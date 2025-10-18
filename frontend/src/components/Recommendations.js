import React, { useState } from "react";
import { useSelector } from "react-redux";

const Recommendations = () => {
  const [topics, setTopics] = useState(["web development", "javascript"]);
  const [skillLevel, setSkillLevel] = useState("Beginner");
  const [interests, setInterests] = useState("");
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = useSelector((state) => state.auth.token);
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const handleGetRecommendations = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/recommendations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          topics: topics,
          skillLevel: skillLevel,
          interests: interests
            .split(",")
            .map((i) => i.trim())
            .filter((i) => i),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to get recommendations");
      }

      setRecommendations(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addTopic = () => {
    setTopics([...topics, ""]);
  };

  const updateTopic = (index, value) => {
    const newTopics = [...topics];
    newTopics[index] = value;
    setTopics(newTopics);
  };

  const removeTopic = (index) => {
    setTopics(topics.filter((_, i) => i !== index));
  };

  return (
    <div className="recommendations">
      <h2>AI Course Recommendations</h2>

      <form
        onSubmit={handleGetRecommendations}
        className="recommendations-form">
        <div className="form-group">
          <label>Topics of Interest:</label>
          {topics.map((topic, index) => (
            <div key={index} className="topic-input-group">
              <input
                type="text"
                value={topic}
                onChange={(e) => updateTopic(index, e.target.value)}
                placeholder="Enter a topic (e.g., React, Machine Learning)"
                className="form-control"
              />
              {topics.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTopic(index)}
                  className="btn btn-danger btn-sm">
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addTopic}
            className="btn btn-secondary btn-sm">
            Add Another Topic
          </button>
        </div>

        <div className="form-group">
          <label>Skill Level:</label>
          <select
            value={skillLevel}
            onChange={(e) => setSkillLevel(e.target.value)}
            className="form-control">
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>

        <div className="form-group">
          <label>Additional Interests (comma-separated):</label>
          <input
            type="text"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            placeholder="e.g., data science, cloud computing, mobile apps"
            className="form-control"
          />
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? "Generating Recommendations..." : "Get AI Recommendations"}
        </button>
      </form>

      {error && <div className="alert alert-danger">{error}</div>}

      {recommendations && (
        <div className="recommendations-results">
          <h3>Recommended Courses</h3>
          <p className="generated-info">
            Generated at:{" "}
            {new Date(recommendations.generatedAt).toLocaleString()}
          </p>

          <div className="recommendations-grid">
            {recommendations.recommendations.map((course, index) => (
              <div key={index} className="recommendation-card">
                <h4>{course.title}</h4>
                <p className="course-description">{course.description}</p>
                <p className="ai-description">
                  <strong>AI Insight:</strong> {course.aiDescription}
                </p>
                <div className="course-meta">
                  <span className="category">{course.category}</span>
                  <span className="level">{course.level}</span>
                  <span className="duration">{course.duration}</span>
                  <span className="rating">⭐ {course.rating}</span>
                </div>
                <div className="instructor">
                  Instructor: {course.instructor}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Recommendations;
