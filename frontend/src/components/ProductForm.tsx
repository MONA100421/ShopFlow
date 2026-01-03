import "./ProductForm.css";
import { useState } from "react";
import type { Product } from "../types/Product";

import imagePlaceholder from "../assets/bi_file-earmark-image.svg";

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (p: Product) => void;
}

export default function ProductForm({
  initialData,
  onSubmit,
}: ProductFormProps) {
  /* =========================
     State
  ========================= */
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(
    initialData?.description ?? ""
  );
  const [category, setCategory] = useState(
    initialData?.category ?? "Category1"
  );
  const [price, setPrice] = useState<number>(
    initialData?.price ?? 0
  );
  const [stock, setStock] = useState<number>(
    initialData?.stock ?? 0
  );
  const [image, setImage] = useState<string>(
    initialData?.image ?? ""
  );

  /* =========================
     Submit
  ========================= */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSubmit({
      id: initialData?.id ?? crypto.randomUUID(),
      title,
      description,
      category,
      price,
      stock,
      image,
    });
  };

  return (
    <form className="product-form" onSubmit={handleSubmit}>
      <div className="product-form-card">
        {/* ===== Product name ===== */}
        <div className="form-group full">
          <label className="form-label">Product name</label>
          <input
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* ===== Description ===== */}
        <div className="form-group full">
          <label className="form-label">Product Description</label>
          <textarea
            className="form-control textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* ===== Category + Price ===== */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-control"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Category1">Category1</option>
              <option value="Category2">Category2</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Price</label>
            <input
              type="number"
              className="form-control"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              min={0}
            />
          </div>
        </div>

        {/* ===== Stock + Image Link ===== */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">In Stock Quantity</label>
            <input
              type="number"
              className="form-control"
              value={stock}
              onChange={(e) => setStock(Number(e.target.value))}
              min={0}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Add Image Link</label>
            <div className="image-input-wrapper">
              <input
                className="form-control"
                value={image}
                onChange={(e) => setImage(e.target.value)}
              />
              <button
                type="button"
                className="preview-btn"
              >
                Preview
              </button>
            </div>
          </div>
        </div>

        {/* ===== Image Preview ===== */}
        <div className="image-preview">
          {image ? (
            <img src={image} alt="preview" />
          ) : (
            <>
              <img
                src={imagePlaceholder}
                alt="placeholder"
                className="placeholder-icon"
              />
              <p>image preview!</p>
            </>
          )}
        </div>

        {/* ===== Submit ===== */}
        <button type="submit" className="submit-btn">
          {initialData ? "Update Product" : "Add Product"}
        </button>
      </div>
    </form>
  );
}
