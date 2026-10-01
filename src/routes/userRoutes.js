import express from "express";
import User from "../model/User.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.use(auth);

router.get("/me", async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.user.id,
      is_active: true,
    }).select("-password_hash");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/me", async (req, res) => {
  try {
    const updates = req.body;
    updates.updated_at = Date.now();

    delete updates.password_hash;
    delete updates.is_active;

    const user = await User.findOneAndUpdate(
      { _id: req.user.id, is_active: true },
      updates,
      { new: true },
    ).select("-password_hash");

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/me", async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.user.id },
      { is_active: false, updated_at: Date.now() },
      { new: true },
    );

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "Account deactivated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
