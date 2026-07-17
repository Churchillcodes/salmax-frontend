import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from '../components/layout/PublicLayout';
import AdminLayout from '../components/layout/AdminLayout';
import ProtectedRoute from './ProtectedRoute';

// Public Customer Pages
import Home from '../pages/store/Home';
import Shop from '../pages/store/Shop';
import ProductDetail from '../pages/store/ProductDetail';
import About from '../pages/store/About';
import Contact from '../pages/store/Contact';
import NotFound from '../pages/store/NotFound';

// Administrative Dashboard Pages
import Login from '../pages/admin/Login';
import DashboardOverview from '../pages/admin/DashboardOverview';
import ProductsManagement from '../pages/admin/ProductsManagement';
import CategoriesManagement from '../pages/admin/CategoriesManagement';
import OrdersManagement from '../pages/admin/OrdersManagement';
import SalesAnalytics from '../pages/admin/SalesAnalytics';
import LeadsManagement from '../pages/admin/LeadsManagement';
import SalesLogs from '../pages/admin/SalesLogs';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Customer Storefront Routes */}
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="shop" element={<Shop />} />
        <Route path="product/:id" element={<ProductDetail />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Staff Login Route */}
      <Route path="/admin/login" element={<Login />} />

      {/* Secure Admin Dashboard Routes */}
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
  );
}
