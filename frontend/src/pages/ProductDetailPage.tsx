import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { getProductById } from "../services/productService";
import { useCart } from "../context/CartContext";


export default function ProductDetailPage() {
  const { id } = useParams();
  const product = id ? getProductById(id) : null;
  const { addToCart } = useCart();
  const { role } = useAuth();
  const navigate = useNavigate();


  if (!product) return <p>Product not found</p>;

  return (
    <div className="container">
      <h1>{product.title}</h1>
      <p>{product.description}</p>
      <p>${product.price}</p>

      {role === "admin" && (
        <button 
          onClick={() => navigate(`/products/${product.id}/edit`)}
        >
          Edit Product
          
        </button>
      )}
      
      <button
        onClick={() =>
          addToCart({
            id: product.id,
            name: product.title,
            price: product.price,
            image: product.image,
          })
        }
      >
        Add to Cart
      </button>
    </div>
  );
}
