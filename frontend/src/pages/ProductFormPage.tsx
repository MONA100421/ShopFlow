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

  const { list, loading } = useSelector(
    (state: RootState) => state.products
  );

  const product = isEditMode
    ? list.find((p) => p.id === id)
    : undefined;

  const [pageError, setPageError] = useState("");

  useEffect(() => {
    if (isEditMode && id && !product) {
      dispatch(fetchProductByIdThunk(id));
    }
  }, [dispatch, isEditMode, id, product]);

  /** 🔑 Image URL validation */
  const isValidImageUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      return ["http:", "https:"].includes(parsed.protocol);
    } catch {
      return false;
    }
  };

  const handleSubmit = async (formData: ProductFormData) => {
    setPageError("");

    // ✅ Image 必填 + 必須是合法 URL
    if (!formData.image || !isValidImageUrl(formData.image)) {
      setPageError("Image URL is required and must be a valid URL");
      return;
    }

    try {
      if (isEditMode && product) {
        const updatedProduct: Product = {
          ...product,
          ...formData,
          image: formData.image,
        };

        await dispatch(updateProductThunk(updatedProduct)).unwrap();
      } else {
        const newProduct: Product = {
          ...formData,
          image: formData.image,
        } as Product;

        await dispatch(createProductThunk(newProduct)).unwrap();
      }

      navigate("/products");
    } catch {
      setPageError("Save product failed. Please check your input.");
    }
  };

  const handleDelete = async () => {
    if (!product) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );
    if (!confirmed) return;

    try {
      await dispatch(deleteProductThunk(product.id)).unwrap();
      navigate("/products");
    } catch {
      setPageError("Delete product failed.");
    }
  };

  if (isEditMode && loading && !product) {
    return (
      <div className="product-form-page">
        <h1 className="page-title">Loading...</h1>
      </div>
    );
  }

  if (isEditMode && !product) {
    return (
      <div className="product-form-page">
        <h1 className="page-title">Product Not Found</h1>
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

        {pageError && (
          <div className="page-error">
            {pageError}
          </div>
        )}

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
