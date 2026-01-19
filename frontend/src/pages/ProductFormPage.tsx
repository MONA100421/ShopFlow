import { useEffect } from "react";
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

const DEFAULT_IMAGE = "/assets/react.svg";

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

  useEffect(() => {
    if (isEditMode && id && !product) {
      dispatch(fetchProductByIdThunk(id));
    }
  }, [dispatch, isEditMode, id, product]);

  const handleSubmit = async (formData: ProductFormData) => {
    const image = formData.image?.trim() || DEFAULT_IMAGE;

    try {
      if (isEditMode && product) {
        const updatedProduct: Product = {
          ...product,
          ...formData,
          image,
        };

        await dispatch(updateProductThunk(updatedProduct)).unwrap();
      } else {
        const newProduct: Product = {
          ...formData,
          image,
        } as Product;

        await dispatch(createProductThunk(newProduct)).unwrap();
      }

      navigate("/");
    } catch (err) {
      console.error("Save product failed:", err);
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
      navigate("/");
    } catch (err) {
      console.error("Delete product failed:", err);
    }
  };

  if (isEditMode && loading && !product) {
    return (
      <div className="product-form-page">
        <div className="product-form-container">
          <h1 className="page-title">Loading...</h1>
        </div>
      </div>
    );
  }

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

        {error && (
          <div className="page-error">
            {error}
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
