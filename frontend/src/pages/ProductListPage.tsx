import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

import type { RootState, AppDispatch } from "../store/store";
import { fetchProducts } from "../store/productsSlice";

export default function ProductListPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { role } = useAuth();
  const { addToCart } = useCart();

  const { list, loading, error } = useSelector(
    (state: RootState) => state.products
  );

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  return (
    <div>
      <h1>Products</h1>

      {/* Admin only */}
      {role === "admin" && (
        <button onClick={() => navigate("/products/new")}>
          Add Product
        </button>
      )}

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && list.length === 0 && <p>No products</p>}

      <ul>
        {list.map((p) => (
          <li key={p.id}>
            <h3>{p.title}</h3>
            <p>${p.price}</p>

            <Link to={`/products/${p.id}`}>View</Link>

            <button
              onClick={() =>
                addToCart({
                  id: p.id,
                  name: p.title,
                  price: p.price,
                  image: p.image,
                })
              }
            >
              Add to Cart
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
