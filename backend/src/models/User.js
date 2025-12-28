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
      select: false, // 默认查询不返回 hash（更安全）
    },
    role: {
      type: String,
      enum: ["admin", "regular"],
      default: "regular",
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
