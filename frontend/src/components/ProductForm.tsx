import { useState } from "react";
import "./ProductForm.css";

interface ProductFormProps {
  onSubmit?: (product: ProductData) => void;
}

interface ProductData {
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  imageUrl: string;
}

export default function ProductForm({ onSubmit }: ProductFormProps) {
  /* ===============================
     Form State
  =============================== */

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Category1");
  const [price, setPrice] = useState<number | "">("");
  const [stock, setStock] = useState<number | "">("");
  const [imageUrl, setImageUrl] = useState("");

  /* Image preview state */
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  /* ===============================
     Handlers
  =============================== */

  const handlePreview = () => {
    if (!imageUrl.trim()) {
      setPreviewUrl(null);
      setImageError(false);
      return;
    }

    setPreviewUrl(imageUrl);
    setImageError(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    /* 基本驗證 */
    if (!name || !category || price === "" || stock === "") {
      alert("Please fill in all required fields.");
      return;
    }

    const productData: ProductData = {
      name,
      description,
      category,
      price: Number(price),
      stock: Number(stock),
      imageUrl,
    };

    console.log("Add Product:", productData);

    onSubmit?.(productData);

    /* 可選：送出後清空 */
    // resetForm();
  };

  /* ===============================
     Render
  =============================== */

  return (
    <form className="product-form" onSubmit={handleSubmit}>
      <div className="product-form-card">
        {/* Product name */}
        <div className="form-group full">
          <label className="form-label">Product name</label>
          <input
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Product description */}
        <div className="form-group full">
          <label className="form-label">Product Description</label>
          <textarea
            className="form-control textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Category + Price */}
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
              <option value="Category3">Category3</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Price</label>
            <input
              type="number"
              step="0.01"
              className="form-control"
              value={price}
              onChange={(e) =>
                setPrice(e.target.value === "" ? "" : Number(e.target.value))
              }
            />
          </div>
        </div>

        {/* Stock + Image link */}
        <div className="form-row form-row--stock-image">
          <div className="form-group">
            <label className="form-label">In Stock Quantity</label>
            <input
              type="number"
              className="form-control"
              value={stock}
              onChange={(e) =>
                setStock(e.target.value === "" ? "" : Number(e.target.value))
              }
            />
          </div>

          <div className="form-group">
            <label className="form-label">Add Image Link</label>
            <div className="image-input-wrapper">
              <input
                className="form-control"
                placeholder="http://"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <button
                type="button"
                className="preview-btn"
                onClick={handlePreview}
              >
                Preview
              </button>
            </div>
          </div>
        </div>

        {/* Image preview */}
        <div className="image-preview">
          {previewUrl && !imageError ? (
            <img
              src={previewUrl}
              alt="Preview"
              onError={() => setImageError(true)}
            />
          ) : (
            <>
              <div className="placeholder-icon">🖼️</div>
              <div>
                {imageError ? "Invalid image URL" : "image preview!"}
              </div>
            </>
          )}
        </div>

        {/* Submit */}
        <button type="submit" className="submit-btn">
          Add Product
        </button>
      </div>
    </form>
  );
}
