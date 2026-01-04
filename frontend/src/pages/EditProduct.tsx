import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import type { RootState, AppDispatch } from "../redux/store";
import {
  fetchProductById,
  updateProduct,
  deleteProduct,
} from "../redux/slices/productSlice";

type ProductLike = {
  _id?: string;
  id?: string;
  name?: string;
  description?: string;
  price?: number | string;
  stock?: number | string;
  image?: string;
  imageUrl?: string;
  [k: string]: any;
};

export default function EditProduct() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();

  const dispatch = useDispatch<AppDispatch>();
  const dispatchAny: any = dispatch;

  const auth = useSelector((s: RootState) => (s as any).auth);
  const reduxRole = String(auth?.user?.role ?? auth?.role ?? "").toLowerCase();

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
  const jwtRole = (() => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1] || ""));
      return String(payload?.role || "").toLowerCase();
    } catch {
      return "";
    }
  })();

  const role = reduxRole || jwtRole;
  const isManager = role === "admin" || role === "manager";

  const current = useSelector(
    (s: RootState) => (s.products.current as ProductLike | null) || null
  );
  const loading = useSelector((s: RootState) => !!s.products.currentLoading);
  const error = useSelector((s: RootState) => s.products.currentError);
  const saving = useSelector((s: RootState) => !!s.products.saving);
  const saveError = useSelector((s: RootState) => s.products.saveError);

  const [msg, setMsg] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState("");

  // 1) 权限保护
  useEffect(() => {
    if (!role) return;
    if (!isManager) nav("/signin");
  }, [role, isManager, nav]);

  // 2) load product
  useEffect(() => {
    if (!id) return;
    setMsg("");
    dispatchAny(fetchProductById(id));
  }, [dispatchAny, id]);

  // 3) current → form
  useEffect(() => {
    if (!current) return;
    setName(current?.name || "");
    setDescription(current?.description || "");
    setPrice(String(current?.price ?? ""));
    setStock(String(current?.stock ?? ""));
    setImage(current?.image || current?.imageUrl || "");
  }, [current]);

  // 4) save
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg("");

    if (!id) {
      setMsg("❌ Missing product id");
      return;
    }

    const payload = {
      id,
      data: {
        name: name.trim(),
        description,
        price: Number(price) || 0,
        stock: Number(stock) || 0,
        image: image.trim(),
      },
    };

    try {
      const action = dispatchAny(updateProduct(payload));
      if (typeof action?.unwrap === "function") {
        await action.unwrap();
      }
      setMsg("✅ Updated!");
      nav("/products");
    } catch {
      // error already in redux
    }
  }

  // 5) delete ✅（现在位置正确）
  const onDelete = async () => {
    if (!id) return;

    const ok = window.confirm("确定要删除这个商品吗？删除后无法恢复。");
    if (!ok) return;

    setMsg("");

    try {
      await dispatch(deleteProduct(id)).unwrap();
      nav("/products", { replace: true });
    } catch (e: any) {
      setMsg(String(e?.message || e || "Delete failed"));
    }
  };

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
          />
        </label>

        <label className="field">
          <div className="label">Image URL</div>
          <input
            className="input"
            value={image}
            onChange={(e) => setImage(e.target.value)}
          />
        </label>

        {/* ✅ Image Preview Box (always shown, no "Preview" text) */}
        <div className="field">
          <div
            style={{
              width: "100%",
              height: 280,
              border: "2px dashed rgba(0,0,0,0.15)",
              borderRadius: 12,
              background: "rgba(255,255,255,0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {image?.trim() ? (
              <img
                src={image.trim()}
                alt="product"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
                onError={(e) => {
                  // 图片坏了就回到占位（不留空白）
                  (e.currentTarget as HTMLImageElement).removeAttribute("src");
                }}
              />
            ) : (
              <div style={{ opacity: 0.45, textAlign: "center" }}>
                <div style={{ fontSize: 44, lineHeight: 1 }}>🖼️</div>
              </div>
            )}
          </div>
        </div>

        <div
          className="form-actions"
          style={{
            display: "flex",
            gap: 12,
            marginTop: 16,
          }}
        >
          <button
            type="button"
            onClick={onDelete}
            className="btn"
            style={{
              minWidth: 140,
              border: "1px solid #e5e7eb",
              background: "#fff",
              color: "#111827",
            }}
          >
            Delete
          </button>

          <button
            className="btn btn-primary"
            type="submit"
            disabled={saving}
            style={{ flex: 1 }}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    )}
  </div>
);
}