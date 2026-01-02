import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../redux/store";

import { fetchProductById } from "../redux/slices/productSlice";
import { addToCart } from "../redux/slices/cartSlice";

// --- 宽松产品类型（slice 还是 JS，TS 先止血） ---
type ProductLike = {
  _id?: string;
  id?: string;
  name?: string;
  category?: string;
  description?: string;
  price?: number | string;
  stock?: number | string;
  image?: string;
  imageUrl?: string;
  img?: string;
  [k: string]: any;
};

function getImg(p?: ProductLike) {
  return (
    p?.image ||
    p?.imageUrl ||
    p?.img ||
    "https://via.placeholder.com/900x600?text=No+Image"
  );
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();

  const dispatch = useDispatch<AppDispatch>();
  // ✅ 万能 dispatch：专门给 JS thunk / JS action 用
  const dispatchAny: any = dispatch;

  // --- products ---
  const products = useSelector((s: RootState) => (s as any).products || {});
  const product: ProductLike | null = products.current || null;
  const loading = !!products.currentLoading;
  const error = products.currentError;

  // --- cart ---
  const cartItems: Record<string, number> =
    useSelector((s: RootState) => (s as any).cart?.items) || {};
  const qty = cartItems[String(id)] || 0;

  // --- auth / role ---
  const auth = useSelector((s: RootState) => (s as any).auth);
  const role = String(auth?.user?.role ?? auth?.role ?? "").toLowerCase();
  const manager = role === "admin" || role === "manager";

  // load product
  useEffect(() => {
    if (!id) return;
    const pid = id;
    dispatchAny(fetchProductById(pid as any));
  }, [dispatchAny, id]);

  return (
    <div className="page">
      <div className="page-head">
        <h1>Products Detail</h1>
        <div className="page-actions">
          <button
            className="btn"
            type="button"
            onClick={() => nav("/products")}
          >
            Back
          </button>
        </div>
      </div>

      {loading && <div style={{ marginTop: 16 }}>Loading...</div>}
      {!loading && error && (
        <div style={{ marginTop: 16 }}>Error: {String(error)}</div>
      )}

      {!loading && !error && product && (
        <div className="card" style={{ padding: 24 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 0.8fr",
              gap: 28,
              alignItems: "start",
            }}
          >
            <div
              style={{
                borderRadius: 14,
                overflow: "hidden",
                background: "#fff",
              }}
            >
              <img
                src={getImg(product)}
                alt={product?.name || "product"}
                style={{ width: "100%", height: "100%", display: "block" }}
              />
            </div>

            <div>
              <div style={{ opacity: 0.7, marginBottom: 6 }}>
                {product?.category || "Category"}
              </div>

              <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 10 }}>
                {product?.name}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 14,
                }}
              >
                <div style={{ fontSize: 32, fontWeight: 800 }}>
                  ${Number(product?.price || 0).toFixed(2)}
                </div>

                {Number(product?.stock ?? 1) <= 0 && (
                  <span
                    style={{
                      fontSize: 12,
                      padding: "6px 10px",
                      borderRadius: 999,
                      background: "#fee2e2",
                      color: "#b91c1c",
                    }}
                  >
                    Out of Stock
                  </span>
                )}
              </div>

              <div style={{ opacity: 0.8, lineHeight: 1.5, marginBottom: 18 }}>
                {product?.description || "No description."}
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button
                  className="btn btn-primary"
                  type="button"
                  disabled={Number(product?.stock ?? 1) <= 0}
                  onClick={() =>
                    dispatchAny(addToCart({ id: String(id), delta: 1 }))
                  }
                >
                  Add To Cart {qty ? `(${qty})` : ""}
                </button>

                {manager && (
                  <Link className="btn" to={`/management/products/${id}/edit`}>
                    Edit
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
