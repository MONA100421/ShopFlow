import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createProduct } from "../redux/productSlice";
import { useNavigate } from "react-router-dom";
import "../ui.css";

export default function AddProduct() {
    const dispatch = useDispatch();
    const loading = useSelector((s) => s.products.loading);
    const error = useSelector((s) => s.products.error);
   
    const navigate = useNavigate();

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

        // ⚠️ 为了兼容你后端/前端可能用 image 或 imageUrl 两种字段名，
        // 我这里两个都带上，不会破坏现有功能（多余字段后端通常会忽略）。
        const img = image.trim();

        const payload = {
            name: name.trim(),
            description: description.trim(),
            category,
            price: Number(price),
            stock: Number(stock || 0),
            image: img,
            imageUrl: img,
        };

        try {
            await dispatch(createProduct(payload)).unwrap();
            setMsg("Created ✅ You can add another one.");

            // 清空表单，继续添加
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

                <div className="page-actions">
                    <button type="button" className="btn" onClick={() => navigate("/products")}>
                        Back
                    </button>
                </div>
            </div>

            {msg && <div style={{ marginBottom: 12, opacity: 0.85 }}>{msg}</div>}
            {!loading && error && <div style={{ marginBottom: 12 }}>Error: {error}</div>}

            <form className="product-card form" onSubmit={onSubmit}>
                <label className="form-group field">
                    <div className="label">Product Name</div>
                    <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
                </label>

                <label className="form-group field">
                    <div className="label">Product Description</div>
                    <textarea
                        className="textarea"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                    />
                </label>

                <div className="form-row row">
                    <label className="form-group field">
                        <div className="label">Category</div>
                        <select className="select" value={category} onChange={(e) => setCategory(e.target.value)}>
                            <option value="Category1">Category1</option>
                            <option value="Category2">Category2</option>
                            <option value="Category3">Category3</option>
                        </select>
                    </label>

                    <label className="form-group field">
                        <div className="label">Price</div>
                        <input
                            className="input"
                            type="number"
                            step="0.01"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                        />
                    </label>
                </div>

                <div className="form-row row">
                    <label className="form-group field">
                        <div className="label">Stock</div>
                        <input
                            className="input"
                            type="number"
                            value={stock}
                            onChange={(e) => setStock(e.target.value)}
                        />
                    </label>

                    <label className="form-group field">
                        <div className="label">Image URL</div>
                        <input className="input" value={image} onChange={(e) => setImage(e.target.value)} />
                    </label>
                </div>

                <div className="image-preview-box">
                    {image ? (
                        <img className="image-preview-img" src={image} alt="preview" />
                    ) : (
                        <span className="image-preview-text">image preview!</span>
                    )}
                </div>


                <button className="btn btn-primary submit-btn" type="submit" disabled={loading}>
                    {loading ? "Saving..." : "Add Product"}
                </button>
            </form>
        </div>
    );
}