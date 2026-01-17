import type { CartItem } from "../types/CartItem";
import "./ProductCard.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";

import type { Product } from "../types/Product";
import type { AppDispatch } from "../store/store";

/* ✅ 正確：直接 import action */
import { addToCartThunk } from "../store/cartSlice";

interface ProductCardProps {
  product: Product;
  isAdmin: boolean;
  onEdit?: (id: string) => void;
}

export default function ProductCard({
  product,
  isAdmin,
  onEdit,
}: ProductCardProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [quantity, setQuantity] = useState(1);

  /* ================= Stock rules ================= */

  const isOutOfStock = product.stock === 0;
  const maxQuantity = product.stock;
  const isMaxReached = quantity >= maxQuantity;

  const handleIncrease = () => {
    if (isOutOfStock) return;
    if (isMaxReached) return;
    setQuantity((q) => q + 1);
  };

  const handleDecrease = () => {
    if (isOutOfStock) return;
    setQuantity((q) => Math.max(1, q - 1));
  };

  const handleAddToCart = () => {
    const item: CartItem = {
      productId: product.id,
      name: product.title,
      price: product.price,
      imageUrl: product.image,
      quantity: 1,
      subtotal: product.price,
    };

    dispatch(addToCartThunk(item));
  };


  return (
    <div className="product-card">
      {/* Image */}
      <Link
        to={`/products/${product.id}`}
        className="product-image"
      >
        {product.image ? (
          <img src={product.image} alt={product.title} />
        ) : (
          <div className="image-placeholder">
            No Image
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="product-content">
        <h3 className="product-title">
          {product.title}
        </h3>

        <p className="product-price">
          ${product.price.toFixed(2)}
        </p>

        {/* Quantity */}
        <div className="product-quantity">
          <button
            type="button"
            className="qty-btn"
            onClick={handleDecrease}
            disabled={isOutOfStock}
          >
            −
          </button>

          <span className="quantity-value">
            {quantity}
          </span>

          <button
            type="button"
            className="qty-btn"
            onClick={handleIncrease}
            disabled={isOutOfStock || isMaxReached}
          >
            +
          </button>
        </div>

        {/* Actions */}
        <div className="product-actions">
          <button
            type="button"
            className="add-to-cart-btn"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
          >
            {isOutOfStock
              ? "Out of Stock"
              : "Add to Cart"}
          </button>

          {isAdmin && onEdit && (
            <button
              type="button"
              className="edit-product-btn"
              onClick={() => onEdit(product.id)}
            >
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
