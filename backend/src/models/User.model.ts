// backend/src/models/User.model.ts
import mongoose from "mongoose";

export type UserRole = "admin" | "user";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    /**
     * 🔐 Password hash (bcrypt)
     */
    passwordHash: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      trim: true,
    },

    /**
     * 🔑 Role-based authorization
     */
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
      required: true,
    },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model("User", userSchema);
