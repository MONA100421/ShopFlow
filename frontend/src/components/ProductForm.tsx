import { useEffect, useState } from "react";
import type { ProductFormData } from "../types/ProductFormData";
import "./ProductForm.css";

interface ProductFormProps {
  initialData?: ProductFormData;
  onSubmit: (data: ProductFormData) => void;
  onDelete?: () => void;
  submitLabel?: string;
}

interface FormErrors {
  title?: string;
  price?: string;
  stock?: string;
  image?: string;
}

export default function ProductForm({
  initialData,
  onSubmit,
  onDelete,
  submitLabel = "Add Product",
}: ProductFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Category1");
  const [price, setPrice] = useState<number | "">("");
  const [stock, setStock] = useState<number | "">("");
  const [image, setImage] = useState("");

  const [errors, setErrors] = useState<FormErrors>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

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

  /* ✅ SINGLE SOURCE OF TRUTH */
  const isValidImageSource = (value: string) => {
    if (value.startsWith("data:image/")) return true;

    try {
      const url = new URL(value);
      return ["http:", "https:"].includes(url.protocol);
    } catch {
      return false;
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!title.trim()) {
      newErrors.title = "Product title is required";
    }

    if (price === "" || price <= 0) {
      newErrors.price = "Price must be greater than 0";
    }

    if (stock === "" || stock < 0) {
      newErrors.stock = "Stock cannot be negative";
    }

    if (!image.trim()) {
      newErrors.image = "Image URL is required";
    } else if (!isValidImageSource(image)) {
      newErrors.image = "Image must be a valid URL or data:image";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      title,
      description,
      category,
      price: Number(price),
      stock: Number(stock),
      image,
    });
  };

  const handlePreview = () => {
    if (!image.trim()) {
      setPreviewUrl(null);
      setImageError(false);
      return;
    }

    if (!isValidImageSource(image)) {
      setPreviewUrl(null);
      setImageError(true);
      return;
    }

    setPreviewUrl(image);
    setImageError(false);
  };

  return (
    <form className="product-form" onSubmit={handleSubmit}>
      <div className="product-form-card">
        {/* Title */}
        <div className="form-group full">
          <label className="form-label">Product name</label>
          <input
            className={`form-control ${errors.title ? "error" : ""}`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          {errors.title && <div className="form-error">{errors.title}</div>}
        </div>

        {/* Description */}
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
              className={`form-control ${errors.price ? "error" : ""}`}
              value={price}
              onChange={(e) =>
                setPrice(e.target.value === "" ? "" : Number(e.target.value))
              }
            />
            {errors.price && <div className="form-error">{errors.price}</div>}
          </div>
        </div>

        {/* Stock + Image */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Stock</label>
            <input
              type="number"
              className={`form-control ${errors.stock ? "error" : ""}`}
              value={stock}
              onChange={(e) =>
                setStock(e.target.value === "" ? "" : Number(e.target.value))
              }
            />
            {errors.stock && <div className="form-error">{errors.stock}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Image URL</label>
            <div className="image-input-wrapper">
              <input
                className={`form-control ${errors.image ? "error" : ""}`}
                value={image}
                onChange={(e) => setImage(e.target.value)}
              />
              <button type="button" className="preview-btn" onClick={handlePreview}>
                Preview
              </button>
            </div>
            {errors.image && <div className="form-error">{errors.image}</div>}
          </div>
        </div>

        {/* Image preview */}
        <div className="image-preview">
          {previewUrl && !imageError ? (
            <img src={previewUrl} alt="Preview" />
          ) : (
            <div className="placeholder-icon">🖼️</div>
          )}
        </div>

        {/* Actions */}
        <div className="form-actions">
          {onDelete && (
            <button type="button" className="delete-btn" onClick={onDelete}>
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
