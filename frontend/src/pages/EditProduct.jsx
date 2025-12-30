import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { API_BASE } from "../config";
import { getToken } from "../utils/auth";

function parseMaybeJson(text) {
  try {
    return { json: JSON.parse(text), text };
  } catch {
    return { json: null, text };
  }
}

export default function EditProduct() {
  const { id } = useParams();
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState("");

  // 1) load product
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      setMsg("");

      try {
        const resp = await fetch(`${API_BASE}/api/products/${id}`, {
          method: "GET",
        });

        const raw = await resp.text(); // ✅ 先当 text 读，避免 HTML 把 .json() 炸掉
        const { json } = parseMaybeJson(raw);

        if (!resp.ok) {
          const m = json?.message || `Load failed (${resp.status})`;
          throw new Error(m);
        }

        if (!json || typeof json !== "object") {
          // ✅ 说明后端没返回 JSON（大概率请求打到了前端 HTML）
          throw new Error(
            "API did not return JSON. Please check API_BASE and backend route /api/products/:id."
          );
        }

        setName(json?.name || "");
        setDescription(json?.description || "");
        setPrice(String(json?.price ?? ""));
        setStock(String(json?.stock ?? ""));
        setImage(json?.image || json?.imageUrl || "");
      } catch (e) {
        setError(e?.message || String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // 2) save
  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setMsg("");

    try {
      const resp = await fetch(`${API_BASE}/api/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          description,
          price: Number(price),
          stock: Number(stock),
          image: image.trim(),
        }),
      });

      const raw = await resp.text();
      const { json } = parseMaybeJson(raw);

      if (!resp.ok) {
        const m = json?.message || `Update failed (${resp.status})`;
        throw new Error(m);
      }

      setMsg("✅ Updated!");
      nav("/products");
    } catch (e) {
      setError(e?.message || String(e));
    }
  }

  return (
    <div className="page">
      <div className="page-head">
        <h1>Edit Product</h1>

        {/* 可选：给个返回 */}
        <div className="page-actions">
          <Link className="btn" to="/products">
            Back
          </Link>
        </div>
      </div>

      {msg && <div style={{ marginBottom: 12, opacity: 0.85 }}>{msg}</div>}
      {!loading && error && (
        <div style={{ marginBottom: 12 }}>Error: {error}</div>
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
              placeholder=""
            />
          </label>

          <label className="field">
            <div className="label">Description</div>
            <textarea
              className="textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder=""
              rows={4}
            />
          </label>

          <label className="field">
            <div className="label">Price</div>
            <input
              className="input"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder=""
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
            <button className="btn btn-primary" type="submit">
              Save
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
