import RequireAdmin from "./components/RequireAdmin";
import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import AuthPage from "./pages/AuthPage";
import ProductListPage from "./pages/ProductListPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import ProductFormPage from "./pages/ProductFormPage";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<ProductListPage />} />
        <Route path="/auth/:mode" element={<AuthPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route 
           path="/products/new"
            element={
              <RequireAdmin>
                <ProductFormPage />
              </RequireAdmin>
            }
        />
        <Route
          path="/products/:id/edit"
            element={
              <RequireAdmin>
                <ProductFormPage />
              </RequireAdmin>
            }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
