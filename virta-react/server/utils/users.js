import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const USERS_FILE = join(__dirname, "../data/users.json");

// Initialize users file if it doesn't exist
if (!existsSync(USERS_FILE)) {
  writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
}

// Read users from file
export function readUsers() {
  try {
    const data = readFileSync(USERS_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading users:", error);
    return [];
  }
}

// Save user to file
export function saveUser(user) {
  try {
    const users = readUsers();
    users.push(user);
    writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    return true;
  } catch (error) {
    console.error("Error saving user:", error);
    return false;
  }
}

// Find user by username (case-insensitive)
export function findUserByUsername(username) {
  if (!username) return null;
  const lower = username.toLowerCase().trim();
  const users = readUsers();
  return users.find((user) => user.username && user.username.toLowerCase().trim() === lower);
}

// Find user by email (case-insensitive)
export function findUserByEmail(email) {
  if (!email) return null;
  const lower = email.toLowerCase().trim();
  const users = readUsers();
  return users.find((user) => user.email && user.email.toLowerCase().trim() === lower);
}

// Find user by username or email (case-insensitive identifier)
export function findUserByIdentifier(identifier) {
  if (!identifier) return null;
  const lower = identifier.toLowerCase().trim();
  const users = readUsers();
  return users.find(
    (user) =>
      (user.username && user.username.toLowerCase().trim() === lower) ||
      (user.email && user.email.toLowerCase().trim() === lower)
  );
}

// Find user by ID
export function findUserById(id) {
  const users = readUsers();
  return users.find((user) => user.id === id);
}

// Update user
export function updateUser(userId, updates) {
  try {
    const users = readUsers();
    const userIndex = users.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      return false;
    }
    users[userIndex] = { ...users[userIndex], ...updates };
    writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    return true;
  } catch (error) {
    console.error("Error updating user:", error);
    return false;
  }
}

// Save or update user from social auth provider (Google, GitHub, Facebook, LinkedIn)
export function saveOrUpdateSocialUser({ provider, email, name, avatarUrl, userType }) {
  try {
    const users = readUsers();
    const cleanEmail = email ? email.toLowerCase().trim() : "";
    const cleanName = name ? name.trim() : "User";
    
    // Check existing user by email
    let user = users.find((u) => u.email && u.email.toLowerCase().trim() === cleanEmail);
    
    if (user) {
      user.avatarUrl = avatarUrl || user.avatarUrl;
      user.provider = provider;
      user.lastLoginAt = new Date().toISOString();
      updateUser(user.id, user);
      return user;
    }

    // Generate unique username from name/email
    let baseUsername = (cleanName.replace(/\s+/g, '_').toLowerCase() || cleanEmail.split('@')[0] || "user");
    let username = baseUsername;
    let counter = 1;
    while (users.some((u) => u.username && u.username.toLowerCase() === username.toLowerCase())) {
      username = `${baseUsername}_${counter}`;
      counter++;
    }

    const newUser = {
      id: Date.now().toString(),
      username,
      email: cleanEmail,
      userType: userType === 'instructor' ? 'instructor' : 'student',
      avatarUrl: avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=7494ec&color=fff`,
      provider: provider || 'social',
      score: 0,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    saveUser(newUser);
    return newUser;
  } catch (error) {
    console.error("Error saving social user:", error);
    return null;
  }
}

// Get all users
export function getAllUsers() {
  return readUsers();
}
