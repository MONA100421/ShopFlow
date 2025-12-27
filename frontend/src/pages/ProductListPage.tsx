import { useEffect, useState } from "react";
import { getProducts } from "../services/productService";
import type { Product } from "../types/Product";
import { Link } from "react-router-dom";

export default function ProductListPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    setProducts(getProducts());
  }, []);

  return (
    <div>
      <h1>Products</h1>

      {products.length === 0 && <p>No products</p>}

      {products.map((p) => (
        <div key={p.id}>
          <h3>{p.title}</h3>
          <p>${p.price}</p>
          <Link to={`/products/${p.id}`}>View</Link>
        </div>
      ))}
    </div>
  );
}
