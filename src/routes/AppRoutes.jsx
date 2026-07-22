import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PublicLayout from "../components/layout/PublicLayout";
import AdminLayout from "../components/layout/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";

import Home from "../pages/store/Home";
import NotFound from "../pages/store/NotFound";

const Shop = lazy(() => import("../pages/store/Shop"));
const ProductDetail = lazy(() => import("../pages/store/ProductDetail"));
const About = lazy(() => import("../pages/store/About"));
const Contact = lazy(() => import("../pages/store/Contact"));
const PrivacyPolicy = lazy(() => import("../pages/store/PrivacyPolicy"));
const TermsOfService = lazy(() => import("../pages/store/TermsOfService"));

const Login = lazy(() => import("../pages/admin/Login"));
const DashboardOverview = lazy(
  () => import("../pages/admin/DashboardOverview"),
);
const ProductsManagement = lazy(
  () => import("../pages/admin/ProductsManagement"),
);
const CategoriesManagement = lazy(
  () => import("../pages/admin/CategoriesManagement"),
);
const OrdersManagement = lazy(() => import("../pages/admin/OrdersManagement"));
const SalesAnalytics = lazy(() => import("../pages/admin/SalesAnalytics"));
const LeadsManagement = lazy(() => import("../pages/admin/LeadsManagement"));
const SalesLogs = lazy(() => import("../pages/admin/SalesLogs"));

function RouteLoader() {
  return (
    <div className="min-h-[60vh] bg-dark-base flex flex-col items-center justify-center">
      <div className="relative w-12 h-12 mb-4">
        <div className="absolute inset-0 rounded-full border-2 border-gold/10"></div>
        <div className="absolute inset-0 rounded-full border-t-2 border-gold animate-spin"></div>
      </div>
      <span className="font-serif text-xs tracking-widest text-gold uppercase animate-pulse">
        Loading
      </span>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="privacy-policy" element={<PrivacyPolicy />} />
          <Route path="terms-of-service" element={<TermsOfService />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="/admin/login" element={<Login />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardOverview />} />
          <Route path="products" element={<ProductsManagement />} />
          <Route path="categories" element={<CategoriesManagement />} />
          <Route path="orders" element={<OrdersManagement />} />
          <Route path="analytics" element={<SalesAnalytics />} />
          <Route path="leads" element={<LeadsManagement />} />
          <Route path="sales-logs" element={<SalesLogs />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
