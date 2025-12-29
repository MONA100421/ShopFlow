import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

import ProductCard from "../components/ProductCard";

import type { RootState, AppDispatch } from "../store/store";
import { fetchProducts } from "../store/productsSlice";
import type { Product } from "../types/Product";

export default function ProductListPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { role } = useAuth();
  const { addToCart } = useCart();

  const { list, loading, error } = useSelector(
    (state: RootState) => state.products
  );

  /* ---------------- Phase 2 UI state ---------------- */
  const [sortBy, setSortBy] = useState<string>("default");

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  /* ---------------- Handlers ---------------- */
  const handleAddToCart = (product: Product, quantity: number) => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.title,
        price: product.price,
        image: product.image,
      });
    }
  };


  const handleEditProduct = (id: string) => {
    navigate(`/products/${id}/edit`);
  };

  /* ---------------- Sort (real but simple) ---------------- */
  const sortedList = [...list].sort((a, b) => {
    if (sortBy === "price-asc") {
      return a.price - b.price;
    }
    if (sortBy === "price-desc") {
      return b.price - a.price;
    }
    if (sortBy === "name-asc") {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  return (
    <div className="container">
      {/* Page header */}
      <div className="product-list-header">
        <h1>Products</h1>

        {role === "admin" && (
          <button
            type="button"
            onClick={() => navigate("/products/new")}
          >
            Add Product
          </button>
        )}
      </div>

      {/* Toolbar */}
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

      {/* States */}
      {loading && <p>Loading...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && sortedList.length === 0 && (
        <p>No products found.</p>
      )}

      {/* Product Grid */}
      {!loading && sortedList.length > 0 && (
        <div className="product-grid">
          {sortedList.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isAdmin={role === "admin"}
              onAddToCart={handleAddToCart}
              onEdit={handleEditProduct}
            />
          ))}
        </div>
      )}

      {/* Pagination (UI only) */}
      <div className="pagination">
        <button>{"<"}</button>
        <button className="active">1</button>
        <button>2</button>
        <button>{">"}</button>
      </div>
    </div>
  );
}
