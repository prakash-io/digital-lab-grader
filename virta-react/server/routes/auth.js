import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { readUsers, saveUser, findUserByUsername, findUserByEmail } from "../utils/users.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Signup endpoint
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password, userType } = req.body;

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

    // Default to 'student' if userType is not provided
    const finalUserType = userType === 'instructor' ? 'instructor' : 'student';

    // Check if user already exists
    const existingUser = findUserByUsername(username) || findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: "Username or email already exists" 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = {
      id: Date.now().toString(),
      username,
      email,
      password: hashedPassword,
      userType: finalUserType,
      score: 0, // Initial score is 0
      createdAt: new Date().toISOString(),
    };

    // Save user
    saveUser(newUser);

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id, username: newUser.username, userType: newUser.userType },
      JWT_SECRET,
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
      message: "Internal server error" 
    });
  }
});

// Login endpoint
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide username and password" 
      });
    }

    // Find user
    const user = findUserByUsername(username);
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid username or password" 
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid username or password" 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username, userType: user.userType || 'student' },
      JWT_SECRET,
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
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
});

// Verify token endpoint
router.get("/verify", (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "No token provided" 
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = findUserByUsername(decoded.username);

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

