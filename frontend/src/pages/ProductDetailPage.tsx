import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import type { Product } from "../types/Product";
import type { AppDispatch, RootState } from "../store/store";
import { addToCart } from "../store/cartSlice";
import { getProductById } from "../services/productService";

import "./ProductDetailPage.css";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  /* =================================================
     🔑 唯一正確的身分來源（Redux auth）
     與 RequireAdmin.tsx 完全一致
  ================================================= */
  const user = useSelector((state: RootState) => state.auth.user);
  const isAdmin = user?.role === "admin";

  /* ===== 原本資料取得（不動） ===== */
  const product: Product | null =
    id ? getProductById(id) ?? null : null;

  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div className="product-detail-page">
        <div className="product-detail-container">
          <div className="product-not-found">
            Product not found
          </div>
        </div>
      </div>
    );
  }

  /* ===== 原本 handlers（不動） ===== */
  const handleIncrease = () => {
    setQuantity((q) => q + 1);
  };

  const handleDecrease = () => {
    setQuantity((q) => Math.max(1, q - 1));
  };

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        product,
        quantity,
      })
    );
    setQuantity(1);
  };

  /* ===============================
     Render
  =============================== */
  return (
    <div className="product-detail-page">
      <div className="product-detail-container">
        {/* ================= Page Header ================= */}
        <h1 className="product-detail-page-title">
          Products Detail
        </h1>

        {/* ================= Detail Card ================= */}
        <div className="product-detail-card">
          {/* ---------- Left: Product Image ---------- */}
          <div className="product-detail-image">
            {product.image && (
              <img
                src={product.image}
                alt={product.title}
              />
            )}
          </div>

          {/* ---------- Right: Product Info ---------- */}
          <div className="product-detail-info">
            {/* Category */}
            <div className="product-category">
              {product.category}
            </div>

            {/* Title */}
            <h2 className="product-title">
              {product.title}
            </h2>

            {/* Price */}
            <div className="product-price">
              ${product.price.toFixed(2)}
            </div>

            {/* Description */}
            {product.description && (
              <p className="product-description">
                {product.description}
              </p>
            )}

            {/* Quantity selector */}
            <div className="product-quantity">
              <button
                type="button"
                onClick={handleDecrease}
              >
                −
              </button>

              <span>{quantity}</span>

              <button
                type="button"
                onClick={handleIncrease}
              >
                +
              </button>
            </div>

            {/* ================= Actions ================= */}
            <div className="product-actions">
              <button
                className="add-to-cart-btn"
                onClick={handleAddToCart}
              >
                Add to Cart
              </button>

              <button
                className="back-btn"
                onClick={() =>
                  isAdmin
                    ? navigate(`/products/${product.id}/edit`)
                    : navigate("/")
                }
              >
                {isAdmin ? "Edit" : "Back"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
