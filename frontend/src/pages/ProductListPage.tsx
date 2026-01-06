import "./ProductListPage.css";
import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  Utils
========================= */


// 🔑 關鍵：統一字串正規化（中文非常重要）
function normalizeText(text: string) {
 return text
   .normalize("NFC") // Unicode 正規化
   .toLowerCase()
   .trim();
}


/* =========================
  Component
========================= */


export default function ProductListPage() {
 const navigate = useNavigate();
 const dispatch = useDispatch<AppDispatch>();
 const dropdownRef = useRef<HTMLDivElement>(null);


 /* ===== URL Search ===== */
 const [searchParams] = useSearchParams();
 const rawKeyword = searchParams.get("q") ?? "";
 const keyword = normalizeText(rawKeyword);


 /* ===== Redux state ===== */
 const { list, loading, error } = useSelector(
   (state: RootState) => state.products
 );


 const { user } = useSelector((state: RootState) => state.auth);
 const isAdmin = user?.role === "admin";


 /* ===== Local state ===== */
 const [sortBy, setSortBy] = useState<SortKey>("last");
 const [open, setOpen] = useState(false);
 const [currentPage, setCurrentPage] = useState(1);


 /* =========================
    Effects
 ========================= */


 useEffect(() => {
   dispatch(fetchProducts());
 }, [dispatch]);


 // Close dropdown
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


 // Reset page when search or sort changes
 useEffect(() => {
   setCurrentPage(1);
 }, [keyword, sortBy]);


 /* =========================
    Filter (Search) ✅ 中文版
 ========================= */


 const filteredList = useMemo(() => {
   if (!keyword) return list;


   return list.filter((product) => {
     const title = normalizeText(product.title);
     const desc = normalizeText(product.description ?? "");


     return (
       title.includes(keyword) ||
       desc.includes(keyword)
     );
   });
 }, [list, keyword]);


 /* =========================
    Sorting
 ========================= */


 const sortedList = [...filteredList].sort((a, b) => {
   if (sortBy === "price-asc") return a.price - b.price;
   if (sortBy === "price-desc") return b.price - a.price;


   return (
     new Date(b.createdAt).getTime() -
     new Date(a.createdAt).getTime()
   );
 });


 /* =========================
    Pagination
 ========================= */


 const totalPages = Math.ceil(
   sortedList.length / ITEMS_PER_PAGE
 );


 const pagedList = sortedList.slice(
   (currentPage - 1) * ITEMS_PER_PAGE,
   currentPage * ITEMS_PER_PAGE
 );


 const currentLabel =
   SORT_OPTIONS.find((o) => o.key === sortBy)?.label ??
   "Last added";


 /* =========================
    Render
 ========================= */


 return (
   <div className="product-page">
     <div className="container">
       <div className="product-header">
         <h1 className="product-title">Products</h1>


         <div className="product-header-actions">
           {/* Sort */}
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


       {/* Content */}
       {loading && <p className="loading-text">Loading...</p>}
       {error && <p className="error-text">{error}</p>}


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
                 className={`pagination-item ${currentPage === 1 ? "disabled" : ""}`}
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



