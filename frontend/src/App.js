import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import CourseSearch from "./components/CourseSearch";
import Recommendations from "./components/Recommendations";
import Navbar from "./components/Navbar";
import { loadUser } from "./actions/auth";
import "./App.css";

store.dispatch(loadUser());

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Navbar />
          <div className="container">
            <Routes>
              <Route
                path="/login"
                element={
                  !isAuthenticated ? <Login /> : <Navigate to="/dashboard" />
                }
              />
              <Route
                path="/dashboard"
                element={
                  isAuthenticated ? <Dashboard /> : <Navigate to="/login" />
                }
              />
              <Route
                path="/search"
                element={
                  isAuthenticated ? <CourseSearch /> : <Navigate to="/login" />
                }
              />
              <Route
                path="/recommendations"
                element={
                  isAuthenticated ? (
                    <Recommendations />
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
              <Route
                path="/"
                element={
                  <Navigate to={isAuthenticated ? "/dashboard" : "/login"} />
                }
              />
            </Routes>
          </div>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
