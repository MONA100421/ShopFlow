import { Outlet } from "react-router-dom";
import "./LayoutShell.css";

export default function LayoutShell() {
  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <span className="brand-main">Management</span>
            <span className="brand-sub">Chuwa</span>
          </div>

          <div className="search">
            <input className="search-input" placeholder="Search" />
            <span className="search-icon">🔍</span>
          </div>

          <div className="top-actions">
            <div className="action">
              <span className="icon">👤</span>
              <span>Sign In</span>
            </div>
            <div className="action">
              <span className="icon">🛒</span>
              <span>$0.00</span>
            </div>
          </div>
        </div>
      </header>

      {/* 中间内容区：让弹窗在这里居中（不会盖住 header/footer） */}
      <main className="content">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <div>©2022 All Rights Reserved.</div>
          <div className="footer-icons">
            <span>▶️</span>
            <span>🐦</span>
            <span>f</span>
          </div>
          <div className="footer-links">
            <a href="#">Contact us</a>
            <a href="#">Privacy Policies</a>
            <a href="#">Help</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
