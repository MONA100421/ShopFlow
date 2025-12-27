import { BrowserRouter, Routes, Route } from "react-router-dom";
import LayoutShell from "./layout/LayoutShell";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import UpdatePassword from "./pages/UpdatePassword";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* LayoutShell 只出现一次，内部用 Outlet 承载页面 */}
        <Route element={<LayoutShell />}>
          <Route path="/" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/update-password" element={<UpdatePassword />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
