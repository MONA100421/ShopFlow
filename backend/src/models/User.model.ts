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

    name: {
      type: String,
      trim: true,
    },

    /**
     * 🔑 Role-based authorization
     * - user: default
     * - admin: can manage products
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
