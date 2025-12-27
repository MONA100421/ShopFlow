import { useParams, Link } from "react-router-dom";
import { getProductById } from "../services/productService";

export default function ProductDetailPage() {
  const { id } = useParams();
  const product = id ? getProductById(id) : null;

  if (!product) return <p>Product not found</p>;

  return (
    <div>
      <h1>{product.title}</h1>
      <p>{product.description}</p>
      <p>${product.price}</p>

      <Link to={`/products/${product.id}/edit`}>Edit</Link>
    </div>
  );
}
