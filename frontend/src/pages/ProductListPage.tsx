import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { useAuth } from "../context/AuthContext";
import ProductCard from "../components/ProductCard";

import type { RootState, AppDispatch } from "../store/store";
import { fetchProducts } from "../store/productsSlice";

export default function ProductListPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { role } = useAuth();

  const { setCartOpen } = useOutletContext<{
    setCartOpen: (open: boolean) => void;
  }>();

  const { list, loading, error } = useSelector(
    (state: RootState) => state.products
  );

  const [sortBy, setSortBy] = useState("default");

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleEditProduct = (id: string) => {
    navigate(`/products/${id}/edit`);
  };

  const sortedList = [...list].sort((a, b) => {
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    if (sortBy === "name-asc") return a.title.localeCompare(b.title);
    return 0;
  });

  return (
    <div className="container">
      <div className="product-list-header">
        <h1>Products</h1>

        {role === "admin" && (
          <button onClick={() => navigate("/products/new")}>
            Add Product
          </button>
        )}
      </div>

      <div className="product-toolbar">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="default">Sort by</option>
          <option value="price-asc">Price: Low → High</option>
          <option value="price-desc">Price: High → Low</option>
          <option value="name-asc">Name: A → Z</option>
        </select>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && sortedList.length > 0 && (
        <div className="product-grid">
          {sortedList.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isAdmin={role === "admin"}
              onEdit={handleEditProduct}
            />
          ))}
        </div>
      )}
    </div>
  );
}
