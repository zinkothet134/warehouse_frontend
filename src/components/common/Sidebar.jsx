// src/components/common/Sidebar.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "../../assets/common/Sidebar.css";

// 1. Define the Navigation Configuration Object
const navConfig = [
  {
    title: "Overview",
    roles: ["ADMIN", "WAREHOUSE", "CASHIER", "SALES"],
    items: [{ name: "Dashboard", path: "/dashboard", icon: "📊" }],
  },
  {
    title: "Catalog & Inventory",
    roles: ["ADMIN", "WAREHOUSE"],
    items: [
      { name: "Brands & Categories", path: "/products/attributes", icon: "🏷️" },
      { name: "Products", path: "/products", icon: "👟" },
      { name: "Stock Levels", path: "/inventory/levels", icon: "📦" },
      { name: "Receive Stock", path: "/inventory/receive", icon: "📥" },
      { name: "Suppliers", path: "/purchasing/suppliers", icon: "🏭" },
      {
        name: "Purchase Orders",
        path: "/purchasing/purchase-orders",
        icon: "📋",
      },
    ],
  },
  {
    title: "Sales & Customers",
    roles: ["ADMIN", "CASHIER", "SALES"],
    items: [
      { name: "Point of Sales", path: "/pos", icon: "🧑‍💻" },

      { name: "Order History", path: "/orders", icon: "🧾" },
      { name: "Customers", path: "/customers", icon: "👥" },
    ],
  },
  {
    title: "Administration",
    roles: ["ADMIN"],
    items: [
      { name: "Staff Management", path: "/staff", icon: "🛡️" },
      { name: "Settings", path: "/settings", icon: "⚙️" },
    ],
  },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Notice we default to 'SALES' so it has a safe fallback before the token decodes
  const [user, setUser] = useState({ username: "User", role: "SALES" });

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({
          username: decoded.username || "Staff",
          role: decoded.role || "SALES", // Set the state here!
        });
      } catch (e) {
        console.error("Invalid token in sidebar");
      }
    }
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      console.log("Window Width:", window.innerWidth, "Is Mobile:", isMobile);

      // Force collapse on small screens
      setIsCollapsed(isMobile);
    };

    // 1. Run immediately on load
    handleResize();

    // 2. Add listener
    window.addEventListener("resize", handleResize);

    // 3. Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/login");
  };

  // 3. Filter using the state variable: user.role
  const visibleGroups = navConfig.filter((group) =>
    group.roles.includes(user.role),
  );

  return (
    <aside className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      {/* Toggle Button */}
      <button
        className="toggle-btn"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? "▶" : "◀"}
      </button>

      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div className="avatar">
          {user.username ? user.username.charAt(0).toUpperCase() : "S"}
        </div>
        {!isCollapsed && (
          <div className="user-info">
            <span className="username">{user.username}</span>
            <span className="user-role">{user.role}</span>
          </div>
        )}
      </div>

      {/* Sidebar Body (Dynamic Navigation) */}
      <div className="sidebar-body">
        {/* 4. Map over our visible groups to generate the links dynamically */}
        {visibleGroups.map((group, index) => (
          <div key={index} className="sidebar-group">
            {/* Only show group titles if the sidebar is open */}
            {!isCollapsed && <h4 className="group-title">{group.title}</h4>}

            {group.items.map((item, idx) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={idx}
                  to={item.path}
                  className={`nav-link ${isActive ? "active" : ""}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {!isCollapsed && (
                    <span className="nav-text">{item.name}</span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <span className="nav-icon">🚪</span>
          {!isCollapsed && "Logout"}
        </button>
      </div>
    </aside>
  );
}
