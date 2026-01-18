// frontend/src/App.tsx
import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

import type { AppDispatch } from "./store/store";
import { restoreAuthThunk } from "./store/authSlice";

import MainLayout from "./layouts/MainLayout";
import RequireAdmin from "./components/RequireAdmin";

import AuthPage from "./pages/AuthPage";
import ProductListPage from "./pages/ProductListPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import ProductFormPage from "./pages/ProductFormPage";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  const dispatch = useDispatch<AppDispatch>();

  /**
   * 🔁 App 啟動只做一件事：
   * - restore auth（session）
   * - cart hydrate 由 auth thunk 內部負責
   */
  useEffect(() => {
    dispatch(restoreAuthThunk());
  }, [dispatch]);

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<ProductListPage />} />
        <Route path="/auth/:mode" element={<AuthPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />

        <Route element={<RequireAdmin />}>
          <Route path="/products/new" element={<ProductFormPage />} />
          <Route path="/products/:id/edit" element={<ProductFormPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
