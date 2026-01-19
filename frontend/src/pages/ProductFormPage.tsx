import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import ProductForm from "../components/ProductForm";
import {
  createProductThunk,
  updateProductThunk,
  deleteProductThunk,
  fetchProductByIdThunk,
} from "../store/productsSlice";
import type { Product } from "../types/Product";
import type { ProductFormData } from "../types/ProductFormData";
import type { RootState, AppDispatch } from "../store/store";
import "./ProductFormPage.css";

export default function ProductFormPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const isEditMode = Boolean(id);

  const { list, loading, error } = useSelector(
    (state: RootState) => state.products
  );

  const product = isEditMode
    ? list.find((p) => p.id === id)
    : undefined;

  const [pageError, setPageError] = useState("");

  /* Fetch product if editing and not in store */
  useEffect(() => {
    if (isEditMode && id && !product) {
      dispatch(fetchProductByIdThunk(id));
    }
  }, [dispatch, isEditMode, id, product]);

  /* Submit handler */
  const handleSubmit = async (formData: ProductFormData) => {
    setPageError("");

    try {
      if (isEditMode && product) {
        const updatedProduct: Product = {
          ...product,
          ...formData,
          image: formData.image!, // 已在 ProductForm 驗證
        };

        await dispatch(updateProductThunk(updatedProduct)).unwrap();
      } else {
        const newProduct: Product = {
          ...formData,
          image: formData.image!, // 已在 ProductForm 驗證
        } as Product;

        await dispatch(createProductThunk(newProduct)).unwrap();
      }

      // ✅ 關鍵修正：回首頁（而不是 /products）
      navigate("/");
    } catch (err) {
      console.error("Save product failed:", err);
      setPageError("Save product failed. Please check your input.");
    }
  };

  /* Delete handler */
  const handleDelete = async () => {
    if (!product) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );
    if (!confirmed) return;

    try {
      await dispatch(deleteProductThunk(product.id)).unwrap();
      navigate("/"); // ✅ 同樣回首頁
    } catch (err) {
      console.error("Delete product failed:", err);
      setPageError("Delete product failed.");
    }
  };

  /* Loading */
  if (isEditMode && loading && !product) {
    return (
      <div className="product-form-page">
        <div className="product-form-container">
          <h1 className="page-title">Loading...</h1>
        </div>
      </div>
    );
  }

  /* Not found */
  if (isEditMode && !product) {
    return (
      <div className="product-form-page">
        <div className="product-form-container">
          <h1 className="page-title">Product Not Found</h1>
        </div>
      </div>
    );
  }

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

  return (
    <div className="product-form-page">
      <div className="product-form-container">
        <h1 className="page-title">
          {isEditMode ? "Edit Product" : "Create Product"}
        </h1>

        {pageError && <div className="page-error">{pageError}</div>}
        {error && <div className="page-error">{error}</div>}

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
