import mongoose, { Schema, } from "mongoose";
/**
 * ============================
 * 2️⃣ Product Schema (Mongoose)
 * ============================
 * 👉 定義「資料庫層級」的結構與驗證
 */
const ProductSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 120,
    },
    description: {
        type: String,
        trim: true,
        maxlength: 1000,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    category: {
        type: String,
        required: true,
        index: true,
        trim: true,
    },
    imageUrl: {
        type: String,
        trim: true,
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true, // ✅ 自動加入 createdAt / updatedAt
    versionKey: false,
});
/**
 * ============================
 * 3️⃣ Model Export（避免重複編譯）
 * ============================
 * 👉 避免在 dev / hot reload 時 model 被重複註冊
 */
const Product = mongoose.models.Product ||
    mongoose.model("Product", ProductSchema);
export default Product;
