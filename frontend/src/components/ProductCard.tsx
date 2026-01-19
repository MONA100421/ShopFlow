import ProductImage from "./ProductImage";
import QuantityButton from "./QuantityButton";
import "./ProductCard.css";

import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import type { Product } from "../types/Product";
import type { AppDispatch, RootState } from "../store/store";
import {
  addToCartThunk,
  updateQuantityThunk,
  removeFromCartThunk,
} from "../store/cartSlice";

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

  const cartItem = useSelector((state: RootState) =>
    state.cart.items.find(
      (item) => item.productId === product.id
    )
  );

  const quantity = cartItem?.quantity ?? 0;
  const isOutOfStock = product.stock === 0;
  const isMaxReached = quantity >= product.stock;

  /* ================= Handlers ================= */

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

  return (
    <div className="product-card">
      <Link
        to={`/products/${product.id}`}
        className="product-image"
      >
        <ProductImage
          src={product.image}
          alt={product.title}
        />
      </Link>

      <div className="product-content">
        <h3 className="product-title">
          {product.title}
        </h3>

        <p className="product-price">
          ${product.price.toFixed(2)}
        </p>

        {/* ⭐ 關鍵：同一 row */}
        <div className="product-card-actions">
          <QuantityButton
            quantity={quantity}
            onAdd={handleAdd}
            onIncrease={handleIncrease}
            onDecrease={handleDecrease}
            disabled={isOutOfStock}
          />

          {isAdmin && onEdit && (
            <button
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
