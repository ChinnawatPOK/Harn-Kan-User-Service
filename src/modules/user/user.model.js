import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: uuidv4,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    phone_number: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    password_hash: {
      type: String,
      required: true,
      select: false,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },

      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },

    notification_prefs: {
      type: [String],
      default: [],
    },

    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },

    versionKey: false,
  }
);

userSchema.index({
  location: "2dsphere",
});

const User = mongoose.model("User", userSchema);

export default User;
