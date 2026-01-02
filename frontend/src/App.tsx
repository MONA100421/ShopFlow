// src/App.tsx
import type { ReactNode } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import LayoutShell from "./layout/LayoutShell";

import ProductsList from "./pages/ProductsList";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";

import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import UpdatePassword from "./pages/UpdatePassword";

import AddProduct from "./pages/AddProduct";
import EditProduct from "./pages/EditProduct";

import AdminRoute from "./components/AdminRoute";

// ✅ 保护：必须登录（token 存在）
type RequireAuthProps = { children: ReactNode };

function RequireAuth({ children }: RequireAuthProps) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/signin" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      {/* LayoutShell 里必须有 <Outlet /> 才能渲染子路由 */}
      <Route element={<LayoutShell />}>
        {/* 默认入口 */}
        <Route path="/" element={<Navigate to="/signin" replace />} />

        {/* Auth */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/update" element={<UpdatePassword />} />

        {/* Shop */}
        <Route path="/products" element={<ProductsList />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />

        {/* ✅ Manager routes：Create / Edit */}
        <Route
          path="/management/products/new"
          element={
            <RequireAuth>
              <AdminRoute>
                <AddProduct />
              </AdminRoute>
            </RequireAuth>
          }
        />

        <Route
          path="/management/products/:id/edit"
          element={
            <RequireAuth>
              <AdminRoute>
                <EditProduct />
              </AdminRoute>
            </RequireAuth>
          }
        />

        {/* ✅ 兼容旧路由：如果你还留着 /add-product */}
        <Route
          path="/add-product"
          element={
            <RequireAuth>
              <AdminRoute>
                <AddProduct />
              </AdminRoute>
            </RequireAuth>
          }
        />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/signin" replace />} />
      </Route>
    </Routes>
  );
}
