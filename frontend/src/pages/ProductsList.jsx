import { Link } from "react-router-dom";
import { useStore } from "../state/StoreContext";

export default function ProductsList() {
  const { products, addToCart } = useStore();

  return (
    <div className="page">
      <div className="page-head">
        <h1>Products</h1>

        <div className="page-actions">
          <select className="select">
            <option>Last added</option>
            <option>Price: low to high</option>
            <option>Price: high to low</option>
          </select>

          <Link className="btn primary" to="/products/new">
            Add Product
          </Link>
        </div>
      </div>

      <div className="grid">
        {products.map((p) => (
          <div className="card" key={p.id}>
            <img className="thumb" src={p.image} alt={p.name} />
            <div className="card-body">
              <div className="name">{p.name}</div>
              <div className="price">${p.price.toFixed(2)}</div>
              <div className="row">
                <button className="btn primary" onClick={() => addToCart(p.id, 1)}>
                  Add
                </button>
                <button className="btn" disabled>
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 简化分页：先做 UI */}
      <div className="pager">
        <button className="btn">«</button>
        <button className="btn primary">1</button>
        <button className="btn">2</button>
        <button className="btn">3</button>
        <button className="btn">»</button>
      </div>
    </div>
  );
}
