import { useEffect, useState, useRef } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import ProductCard from "../components/ProductCard";
import type { RootState, AppDispatch } from "../store/store";
import { fetchProducts } from "../store/productsSlice";

type SortKey = "last" | "price-asc" | "price-desc";

export default function ProductListPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { setCartOpen } = useOutletContext<{
    setCartOpen: (open: boolean) => void;
  }>();

  const { list, loading, error } = useSelector(
    (state: RootState) => state.products
  );

  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === "admin";

  const [sortBy, setSortBy] = useState<SortKey>("last");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const sortedList = [...list].sort((a, b) => {
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    return 0; // last added = backend order
  });

  const labelMap: Record<SortKey, string> = {
    last: "Last added",
    "price-asc": "Price: low to high",
    "price-desc": "Price: high to low",
  };

  return (
    <div className="container">
      {/* ===== Header ===== */}
      <div className="product-header">
        <h1 className="product-title">Products</h1>

        <div className="product-actions">
          {/* ===== Custom Dropdown ===== */}
          <div className="sort-dropdown" ref={dropdownRef}>
            <button
              className="sort-trigger"
              onClick={() => setOpen((v) => !v)}
            >
              {labelMap[sortBy]}
              <span className={`caret ${open ? "up" : ""}`} />
            </button>

            {open && (
              <div className="sort-menu">
                {(["last", "price-asc", "price-desc"] as SortKey[]).map(
                  (key) => (
                    <div
                      key={key}
                      className="sort-item"
                      onClick={() => {
                        setSortBy(key);
                        setOpen(false);
                      }}
                    >
                      <span>{labelMap[key]}</span>
                      {sortBy === key && <span className="check">✓</span>}
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {isAdmin && (
            <button
              className="add-product-btn"
              onClick={() => navigate("/products/new")}
            >
              Add Product
            </button>
          )}
        </div>
      </div>

      {/* ===== Content ===== */}
      {loading && <p>Loading...</p>}
      {error && <p className="error-text">{error}</p>}

      <div className="product-grid">
        {sortedList.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            isAdmin={isAdmin}
            onEdit={(id) => navigate(`/products/${id}/edit`)}
          />
        ))}
      </div>
    </div>
  );
}
