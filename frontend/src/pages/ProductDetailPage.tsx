import { useDispatch } from "react-redux";
import { addToCart } from "../store/cartSlice";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { getProductById } from "../services/productService";
import type { Product } from "../types/Product";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();

  const product: Product | null =
    id ? getProductById(id) ?? null : null;

  const { role } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  if (!product) {
    return <p>Product not found</p>;
  }

  const handleAddToCart = () => {
    dispatch(addToCart(product));
  };

  return (
    <div className="container">
      <h1>{product.title}</h1>

      {"description" in product && (
        <p className="product-description">
          {product.description}
        </p>
      )}

      <p className="product-price">${product.price}</p>

      {role === "admin" && (
        <button
          onClick={() =>
            navigate(`/products/${product.id}/edit`)
          }
        >
          Edit Product
        </button>
      )}

      <button
        className="add-to-cart-btn"
        onClick={handleAddToCart}
      >
        Add to Cart
      </button>
    </div>
  );
}
