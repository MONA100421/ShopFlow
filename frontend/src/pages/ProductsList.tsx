import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo, useState } from "react";
import type { RootState, AppDispatch } from "../redux/store";

import { fetchProducts } from "../redux/slices/productSlice";
import { addToCart } from "../redux/slices/cartSlice";

const PAGE_SIZE = 10;

// --- 宽松类型（slice 还是 JS，TS 先止血） ---
type ProductLike = {
  _id?: string;
  id?: string;
  name?: string;
  description?: string;
  category?: string;
  price?: number | string;
  image?: string;
  imageUrl?: string;
  img?: string;
  createdAt?: string | number | Date;
  stock?: number | string;
  [k: string]: any;
};

type DraftQtyMap = Record<string, number>;

function getImg(p?: ProductLike) {
  return (
    p?.image ||
    p?.imageUrl ||
    p?.img ||
    "https://via.placeholder.com/600x400?text=No+Image"
  );
}

// ✅ base64url -> json（兼容 - _ 和 padding）
function decodeJwtPayload(token: string): any | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const pad = base64.length % 4;
    if (pad) base64 += "=".repeat(4 - pad);

    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function getRoleFromToken(token: string | null): string {
  if (!token) return "";
  const payload = decodeJwtPayload(token);
  return String(payload?.role || "").toLowerCase();
}

export default function ProductsList() {
  const dispatch = useDispatch<AppDispatch>();
  const dispatchAny: any = dispatch;
  const nav = useNavigate();

  // ✅ token（用于“按钮点击时”的兜底判断：没有 token 就直接去 signin）
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // ✅ Manager 判定：优先 Redux（auth.user.role），再用 JWT 兜底
  const auth = useSelector((s: RootState) => (s as any).auth);
  const reduxRole = String(auth?.user?.role ?? auth?.role ?? "").toLowerCase();
  const jwtRole = useMemo(() => getRoleFromToken(token), [token]);
  const role = reduxRole || jwtRole;
  const manager = role === "admin" || role === "manager";

  // ✅ Redux: products
  const productsSlice = useSelector(
    (s: RootState) => (s as any).products || {}
  );
  const products: ProductLike[] = Array.isArray(productsSlice.items)
    ? (productsSlice.items as ProductLike[])
    : [];
  const loading = !!productsSlice.loading;
  const error = productsSlice.error;

  // ✅ Redux: search（从 uiSlice 来）
  const ui = useSelector((s: RootState) => (s as any).ui || {});
  const search = String(ui.search || "");

  // UI: sort + pagination
  const [sortKey, setSortKey] = useState<"last" | "priceAsc" | "priceDesc">(
    "last"
  );
  const [page, setPage] = useState<number>(1);

  // ✅ 每个商品一个“待加入数量”
  const [draftQtyMap, setDraftQtyMap] = useState<DraftQtyMap>({});
  const getDraftQty = (pid: string) =>
    Math.max(1, Number(draftQtyMap[pid] ?? 1));
  const setDraftQty = (pid: string, next: number) =>
    setDraftQtyMap((m) => ({ ...m, [pid]: Math.max(1, Number(next) || 1) }));

  useEffect(() => {
    dispatchAny(fetchProducts());
  }, [dispatchAny]);

  useEffect(() => {
    // 搜索/排序变了就回到第一页
    setPage(1);
  }, [search, sortKey]);

  const viewList: ProductLike[] = useMemo(() => {
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
    const getPrice = (p: ProductLike) => {
      const n = Number(p?.price);
      return Number.isFinite(n) ? n : 0;
    };
    const getCreatedAt = (p: ProductLike) => {
      const t = p?.createdAt ? new Date(p.createdAt as any).getTime() : 0;
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

  const paged: ProductLike[] = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return viewList.slice(start, start + PAGE_SIZE);
  }, [viewList, safePage]);

  // ✅ 统一处理：manager 按钮点击（避免“点了没反应/跳了又回来”）
  const goCreate = () => {
    // 没 token：直接去登录（由登录流程拿新 token）
    if (!token) {
      nav("/signin", { replace: false });
      return;
    }
    // 有 token：去管理路由，让 RequireAuth/AdminRoute 做最终判定
    nav("/management/products/new");
  };

  const goEdit = (pid: string) => {
    if (!pid) return;
    if (!token) {
      nav("/signin", { replace: false });
      return;
    }
    nav(`/management/products/${pid}/edit`);
  };

   return (
    <div className="page">
      {/* ===== Header ===== */}
      <div className="page-head">
        <h1 className="page-title">Products</h1>

        <div className="page-actions">
          <select
            className="select"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as any)}
            style={{ width: 220 }}
          >
            <option value="last">Last added</option>
            <option value="priceAsc">Price: low to high</option>
            <option value="priceDesc">Price: high to low</option>
          </select>

          {/* ✅ 只有 manager 才能看到 Add Product */}
          {manager && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={goCreate}
            >
              Add Product
            </button>
          )}
        </div>
      </div>

      {/* ===== 状态 ===== */}
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
          {search?.trim() ? `No results for "${search}".` : "No products yet."}
        </div>
      )}

      {/* ===== 商品卡片 ===== */}
      {!loading && !error && paged.length > 0 && (
        <>
          <div className="grid">
            {paged.map((p) => {
              const pid = String(p?._id ?? p?.id ?? "");

              // ✅ 库存判定
              const stockNum = Number(p?.stock ?? 0);
              const outOfStock = Number.isFinite(stockNum)
                ? stockNum <= 0
                : false;

              // ✅ UI 上的待加入数量：
              // - 缺货直接显示 0
              // - 有货时不允许超过库存
              const rawDraft = pid ? getDraftQty(pid) : 1;
              const draftQty = outOfStock
                ? 1
                : Math.max(1, Math.min(rawDraft, Math.max(1, stockNum || 1)));

              return (
                <div
                  className="card product-card"
                  key={pid || `${p?.name}-${p?.price}`}
                >
                  {/* ✅ 图片可点：去详情 + 角标叠在图片上 */}
                  <div className="product-thumb-wrap">
                    <Link to={`/products/${pid}`} className="product-thumb">
                      <img src={getImg(p)} alt={p?.name || "product"} />
                    </Link>

                    {/* ✅ 只保留这一处 Out of Stock（叠在图片上） */}
                    {outOfStock && (
                      <span className="badge-out badge-abs">Out of Stock</span>
                    )}
                  </div>

                  <div className="product-body">
                    {/* 名字可点：去详情 */}
                    <Link to={`/products/${pid}`} className="product-name">
                      {p?.name || "(No name)"}
                    </Link>

                    {/* ✅ 价格：保持原来逻辑，不在白区重复渲染 Out of Stock */}
                    <div className="product-price">
                      ${Number(p?.price || 0).toFixed(2)}
                    </div>

                    {/* ✅ Stepper + Add to cart + Edit（保持你原逻辑，只加禁用条件） */}
                    <div className="row">
                      <div className="stepper">
                        <button
                          type="button"
                          disabled={outOfStock || !pid }
                          onClick={() => {
                            if (!pid) return;
                            if (outOfStock) return;
                            setDraftQty(pid, Math.max(1, draftQty - 1));
                          }}
                          aria-label="decrease"
                        >
                          –
                        </button>

                        <span>{draftQty}</span>

                        <button
                          type="button"
                          disabled={
                            outOfStock ||
                            !pid ||
                            draftQty >= Math.max(1, stockNum || 1)
                          }
                          onClick={() => {
                            if (!pid) return;
                            if (outOfStock) return;
                            const cap = Math.max(1, stockNum || 1);
                            setDraftQty(pid, Math.min(cap, draftQty + 1));
                          }}
                          aria-label="increase"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        className="btn btn-primary"
                        disabled={!pid || outOfStock || draftQty <= 0}
                        onClick={() => {
                          if (!pid) return;
                          if (outOfStock) return;
                          if (draftQty <= 0) return;

                          dispatchAny(addToCart({ id: pid, delta: draftQty }));

                          // 加完重置为 1（保持你原来的行为）
                          setDraftQty(pid, 1);
                        }}
                      >
                        Add
                      </button>

                      {manager && (
                        <button
                          type="button"
                          className="btn"
                          onClick={() => goEdit(pid)}
                        >
                          Edit
                        </button>
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
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
