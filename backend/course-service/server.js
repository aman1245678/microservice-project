const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const csv = require("csv-parser");
const redis = require("redis");
const { Client: ElasticsearchClient } = require("@elastic/elasticsearch");
const cors = require("cors");
const fs = require("fs");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5003;

app.use(cors());
app.use(express.json());

mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost:27017/course_service",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const redisClient = redis.createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));
redisClient.connect();

const esClient = new ElasticsearchClient({
  node: process.env.ELASTICSEARCH_URL || "http://localhost:9200",
});

const courseSchema = new mongoose.Schema(
  {
    course_id: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    instructor: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
    },
    students_enrolled: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Course = mongoose.model("Course", courseSchema);

const upload = multer({ dest: "uploads/" });

const indexCourseInElasticsearch = async (course) => {
  try {
    await esClient.index({
      index: "courses",
      id: course._id.toString(),
      body: {
        course_id: course.course_id,
        title: course.title,
        description: course.description,
        category: course.category,
        instructor: course.instructor,
        duration: course.duration,
        price: course.price,
        rating: course.rating,
        students_enrolled: course.students_enrolled,
      },
    });
    console.log(`Indexed course: ${course.title}`);
  } catch (error) {
    console.error("Error indexing course in Elasticsearch:", error);
  }
};

const cacheCourseData = async (key, data, expiry = 3600) => {
  try {
    await redisClient.setEx(key, expiry, JSON.stringify(data));
  } catch (error) {
    console.error("Redis cache error:", error);
  }
};

const getCachedData = async (key) => {
  try {
    const cachedData = await redisClient.get(key);
    return cachedData ? JSON.parse(cachedData) : null;
  } catch (error) {
    console.error("Redis get error:", error);
    return null;
  }
};

app.post("/api/courses/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const courses = [];
    const errors = [];

    await new Promise((resolve, reject) => {
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on("data", (row) => {
          if (
            !row.course_id ||
            !row.title ||
            !row.description ||
            !row.category ||
            !row.instructor ||
            !row.duration
          ) {
            errors.push(
              `Missing required fields in row: ${JSON.stringify(row)}`
            );
            return;
          }

          const course = {
            course_id: row.course_id,
            title: row.title,
            description: row.description,
            category: row.category,
            instructor: row.instructor,
            duration: row.duration,
            price: parseFloat(row.price) || 0,
            rating: parseFloat(row.rating) || 0,
            students_enrolled: parseInt(row.students_enrolled) || 0,
          };

          courses.push(course);
        })
        .on("end", resolve)
        .on("error", reject);
    });

    const savedCourses = [];
    for (const courseData of courses) {
      try {
        let course = await Course.findOne({ course_id: courseData.course_id });

        if (course) {
          course = await Course.findOneAndUpdate(
            { course_id: courseData.course_id },
            courseData,
            { new: true }
          );
        } else {
          course = new Course(courseData);
          await course.save();
        }

        savedCourses.push(course);

        await indexCourseInElasticsearch(course);

        await redisClient.del("all_courses");
      } catch (error) {
        errors.push(
          `Error saving course ${courseData.course_id}: ${error.message}`
        );
      }
    }

    fs.unlinkSync(req.file.path);

    res.json({
      message: "CSV processed successfully",
      coursesProcessed: savedCourses.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res
      .status(500)
      .json({ message: "Error processing CSV file", error: error.message });
  }
});

app.get("/api/courses/search", async (req, res) => {
  try {
    const { q, category, instructor, page = 1, limit = 10 } = req.query;

    const cacheKey = `search:${q}:${category}:${instructor}:${page}:${limit}`;

    const cachedResults = await getCachedData(cacheKey);
    if (cachedResults) {
      return res.json({
        ...cachedResults,
        cached: true,
      });
    }

    const mustClauses = [];

    if (q) {
      mustClauses.push({
        multi_match: {
          query: q,
          fields: ["title^3", "description^2", "category", "instructor"],
          fuzziness: "AUTO",
        },
      });
    }

    if (category) {
      mustClauses.push({ match: { category } });
    }

    if (instructor) {
      mustClauses.push({ match: { instructor } });
    }

    const query =
      mustClauses.length > 0
        ? { bool: { must: mustClauses } }
        : { match_all: {} };

    const from = (page - 1) * limit;

    const searchResult = await esClient.search({
      index: "courses",
      body: {
        query,
        from,
        size: limit,
        sort: [
          { rating: { order: "desc" } },
          { students_enrolled: { order: "desc" } },
        ],
      },
    });

    const results = {
      total: searchResult.body.hits.total.value,
      page: parseInt(page),
      limit: parseInt(limit),
      courses: searchResult.body.hits.hits.map((hit) => ({
        id: hit._id,
        ...hit._source,
      })),
    };

    await cacheCourseData(cacheKey, results, 900);

    res.json({
      ...results,
      cached: false,
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Search failed", error: error.message });
  }
});

app.get("/api/courses", async (req, res) => {
  try {
    const cacheKey = "all_courses";

    const cachedCourses = await getCachedData(cacheKey);
    if (cachedCourses) {
      return res.json({
        courses: cachedCourses,
        cached: true,
      });
    }

    const courses = await Course.find().sort({ createdAt: -1 }).limit(100);

    await cacheCourseData(cacheKey, courses, 1800); // 30 minutes cache

    res.json({
      courses,
      cached: false,
    });
  } catch (error) {
    console.error("Get courses error:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch courses", error: error.message });
  }
});

app.get("/api/courses/:id", async (req, res) => {
  try {
    const courseId = req.params.id;
    const cacheKey = `course:${courseId}`;

    const cachedCourse = await getCachedData(cacheKey);
    if (cachedCourse) {
      return res.json({
        course: cachedCourse,
        cached: true,
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    await cacheCourseData(cacheKey, course, 3600); // 1 hour cache

    res.json({
      course,
      cached: false,
    });
  } catch (error) {
    console.error("Get course error:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch course", error: error.message });
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "Course service is running" });
});

app.listen(PORT, () => {
  console.log(`Course service running on port ${PORT}`);
});
