import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div
      style={{
        background: "white",
        padding: "40px",
        borderRadius: "10px",
        boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
      }}>
      <h2>Welcome, {user?.name}!</h2>
      <p>This is your admin dashboard for managing the course platform.</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
          marginTop: "30px",
        }}>
        <div
          style={{
            padding: "20px",
            background: "#3498db",
            color: "white",
            borderRadius: "8px",
          }}>
          <h3>Course Management</h3>
          <p>Upload and manage courses</p>
          <Link
            to="/search"
            style={{ color: "white", textDecoration: "underline" }}>
            Go to Courses →
          </Link>
        </div>

        <div
          style={{
            padding: "20px",
            background: "#2ecc71",
            color: "white",
            borderRadius: "8px",
          }}>
          <h3>AI Recommendations</h3>
          <p>Get personalized course suggestions</p>
          <Link
            to="/recommendations"
            style={{ color: "white", textDecoration: "underline" }}>
            Get Recommendations →
          </Link>
        </div>

        <div
          style={{
            padding: "20px",
            background: "#e74c3c",
            color: "white",
            borderRadius: "8px",
          }}>
          <h3>Search & Filter</h3>
          <p>Advanced search with Elasticsearch</p>
          <Link
            to="/search"
            style={{ color: "white", textDecoration: "underline" }}>
            Search Courses →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
