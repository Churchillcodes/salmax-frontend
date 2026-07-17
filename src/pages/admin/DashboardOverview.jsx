import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  ClipboardList, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Truck, 
  TrendingUp, 
  ArrowRight
} from 'lucide-react';
import apiClient from '../../api/apiClient';

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    products: { total: 0, active: 0, archived: 0, lowStock: 0 },
    orders: { total: 0, pending: 0, confirmed: 0, delivered: 0, cancelled: 0 },
    leadsCount: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentLeads, setRecentLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      setLoading(true);
      try {
        let summaryData = null;
        
        // 1. Attempt to hit the primary summary endpoint
        try {
          const summaryRes = await apiClient.get('/dashboard/summary');
          summaryData = summaryRes.data;
        } catch (e) {
          console.warn("Primary /dashboard/summary endpoint failed, calculating client-side...");
        }

        // 2. Fetch primary datasets in parallel to build recent lists and calculate fallback stats
        const [productsRes, ordersRes, leadsRes] = await Promise.all([
          apiClient.get('/products').catch(() => ({ data: [] })),
          apiClient.get('/orders').catch(() => ({ data: [] })),
          apiClient.get('/leads').catch(() => ({ data: [] }))
        ]);

        const products = productsRes.data || [];
        const orders = ordersRes.data || [];
        const leads = leadsRes.data || [];

        // Save recent entities
        setRecentOrders(orders.slice(0, 5));
        setRecentLeads(leads.slice(0, 5));

        if (summaryData) {
          // If summary endpoint worked, use its values but map properly
          setStats({
            products: {
              total: summaryData.totalProducts || products.length,
              active: summaryData.activeProducts || products.filter(p => p.isActive !== false).length,
              archived: summaryData.archivedProducts || products.filter(p => p.isActive === false).length,
              lowStock: summaryData.lowStockProducts || products.filter(p => p.stock <= 5).length
            },
            orders: {
              total: summaryData.totalOrders || orders.length,
              pending: summaryData.pendingOrders || orders.filter(o => o.status === 'pending').length,
              confirmed: summaryData.confirmedOrders || orders.filter(o => o.status === 'confirmed').length,
              delivered: summaryData.deliveredOrders || orders.filter(o => o.status === 'delivered').length,
              cancelled: summaryData.cancelledOrders || orders.filter(o => o.status === 'cancelled').length
            },
            leadsCount: summaryData.totalLeads || leads.length
          });
        } else {
          // Client-side calculations fallback
          const lowStockCount = products.filter(p => {
            const hasSizes = p.sizes && Object.keys(p.sizes).length > 0;
            if (hasSizes) {
              return Object.values(p.sizes).some(qty => qty <= 5);
            }
            return p.stock <= 5;
          }).length;

          setStats({
            products: {
              total: products.length,
              active: products.filter(p => p.isActive !== false).length,
              archived: products.filter(p => p.isActive === false).length,
              lowStock: lowStockCount
            },
            orders: {
              total: orders.length,
              pending: orders.filter(o => o.status?.toLowerCase() === 'pending').length,
              confirmed: orders.filter(o => o.status?.toLowerCase() === 'confirmed').length,
              delivered: orders.filter(o => o.status?.toLowerCase() === 'delivered').length,
              cancelled: orders.filter(o => o.status?.toLowerCase() === 'cancelled').length
            },
            leadsCount: leads.length
          });
        }

      } catch (error) {
        console.error('Error compiling dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-gold">
        <div className="w-10 h-10 border-2 border-gold/10 border-t-2 border-gold rounded-full animate-spin mb-4"></div>
        <p className="text-xs uppercase tracking-widest animate-pulse">Assembling Dashboard Overview...</p>
      </div>
    );
  }

  // Cards layout configurations
  const productCards = [
    { label: 'Total Products', val: stats.products.total, icon: ShoppingBag, color: 'text-blue-400', bg: 'bg-blue-400/5' },
    { label: 'Active in Catalog', val: stats.products.active, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/5' },
    { label: 'Archived / Hidden', val: stats.products.archived, icon: XCircle, color: 'text-zinc-400', bg: 'bg-zinc-400/5' },
    { label: 'Low Stock Alerts', val: stats.products.lowStock, icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-400/5' },
  ];

  const orderCards = [
    { label: 'Total Orders', val: stats.orders.total, icon: ClipboardList, color: 'text-indigo-400', bg: 'bg-indigo-400/5' },
    { label: 'Pending', val: stats.orders.pending, icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/5' },
    { label: 'Confirmed', val: stats.orders.confirmed, icon: CheckCircle2, color: 'text-teal-400', bg: 'bg-teal-400/5' },
    { label: 'Delivered', val: stats.orders.delivered, icon: Truck, color: 'text-green-400', bg: 'bg-green-400/5' },
    { label: 'Cancelled', val: stats.orders.cancelled, icon: XCircle, color: 'text-rose-400', bg: 'bg-rose-400/5' },
  ];

  return (
    <div className="space-y-10 animate-fade-in text-warm-ivory">
      
      {/* Title */}
      <div>
        <h1 className="font-serif text-2xl md:text-3xl text-white font-light tracking-wide">
          Boutique Metrics Overview
        </h1>
        <p className="text-xs text-warm-ivory/50 mt-1 uppercase tracking-widest">
          Real-time product inventory and order tracking details.
        </p>
      </div>

      {/* Inventory section */}
      <div>
        <h3 className="text-xs uppercase tracking-widest text-gold font-semibold mb-4">Inventory & Catalogue</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {productCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="bg-dark-charcoal border border-gold/10 p-5 rounded-xl flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-warm-ivory/50 font-light">{card.label}</p>
                  <p className="text-2xl font-semibold text-white font-serif">{card.val}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg ${card.bg} ${card.color} border border-gold/5 flex items-center justify-center`}>
                  <Icon size={20} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Orders section */}
      <div>
        <h3 className="text-xs uppercase tracking-widest text-gold font-semibold mb-4">Sales Order Flow</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {orderCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="bg-dark-charcoal border border-gold/10 p-4 rounded-xl flex flex-col justify-between h-28">
                <div className={`w-8 h-8 rounded-lg ${card.bg} ${card.color} border border-gold/5 flex items-center justify-center self-end`}>
                  <Icon size={16} />
                </div>
                <div className="mt-2">
                  <p className="text-[10px] text-warm-ivory/50 font-light uppercase tracking-wider">{card.label}</p>
                  <p className="text-xl font-semibold text-white font-serif">{card.val}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Leads Highlight */}
      <div className="bg-gradient-to-r from-gold/5 via-gold/1 to-transparent border border-gold/20 p-6 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="text-sm font-semibold tracking-wider text-white">WhatsApp Client Leads Captured</h4>
          <p className="text-xs text-warm-ivory/60 font-light">
            You have received <strong className="text-gold font-serif">{stats.leadsCount}</strong> product inquiry submissions.
          </p>
        </div>
        <Link 
          to="/admin/leads" 
          className="text-xs bg-gold text-dark-base uppercase tracking-widest font-semibold px-4 py-2 rounded flex items-center gap-1.5 hover:bg-gold-light transition duration-300"
        >
          View Leads Log
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Orders */}
        <div className="bg-dark-charcoal border border-gold/10 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-serif text-base font-medium text-white tracking-wide">Recent Orders</h3>
            <Link to="/admin/orders" className="text-xs text-gold hover:text-gold-light transition duration-300 flex items-center gap-1">
              All Orders
              <ArrowRight size={12} />
            </Link>
          </div>

          {recentOrders.length > 0 ? (
            <div className="divide-y divide-gold/5">
              {recentOrders.map((order) => (
                <div key={order._id || order.id} className="py-3.5 flex justify-between items-center text-sm font-light">
                  <div>
                    <p className="font-semibold text-white">Ref: #{order._id?.slice(-6) || order.id}</p>
                    <p className="text-[10px] text-warm-ivory/40 uppercase mt-0.5">
                      {order.customerName || order.customer?.name || 'Customer'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gold font-serif font-medium">
                      KES {order.totalAmount || order.total?.toLocaleString()}
                    </p>
                    <span className={`inline-block text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full mt-1 ${
                      order.status?.toLowerCase() === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                      order.status?.toLowerCase() === 'delivered' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                      order.status?.toLowerCase() === 'cancelled' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                      'bg-teal-500/10 text-teal-500 border border-teal-500/20'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-warm-ivory/40 text-center py-8">No orders cataloged yet.</p>
          )}
        </div>

        {/* Recent Leads */}
        <div className="bg-dark-charcoal border border-gold/10 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-serif text-base font-medium text-white tracking-wide">Recent WhatsApp Leads</h3>
            <Link to="/admin/leads" className="text-xs text-gold hover:text-gold-light transition duration-300 flex items-center gap-1">
              All Leads
              <ArrowRight size={12} />
            </Link>
          </div>

          {recentLeads.length > 0 ? (
            <div className="divide-y divide-gold/5">
              {recentLeads.map((lead) => (
                <div key={lead._id || lead.id} className="py-3.5 flex justify-between items-center text-sm font-light">
                  <div>
                    <p className="font-semibold text-white">{lead.name}</p>
                    <p className="text-[10px] text-warm-ivory/40 uppercase mt-0.5">{lead.phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gold font-medium truncate max-w-[150px]" title={lead.product}>
                      {lead.product}
                    </p>
                    <span className="text-[9px] text-warm-ivory/40 mt-1 block tracking-wider uppercase">
                      {lead.source}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-warm-ivory/40 text-center py-8">No leads logged yet.</p>
          )}
        </div>

      </div>

    </div>
  );
}
