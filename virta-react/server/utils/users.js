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

// Save users to file
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

// Find user by username
export function findUserByUsername(username) {
  const users = readUsers();
  return users.find((user) => user.username === username);
}

// Find user by email
export function findUserByEmail(email) {
  const users = readUsers();
  return users.find((user) => user.email === email);
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

// Get all users
export function getAllUsers() {
  return readUsers();
}

