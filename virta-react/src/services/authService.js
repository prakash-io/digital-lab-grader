// Base API URL - uses environment variable or falls back to domain/localhost
const getApiBaseUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl && apiUrl.trim()) {
    const cleanUrl = apiUrl.trim().replace(/\/$/, '');
    return `${cleanUrl}/api/auth`;
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return `${window.location.origin}/api/auth`;
  }
  return "http://localhost:3001/api/auth";
};

const API_BASE_URL = getApiBaseUrl();

// Client-side authentication fallback for deployed frontend without connected backend
const localAuthFallback = {
  signup(username, email, password, userType = 'student') {
    const users = JSON.parse(localStorage.getItem("virta_local_users") || "[]");
    const cleanUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (users.some(u => u.username?.toLowerCase() === cleanUsername.toLowerCase())) {
      throw new Error("Username is already taken");
    }
    if (users.some(u => u.email?.toLowerCase() === cleanEmail)) {
      throw new Error("Email is already registered");
    }

    const newUser = {
      id: Date.now().toString(),
      username: cleanUsername,
      email: cleanEmail,
      userType: userType === 'instructor' ? 'instructor' : 'student',
      score: 0,
      createdAt: new Date().toISOString()
    };

    users.push({ ...newUser, password: password.trim() });
    localStorage.setItem("virta_local_users", JSON.stringify(users));

    const token = `demo_token_${Date.now()}`;
    return { success: true, message: "User registered successfully", token, user: newUser };
  },

  login(username, password) {
    const users = JSON.parse(localStorage.getItem("virta_local_users") || "[]");
    const identifier = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    const user = users.find(u => 
      u.username?.toLowerCase() === identifier || u.email?.toLowerCase() === identifier
    );

    if (!user) {
      // Pre-configured accounts for instant testing
      if (identifier === "student" || identifier === "student@demo.com") {
        const demoUser = { id: "demo_student", username: "student", email: "student@demo.com", userType: "student" };
        return { success: true, token: "demo_token_student", user: demoUser };
      }
      if (identifier === "instructor" || identifier === "instructor@demo.com") {
        const demoUser = { id: "demo_instructor", username: "instructor", email: "instructor@demo.com", userType: "instructor" };
        return { success: true, token: "demo_token_instructor", user: demoUser };
      }
      throw new Error("Invalid username/email or password");
    }

    if (user.password && user.password !== cleanPassword) {
      throw new Error("Invalid username/email or password");
    }

    const token = `demo_token_${Date.now()}`;
    const { password: _, ...userData } = user;
    return { success: true, message: "Login successful", token, user: userData };
  },

  socialLogin({ provider, email, name, avatarUrl, userType = 'student' }) {
    const cleanEmail = email ? email.toLowerCase().trim() : "";
    const cleanName = name ? name.trim() : "User";
    const username = (cleanName.replace(/\s+/g, '_').toLowerCase() || "user");

    const user = {
      id: Date.now().toString(),
      username,
      email: cleanEmail,
      userType: userType === 'instructor' ? 'instructor' : 'student',
      avatarUrl: avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=7494ec&color=fff`,
      provider
    };

    const token = `demo_social_token_${Date.now()}`;
    return { success: true, message: `${provider} authentication successful`, token, user };
  },

  verifyToken(token) {
    if (token && token.startsWith("demo_")) {
      const user = {
        id: "demo_user",
        username: "DemoUser",
        email: "user@demo.com",
        userType: "student"
      };
      return { success: true, user };
    }
    throw new Error("Invalid token");
  }
};

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

      if (response.ok) {
        return await response.json();
      }

      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || `Signup failed: ${response.status} ${response.statusText}`);
    } catch (error) {
      if (error.name === 'TypeError' || error.message.includes('fetch') || error.message.includes('Network error')) {
        console.warn("Backend API unreachable, using client-side auth fallback");
        return localAuthFallback.signup(username, email, password, userType);
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

      if (response.ok) {
        return await response.json();
      }

      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || `Login failed: ${response.status} ${response.statusText}`);
    } catch (error) {
      if (error.name === 'TypeError' || error.message.includes('fetch') || error.message.includes('Network error')) {
        console.warn("Backend API unreachable, using client-side auth fallback");
        return localAuthFallback.login(username, password);
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

      if (response.ok) {
        return await response.json();
      }

      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || `${provider} login failed`);
    } catch (error) {
      if (error.name === 'TypeError' || error.message.includes('fetch') || error.message.includes('Network error')) {
        console.warn("Backend API unreachable, using client-side auth fallback");
        return localAuthFallback.socialLogin({ provider, email, name, avatarUrl, userType });
      }
      throw error;
    }
  },

  async verifyToken(token) {
    try {
      if (token && token.startsWith("demo_")) {
        return localAuthFallback.verifyToken(token);
      }

      const response = await fetch(`${API_BASE_URL}/verify`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        return await response.json();
      }

      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || `Token verification failed: ${response.status} ${response.statusText}`);
    } catch (error) {
      if (token && token.startsWith("demo_")) {
        return localAuthFallback.verifyToken(token);
      }
      if (error.name === 'TypeError' || error.message.includes('fetch') || error.message.includes('Network error')) {
        return localAuthFallback.verifyToken(token);
      }
      throw error;
    }
  },
};
