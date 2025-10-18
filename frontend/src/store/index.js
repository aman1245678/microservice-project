import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../reducers/auth";
import courseReducer from "../reducers/courses";

export default configureStore({
  reducer: {
    auth: authReducer,
    courses: courseReducer,
  },
});
