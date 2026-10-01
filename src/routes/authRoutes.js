import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../model/User.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, phone_number, password } = req.body;

    const existingUser = await User.findOne({ phone_number });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Phone number already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      phone_number,
      password_hash,
    });

    await user.save();

    res.status(201).json({
      message: "User registered successfully",
      userId: user._id,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { phone_number, password } = req.body;

    const user = await User.findOne({
      phone_number,
      is_active: true,
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials or account deleted",
      });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ token });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

export default router;
