import { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";

import type { Product } from "../types/Product";
import type { AppDispatch } from "../store/store";
import { addToCart } from "../store/cartSlice";

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

  return (
    <div className="product-card">
      {/* Image */}
      <Link to={`/products/${product.id}`} className="product-image">
        {product.image ? (
          <img src={product.image} alt={product.title} />
        ) : (
          <div className="image-placeholder">No Image</div>
        )}
      </Link>

      {/* Content */}
      <div className="product-content">
        <h3 className="product-title">{product.title}</h3>
        <p className="product-price">
          ${product.price.toFixed(2)}
        </p>

        {/* Quantity selector */}
        <div className="product-quantity">
          <button type="button" onClick={handleDecrease}>
            −
          </button>

          <span>{quantity}</span>

          <button type="button" onClick={handleIncrease}>
            +
          </button>
        </div>

        {/* Actions */}
        <div className="product-actions">
          <button
            type="button"
            className="add-to-cart-btn"
            onClick={handleAddToCart}
          >
            Add to Cart
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
