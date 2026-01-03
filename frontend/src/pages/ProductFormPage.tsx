import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import ProductForm from "../components/ProductForm";
import { addProduct } from "../store/productsSlice";
import type { Product } from "../types/Product";

import "./ProductFormPage.css";

export default function ProductFormPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  /**
   * ProductForm 送上來的是「沒有 id 的 Product」
   * 我們在這一層補上 id，才是完整 Product
   */
  const handleSubmit = (formData: Omit<Product, "id">) => {
    const newProduct: Product = {
      id: crypto.randomUUID(), // ✅ 原生，不需要 uuid 套件
      ...formData,
    };

    // ✅ 加進 Redux + localStorage
    dispatch(addProduct(newProduct));

    // ✅ 新增完成後回到商品列表
    navigate("/");
  };

  return (
    <div className="product-form-page">
      <div className="product-form-container">
        {/* Page title（已對齊 Figma） */}
        <h1 className="page-title">Create Product</h1>

        {/* Product form */}
        <ProductForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
