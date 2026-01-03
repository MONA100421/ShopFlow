import ProductForm from "../components/ProductForm";
import "./ProductFormPage.css";

export default function ProductFormPage() {
  return (
    <div className="product-form-page">
      <div className="product-form-container">
        {/* Page Title */}
        <h1 className="page-title">Create Product</h1>

        {/* Form */}
        <ProductForm
          onSubmit={(p) => {
            console.log("submit", p);
          }}
        />
      </div>
    </div>
  );
}
