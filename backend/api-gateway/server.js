const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use(
  "/api/auth",
  createProxyMiddleware({
    target: "http://localhost:5001",
    changeOrigin: true,
    pathRewrite: {
      "^/api/auth": "/api/auth",
    },
  })
);

app.use(
  "/api/recommendations",
  createProxyMiddleware({
    target: "http://localhost:5002",
    changeOrigin: true,
    pathRewrite: {
      "^/api/recommendations": "/api/recommendations",
    },
  })
);

app.use(
  "/api/courses",
  createProxyMiddleware({
    target: "http://localhost:5003",
    changeOrigin: true,
    pathRewrite: {
      "^/api/courses": "/api/courses",
    },
  })
);

app.get("/health", async (req, res) => {
  const services = [
    { name: "Auth Service", url: "http://localhost:5001/health" },
    { name: "Recommendation Service", url: "http://localhost:5002/health" },
    { name: "Course Service", url: "http://localhost:5003/health" },
  ];

  const healthStatus = await Promise.all(
    services.map(async (service) => {
      try {
        const response = await fetch(service.url);
        const data = await response.json();
        return {
          service: service.name,
          status: "healthy",
          data: data,
        };
      } catch (error) {
        return {
          service: service.name,
          status: "unhealthy",
          error: error.message,
        };
      }
    })
  );

  res.json({
    gateway: "healthy",
    timestamp: new Date().toISOString(),
    services: healthStatus,
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "MERN Microservices API Gateway",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      recommendations: "/api/recommendations",
      courses: "/api/courses",
      health: "/health",
    },
  });
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
