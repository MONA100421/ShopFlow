import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import type { RootState, AppDispatch } from "../redux/store";
import { fetchProductById, updateProduct } from "../redux/slices/productSlice";

type ProductLike = {
  _id?: string;
  id?: string;
  name?: string;
  description?: string;
  price?: number | string;
  stock?: number | string;
  image?: string;
  imageUrl?: string;
  [k: string]: any;
};

export default function EditProduct() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();

  // ✅ 原生 dispatch（有类型）
  const dispatch = useDispatch<AppDispatch>();
  // ✅ 迁移期“万能 dispatch”：专门给 JS thunk 用（写一次，后面都用它）
  const dispatchAny: any = dispatch;

  // ✅ auth：做权限保护（兼容 JS slice 结构不确定的情况）
  const auth = useSelector((s: RootState) => (s as any).auth);
  const role = String(auth?.user?.role ?? auth?.role ?? "").toLowerCase();
  const isManager = role === "admin" || role === "manager";

  // ✅ products：读当前 product + loading/error
  const current = useSelector(
    (s: RootState) => (s.products.current as ProductLike | null) || null
  );
  const loading = useSelector((s: RootState) => !!s.products.currentLoading);
  const error = useSelector((s: RootState) => s.products.currentError);
  const saving = useSelector((s: RootState) => !!s.products.saving);
  const saveError = useSelector((s: RootState) => s.products.saveError);

  const [msg, setMsg] = useState("");

  // 表单字段：组件局部状态
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState("");

  // 1) 权限保护
  useEffect(() => {
    if (!isManager) nav("/signin");
  }, [isManager, nav]);

  // 2) load product
  useEffect(() => {
    if (!id) return;
    const pid = id; // ✅ 收窄成 string
    setMsg("");
    dispatchAny(fetchProductById(pid as any));
  }, [dispatchAny, id]);

  // 3) current 到了，把值灌进表单
  useEffect(() => {
    if (!current) return;
    setName(current?.name || "");
    setDescription(current?.description || "");
    setPrice(String(current?.price ?? ""));
    setStock(String(current?.stock ?? ""));
    setImage(current?.image || current?.imageUrl || "");
  }, [current]);

  // 4) save
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg("");

    if (!id) {
      setMsg("❌ Missing product id");
      return;
    }
    const pid = id;

    const payload = {
      id: pid,
      data: {
        name: name.trim(),
        description,
        price: Number(price) || 0,
        stock: Number(stock) || 0,
        image: image.trim(),
      },
    };

    try {
      const action = dispatchAny(updateProduct(payload as any));

      // 如果 thunk 是 createAsyncThunk，unwrap 会存在
      if (typeof action?.unwrap === "function") {
        await action.unwrap();
      }

      setMsg("✅ Updated!");
      nav("/products");
    } catch {
      // 错误已进 redux 的 saveError
    }
  }

  return (
    <div className="page">
      <div className="page-head">
        <h1>Edit Product</h1>

        <div className="page-actions">
          <Link className="btn" to="/products">
            Back
          </Link>
        </div>
      </div>

      {msg && <div style={{ marginBottom: 12, opacity: 0.85 }}>{msg}</div>}

      {!loading && (error || saveError) && (
        <div style={{ marginBottom: 12 }}>
          Error: {String(saveError || error)}
        </div>
      )}

      {loading ? (
        <div style={{ marginTop: 16 }}>Loading...</div>
      ) : (
        <form className="form" onSubmit={onSubmit}>
          <label className="field">
            <div className="label">Name</div>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          <label className="field">
            <div className="label">Description</div>
            <textarea
              className="textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </label>

          <label className="field">
            <div className="label">Price</div>
            <input
              className="input"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </label>

          <label className="field">
            <div className="label">Stock</div>
            <input
              className="input"
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />
          </label>

          <label className="field">
            <div className="label">Image URL</div>
            <input
              className="input"
              value={image}
              onChange={(e) => setImage(e.target.value)}
            />
          </label>

          <div className="form-actions">
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
