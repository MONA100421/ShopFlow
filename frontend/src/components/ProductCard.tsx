import { useState } from "react";
import { Link } from "react-router-dom";
import type { Product } from "../types/Product";

interface ProductCardProps {
  product: Product;
  isAdmin: boolean;
  onAddToCart: (product: Product, quantity: number) => void;
  onEdit?: (id: string) => void;
}

export default function ProductCard({
  product,
  isAdmin,
  onAddToCart,
  onEdit,
}: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);

  const handleIncrease = () => {
    setQuantity((q) => q + 1);
  };

  const handleDecrease = () => {
    setQuantity((q) => (q > 1 ? q - 1 : 1));
  };

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    setQuantity(1);
  };

  return (
    <div className="product-card">
      {/* Image */}
      <Link to={`/products/${product.id}`} className="product-image">
        {product.image ? (
            <img
                src={product.image}
                alt={product.title}
            />
        ) : (
            <div className="image-placeholder">
                No Image
            </div>
        )}
      </Link>

      {/* Content */}
      <div className="product-content">
        <h3 className="product-title">{product.title}</h3>
        <p className="product-price">${product.price}</p>

        {/* Quantity control */}
        <div className="product-quantity">
          <button
            type="button"
            onClick={handleDecrease}
            aria-label="Decrease quantity"
          >
            −
          </button>

          <span>{quantity}</span>

          <button
            type="button"
            onClick={handleIncrease}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        {/* Actions */}
        <div className="product-actions">
          <button
            type="button"
            onClick={handleAddToCart}
            className="add-to-cart-btn"
          >
            Add to Cart
          </button>

          {isAdmin && onEdit && (
            <button
              type="button"
              onClick={() => onEdit(product.id)}
              className="edit-product-btn"
            >
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
