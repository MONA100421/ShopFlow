// frontend/src/App.tsx
import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch, RootState } from "./store/store";
import { restoreAuthThunk } from "./store/authSlice";
import { fetchCartThunk } from "./store/cartSlice";

import MainLayout from "./layouts/MainLayout";
import RequireAdmin from "./components/RequireAdmin";

import AuthPage from "./pages/AuthPage";
import ProductListPage from "./pages/ProductListPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import ProductFormPage from "./pages/ProductFormPage";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const authInitialized = useSelector(
    (state: RootState) => state.auth.initialized
  );

  // ① restore auth
  useEffect(() => {
    dispatch(restoreAuthThunk());
  }, [dispatch]);

  // ② auth ready → hydrate cart（唯一入口）
  useEffect(() => {
    if (authInitialized) {
      dispatch(fetchCartThunk());
    }
  }, [authInitialized, dispatch]);

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
