import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo, useState } from "react";

import { fetchProducts } from "../redux/slices/productSlice";
import { addToCart, setQty } from "../redux/slices/cartSlice";

const PAGE_SIZE = 8;

function getImg(p) {
    return (
        p?.image ||
        p?.imageUrl ||
        p?.img ||
        "https://via.placeholder.com/600x400?text=No+Image"
    );
}

export default function ProductsList() {
    const dispatch = useDispatch();

    // ✅ Manager 判定：优先 Redux（auth.user.role），没有就 fallback 到 localStorage（兼容旧后端/旧逻辑）
    const role = useSelector((s) => String(s.auth?.user?.role || "").toLowerCase());
    const manager = role === "admin" || role === "manager";

    // ✅ Redux: products
    const products = useSelector((state) => state.products.items || []);
    const loading = useSelector((state) => state.products.loading);
    const error = useSelector((state) => state.products.error);

    // ✅ Redux: search（从 uiSlice 来）
    const search = useSelector((state) => state.ui.search || "");

    // ✅ Redux: cart（从 cartSlice 来）
    const cart = useSelector((state) => state.cart.items || {});

    // UI: sort + pagination
    const [sortKey, setSortKey] = useState("last");
    const [page, setPage] = useState(1);

    useEffect(() => {
        dispatch(fetchProducts());
    }, [dispatch]);

    useEffect(() => {
        // 搜索/排序变了就回到第一页
        setPage(1);
    }, [search, sortKey]);

    const viewList = useMemo(() => {
        const arr = Array.isArray(products) ? [...products] : [];

        // filter
        const q = (search || "").trim().toLowerCase();
        const filtered = q
            ? arr.filter((p) => {
                const name = String(p?.name || "").toLowerCase();
                const desc = String(p?.description || "").toLowerCase();
                const cat = String(p?.category || "").toLowerCase();
                return name.includes(q) || desc.includes(q) || cat.includes(q);
            })
            : arr;

        // sort
        const getPrice = (p) => {
            const n = Number(p?.price);
            return Number.isFinite(n) ? n : 0;
        };
        const getCreatedAt = (p) => {
            const t = p?.createdAt ? new Date(p.createdAt).getTime() : 0;
            return Number.isFinite(t) ? t : 0;
        };

        const stable = filtered.map((p, idx) => ({ p, idx }));
        stable.sort((a, b) => {
            if (sortKey === "priceAsc") {
                const diff = getPrice(a.p) - getPrice(b.p);
                return diff !== 0 ? diff : a.idx - b.idx;
            }
            if (sortKey === "priceDesc") {
                const diff = getPrice(b.p) - getPrice(a.p);
                return diff !== 0 ? diff : a.idx - b.idx;
            }
            const diff = getCreatedAt(b.p) - getCreatedAt(a.p);
            return diff !== 0 ? diff : a.idx - b.idx;
        });

        return stable.map((x) => x.p);
    }, [products, sortKey, search]);

    // pagination
    const totalPages = Math.max(1, Math.ceil(viewList.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const paged = useMemo(() => {
        const start = (safePage - 1) * PAGE_SIZE;
        return viewList.slice(start, start + PAGE_SIZE);
    }, [viewList, safePage]);

    return (
        <div className="page">
            {/* ===== Header ===== */}
            <div className="page-head">
                <h1 className="page-title">Products</h1>

                <div className="page-actions">
                    <select
                        className="select"
                        value={sortKey}
                        onChange={(e) => setSortKey(e.target.value)}
                        style={{ width: 220 }}
                    >
                        <option value="last">Last added</option>
                        <option value="priceAsc">Price: low to high</option>
                        <option value="priceDesc">Price: high to low</option>
                    </select>

                    {/* ✅ 只有 manager 才能看到 Add Product */}
                    {manager && (
                        <Link className="btn btn-primary" to="/management/products/new">
                            Add Product
                        </Link>
                    )}
                </div>
            </div>

            {/* ===== 状态 ===== */}
            {loading && <div style={{ textAlign: "center", marginTop: 40 }}>Loading...</div>}

            {!loading && error && (
                <div style={{ textAlign: "center", marginTop: 40 }}>
                    Load failed: {String(error)}
                </div>
            )}

            {!loading && !error && viewList.length === 0 && (
                <div style={{ textAlign: "center", marginTop: 40, opacity: 0.7 }}>
                    {search?.trim() ? `No results for "${search}".` : "No products yet."}
                </div>
            )}

            {/* ===== 商品卡片 ===== */}
            {!loading && !error && paged.length > 0 && (
                <>
                    <div className="grid">
                        {paged.map((p) => {
                            const pid = String(p?._id ?? p?.id ?? "");
                            const qty = Number(cart?.[pid] || 0);

                            return (
                                <div className="card product-card" key={pid || `${p?.name}-${p?.price}`}>
                                    {/* ✅ 图片可点：去详情 */}
                                    <Link to={`/products/${pid}`} className="product-thumb">
                                        <img src={getImg(p)} alt={p?.name || "product"} />
                                    </Link>

                                    <div className="product-body">
                                        {/* ✅ 名字可点：去详情（不影响 +/- / Edit） */}
                                        <Link to={`/products/${pid}`} className="product-name">
                                            {p?.name || "(No name)"}
                                        </Link>

                                        <div className="product-price">
                                            ${Number(p?.price || 0).toFixed(2)}
                                        </div>

                                        <div className="row">
                                            {/* 数量控制 */}
                                            <div className="stepper">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (!pid) return;
                                                        dispatch(setQty({ id: pid, qty: Math.max(0, qty - 1) }));
                                                    }}
                                                    aria-label="decrease"
                                                >
                                                    –
                                                </button>
                                                <span>{qty}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (!pid) return;
                                                        dispatch(addToCart({ id: pid, delta: 1 }));
                                                    }}
                                                    aria-label="increase"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            {/* ✅ Edit：只给 manager */}
                                            {manager && (
                                                <Link className="btn" to={`/management/products/${pid}/edit`}>
                                                    Edit
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* ===== 分页 ===== */}
                    {totalPages > 1 && (
                        <div className="pagination">
                            <div className="pg">
                                <button disabled={safePage === 1} onClick={() => setPage(1)}>
                                    «
                                </button>
                                <button
                                    disabled={safePage === 1}
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                >
                                    ‹
                                </button>

                                {Array.from({ length: totalPages })
                                    .slice(0, 7)
                                    .map((_, i) => {
                                        const n = i + 1;
                                        return (
                                            <button
                                                key={n}
                                                className={n === safePage ? "active" : ""}
                                                onClick={() => setPage(n)}
                                            >
                                                {n}
                                            </button>
                                        );
                                    })}

                                <button
                                    disabled={safePage === totalPages}
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                >
                                    ›
                                </button>
                                <button disabled={safePage === totalPages} onClick={() => setPage(totalPages)}>
                                    »
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
