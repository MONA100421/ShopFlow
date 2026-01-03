import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import ProductForm from "../components/ProductForm";
import { addProduct, updateProduct } from "../store/productsSlice";

import type { Product } from "../types/Product";
import type { ProductFormData } from "../types/ProductFormData";
import type { RootState } from "../store/store";

import "./ProductFormPage.css";

const DEFAULT_IMAGE = "/assets/react.svg";

export default function ProductFormPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const isEditMode = Boolean(id);

  /* 🔍 從 Redux 找要編輯的商品 */
  const product = useSelector((state: RootState) =>
    id ? state.products.list.find((p) => p.id === id) : undefined
  );

  /* ===============================
     Submit handler（Create / Edit 共用）
  =============================== */
  const handleSubmit = (formData: ProductFormData) => {
    const image = formData.image?.trim() || DEFAULT_IMAGE;

    if (isEditMode && product) {
      /* ✅ Edit Product */
      const updatedProduct: Product = {
        ...product,        // 保留 id、既有資料
        ...formData,       // 表單資料（title / price / stock / etc）
        image,             // 保證 image 一定是 string
      };

      dispatch(updateProduct(updatedProduct));
    } else {
      /* ✅ Create Product */
      const newProduct: Product = {
        id: crypto.randomUUID(),
        ...formData,
        image,
      };

      dispatch(addProduct(newProduct));
    }

    navigate("/");
  };

  /* 🚨 Edit mode 但找不到商品（防呆） */
  if (isEditMode && !product) {
    return (
      <div className="product-form-page">
        <div className="product-form-container">
          <h1 className="page-title">Product Not Found</h1>
        </div>
      </div>
    );
  }

  /* 🧠 將 Product → ProductFormData（避免型別衝突） */
  const initialFormData: ProductFormData | undefined = isEditMode && product
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
        {/* Page title */}
        <h1 className="page-title">
          {isEditMode ? "Edit Product" : "Create Product"}
        </h1>

        {/* 共用 ProductForm */}
        <ProductForm
          initialData={initialFormData}
          onSubmit={handleSubmit}
          submitLabel={isEditMode ? "Save" : "Add Product"}
        />
      </div>
    </div>
  );
}
