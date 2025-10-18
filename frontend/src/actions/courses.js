import { createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export const getAllCourses = createAsyncThunk("courses/getAll", async () => {
  const response = await fetch(`${API_BASE_URL}/api/courses`);
  return response.json();
});

export const searchCourses = createAsyncThunk(
  "courses/search",
  async (searchParams) => {
    const params = new URLSearchParams(searchParams);
    const response = await fetch(
      `${API_BASE_URL}/api/courses/search?${params}`
    );
    return response.json();
  }
);
