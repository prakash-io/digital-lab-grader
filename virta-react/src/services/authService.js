// Base API URL - uses environment variable or falls back to domain/localhost
const getApiBaseUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl && apiUrl.trim()) {
    const cleanUrl = apiUrl.trim().replace(/\/$/, '');
    return `${cleanUrl}/api/auth`;
  }
  // In production (e.g. Vercel deployment), point to same origin /api/auth if not on localhost
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return `${window.location.origin}/api/auth`;
  }
  return "http://localhost:3001/api/auth";
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
        throw new Error(`Network error: Unable to connect to server at ${API_BASE_URL}. Is backend running?`);
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
        throw new Error(`Network error: Unable to connect to server at ${API_BASE_URL}. Is backend running?`);
      }
      throw error;
    }
  },

  async socialLogin({ provider, email, name, avatarUrl, userType = 'student' }) {
    try {
      const response = await fetch(`${API_BASE_URL}/social-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ provider, email, name, avatarUrl, userType }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || `${provider} login failed`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error(`Network error: Unable to connect to server at ${API_BASE_URL}`);
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
        throw new Error(`Network error: Unable to connect to server at ${API_BASE_URL}`);
      }
      throw error;
    }
  },
};
