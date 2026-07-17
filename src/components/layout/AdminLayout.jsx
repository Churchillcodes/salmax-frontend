import React, { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  LayoutDashboard,
  ShoppingBag,
  FolderOpen,
  ClipboardList,
  BarChart3,
  Users2,
  LogOut,
  Menu,
  X,
  User,
  ExternalLink,
  ReceiptText,
} from "lucide-react";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const menuItems = [
    { path: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
    { path: "/admin/products", label: "Products", icon: ShoppingBag },
    { path: "/admin/categories", label: "Categories", icon: FolderOpen },
    { path: "/admin/orders", label: "Orders", icon: ClipboardList },
    { path: "/admin/analytics", label: "Sales Analytics", icon: BarChart3 },
    { path: "/admin/sales-logs", label: "Sales Logs", icon: ReceiptText },
    { path: "/admin/leads", label: "Leads Log", icon: Users2 },
  ];

  return (
    <div className="min-h-screen bg-dark-base flex text-warm-ivory font-sans">
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 right-4 z-50 bg-gold text-dark-base w-11 h-11 rounded-full flex items-center justify-center shadow-lg hover:bg-gold-light transition duration-300"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar - Desktop & Mobile Drawer */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 w-64 bg-dark-charcoal border-r border-gold/10 flex flex-col justify-between py-6 px-4 transition-transform duration-300 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="space-y-8">
          {/* Logo */}
          <div className="flex flex-col items-center border-b border-gold/10 pb-6">
            <Link
              to="/"
              className="text-center group flex flex-col items-center"
            >
              <span className="font-serif text-2xl font-bold tracking-widest text-gold group-hover:text-gold-light transition duration-300">
                SALMAX
              </span>
              <span className="text-[10px] uppercase tracking-[0.25em] text-white/50 mt-1">
                ADMIN CONSOLE
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm tracking-wider uppercase transition-all duration-300 ${
                      isActive
                        ? "bg-gold text-dark-base font-semibold shadow-md"
                        : "text-warm-ivory/70 hover:bg-gold/5 hover:text-gold"
                    }`
                  }
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="space-y-4 pt-6 border-t border-gold/10">
          {/* User info */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full border border-gold flex items-center justify-center text-gold bg-gold/5">
              <User size={16} />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold truncate text-white">
                {user?.name || user?.username || "Administrator"}
              </p>
              <p className="text-[10px] text-warm-ivory/40 uppercase tracking-widest">
                Logged In
              </p>
            </div>
          </div>

          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs uppercase tracking-wider text-warm-ivory/50 hover:text-gold transition duration-300"
          >
            <ExternalLink size={14} />
            Visit Storefront
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm tracking-wider uppercase text-red-400 hover:bg-red-500/10 transition duration-300"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:pl-64 min-h-screen flex flex-col">
        {/* Header bar */}
        <header className="bg-dark-charcoal/40 border-b border-gold/5 px-6 py-4 flex justify-between items-center hidden md:flex">
          <h2 className="font-serif text-xl font-medium tracking-wide text-gold">
            Control Panel
          </h2>
          <div className="flex items-center gap-3 text-xs text-warm-ivory/60">
            <span>Salmax Suppliers Admin Dashboard</span>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 p-6 pt-20 md:p-8 md:pt-8 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
