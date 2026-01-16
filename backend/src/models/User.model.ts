import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model("User", userSchema);
