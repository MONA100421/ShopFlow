import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useStore } from "../state/StoreContext";

export default function ProductsList() {
    // ✅ products 从 Redux 来
    const products = useSelector((state) => state.products.items || []);

    // ✅ cart 先继续用旧 StoreContext
    const { addToCart } = useStore();

    return (
        <div className="page">
            <div className="page-head">
                <h1>Products</h1>

                <div className="page-actions">
                    <select className="select" defaultValue="Last added">
                        <option>Last added</option>
                        <option>Price: low to high</option>
                        <option>Price: high to low</option>
                    </select>

                    {/* ✅ create product 页面路由 */}
                    <Link className="btn primary" to="/add-product">
                        Add Product
                    </Link>
                </div>
            </div>

            <div className="grid">
                {products.map((p) => {
                    const pid = p.id ?? p._id;
                    return (
                        <div className="card" key={pid}>
                            <img
                                className="thumb"
                                src={p.image || "https://via.placeholder.com/300x200?text=No+Image"}
                                alt={p.name || "product"}
                            />

                            <div className="card-body">
                                <div className="name">{p.name}</div>

                                <div className="price">${Number(p.price || 0).toFixed(2)}</div>

                                <div className="row">
                                    <button
                                        className="btn primary"
                                        onClick={() => addToCart(pid, 1)}
                                    >
                                        Add
                                    </button>

                                    <button className="btn" disabled>
                                        Edit
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {products.length === 0 && (
                    <div style={{ opacity: 0.7 }}>No products yet. Admin can add one.</div>
                )}
            </div>
        </div>
    );
}
