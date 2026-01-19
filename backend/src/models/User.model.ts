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

    // ️ Hashed password for security
    passwordHash: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      trim: true,
    },

    // Role: admin or regular user
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
