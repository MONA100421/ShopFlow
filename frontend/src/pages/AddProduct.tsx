import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../redux/store";

import { createProduct } from "../redux/slices/productSlice";

export default function AddProduct() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  // ✅ 直接按 ProductsState 读（你 productSlice.ts 里就是这些字段）
  const loading = useSelector((s: RootState) => s.products.loading);
  const error = useSelector((s: RootState) => s.products.error);

  // 表单状态
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<string>("Category1");
  const [price, setPrice] = useState<string>("");
  const [stock, setStock] = useState<string>("");
  const [image, setImage] = useState<string>("");

  const [msg, setMsg] = useState<string>("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg("");

    const payload = {
      name: name.trim(),
      description: description.trim(),
      category: category.trim(),
      price: Number(price) || 0,
      stock: Number(stock) || 0,
      image: image.trim(),
    };

    try {
      // ✅ 你现在的 createProduct 是 createAsyncThunk（TS 版）
      // 所以 unwrap() 天然存在且有类型
      await dispatch(createProduct(payload)).unwrap();

      setMsg("✅ Product created successfully");
      navigate("/products");
    } catch (err) {
      // ✅ rejectWithValue(string) => err 可能是 string
      const m = typeof err === "string" ? err : "Create product failed";
      setMsg(`❌ ${m}`);
    }
  }

  return (
    <div className="page">
      <div className="page-head">
        <h1>Create Product</h1>
      </div>

      {msg && <div style={{ marginBottom: 12, opacity: 0.9 }}>{msg}</div>}

      {!msg && error && (
        <div style={{ marginBottom: 12, color: "#dc2626" }}>
          Error: {String(error)}
        </div>
      )}

      <form className="product-card form" onSubmit={onSubmit}>
        <label className="field">
          <div className="label">Product Name</div>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        <label className="field">
          <div className="label">Description</div>
          <textarea
            className="textarea"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        <div className="row form-row">
          <label className="field" style={{ flex: 1 }}>
            <div className="label">Category</div>
            <select
              className="select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Category1">Category1</option>
              <option value="Category2">Category2</option>
              <option value="Category3">Category3</option>
            </select>
          </label>

          <label className="field" style={{ flex: 1 }}>
            <div className="label">Price</div>
            <input
              className="input"
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </label>
        </div>

        <div className="row form-row">
          <label className="field" style={{ flex: 1 }}>
            <div className="label">Stock</div>
            <input
              className="input"
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />
          </label>

          <label className="field" style={{ flex: 1 }}>
            <div className="label">Image URL</div>
            <input
              className="input"
              value={image}
              onChange={(e) => setImage(e.target.value)}
            />
          </label>
        </div>

        {image && (
          <div className="image-preview-box">
            <img className="image-preview-img" src={image} alt="preview" />
          </div>
        )}

        <div className="page-actions">
          <button
            type="button"
            className="btn"
            onClick={() => navigate("/products")}
          >
            Back
          </button>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Saving..." : "Add Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
