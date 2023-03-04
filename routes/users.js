const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user")
const Task = require("../models/task")

const router = express.Router();

//! LOGIN, REGISTER => AUTH
router.post("/login", async (req, res) => {

// {
//   "name": "Test Admin",
//   "email": "test@admin.com",
//   "password": "Test123@",
//   "isAdmin": true
// }

// {
//   "name": "Test U”ser,
//   "email": “user@admin.com",
//   "password": “user123@",
//   "isAdmin": false
// }

  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).send("Invalid email or password.");

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword)
    return res.status(400).send("Invalid email or password.");

  const token = jwt.sign(
    { _id: user._id, isAdmin: user.isAdmin },
    "jwtPrivateKey"
  );
  res.send(token);
});

router.post("/register", async (req, res) => {
  const { name, email, password, isAdmin } = req.body;

  // Check if the email is already registered
  let user = await User.findOne({ email });
  if (user) return res.status(400).send("User already registered.");

  // Create a new user
  user = new User({
    name,
    email,
    password: await bcrypt.hash(password, 10),
    isAdmin,
  });

  await user.save();

  // Send a response with the new user
  res.send(user);
});

//! GET, POST => USERS
router.post("/users", async (req, res) => {
  const { username, password } = req.body;

  const existingUser = await User.findOne({ username });
  if (existingUser) return res.status(400).send("Username already taken.");

  const user = new User({
    username,
    password: await bcrypt.hash(password, 10),
  });

  await user.save();

  res.send(user);
});

router.get("/users", async (req, res) => {
  const users = await User.find();
  res.send(users);
});

//! GET, POST => TASKS
router.post("/tasks", async (req, res) => {
  const { title, description, assignedTo } = req.body;

  const task = new Task({
    title,
    description,
    assignedTo,
  });

  await task.save();

  res.send(task);
});

router.get("/tasks", async (req, res) => {
  const tasks = await Task.find().populate("assignedTo", "username");
  res.send(tasks);
});

module.exports = router;
