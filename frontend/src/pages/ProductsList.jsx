import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo, useState } from "react";
import { fetchProducts } from "../redux/productSlice";
import { useStore } from "../state/StoreContext";

export default function ProductsList() {
    const dispatch = useDispatch();

    // Redux: products
    const products = useSelector((state) => state.products.items || []);
    const loading = useSelector((state) => state.products.loading);
    const error = useSelector((state) => state.products.error);

    // StoreContext: cart + applied search
    const { addToCart, search } = useStore();

    // UI: sort
    const [sortKey, setSortKey] = useState("last");

    // 1) 进入页面就拉产品（Mongo）
    useEffect(() => {
        dispatch(fetchProducts());
    }, [dispatch]);

    // 2) 搜索变化时可选：滚到顶部（体验更像电商）
    useEffect(() => {
        // 如果你不想滚动，删掉这段即可
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [search]);

    // 3) filter + sort 合并成一个 memo 结果
    const viewList = useMemo(() => {
        const arr = Array.isArray(products) ? [...products] : [];

        // --- filter ---
        const q = (search || "").trim().toLowerCase();
        const filtered = q
            ? arr.filter((p) => {
                const name = String(p?.name || "").toLowerCase();
                const desc = String(p?.description || "").toLowerCase();
                const cat = String(p?.category || "").toLowerCase();
                return (
                    name.includes(q) ||
                    desc.includes(q) ||
                    cat.includes(q)
                );
            })
            : arr;

        // --- sort ---
        const getPrice = (p) => {
            const n = Number(p?.price);
            return Number.isFinite(n) ? n : 0;
        };

        const getCreatedAt = (p) => {
            // createdAt 可能缺失/无效，给 0
            const t = p?.createdAt ? new Date(p.createdAt).getTime() : 0;
            return Number.isFinite(t) ? t : 0;
        };

        // 为了“稳定排序”（相同值时不乱跳），加 index
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

            // last added（新在前）
            const diff = getCreatedAt(b.p) - getCreatedAt(a.p);
            return diff !== 0 ? diff : a.idx - b.idx;
        });

        return stable.map((x) => x.p);
    }, [products, sortKey, search]);

    // 4) 渲染
    return (
        <div className="page">
            <div className="page-head">
                <h1>Products</h1>

                <div className="page-actions">
                    <select
                        className="select"
                        value={sortKey}
                        onChange={(e) => setSortKey(e.target.value)}
                    >
                        <option value="last">Last added</option>
                        <option value="priceAsc">Price: low to high</option>
                        <option value="priceDesc">Price: high to low</option>
                    </select>

                    <Link className="btn primary" to="/add-product">
                        Add Product
                    </Link>
                </div>
            </div>

            {loading && (
                <div style={{ textAlign: "center", marginTop: 40 }}>Loading...</div>
            )}

            {!loading && error && (
                <div style={{ textAlign: "center", marginTop: 40 }}>
                    Load failed: {String(error)}
                </div>
            )}

            {!loading && !error && viewList.length === 0 && (
                <div style={{ textAlign: "center", marginTop: 40, opacity: 0.7 }}>
                    {search?.trim()
                        ? `No results for "${search}".`
                        : "No products yet. Admin can add one."}
                </div>
            )}

            {!loading && !error && viewList.length > 0 && (
                <div className="products">
                    {viewList.map((p) => {
                        // 统一 id：Mongo 用 _id
                        const pid = String(p?._id ?? p?.id ?? "");

                        return (
                            <div className="product-card" key={pid || `${p?.name}-${p?.price}`}>
                                <div className="product-title">{p?.name || "(No name)"}</div>

                                <div className="product-price">
                                    ${Number(p?.price || 0).toFixed(2)}
                                </div>

                                <div className="product-actions">
                                    <button
                                        className="btn"
                                        type="button"
                                        onClick={() => {
                                            if (!pid) return; // 防御：避免 undefined
                                            addToCart(pid, 1);
                                        }}
                                    >
                                        Add
                                    </button>

                                    <button className="btn ghost" type="button" disabled>
                                        Edit
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
