import mongoose, {
  Schema,
  Document,
  Model,
} from "mongoose";

/**
 * ============================
 * 1️⃣ Product Type (TypeScript)
 * ============================
 * 👉 描述「一筆 Product 文件」在程式中的型態
 */
export interface IProduct extends Document {
  title: string;
  description?: string;
  price: number;

  category: string;
  imageUrl?: string;

  stock: number;
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * ============================
 * 2️⃣ Product Schema (Mongoose)
 * ============================
 * 👉 定義資料庫結構、驗證規則、預設值
 */
const ProductSchema = new Schema<IProduct>(
  {
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
      trim: true,
      index: true,
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
  },
  {
    timestamps: true,   // ✅ 自動產生 createdAt / updatedAt
    versionKey: false,  // ❌ 不需要 __v
  }
);

/**
 * ============================
 * 3️⃣ Model Export（防止重複編譯）
 * ============================
 * 👉 ts-node / nodemon / hot reload 必備
 */
const Product: Model<IProduct> =
  mongoose.models.Product ||
  mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
