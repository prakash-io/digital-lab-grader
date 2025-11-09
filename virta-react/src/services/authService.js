// Base API URL - uses environment variable or falls back to localhost
const getApiBaseUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl) {
    // Remove trailing slash if present
    const cleanUrl = apiUrl.replace(/\/$/, '');
    return `${cleanUrl}/api/auth`;
  }
  // Fallback to localhost for development
  if (import.meta.env.MODE === 'development') {
    return "http://localhost:3001/api/auth";
  }
  // In production, throw error if no API URL is set
  console.error('VITE_API_URL is not set! Please configure it in Vercel environment variables.');
  throw new Error('Backend API URL is not configured. Please set VITE_API_URL environment variable.');
};

const API_BASE_URL = getApiBaseUrl();

export const authService = {
  async signup(username, email, password, userType = 'student') {
    try {
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password, userType }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || `Signup failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error(`Network error: Unable to connect to server. Please check if the backend is running at ${API_BASE_URL}`);
      }
      throw error;
    }
  },

  async login(username, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || `Login failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error(`Network error: Unable to connect to server. Please check if the backend is running at ${API_BASE_URL}`);
      }
      throw error;
    }
  },

  async verifyToken(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/verify`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || `Token verification failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error(`Network error: Unable to connect to server. Please check if the backend is running at ${API_BASE_URL}`);
      }
      throw error;
    }
  },
};

