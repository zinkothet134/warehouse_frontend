import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import "../../assets/common/Layout.css";

export default function Layout() {
  return (
    <div className="app-layout">
      {/* The Sidebar stays locked on the left */}
      <Sidebar />

      {/* The main content area dynamically changes based on the URL */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
