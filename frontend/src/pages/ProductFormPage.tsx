import { useParams, useNavigate } from "react-router-dom";
import ProductForm from "../components/ProductForm";
import {
  createProduct,
  getProductById,
  updateProduct,
} from "../services/productService";

export default function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const product = id ? getProductById(id) : undefined;

  return (
    <div className="product-form-page">
      <h1>{id ? "Edit Product" : "Create Product"}</h1>

      <ProductForm
        initialData={product}
        onSubmit={(p) => {
          id ? updateProduct(p) : createProduct(p);
          navigate("/");
        }}
      />
    </div>
  );
}
