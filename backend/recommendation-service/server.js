const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5002;

app.use(cors());
app.use(express.json());

class GeminiAIService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || "mock-api-key";
    this.baseURL =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";
  }

  async generateRecommendations(userPreferences) {
    const { topics, skillLevel, interests } = userPreferences;

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const mockCourses = [
      {
        id: 1,
        title: "Complete Web Development Bootcamp",
        description: "Learn full-stack web development from scratch",
        category: "Web Development",
        level: skillLevel || "Beginner",
        duration: "40 hours",
        rating: 4.8,
        instructor: "Sarah Johnson",
      },
      {
        id: 2,
        title: "Advanced JavaScript Patterns",
        description: "Master advanced JavaScript concepts and patterns",
        category: "Programming",
        level: "Advanced",
        duration: "25 hours",
        rating: 4.9,
        instructor: "Mike Chen",
      },
      {
        id: 3,
        title: "Machine Learning Fundamentals",
        description: "Introduction to ML concepts and algorithms",
        category: "Data Science",
        level: "Intermediate",
        duration: "35 hours",
        rating: 4.7,
        instructor: "Dr. Emily Davis",
      },
      {
        id: 4,
        title: "React Native Mobile Development",
        description: "Build cross-platform mobile apps with React Native",
        category: "Mobile Development",
        level: "Intermediate",
        duration: "30 hours",
        rating: 4.6,
        instructor: "Alex Rodriguez",
      },
      {
        id: 5,
        title: "DevOps and Cloud Computing",
        description: "Learn DevOps practices and cloud deployment",
        category: "DevOps",
        level: "Intermediate",
        duration: "45 hours",
        rating: 4.8,
        instructor: "Priya Patel",
      },
    ];

    let recommendations = mockCourses;
    if (topics && topics.length > 0) {
      recommendations = mockCourses.filter((course) =>
        topics.some(
          (topic) =>
            course.title.toLowerCase().includes(topic.toLowerCase()) ||
            course.category.toLowerCase().includes(topic.toLowerCase()) ||
            course.description.toLowerCase().includes(topic.toLowerCase())
        )
      );
    }

    recommendations = recommendations.map((course) => ({
      ...course,
      aiDescription: `Based on your interest in ${
        topics?.join(", ") || "technology"
      } and ${
        skillLevel || "beginner"
      } skill level, I recommend this comprehensive course that covers essential concepts with hands-on projects.`,
    }));

    return {
      recommendations,
      generatedAt: new Date().toISOString(),
      preferencesUsed: userPreferences,
    };
  }
}

const geminiService = new GeminiAIService();

app.post("/api/recommendations", async (req, res) => {
  try {
    const { topics, skillLevel, interests, maxResults = 5 } = req.body;

    if (!topics || !Array.isArray(topics) || topics.length === 0) {
      return res.status(400).json({
        message: "Please provide topics array in the request body",
      });
    }

    const userPreferences = {
      topics,
      skillLevel: skillLevel || "Beginner",
      interests: interests || [],
      maxResults,
    };

    console.log("Generating recommendations for:", userPreferences);

    const recommendations = await geminiService.generateRecommendations(
      userPreferences
    );

    res.json({
      success: true,
      data: recommendations,
      message: "Recommendations generated successfully",
    });
  } catch (error) {
    console.error("Recommendation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate recommendations",
      error: error.message,
    });
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "Recommendation service is running" });
});

app.listen(PORT, () => {
  console.log(`Recommendation service running on port ${PORT}`);
});
