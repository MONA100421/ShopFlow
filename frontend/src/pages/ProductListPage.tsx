import "./ProductListPage.css";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import ProductCard from "../components/ProductCard";
import Pagination from "../components/Pagination";
import type { RootState, AppDispatch } from "../store/store";
import { fetchProductsThunk } from "../store/productsSlice";

import TriangleIcon from "../assets/Triangle.svg";
import CheckIcon from "../assets/check-right.svg";

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
  const dropdownRef = useRef<HTMLDivElement>(null);

  /* URL state */

  const [searchParams, setSearchParams] =
    useSearchParams();

  const keyword = normalizeText(
    searchParams.get("q") ?? ""
  );

  const sortBy = (searchParams.get("sort") ??
    "last") as SortKey;

  const pageFromUrl = Number(
    searchParams.get("page") ?? "1"
  );

  const currentPage =
    Number.isNaN(pageFromUrl) || pageFromUrl < 1
      ? 1
      : pageFromUrl;

  /* Redux state */

  const { list, loading, error } = useSelector(
    (state: RootState) => state.products
  );

  const { user } = useSelector(
    (state: RootState) => state.auth
  );
  const isAdmin = user?.role === "admin";

  /* Fetch products */

  useEffect(() => {
    dispatch(fetchProductsThunk());
  }, [dispatch]);

  /* Close dropdown on outside click */

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          e.target as Node
        )
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () =>
      document.removeEventListener(
        "mousedown",
        handler
      );
  }, []);

  /* Local UI state */
  
  const [open, setOpen] = useState(false);

  /* Filter */

  const filteredList = useMemo(() => {
    if (!Array.isArray(list)) return [];
    if (!keyword) return list;

    return list.filter((product) => {
      const title = normalizeText(product.title);
      const desc = normalizeText(
        product.description ?? ""
      );
      return (
        title.includes(keyword) ||
        desc.includes(keyword)
      );
    });
  }, [list, keyword]);

  /* Sorting */

  const sortedList = useMemo(() => {
    if (!Array.isArray(filteredList)) return [];

    return [...filteredList].sort((a, b) => {
      if (sortBy === "price-asc")
        return a.price - b.price;
      if (sortBy === "price-desc")
        return b.price - a.price;

      return (
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
      );
    });
  }, [filteredList, sortBy]);

  /* Pagination */

  const totalPages = Math.ceil(
    sortedList.length / ITEMS_PER_PAGE
  );

  const pagedList = useMemo(() => {
    return sortedList.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );
  }, [sortedList, currentPage]);

  /* Helpers */

  const updateParams = (updates: Record<string, string>) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      Object.entries(updates).forEach(([k, v]) =>
        params.set(k, v)
      );
      return params;
    });
  };

  const currentLabel =
    SORT_OPTIONS.find(
      (o) => o.key === sortBy
    )?.label ?? "Last added";

  /* Render */

  return (
    <div className="product-page">
      <div className="container">
        <div className="product-header">
          <h1 className="product-title">
            Products
          </h1>

          <div className="product-header-actions">
            {/* Sort */}
            <div
              className="sort-dropdown"
              ref={dropdownRef}
            >
              <button
                type="button"
                className="sort-trigger"
                onClick={() =>
                  setOpen((v) => !v)
                }
              >
                <span>{currentLabel}</span>
                <img
                  src={TriangleIcon}
                  alt=""
                  className={`sort-triangle ${
                    open ? "open" : ""
                  }`}
                />
              </button>

              {open && (
                <div className="sort-menu">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      className="sort-item"
                      onClick={() => {
                        updateParams({
                          sort: opt.key,
                          page: "1",
                        });
                        setOpen(false);
                      }}
                    >
                      <span className="sort-item-text">
                        {opt.label}
                      </span>
                      {sortBy === opt.key && (
                        <img
                          src={CheckIcon}
                          alt="selected"
                          className="sort-check-icon"
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {isAdmin && (
              <button
                className="add-product-btn"
                onClick={() =>
                  navigate("/products/new")
                }
              >
                Add Product
              </button>
            )}
          </div>
        </div>

        {loading && (
          <p className="loading-text">
            Loading...
          </p>
        )}

        {error && list.length === 0 && (
          <p className="error-text">
            {error}
          </p>
        )}

        {!loading && pagedList.length === 0 ? (
          <div className="product-empty">
            <p>No products found</p>
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
                    navigate(
                      `/products/${id}/edit`
                    )
                  }
                />
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) =>
                updateParams({ page: String(page) })
              }
            />
          </>
        )}
      </div>
    </div>
  );
}
