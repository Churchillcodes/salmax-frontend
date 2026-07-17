import React, { useState, useEffect } from "react";
import {
  ReceiptText,
  Search,
  RefreshCw,
  X,
  TrendingUp,
  Eye,
  Calendar,
  BadgeCheck,
} from "lucide-react";
import apiClient from "../../api/apiClient";
import { toast } from "react-toastify";

export default function SalesLogs() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingSale, setViewingSale] = useState(null);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/sales");
      setSales(res.data || []);
    } catch (e) {
      console.error("Failed to fetch sales logs:", e);
      toast.error("Could not load sales logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const filteredSales = sales.filter((sale) => {
    const q = searchQuery.toLowerCase();
    const customer =
      sale.customerName || sale.customer?.name || sale.order?.customerName || "";
    const product =
      sale.productName || sale.product?.name || sale.order?.productName || "";
    const id = sale._id || sale.id || "";
    return (
      customer.toLowerCase().includes(q) ||
      product.toLowerCase().includes(q) ||
      id.toLowerCase().includes(q)
    );
  });

  const totalRevenue = sales.reduce(
    (sum, s) => sum + Number(s.totalAmount || s.total || s.amount || 0),
    0
  );
  const totalUnits = sales.reduce((sum, s) => sum + Number(s.quantity || 1), 0);

  const formatCurrency = (amount) => `KES ${Number(amount || 0).toLocaleString()}`;

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in text-warm-ivory">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-start">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl text-white font-light tracking-wide">
            Sales Logs
          </h1>
          <p className="text-xs text-warm-ivory/50 mt-1 uppercase tracking-widest">
            Transaction records generated when orders reach delivered status.
          </p>
        </div>
        <button
          onClick={fetchSales}
          className="flex items-center gap-2 bg-dark-charcoal border border-gold/20 text-warm-ivory/70 px-4 py-2 rounded-lg text-xs uppercase tracking-widest hover:border-gold/50 hover:text-gold transition"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: "Total Transactions", value: sales.length, icon: ReceiptText, color: "text-gold" },
          { label: "Total Revenue", value: formatCurrency(totalRevenue), icon: TrendingUp, color: "text-emerald-400" },
          { label: "Units Sold", value: totalUnits, icon: BadgeCheck, color: "text-teal-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-dark-charcoal border border-gold/10 rounded-xl p-5 flex items-center gap-4">
            <div className={`rounded-lg p-2.5 bg-white/5`}>
              <Icon size={20} className={color} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-warm-ivory/50">{label}</p>
              <p className={`font-serif text-lg font-semibold ${color}`}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-dark-charcoal border border-gold/10 p-4 rounded-xl">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gold/50" size={16} />
          <input
            type="text"
            placeholder="Search by customer, product, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-dark-base border border-gold/10 rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-gold/30 text-white"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-16 text-gold">
          <RefreshCw size={24} className="animate-spin mx-auto mb-3" />
          <span className="text-xs uppercase tracking-widest">Loading Sales Records...</span>
        </div>
      ) : filteredSales.length > 0 ? (
        <div className="bg-dark-charcoal border border-gold/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-dark-base/50 text-[10px] uppercase tracking-widest border-b border-gold/10 text-warm-ivory/50">
                  <th className="px-6 py-4 font-semibold">Sale ID</th>
                  <th className="px-6 py-4 font-semibold">Customer</th>
                  <th className="px-6 py-4 font-semibold">Product</th>
                  <th className="px-6 py-4 font-semibold">Size</th>
                  <th className="px-6 py-4 font-semibold">Qty</th>
                  <th className="px-6 py-4 font-semibold">Revenue</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold text-right">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/5 text-xs font-light text-warm-ivory/80">
                {filteredSales.map((sale) => {
                  const saleId = sale._id || sale.id || "";
                  const customer = sale.customerName || sale.customer?.name || sale.order?.customerName || "Unknown";
                  const product = sale.productName || sale.product?.name || sale.order?.productName || "—";
                  const size = sale.size || sale.order?.size || "—";
                  const qty = Number(sale.quantity || 1);
                  const revenue = Number(sale.totalAmount || sale.total || sale.amount || 0);
                  const date = sale.createdAt || sale.date || sale.deliveredAt;
                  return (
                    <tr key={saleId} className="hover:bg-gold/5 transition duration-300">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-white text-[11px]">#{saleId.slice(-6).toUpperCase()}</p>
                      </td>
                      <td className="px-6 py-4 font-medium text-white/90">{customer}</td>
                      <td className="px-6 py-4 text-warm-ivory/60">{product}</td>
                      <td className="px-6 py-4 uppercase text-warm-ivory/60">{size}</td>
                      <td className="px-6 py-4 text-center">{qty}</td>
                      <td className="px-6 py-4 font-serif text-gold font-medium">{formatCurrency(revenue)}</td>
                      <td className="px-6 py-4 text-warm-ivory/50">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={11} />
                          {formatDate(date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setViewingSale(sale)}
                          className="p-1.5 hover:bg-gold/10 text-warm-ivory/50 hover:text-gold rounded transition"
                          title="View Sale Details"
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-gold/10 rounded-xl bg-dark-charcoal/20">
          <ReceiptText size={36} className="mx-auto text-gold/30 mb-3" />
          <p className="font-serif italic text-warm-ivory/60">No sales records found</p>
          <p className="text-xs text-warm-ivory/40 mt-1">
            Sales are automatically logged when an order is marked as Delivered.
          </p>
        </div>
      )}

      {/* Sale Detail Modal */}
      {viewingSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-md bg-dark-charcoal border border-gold/25 rounded-xl overflow-hidden shadow-2xl animate-fade-in text-warm-ivory">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gold/15 bg-dark-base">
              <div className="flex items-center gap-2">
                <ReceiptText size={18} className="text-gold" />
                <h3 className="font-serif text-base text-gold font-medium tracking-wide">
                  Sale Record: #{(viewingSale._id || viewingSale.id || "").slice(-6).toUpperCase()}
                </h3>
              </div>
              <button onClick={() => setViewingSale(null)} className="text-warm-ivory/50 hover:text-gold">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="bg-dark-base/40 p-4 rounded-lg border border-gold/5 text-xs">
                <p className="text-[10px] uppercase tracking-widest text-warm-ivory/40 font-semibold mb-2">Customer Details</p>
                <p className="text-sm font-semibold text-white mb-1">
                  {viewingSale.customerName || viewingSale.customer?.name || viewingSale.order?.customerName || "Unknown"}
                </p>
                <p className="text-warm-ivory/60">{viewingSale.customerPhone || viewingSale.customer?.phone || "—"}</p>
                <p className="text-warm-ivory/60">{viewingSale.customerEmail || viewingSale.customer?.email || "—"}</p>
              </div>

              <div className="bg-dark-base/40 p-4 rounded-lg border border-gold/5 text-xs">
                <p className="text-[10px] uppercase tracking-widest text-warm-ivory/40 font-semibold mb-3">Transaction Details</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ["Product", viewingSale.productName || viewingSale.product?.name || "—"],
                    ["Size", (viewingSale.size || viewingSale.order?.size || "—").toUpperCase()],
                    ["Quantity", viewingSale.quantity || 1],
                    ["Unit Price", formatCurrency(viewingSale.agreedPrice || viewingSale.unitPrice || viewingSale.price || 0)],
                    ["Date", formatDate(viewingSale.createdAt || viewingSale.date || viewingSale.deliveredAt)],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <p className="text-warm-ivory/40 text-[9px] uppercase mb-0.5">{label}</p>
                      <p className="text-white font-medium">{val}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-gold/10 pt-4 font-serif">
                <span className="text-sm font-semibold uppercase text-warm-ivory/50 tracking-wider">Revenue Earned</span>
                <span className="text-2xl text-gold font-semibold">
                  {formatCurrency(viewingSale.totalAmount || viewingSale.total || viewingSale.amount || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
