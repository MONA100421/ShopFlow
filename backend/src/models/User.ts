// backend/src/models/User.ts
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "manager", "regular"], // ✅ 加上 manager
      default: "regular",
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
