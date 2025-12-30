import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import type { Product } from "../types/Product";
import type { AppDispatch } from "../store/store";
import { addToCart } from "../store/cartSlice";
import { getProductById } from "../services/productService";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const product: Product | null =
    id ? getProductById(id) ?? null : null;

  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return <p>Product not found</p>;
  }

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
    <div className="container">
      <h1>{product.title}</h1>

      {product.description && (
        <p className="product-description">
          {product.description}
        </p>
      )}

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
          className="add-to-cart-btn"
          onClick={handleAddToCart}
        >
          Add to Cart
        </button>

        <button
          className="back-btn"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
      </div>
    </div>
  );
}
