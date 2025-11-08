// Base API URL - uses environment variable or falls back to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api/auth`
  : "http://localhost:3001/api/auth";

export const authService = {
  async signup(username, email, password, userType = 'student') {
    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password, userType }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || "Signup failed");
    }

    return data;
  },

  async login(username, password) {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    return data;
  },

  async verifyToken(token) {
    const response = await fetch(`${API_BASE_URL}/verify`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || "Token verification failed");
    }

    return data;
  },
};

