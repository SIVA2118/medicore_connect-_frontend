import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/navbar/AdminNavbar.css";

export default function AdminNavbar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const role = localStorage.getItem("role");
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const menuItems = [
    { label: "Home", icon: "🏠", path: "/admin" },
    { label: "Doctors", icon: "👨‍⚕️", path: "/admin/doctors" },
    { label: "Receptionists", icon: "🧑‍💼", path: "/admin/receptionists" },
    { label: "Scanners", icon: "🧪", path: "/admin/scanners" },
    { label: "Billers", icon: "💳", path: "/admin/billers" },
    { label: "Reports", icon: "📊", path: "/admin/reports" },
  ];

  return (
    <>
      {/* TOP NAVBAR */}
      <header
        className="app-navbar"
      >
        <div className="left">
          <button
            className="menu-btn"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            aria-label="Toggle Menu"
          >
            ☰
          </button>
          <h3>NS multispeciality hospital</h3>
        </div>

        <div className="right">
          <span className="role-badge">{role}</span>
          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      {/* SIDEBAR */}
      <aside
        className={`app-sidebar ${isMobileOpen ? "open" : ""}`}
      >
        <h4>Main Menu</h4>
        <ul>
          {menuItems.map((item) => (
            <li
              key={item.path}
              className={location.pathname === item.path ? "active" : ""}
              onClick={() => {
                navigate(item.path);
                if (window.innerWidth < 1024) setIsMobileOpen(false);
              }}
            >
              <span title={item.label}>{item.icon}</span>
              <span className="menu-label">{item.label}</span>
            </li>
          ))}
        </ul>
      </aside>

      {/* OVERLAY (Mobile) */}
      {isMobileOpen && (
        <div
          className="overlay"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
