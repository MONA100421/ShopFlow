import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import type { Product } from "../types/Product";
import type { AppDispatch, RootState } from "../store/store";
import { addToCartThunk } from "../store/cartSlice";
import { getProductById } from "../services/productService";

import "./ProductDetailPage.css";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  /* =================================================
     🔑 Auth / Role
  ================================================= */
  const user = useSelector((state: RootState) => state.auth.user);
  const isAdmin = user?.role === "admin";

  /* =================================================
     Product State
  ================================================= */
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  /* =================================================
     Fetch Product
  ================================================= */
  useEffect(() => {
    if (!id || typeof id !== "string") {
      setLoading(false);
      return;
    }

    const loadProduct = async () => {
      try {
        const data = await getProductById(id);
        setProduct(data);
      } catch (err) {
        console.error("Failed to load product:", err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  /* ================= Quantity ================= */
  const [quantity, setQuantity] = useState(1);

  /* ================= Loading ================= */
  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="product-detail-container">
          <div className="product-not-found">Loading...</div>
        </div>
      </div>
    );
  }

  /* ================= Not Found ================= */
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

  /* =================================================
     Stock / Quantity Rules
  ================================================= */
  const isOutOfStock = product.stock === 0;
  const maxQuantity = product.stock;
  const isMaxReached = quantity >= maxQuantity;

  /* ================= Handlers ================= */
  const handleIncrease = () => {
    if (isOutOfStock || isMaxReached) return;
    setQuantity((q) => q + 1);
  };

  const handleDecrease = () => {
    if (isOutOfStock) return;
    setQuantity((q) => Math.max(1, q - 1));
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    dispatch(
      addToCartThunk({
        product,
        quantity,
      })
    );

    setQuantity(1);
  };

  /* ================= Render ================= */
  return (
    <div className="product-detail-page">
      <div className="product-detail-container">
        <h1 className="product-detail-page-title">
          Product Detail
        </h1>

        <div className="product-detail-card">
          {/* Image */}
          <div className="product-detail-image">
            {product.image ? (
              <img
                src={product.image}
                alt={product.title}
              />
            ) : (
              <div className="no-image">No Image</div>
            )}
          </div>

          {/* Info */}
          <div className="product-detail-info">
            <div className="product-category">
              {product.category}
            </div>

            <h2 className="product-title">
              {product.title}
            </h2>

            <div className="product-price">
              ${product.price.toFixed(2)}
            </div>

            {isOutOfStock && (
              <div className="out-of-stock-badge">
                Out of Stock
              </div>
            )}

            {product.description && (
              <p className="product-description">
                {product.description}
              </p>
            )}

            {/* Quantity */}
            <div className="product-quantity">
              <button
                type="button"
                onClick={handleDecrease}
                disabled={isOutOfStock}
              >
                −
              </button>

              <span>{quantity}</span>

              <button
                type="button"
                onClick={handleIncrease}
                disabled={isOutOfStock || isMaxReached}
              >
                +
              </button>
            </div>

            {/* Actions */}
            <div className="product-actions">
              <button
                className="add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
              >
                {isOutOfStock ? "Out of Stock" : "Add to Cart"}
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
