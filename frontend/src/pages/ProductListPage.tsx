import "./ProductListPage.css";
import { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import ProductCard from "../components/ProductCard";
import type { RootState, AppDispatch } from "../store/store";
import { fetchProductsThunk } from "../store/productsSlice";

type SortKey = "last" | "price-asc" | "price-desc";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "last", label: "Last added" },
  { key: "price-asc", label: "Price: low to high" },
  { key: "price-desc", label: "Price: high to low" },
];

const ITEMS_PER_PAGE = 10;

function normalizeText(text: string) {
  return text.normalize("NFC").toLowerCase().trim();
}

export default function ProductListPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  /* URL Search */
  const [searchParams] = useSearchParams();
  const rawKeyword = searchParams.get("q") ?? "";
  const keyword = normalizeText(rawKeyword);

  /* Redux state */
  const { list, loading, error } = useSelector(
    (state: RootState) => state.products
  );

  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === "admin";

  /* Local state */
  const [sortBy, setSortBy] = useState<SortKey>("last");
  const [currentPage, setCurrentPage] = useState(1);

  /* Fetch products */
  useEffect(() => {
    dispatch(fetchProductsThunk());
  }, [dispatch]);

  /* Reset page when search or sort changes */
  useEffect(() => {
    setCurrentPage(1);
  }, [keyword, sortBy]);

  /* Filter (Search) */
  const filteredList = useMemo(() => {
    if (!Array.isArray(list)) return [];
    if (!keyword) return list;

    return list.filter((product) => {
      const title = normalizeText(product.title);
      const desc = normalizeText(product.description ?? "");
      return title.includes(keyword) || desc.includes(keyword);
    });
  }, [list, keyword]);

  /* Sorting */
  const sortedList = useMemo(() => {
    if (!Array.isArray(filteredList)) return [];

    return [...filteredList].sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      return (
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
      );
    });
  }, [filteredList, sortBy]);

  /* Pagination */
  const totalPages = Math.ceil(sortedList.length / ITEMS_PER_PAGE);

  const pagedList = useMemo(() => {
    return sortedList.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );
  }, [sortedList, currentPage]);

  return (
    <div className="product-page">
      <div className="container">
        <div className="product-header">
          <h1 className="product-title">Products</h1>

          <div className="product-header-actions">
            <select
              className="sort-trigger"
              id="product-sort"
              name="sort"
              aria-label="Sort products"
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as SortKey)
              }
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label}
                </option>
              ))}
            </select>

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

        {/* Loading */}
        {loading && <p className="loading-text">Loading...</p>}

        {/* Error */}
        {error && list.length === 0 && (
          <p className="error-text">{error}</p>
        )}

        {/* Empty */}
        {!loading && pagedList.length === 0 ? (
          <div className="product-empty">
            <p style={{ textAlign: "center", color: "#6b7280" }}>
              No products found
            </p>
          </div>
        ) : (
          <>
            <div className="product-grid">
              {pagedList.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isAdmin={isAdmin}
                  onEdit={(id) =>
                    navigate(`/products/${id}/edit`)
                  }
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
                    currentPage > 1 &&
                    setCurrentPage(currentPage - 1)
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
