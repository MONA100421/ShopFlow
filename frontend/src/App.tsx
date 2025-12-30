import { Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import RequireAdmin from "./components/RequireAdmin";

import AuthPage from "./pages/AuthPage";
import ProductListPage from "./pages/ProductListPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import ProductFormPage from "./pages/ProductFormPage";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  return (
    <Routes>
      {/* ================= Main Layout ================= */}
      <Route element={<MainLayout />}>
        {/* Public pages */}
        <Route path="/" element={<ProductListPage />} />
        <Route path="/auth/:mode" element={<AuthPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />

        {/* ================= Admin only ================= */}
        <Route element={<RequireAdmin />}>
          <Route path="/products/new" element={<ProductFormPage />} />
          <Route path="/products/:id/edit" element={<ProductFormPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
