import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { searchCourses, getAllCourses } from "../actions/courses";

const CourseSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("");
  const [instructor, setInstructor] = useState("");
  const dispatch = useDispatch();

  const { courses, loading, error, cached } = useSelector(
    (state) => state.courses
  );

  useEffect(() => {
    dispatch(getAllCourses());
  }, [dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery || category || instructor) {
      dispatch(searchCourses({ q: searchQuery, category, instructor }));
    } else {
      dispatch(getAllCourses());
    }
  };

  const handleClear = () => {
    setSearchQuery("");
    setCategory("");
    setInstructor("");
    dispatch(getAllCourses());
  };

  return (
    <div className="course-search">
      <h2>Course Search</h2>

      <form onSubmit={handleSearch} className="search-form">
        <div className="form-group">
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-control"
          />
        </div>

        <div className="form-group">
          <input
            type="text"
            placeholder="Filter by category..."
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="form-control"
          />
        </div>

        <div className="form-group">
          <input
            type="text"
            placeholder="Filter by instructor..."
            value={instructor}
            onChange={(e) => setInstructor(e.target.value)}
            className="form-control"
          />
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? "Searching..." : "Search"}
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="btn btn-secondary">
            Clear
          </button>
        </div>
      </form>

      {error && <div className="alert alert-danger">{error}</div>}
      {cached && <div className="alert alert-info">Showing cached results</div>}

      <div className="courses-grid">
        {courses &&
          courses.map((course) => (
            <div key={course._id || course.id} className="course-card">
              <h3>{course.title}</h3>
              <p className="course-description">{course.description}</p>
              <div className="course-meta">
                <span className="category">{course.category}</span>
                <span className="instructor">By {course.instructor}</span>
                <span className="duration">{course.duration}</span>
                <span className="rating">⭐ {course.rating}</span>
              </div>
              {course.price > 0 && (
                <div className="course-price">${course.price}</div>
              )}
            </div>
          ))}
      </div>

      {courses && courses.length === 0 && !loading && (
        <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
          No courses found. Try different search terms.
        </div>
      )}
    </div>
  );
};

export default CourseSearch;
