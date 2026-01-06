import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";


import ProductForm from "../components/ProductForm";
import {
 addProduct,
 updateProduct,
 deleteProduct,
} from "../store/productsSlice";


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
       ...product,   // 保留 id
       ...formData,  // 表單欄位
       image,        // image 一定是 string
     };


     dispatch(updateProduct(updatedProduct));
   } else {
     /* ===== Create Product ===== */
     const newProduct: Product = {
       id: crypto.randomUUID(),
       ...formData,
       image,
       createdAt: new Date().toISOString(),
     };


     dispatch(addProduct(newProduct));
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


   dispatch(deleteProduct(product.id)); // ✅ 正確
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



