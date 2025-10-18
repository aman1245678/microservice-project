import {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
} from "../reducers/auth";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export const login = (email, password) => async (dispatch) => {
  dispatch(loginStart());

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.admin));
    dispatch(loginSuccess(data));

    return { success: true };
  } catch (error) {
    dispatch(loginFailure(error.message));
    return { success: false, error: error.message };
  }
};

export const logoutUser = () => (dispatch) => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  dispatch(logout());
};

export const loadUser = () => (dispatch) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (token && user) {
    dispatch(loginSuccess({ token, admin: user }));
  }
};
