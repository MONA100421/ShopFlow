import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import ProductForm from "../components/ProductForm";
import {
  createProductThunk,
  updateProductThunk,
  deleteProductThunk,
} from "../store/productsSlice";

import type { Product } from "../types/Product";
import type { ProductFormData } from "../types/ProductFormData";
import type { RootState, AppDispatch } from "../store/store";

import "./ProductFormPage.css";

const DEFAULT_IMAGE = "/assets/react.svg";

export default function ProductFormPage() {
  const dispatch = useDispatch<AppDispatch>(); // ✅ 關鍵修正
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const isEditMode = Boolean(id);

  /* ======================================================
     Find product for edit mode
  ====================================================== */
  const product = useSelector((state: RootState) =>
    id ? state.products.list.find((p) => p.id === id) : undefined
  );

  /* ======================================================
     Submit handler (Create / Edit)
  ====================================================== */
  const handleSubmit = (formData: ProductFormData) => {
    const image = formData.image?.trim() || DEFAULT_IMAGE;

    if (isEditMode && product) {
      /* ===== Edit Product ===== */
      const updatedProduct: Product = {
        ...product,
        ...formData,
        image,
      };

      dispatch(updateProductThunk(updatedProduct));
    } else {
      /* ===== Create Product ===== */
      const newProduct: Product = {
        ...formData,
        image,
        // id / createdAt 交給 API（mock / backend）處理
      } as Product;

      dispatch(createProductThunk(newProduct));
    }

    navigate("/");
  };

  /* ======================================================
     Delete handler (Edit only)
  ====================================================== */
  const handleDelete = () => {
    if (!product) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    dispatch(deleteProductThunk(product.id));
    navigate("/");
  };

  /* ======================================================
     Guard: Edit mode but product not found
  ====================================================== */
  if (isEditMode && !product) {
    return (
      <div className="product-form-page">
        <div className="product-form-container">
          <h1 className="page-title">Product Not Found</h1>
        </div>
      </div>
    );
  }

  /* ======================================================
     Map Product → ProductFormData
  ====================================================== */
  const initialFormData: ProductFormData | undefined =
    isEditMode && product
      ? {
          title: product.title,
          description: product.description,
          category: product.category,
          price: product.price,
          stock: product.stock,
          image: product.image,
        }
      : undefined;

  /* ======================================================
     Render
  ====================================================== */
  return (
    <div className="product-form-page">
      <div className="product-form-container">
        <h1 className="page-title">
          {isEditMode ? "Edit Product" : "Create Product"}
        </h1>

        <ProductForm
          initialData={initialFormData}
          onSubmit={handleSubmit}
          onDelete={isEditMode ? handleDelete : undefined}
          submitLabel={isEditMode ? "Save" : "Add Product"}
        />
      </div>
    </div>
  );
}
