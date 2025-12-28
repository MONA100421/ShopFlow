import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { deleteProduct, getProducts } from "../services/productService";
import type { Product } from "../types/Product";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";



export default function ProductListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const { addToCart } = useCart();
  const { role } = useAuth();
  const navigate = useNavigate();


  useEffect(() => {
    const data = getProducts();
    setProducts(data);
  }, []);

  return (
    <div>
      <h1>Products</h1>
      {role === "admin" && (
        <button onClick={() => navigate("/products/new")}>
          Add Product
        </button>
      )}

      {products.length === 0 && <p>No products</p>}

      {products.map((p) => (
        <div key={p.id}>
          <h3>{p.title}</h3>
          <p>${p.price}</p>
          <Link to={`/products/${p.id}`}>View</Link>
          <button
            onClick={() => 
              addToCart({
                id: p.id,
                name: p.title,
                price: p.price,
                image: p.image,
              })
            }
          >
            Add to Cart
          </button>
          
          {/* Admin only Delete */}
          {role === "admin" && (
            <button
              onClick={() => {
                deleteProduct(p.id);
                setProducts(getProducts()); // Refresh list
              }}
            >
              Delete
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
