import { Routes, Route } from "react-router-dom";
import LayoutShell from "./layout/LayoutShell";
import ProductsList from "./pages/ProductsList";
import Cart from "./pages/Cart";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import UpdatePassword from "./pages/UpdatePassword";

export default function App() {
  return (
    <Routes>
      <Route element={<LayoutShell />}>
        <Route path="/" element={<ProductsList />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/update-password" element={<UpdatePassword />} />
      </Route>
    </Routes>
  );
}
