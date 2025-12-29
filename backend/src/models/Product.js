import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        description: { type: String, default: "" },
        category: { type: String, default: "General" },
        price: { type: Number, required: true, min: 0 },
        stock: { type: Number, default: 0, min: 0 },
        image: { type: String, default: "" },
    },
    { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
