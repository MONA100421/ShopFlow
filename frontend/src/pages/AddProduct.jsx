import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createProduct } from "../redux/productSlice";

export default function AddProduct() {
    const dispatch = useDispatch();
    const loading = useSelector((s) => s.products.loading);
    const error = useSelector((s) => s.products.error);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("Category1");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("");
    const [image, setImage] = useState("");
    const [msg, setMsg] = useState("");

    async function onSubmit(e) {
        e.preventDefault();
        setMsg("");

        if (!name.trim()) return alert("Name is required");
        if (price === "" || Number(price) < 0) return alert("Price must be >= 0");

        const payload = {
            name: name.trim(),
            description: description.trim(),
            category,
            price: Number(price),
            stock: Number(stock || 0),
            image: image.trim(),
        };

        try {
            await dispatch(createProduct(payload)).unwrap();
            setMsg("Created ✅ You can add another one.");

            // ✅ 清空表单，继续添加
            setName("");
            setDescription("");
            setCategory("Category1");
            setPrice("");
            setStock("");
            setImage("");
        } catch (err) {
            alert(err?.message || "Create failed");
        }
    }

    return (
        <div className="page">
            <div className="page-head">
                <h1>Create Product</h1>
            </div>

            {msg && <div style={{ marginBottom: 12, opacity: 0.85 }}>{msg}</div>}
            {!loading && error && (
                <div style={{ marginBottom: 12 }}>Error: {error}</div>
            )}

            <form className="form" onSubmit={onSubmit}>
                <label className="field">
                    <div className="label">Product Name</div>
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="绿豆糕" />
                </label>

                <label className="field">
                    <div className="label">Product Description</div>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="台湾绿豆糕"
                    />
                </label>

                <div className="row">
                    <label className="field">
                        <div className="label">Category</div>
                        <select value={category} onChange={(e) => setCategory(e.target.value)}>
                            <option value="Category1">Category1</option>
                            <option value="Category2">Category2</option>
                            <option value="Category3">Category3</option>
                        </select>
                    </label>

                    <label className="field">
                        <div className="label">Price</div>
                        <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="8.99" />
                    </label>
                </div>

                <div className="row">
                    <label className="field">
                        <div className="label">Stock</div>
                        <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="100" />
                    </label>

                    <label className="field">
                        <div className="label">Image URL</div>
                        <input value={image} onChange={(e) => setImage(e.target.value)} placeholder="" />
                    </label>
                </div>

                {image && (
                    <div style={{ marginTop: 12 }}>
                        <img src={image} alt="preview" style={{ maxWidth: 240, borderRadius: 8 }} />
                    </div>
                )}

                <button className="btn primary" type="submit" disabled={loading}>
                    {loading ? "Saving..." : "Add Product"}
                </button>
            </form>
        </div>
    );
}
