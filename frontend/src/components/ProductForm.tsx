import { useEffect, useState } from "react";
import type { ProductFormData } from "../types/ProductFormData";
import "./ProductForm.css";

interface ProductFormProps {
  initialData?: ProductFormData;
  onSubmit: (data: ProductFormData) => void;
  onDelete?: () => void;
  submitLabel?: string;
}

export default function ProductForm({
  initialData,
  onSubmit,
  onDelete,
  submitLabel = "Add Product",
}: ProductFormProps) {
  /* ===============================
     Form State
  =============================== */

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Category1");
  const [price, setPrice] = useState<number | "">("");
  const [stock, setStock] = useState<number | "">("");
  const [image, setImage] = useState("");

  /* Image preview */
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  /* ===============================
     Sync initialData (Edit mode)
  =============================== */

  useEffect(() => {
    if (!initialData) return;

    setTitle(initialData.title);
    setDescription(initialData.description);
    setCategory(initialData.category);
    setPrice(initialData.price);
    setStock(initialData.stock);
    setImage(initialData.image ?? "");
    setPreviewUrl(initialData.image ?? null);
  }, [initialData]);

  /* ===============================
     Handlers
  =============================== */

  const handlePreview = () => {
    if (!image.trim()) {
      setPreviewUrl(null);
      setImageError(false);
      return;
    }

    setPreviewUrl(image);
    setImageError(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || price === "" || stock === "") {
      alert("Please fill in all required fields.");
      return;
    }

    const formData: ProductFormData = {
      title,
      description,
      category,
      price: Number(price),
      stock: Number(stock),
      image: image.trim() ? image : undefined,
    };

    onSubmit(formData);
  };

  const handleDelete = () => {
    if (!onDelete) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this product? This action cannot be undone."
    );

    if (confirmed) {
      onDelete();
    }
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
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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
                value={image}
                onChange={(e) => setImage(e.target.value)}
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

        {/* Actions */}
        <div className="form-actions">
          {onDelete && (
            <button
              type="button"
              className="delete-btn"
              onClick={handleDelete}
            >
              Delete
            </button>
          )}

          <button type="submit" className="submit-btn">
            {submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
