import ProductImage from "../components/ProductImage";
import QuantityButton from "../components/QuantityButton";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import type { AppDispatch, RootState } from "../store/store";
import {
  addToCartThunk,
  updateQuantityThunk,
  removeFromCartThunk,
} from "../store/cartSlice";
import { fetchProductByIdThunk } from "../store/productsSlice";

import "./ProductDetailPage.css";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  /* =================================================
     Auth / Role
  ================================================= */
  const user = useSelector((state: RootState) => state.auth.user);
  const isAdmin = user?.role === "admin";

  /* =================================================
     Product from Redux Store
  ================================================= */
  const { list, loading } = useSelector(
    (state: RootState) => state.products
  );

  const product = list.find((p) => p.id === id);

  /* =================================================
     Cart Item (single source of truth)
  ================================================= */
  const cartItem = useSelector((state: RootState) =>
    state.cart.items.find(
      (item) => item.productId === id
    )
  );

  const quantity = cartItem?.quantity ?? 0;

  /* =================================================
     Local state: not found flag
  ================================================= */
  const [notFound, setNotFound] = useState(false);

  /* =================================================
     Fetch Product by Id
  ================================================= */
  useEffect(() => {
    if (!id) {
      navigate("/not-found", { replace: true });
      return;
    }

    if (product) return;

    dispatch(fetchProductByIdThunk(id))
      .unwrap()
      .catch(() => {
        setNotFound(true);
      });
  }, [id, product, dispatch, navigate]);

  /* =================================================
     Loading
  ================================================= */
  if (loading && !product && !notFound) {
    return (
      <div className="product-detail-page">
        <div className="product-detail-container">
          <div className="product-not-found">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  /* =================================================
     Not Found
  ================================================= */
  if (notFound) {
    navigate("/not-found", { replace: true });
    return null;
  }

  if (!product) return null;

  /* =================================================
     Stock rules
  ================================================= */
  const isOutOfStock = product.stock === 0;
  const isMaxReached = quantity >= product.stock;

  /* =================================================
     Handlers (Redux-driven – SINGLE SOURCE)
  ================================================= */
  const handleAdd = () => {
    dispatch(
      addToCartThunk({
        productId: product.id,
        name: product.title,
        price: product.price,
        imageUrl: product.image,
        quantity: 1,
        subtotal: product.price,
      })
    );
  };

  const handleIncrease = () => {
    if (isMaxReached) return;

    dispatch(
      updateQuantityThunk({
        productId: product.id,
        delta: 1,
      })
    );
  };

  const handleDecrease = () => {
    if (quantity <= 1) {
      dispatch(removeFromCartThunk(product.id));
    } else {
      dispatch(
        updateQuantityThunk({
          productId: product.id,
          delta: -1,
        })
      );
    }
  };

  /* =================================================
     Render
  ================================================= */
  return (
    <div className="product-detail-page">
      <div className="product-detail-container">
        <h1 className="product-detail-page-title">
          Product Detail
        </h1>

        <div className="product-detail-card">
          {/* ---------- Image ---------- */}
          <div className="product-detail-image">
            <ProductImage
              src={product.image}
              alt={product.title}
            />
          </div>

          {/* ---------- Info ---------- */}
          <div className="product-detail-info">
            <div className="product-category">
              {product.category}
            </div>

            <h2 className="product-title">
              {product.title}
            </h2>
            <div className="product-price-row">
              <div className="product-price">
                ${product.price.toFixed(2)}
              </div>

              {product.stock === 0 && (
                <span className="out-of-stock-badge">
                  Out of Stock
                </span>
              )}
            </div>
            
            {product.description && (
              <p className="product-description">
                {product.description}
              </p>
            )}

            {/* ================= Actions (LOCKED) ================= */}
            <div className="product-detail-actions">
              <QuantityButton
                quantity={quantity}
                onAdd={handleAdd}
                onIncrease={handleIncrease}
                onDecrease={handleDecrease}
                disabled={isOutOfStock}
              />

              {isAdmin && (
                <button
                  className="edit-product-btn"
                  onClick={() =>
                    navigate(
                      `/products/${product.id}/edit`
                    )
                  }
                >
                  Edit
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
