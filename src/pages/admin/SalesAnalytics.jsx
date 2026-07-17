import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  ShoppingBag,
  Users2,
  DollarSign,
  Search,
  RefreshCw,
  Award,
} from "lucide-react";
import apiClient from "../../api/apiClient";
import { normalizeOrder, normalizeProduct } from "../../utils/apiData";

const GOLD_COLORS = ["#C8A24A", "#D4AF37", "#E9DFCA", "#A67C1E", "#F7F3EA"];

export default function SalesAnalytics() {
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [breakdown, setBreakdown] = useState([]);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    averageOrder: 0,
    totalOrdersCount: 0,
  });

  // Customer Lookup
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerHistory, setCustomerHistory] = useState(null);
  const [ordersDataset, setOrdersDataset] = useState([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        let revenueDataFetched = null;
        let topProductsFetched = null;
        let breakdownFetched = null;

        // 1. Try to fetch from backend analytics endpoints
        try {
          const [revRes, topRes, brkRes] = await Promise.all([
            apiClient.get("/sales/analytics/revenue-trends"),
            apiClient.get("/sales/analytics/top-products"),
            apiClient.get("/sales/analytics/sales-breakdown"),
          ]);
          revenueDataFetched = revRes.data;
          topProductsFetched = topRes.data;
          breakdownFetched = brkRes.data;
        } catch (e) {
          console.warn(
            "Backend analytics aggregates failed or pending, compiling fallback datasets...",
          );
        }

        // 2. Fetch full orders list for fallback calculations and customer searches
        const ordersRes = await apiClient
          .get("/orders")
          .catch(() => ({ data: [] }));
        const orders = (ordersRes.data || []).map((order) =>
          normalizeOrder(order),
        );
        setOrdersDataset(orders);

        const productsRes = await apiClient
          .get("/products")
          .catch(() => ({ data: [] }));
        const products = (productsRes.data || []).map((product) =>
          normalizeProduct(product),
        );

        // Compile Summary Card Values
        const deliveredOrders = orders.filter(
          (o) => o.status?.toLowerCase() === "delivered",
        );
        const revenueOrders = orders.filter(
          (o) => o.status?.toLowerCase() !== "cancelled",
        );

        const totalRevenue = revenueOrders.reduce(
          (acc, curr) => acc + (curr.totalAmount || curr.total || 0),
          0,
        );
        const averageOrder =
          revenueOrders.length > 0 ? totalRevenue / revenueOrders.length : 0;

        setSummary({
          totalRevenue,
          averageOrder,
          totalOrdersCount: orders.length,
        });

        // 3. Fallback Revenue Trends (Daily revenue for last 7 order dates)
        if (revenueDataFetched && Array.isArray(revenueDataFetched)) {
          setRevenueData(revenueDataFetched);
        } else {
          const trendsMap = {};
          orders.forEach((order) => {
            const dateStr = order.createdAt || order.date;
            if (dateStr && order.status?.toLowerCase() !== "cancelled") {
              const formattedDate = new Date(dateStr).toLocaleDateString(
                undefined,
                { month: "short", day: "numeric" },
              );
              trendsMap[formattedDate] =
                (trendsMap[formattedDate] || 0) +
                (order.totalAmount || order.total || 0);
            }
          });
          const trendsArray = Object.entries(trendsMap)
            .map(([date, revenue]) => ({ date, revenue }))
            .slice(-7);
          setRevenueData(trendsArray);
        }

        // 4. Fallback Top Products (Count purchases per product name)
        if (topProductsFetched && Array.isArray(topProductsFetched)) {
          setTopProducts(
            topProductsFetched.map((p) => ({
              name: p.productName,
              sales: p.unitsSold,
              revenue: p.revenue,
            })),
          );
        } else {
          const productSalesMap = {};
          orders.forEach((order) => {
            if (order.status?.toLowerCase() !== "cancelled" && order.items) {
              order.items.forEach((item) => {
                const name = item.name;
                if (name) {
                  productSalesMap[name] =
                    (productSalesMap[name] || 0) + (item.quantity || 1);
                }
              });
            }
          });
          const sortedProds = Object.entries(productSalesMap)
            .map(([name, sales]) => ({ name, sales }))
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 5);
          setTopProducts(sortedProds);
        }

        // 5. Fallback Product Type Breakdown
        if (breakdownFetched && Array.isArray(breakdownFetched)) {
          setBreakdown(breakdownFetched);
        } else {
          const typeSalesMap = {};
          orders.forEach((order) => {
            if (order.status?.toLowerCase() !== "cancelled" && order.items) {
              order.items.forEach((item) => {
                // Find matching product type
                const matchingProduct = products.find(
                  (p) => p.name === item.name,
                );
                const type = matchingProduct?.productType || "Unassigned";
                typeSalesMap[type] =
                  (typeSalesMap[type] || 0) +
                  (item.price * (item.quantity || 1) || 0);
              });
            }
          });
          const typeBreakdown = Object.entries(typeSalesMap).map(
            ([name, value]) => ({ name, value }),
          );
          setBreakdown(typeBreakdown);
        }
      } catch (err) {
        console.error("Analytics compiling failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Search client history
  const handleCustomerSearch = (e) => {
    e.preventDefault();
    if (!customerSearch.trim()) return;

    const query = customerSearch.toLowerCase();
    const customerOrders = ordersDataset.filter((o) => {
      const name = (o.customerName || o.customer?.name || "").toLowerCase();
      const phone = o.customerPhone || o.customer?.phone || "";
      const email = (o.customerEmail || o.customer?.email || "").toLowerCase();
      return (
        name.includes(query) || phone.includes(query) || email.includes(query)
      );
    });

    if (customerOrders.length > 0) {
      const name =
        customerOrders[0].customerName || customerOrders[0].customer?.name;
      const phone =
        customerOrders[0].customerPhone || customerOrders[0].customer?.phone;
      const email =
        customerOrders[0].customerEmail || customerOrders[0].customer?.email;
      const totalSpent = customerOrders
        .filter((o) => o.status?.toLowerCase() !== "cancelled")
        .reduce((sum, o) => sum + (o.totalAmount || o.total || 0), 0);

      setCustomerHistory({
        name,
        phone,
        email,
        totalSpent,
        orders: customerOrders,
      });
    } else {
      setCustomerHistory({ error: "No order history found for this client." });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-gold">
        <div className="w-10 h-10 border-2 border-gold/10 border-t-2 border-gold rounded-full animate-spin mb-4"></div>
        <p className="text-xs uppercase tracking-widest animate-pulse">
          Plotting Charts & Aggregates...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in text-warm-ivory">
      {/* Title */}
      <div>
        <h1 className="font-serif text-2xl md:text-3xl text-white font-light tracking-wide">
          Performance &amp; Insights
        </h1>
        <p className="text-xs text-warm-ivory/50 mt-1 uppercase tracking-widest">
          Analyze revenue trends, top-selling lines, and category demand shares.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-dark-charcoal border border-gold/10 p-5 rounded-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-gold/5 border border-gold/20 text-gold flex items-center justify-center shrink-0">
            <DollarSign size={20} />
          </div>
          <div>
            <p className="text-[10px] text-warm-ivory/40 uppercase tracking-wider font-light">
              Gross Sales Revenue
            </p>
            <h3 className="font-serif text-xl font-bold text-white mt-0.5">
              KES {summary.totalRevenue.toLocaleString()}
            </h3>
          </div>
        </div>

        <div className="bg-dark-charcoal border border-gold/10 p-5 rounded-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-gold/5 border border-gold/20 text-gold flex items-center justify-center shrink-0">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-[10px] text-warm-ivory/40 uppercase tracking-wider font-light">
              Average Order Value
            </p>
            <h3 className="font-serif text-xl font-bold text-white mt-0.5">
              KES {Math.round(summary.averageOrder).toLocaleString()}
            </h3>
          </div>
        </div>

        <div className="bg-dark-charcoal border border-gold/10 p-5 rounded-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-gold/5 border border-gold/20 text-gold flex items-center justify-center shrink-0">
            <ShoppingBag size={20} />
          </div>
          <div>
            <p className="text-[10px] text-warm-ivory/40 uppercase tracking-wider font-light">
              Total Logged Orders
            </p>
            <h3 className="font-serif text-xl font-bold text-white mt-0.5">
              {summary.totalOrdersCount}
            </h3>
          </div>
        </div>
      </div>

      {/* Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Trends Chart */}
        <div className="bg-dark-charcoal border border-gold/10 rounded-xl p-6">
          <h3 className="font-serif text-base text-white tracking-wide mb-6">
            Revenue Growth curve
          </h3>
          <div className="h-72">
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={revenueData}
                  margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#C8A24A" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#C8A24A" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" />
                  <XAxis
                    dataKey="date"
                    stroke="#888888"
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1A1A1A",
                      borderColor: "#C8A24A",
                      color: "#F7F3EA",
                    }}
                    formatter={(val) => [
                      `KES ${val.toLocaleString()}`,
                      "Revenue",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#C8A24A"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center py-20 text-xs text-warm-ivory/40">
                No sales transactions available to graph.
              </p>
            )}
          </div>
        </div>

        {/* Category Demand Split - Progress Bars */}
        <div className="bg-dark-charcoal border border-gold/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
              <TrendingUp size={16} className="text-gold" />
            </div>
            <div>
              <h3 className="font-serif text-base text-white tracking-wide">
                Category Demand Split
              </h3>
              <p className="text-[10px] text-warm-ivory/40 uppercase tracking-wider mt-0.5">
                Share of store revenues
              </p>
            </div>
          </div>

          {breakdown.length > 0 ? (
            (() => {
              const getVal = (item) =>
                item.value !== undefined
                  ? item.value
                  : item.amount ||
                    item.total ||
                    item.revenue ||
                    item.totalAmount ||
                    item.totalSales ||
                    item.sales ||
                    0;
              const getName = (item) =>
                item.name ||
                item.category ||
                item.type ||
                item.productType ||
                item._id ||
                "Unassigned";
              const totalValue = breakdown.reduce((s, b) => s + getVal(b), 0);
              return (
                <div className="space-y-5">
                  {breakdown.map((cat, idx) => {
                    const val = getVal(cat);
                    const name = getName(cat);
                    const pct =
                      totalValue > 0 ? Math.round((val / totalValue) * 100) : 0;
                    const itemCount = (() => {
                      // count items in this category from orders
                      let count = 0;
                      ordersDataset.forEach((order) => {
                        if (
                          order.status?.toLowerCase() !== "cancelled" &&
                          order.items
                        ) {
                          order.items.forEach((item) => {
                            if (
                              (item.productType || "") === name ||
                              name === "Unassigned"
                            )
                              count += item.quantity || 1;
                          });
                        }
                      });
                      return count;
                    })();
                    const barColors = [
                      "bg-gold",
                      "bg-emerald-500",
                      "bg-teal-400",
                      "bg-amber-400",
                      "bg-rose-400",
                    ];
                    return (
                      <div key={name || idx}>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-sm font-semibold text-white">
                            {name}
                          </span>
                          <span className="text-xs text-warm-ivory/60">
                            {pct}%{itemCount > 0 ? ` (${itemCount} items)` : ""}
                          </span>
                        </div>
                        <div className="h-2.5 bg-dark-base rounded-full overflow-hidden">
                          <div
                            className={`h-full ${barColors[idx % barColors.length]} rounded-full transition-all duration-700`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="text-right text-[10px] text-warm-ivory/40 mt-1">
                          KES {val.toLocaleString()}
                        </p>
                      </div>
                    );
                  })}
                  <p className="text-[10px] text-warm-ivory/40 italic pt-2 border-t border-gold/10">
                    Category data is aggregated dynamically as orders are marked
                    complete.
                  </p>
                </div>
              );
            })()
          ) : (
            <p className="text-center py-20 text-xs text-warm-ivory/40">
              No product classifications cataloged.
            </p>
          )}
        </div>
      </div>

      {/* Top Products & Customer History Lookup */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Top selling products */}
        <div className="lg:col-span-5 bg-dark-charcoal border border-gold/10 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                <Award size={16} className="text-gold" />
              </div>
              <div>
                <h3 className="font-serif text-base text-white tracking-wide">
                  Top Selling Products
                </h3>
                <p className="text-[10px] text-warm-ivory/40 uppercase tracking-wider mt-0.5">
                  Ranked by volume of units sold
                </p>
              </div>
            </div>
            {topProducts.length > 0 ? (
              (() => {
                const getSales = (p) =>
                  p.sales !== undefined
                    ? p.sales
                    : p.count || p.quantity || p.salesCount || 0;
                const getRevenue = (p) =>
                  p.revenue !== undefined
                    ? p.revenue
                    : p.total || p.amount || p.totalAmount || 0;
                const maxSales = Math.max(
                  ...topProducts.map((p) => getSales(p)),
                  1,
                );
                return (
                  <div className="space-y-4">
                    {topProducts.map((prod, idx) => {
                      const sales = getSales(prod);
                      const revenue = getRevenue(prod);
                      return (
                        <div key={prod.name || idx}>
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-sm font-semibold text-white">
                              {idx + 1}. {prod.name || "Unknown Product"}
                            </span>
                            <span className="text-xs text-warm-ivory/60">
                              {sales} sold
                              {revenue
                                ? ` · KES ${Number(revenue).toLocaleString()}`
                                : ""}
                            </span>
                          </div>
                          <div className="h-2 bg-dark-base rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gold rounded-full transition-all duration-700"
                              style={{ width: `${(sales / maxSales) * 100}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()
            ) : (
              <p className="text-xs text-warm-ivory/40 text-center py-10">
                No top products data compiled.
              </p>
            )}
          </div>
          <div className="flex gap-2.5 p-3.5 bg-gold/5 border border-gold/10 rounded-lg text-[10px] leading-relaxed text-gold/90 font-light mt-6">
            <Award size={16} className="shrink-0 mt-0.5" />
            <p>
              Highlights are sorted based on cumulative product counts inside
              valid sales invoices.
            </p>
          </div>
        </div>

        {/* Customer Lookup (Columns 6-12) */}
        <div className="lg:col-span-7 bg-dark-charcoal border border-gold/10 rounded-xl p-6 space-y-6">
          <div>
            <h3 className="font-serif text-base text-white tracking-wide">
              Client History Lookup
            </h3>
            <p className="text-[10px] text-warm-ivory/40 uppercase mt-0.5 tracking-wider">
              Search sales records by customer phone, name, or email.
            </p>
          </div>

          <form onSubmit={handleCustomerSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gold/50"
                size={14}
              />
              <input
                type="text"
                placeholder="Search phone (e.g. +254...), name, email..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="w-full bg-dark-base border border-gold/15 focus:border-gold rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none text-white"
              />
            </div>
            <button
              type="submit"
              className="bg-gold text-dark-base font-semibold px-4 py-2 rounded-lg text-xs uppercase tracking-widest hover:bg-gold-light transition duration-300 shrink-0"
            >
              Search
            </button>
          </form>

          {/* Search Result */}
          {customerHistory && (
            <div className="border border-gold/15 rounded-lg p-4 bg-dark-base/30 text-xs font-light space-y-4 animate-fade-in">
              {customerHistory.error ? (
                <p className="text-center text-amber-500 font-medium py-4">
                  {customerHistory.error}
                </p>
              ) : (
                <>
                  {/* Bio */}
                  <div className="grid grid-cols-2 gap-4 border-b border-gold/5 pb-3">
                    <div>
                      <h4 className="font-semibold text-white/50 uppercase tracking-widest text-[9px] mb-1">
                        Customer Profile
                      </h4>
                      <p className="text-sm font-semibold text-white">
                        {customerHistory.name}
                      </p>
                      <p className="mt-0.5 text-warm-ivory/60">
                        {customerHistory.phone}
                      </p>
                      <p className="text-warm-ivory/60">
                        {customerHistory.email}
                      </p>
                    </div>
                    <div className="text-right">
                      <h4 className="font-semibold text-white/50 uppercase tracking-widest text-[9px] mb-1">
                        Lifetime Value
                      </h4>
                      <p className="text-lg font-bold text-gold font-serif mt-1">
                        KES {customerHistory.totalSpent.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-warm-ivory/40 uppercase mt-0.5">
                        {customerHistory.orders.length} order(s)
                      </p>
                    </div>
                  </div>

                  {/* Orders list */}
                  <div className="space-y-2">
                    <h5 className="font-semibold text-white/50 uppercase tracking-wider text-[9px]">
                      Purchases History
                    </h5>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {customerHistory.orders.map((ord) => (
                        <div
                          key={ord._id || ord.id}
                          className="bg-dark-base/40 p-2.5 rounded border border-gold/5 flex justify-between items-center text-[11px]"
                        >
                          <div>
                            <span className="font-semibold text-white">
                              #{(ord._id || ord.id).slice(-6).toUpperCase()}
                            </span>
                            <span className="text-warm-ivory/40 ml-2">
                              {ord.createdAt || ord.date
                                ? new Date(
                                    ord.createdAt || ord.date,
                                  ).toLocaleDateString()
                                : ""}
                            </span>
                          </div>
                          <div className="text-right font-serif">
                            <span className="text-gold font-semibold mr-3">
                              KES{" "}
                              {(
                                ord.totalAmount ||
                                ord.total ||
                                0
                              ).toLocaleString()}
                            </span>
                            <span className="text-[8px] uppercase tracking-wider text-warm-ivory/50">
                              {ord.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
