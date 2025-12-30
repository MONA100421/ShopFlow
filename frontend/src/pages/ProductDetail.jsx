import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductById } from "../redux/productSlice";
import { useStore } from "../state/StoreContext";
import { isManager } from "../utils/auth";

function getImg(p) {
    return (
        p?.image ||
        p?.imageUrl ||
        p?.img ||
        "https://via.placeholder.com/900x600?text=No+Image"
    );
}

export default function ProductDetail() {
    const { id } = useParams();
    const nav = useNavigate();
    const dispatch = useDispatch();
    const manager = isManager();

    const product = useSelector((s) => s.products.current);
    const loading = useSelector((s) => s.products.currentLoading);
    const error = useSelector((s) => s.products.currentError);

    const { addToCart, cart } = useStore();
    const qty = cart?.[String(id)] || 0;

    useEffect(() => {
        if (id) dispatch(fetchProductById(id));
    }, [dispatch, id]);

    return (
        <div className="page">
            <div className="page-head">
                <h1>Products Detail</h1>
                <div className="page-actions">
                    <button className="btn" type="button" onClick={() => nav("/products")}>
                        Back
                    </button>
                </div>
            </div>

            {loading && <div style={{ marginTop: 16 }}>Loading...</div>}
            {!loading && error && <div style={{ marginTop: 16 }}>Error: {String(error)}</div>}

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
                        {/* Left: image */}
                        <div style={{ borderRadius: 14, overflow: "hidden", background: "#fff" }}>
                            <img
                                src={getImg(product)}
                                alt={product?.name || "product"}
                                style={{ width: "100%", height: "100%", display: "block" }}
                            />
                        </div>

                        {/* Right: info */}
                        <div>
                            <div style={{ opacity: 0.7, marginBottom: 6 }}>
                                {product?.category || "Category"}
                            </div>

                            <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 10 }}>
                                {product?.name}
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
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
                                    onClick={() => addToCart(String(id), 1)}
                                >
                                    Add To Cart {qty ? `(${qty})` : ""}
                                </button>

                                {/* ✅ 只有 manager 才能看到 Edit */}
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
