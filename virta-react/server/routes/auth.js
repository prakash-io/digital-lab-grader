import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { 
  readUsers, 
  saveUser, 
  findUserByUsername, 
  findUserByEmail, 
  findUserByIdentifier,
  saveOrUpdateSocialUser 
} from "../utils/users.js";

const router = express.Router();
const getSecret = () => process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Signup endpoint
router.post("/signup", async (req, res) => {
  try {
    let { username, email, password, userType } = req.body;

    username = username ? username.trim() : "";
    email = email ? email.trim().toLowerCase() : "";
    password = password ? password.trim() : "";

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide username, email, and password" 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: "Password must be at least 6 characters long" 
      });
    }

    // Check if username or email already exists
    if (findUserByUsername(username)) {
      return res.status(400).json({ 
        success: false, 
        message: "Username is already taken" 
      });
    }

    if (findUserByEmail(email)) {
      return res.status(400).json({ 
        success: false, 
        message: "Email is already registered" 
      });
    }

    const finalUserType = userType === 'instructor' ? 'instructor' : 'student';

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = {
      id: Date.now().toString(),
      username,
      email,
      password: hashedPassword,
      userType: finalUserType,
      score: 0,
      createdAt: new Date().toISOString(),
    };

    // Save user
    saveUser(newUser);

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id, username: newUser.username, userType: newUser.userType },
      getSecret(),
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        userType: newUser.userType,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error during signup" 
    });
  }
});

// Login endpoint (supports username OR email)
router.post("/login", async (req, res) => {
  try {
    let { username, password } = req.body;

    const identifier = username ? username.trim() : "";
    const cleanPassword = password ? password.trim() : "";

    // Validation
    if (!identifier || !cleanPassword) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide username/email and password" 
      });
    }

    // Find user by username or email
    const user = findUserByIdentifier(identifier);
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid username/email or password" 
      });
    }

    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: `This account uses ${user.provider || 'Social'} login. Please sign in with social login.`
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(cleanPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid username/email or password" 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username, userType: user.userType || 'student' },
      getSecret(),
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        userType: user.userType || 'student',
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error during login" 
    });
  }
});

// Social Login endpoint (Google, GitHub, Facebook, LinkedIn)
router.post("/social-login", async (req, res) => {
  try {
    const { provider, email, name, avatarUrl, userType } = req.body;

    if (!provider) {
      return res.status(400).json({
        success: false,
        message: "Provider is required for social login"
      });
    }

    const user = saveOrUpdateSocialUser({ provider, email, name, avatarUrl, userType });

    if (!user) {
      return res.status(500).json({
        success: false,
        message: "Failed to process social login"
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username, userType: user.userType || 'student' },
      getSecret(),
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: `${provider} authentication successful`,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        userType: user.userType || 'student',
        avatarUrl: user.avatarUrl,
        provider: user.provider
      },
    });
  } catch (error) {
    console.error("Social login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during social login"
    });
  }
});

// Verify token endpoint
router.get("/verify", (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "No token provided" 
      });
    }

    const decoded = jwt.verify(token, getSecret());
    const user = findUserByIdentifier(decoded.username) || readUsers().find(u => u.id === decoded.userId);

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        userType: user.userType || 'student',
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: "Invalid or expired token" 
    });
  }
});

export default router;
