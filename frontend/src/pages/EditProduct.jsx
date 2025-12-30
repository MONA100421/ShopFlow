import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { fetchProductById, updateProduct } from "../redux/slices/productSlice";

export default function EditProduct() {
  const { id } = useParams();
  const nav = useNavigate();
  const dispatch = useDispatch();

  // ✅ auth：做权限保护（防止直接输入 url 进入）
  const role = useSelector((s) => String(s.auth?.user?.role || "").toLowerCase());
  const isManager = role === "admin" || role === "manager";

  // ✅ products：读当前 product + loading/error
  const current = useSelector((s) => s.products.current);
  const loading = useSelector((s) => s.products.currentLoading);
  const error = useSelector((s) => s.products.currentError);
  const saving = useSelector((s) => s.products.saving);
  const saveError = useSelector((s) => s.products.saveError);

  const [msg, setMsg] = useState("");

  // 表单字段仍然用 useState（✅正确：表单是组件局部状态）
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState("");

  // 1) 权限保护
  useEffect(() => {
    if (!isManager) nav("/signin");
  }, [isManager, nav]);

  // 2) load product（Redux thunk）
  useEffect(() => {
    if (!id) return;
    setMsg("");
    dispatch(fetchProductById(id));
  }, [dispatch, id]);

  // 3) 当 current 到了，把值灌进表单（保持你原来行为）
  useEffect(() => {
    if (!current) return;
    setName(current?.name || "");
    setDescription(current?.description || "");
    setPrice(String(current?.price ?? ""));
    setStock(String(current?.stock ?? ""));
    setImage(current?.image || current?.imageUrl || "");
  }, [current]);

  // 4) save（Redux thunk）
  async function onSubmit(e) {
    e.preventDefault();
    setMsg("");

    try {
      await dispatch(
        updateProduct({
          id,
          data: {
            name: name.trim(),
            description,
            price: Number(price),
            stock: Number(stock),
            image: image.trim(),
          },
        })
      ).unwrap();

      setMsg("✅ Updated!");
      nav("/products");
    } catch {
      // 错误已经进了 redux 的 saveError，这里不用重复 setError
    }
  }

  return (
    <div className="page">
      <div className="page-head">
        <h1>Edit Product</h1>
        <div className="page-actions">
          <Link className="btn" to="/products">
            Back
          </Link>
        </div>
      </div>

      {msg && <div style={{ marginBottom: 12, opacity: 0.85 }}>{msg}</div>}
      {!loading && (error || saveError) && (
        <div style={{ marginBottom: 12 }}>
          Error: {String(saveError || error)}
        </div>
      )}

      {loading ? (
        <div style={{ marginTop: 16 }}>Loading...</div>
      ) : (
        <form className="form" onSubmit={onSubmit}>
          <label className="field">
            <div className="label">Name</div>
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </label>

          <label className="field">
            <div className="label">Price</div>
            <input
              className="input"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </label>

          <label className="field">
            <div className="label">Stock</div>
            <input
              className="input"
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="0"
            />
          </label>

          <label className="field">
            <div className="label">Image URL</div>
            <input
              className="input"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://..."
            />
          </label>

          <div className="form-actions">
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
