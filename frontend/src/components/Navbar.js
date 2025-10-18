import React from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../actions/auth";

const Navbar = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
    window.location.href = "/login";
  };

  return (
    <div className="navbar">
      <div className="navbar-content">
        <h1>Course Platform</h1>
        {isAuthenticated && (
          <nav>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/search">Courses</Link>
            <Link to="/recommendations">AI Recommendations</Link>
            <span style={{ color: "white", marginLeft: "20px" }}>
              Welcome, {user?.name}
            </span>
            <button
              onClick={handleLogout}
              style={{
                marginLeft: "20px",
                background: "transparent",
                border: "1px solid white",
                color: "white",
                padding: "5px 10px",
                borderRadius: "4px",
                cursor: "pointer",
              }}>
              Logout
            </button>
          </nav>
        )}
      </div>
    </div>
  );
};

export default Navbar;
