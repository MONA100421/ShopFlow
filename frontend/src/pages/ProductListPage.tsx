import "./ProductListPage.css";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import ProductCard from "../components/ProductCard";
import type { RootState, AppDispatch } from "../store/store";
import { fetchProducts } from "../store/productsSlice";

import checkRightIcon from "../assets/check-right.svg";

/* =========================
   Constants
========================= */

type SortKey = "last" | "price-asc" | "price-desc";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "last", label: "Last added" },
  { key: "price-asc", label: "Price: low to high" },
  { key: "price-desc", label: "Price: high to low" },
];

const ITEMS_PER_PAGE = 10;

/* =========================
   Component
========================= */

export default function ProductListPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { list, loading, error } = useSelector(
    (state: RootState) => state.products
  );

  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === "admin";

  const [sortBy, setSortBy] = useState<SortKey>("last");
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  /* =========================
     Effects
  ========================= */

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // Close dropdown when clicking outside
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

  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy]);

  /* =========================
     Sorting
  ========================= */

  const sortedList = [...list].sort((a, b) => {
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    return 0;
  });

  /* =========================
     Pagination
  ========================= */

  const totalPages = Math.ceil(sortedList.length / ITEMS_PER_PAGE);

  const pagedList = sortedList.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const currentLabel =
    SORT_OPTIONS.find((o) => o.key === sortBy)?.label ?? "Last added";

  /* =========================
     Render
  ========================= */

  return (
    <div className="product-page">
      {/* 🔑 關鍵：Container */}
      <div className="container">
        {/* =========================
            Page Header
        ========================= */}
        <div className="product-header">
          <h1 className="product-title">Products</h1>

          <div className="product-header-actions">
            {/* ===== Sort Dropdown ===== */}
            <div className="sort-dropdown" ref={dropdownRef}>
              <button
                className="sort-trigger"
                type="button"
                onClick={() => setOpen((v) => !v)}
              >
                <span>{currentLabel}</span>
                <span className={`sort-caret ${open ? "open" : ""}`} />
              </button>

              {open && (
                <div className="sort-menu">
                  {SORT_OPTIONS.map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      className="sort-item"
                      onClick={() => {
                        setSortBy(key);
                        setOpen(false);
                      }}
                    >
                      <span className="sort-item-text">{label}</span>

                      {sortBy === key && (
                        <img
                          src={checkRightIcon}
                          alt="selected"
                          className="sort-check-icon"
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ===== Add Product ===== */}
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

        {/* =========================
            Content
        ========================= */}
        {loading && <p className="loading-text">Loading...</p>}
        {error && <p className="error-text">{error}</p>}

        {!loading && pagedList.length === 0 ? (
          <div className="product-empty" />
        ) : (
          <>
            <div className="product-grid">
              {pagedList.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isAdmin={isAdmin}
                  onEdit={(id) => navigate(`/products/${id}/edit`)}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className={`pagination-item ${
                    currentPage === 1 ? "disabled" : ""
                  }`}
                  onClick={() =>
                    currentPage > 1 && setCurrentPage(currentPage - 1)
                  }
                >
                  «
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      className={`pagination-item ${
                        page === currentPage ? "active" : ""
                      }`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  )
                )}

                <button
                  className={`pagination-item ${
                    currentPage === totalPages ? "disabled" : ""
                  }`}
                  onClick={() =>
                    currentPage < totalPages &&
                    setCurrentPage(currentPage + 1)
                  }
                >
                  »
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
