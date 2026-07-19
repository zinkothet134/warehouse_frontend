import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./components/Auth/Login"; // Make sure the export/import matches your actual file
// We will import these once you create them:
import Register from "./components/Auth/Register";
// import PasswordResetRequest from './components/Auth/PasswordResetRequest';
import PasswordResetRequest from "./components/Auth/PasswordResetRequest"; // 👈 Import
import PasswordResetConfirm from "./components/Auth/PasswordResetConfirm"; // 👈 Import
import ProtectedRoute from "./components/common/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Inventory from "./pages/Inventory";
import ReceiveStock from "./pages/ReceiveStock";
import AddProduct from "./pages/AddProduct";
import POS from "./pages/POS";
import BrandsCategories from "./pages/BrandsCategories";

// Layout Component
import Layout from "./components/common/Layout";
import "./App.css";
import Suppliers from "./pages/Suppliers";
import AddSupplier from "./pages/AddSupplier";
import EditSupplierModal from "./pages/EditSupplier";
import PurchaseOrders from "./pages/PurchaseOrders";
import AddPurchaseOrder from "./pages/AddPurchaseOrder";
import OrderHistory from "./pages/OrderHistory";
import Customers from "./pages/Customers";
import EditProduct from "./pages/EditProduct";
import PrintLabels from "./pages/PrintLabels";
import StaffManagement from "./pages/StaffManagement";
import VariantManager from "./pages/VariantManager";
import AddLocation from "./pages/AddLocation";
import LocationList from "./pages/LocationList";
import EditLocation from "./pages/EditLocation";

// // Mock pages for testing (We will build real versions of these next!)
// const Dashboard = () => (
//   <div>
//     <h2>Welcome to the Dashboard!</h2>
//     <p>Here are your stats.</p>
//   </div>
// );

function App() {
  // A simple check: if a token exists in local storage, they are logged in
  const isAuthenticated = !!localStorage.getItem("access");
  return (
    <Router>
      <Routes>
        {/* =========================================
            1. PUBLIC ROUTES (No Sidebar)
            ========================================= */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<PasswordResetRequest />} />
        <Route path="/reset-password" element={<PasswordResetConfirm />} />

        {/* =========================================
            2. PROTECTED ROUTES (Sidebar Layout)
            ========================================= */}
        {/* If logged in, load the Layout. If not, kick them back to /login */}
        <Route
          path="/"
          element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}
        >
          {/* If they visit the root "/", redirect them to "/dashboard" */}
          <Route index element={<Navigate to="/dashboard" />} />
          {/* These pages will render INSIDE the <Outlet /> of the Layout component */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="products" element={<Products />} />
          <Route path="/variants" element={<VariantManager />} />
          <Route path="products/add" element={<AddProduct />} />
          <Route path="inventory/levels" element={<Inventory />} />{" "}
          <Route path="inventory/receive" element={<ReceiveStock />} />
          <Route path="/inventory/locations" element={<LocationList />} />
          <Route path="/inventory/locations/add" element={<AddLocation />} />
          <Route
            path="/inventory/locations/edit/:id"
            element={<EditLocation />}
          />
          <Route path="pos" element={<POS />} />
          {/* 👈 This will now load your real table */}
          <Route path="products/attributes" element={<BrandsCategories />} />
          <Route path="purchasing/suppliers" element={<Suppliers />} />
          <Route path="purchasing/suppliers/add" element={<AddSupplier />} />
          <Route
            path="purchasing/purchase-orders"
            element={<PurchaseOrders />}
          />
          <Route
            path="purchasing/purchase-orders/add"
            element={<AddPurchaseOrder />}
          />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/products/edit/:id" element={<EditProduct />} />
          <Route path="/inventory/labels" element={<PrintLabels />} />
          {/* 🌟 ADDED THE STAFF MANAGEMENT ROUTE HERE */}
          <Route path="staff" element={<StaffManagement />} />
        </Route>

        {/* Catch-all: If they type a random URL, send them home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
