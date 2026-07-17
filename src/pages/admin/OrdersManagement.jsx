import React, { useState, useEffect } from "react";
import {
  ClipboardList,
  Search,
  Eye,
  XCircle,
  CheckCircle2,
  Truck,
  RefreshCw,
  X,
  FileText,
  Plus,
} from "lucide-react";
import apiClient from "../../api/apiClient";
import { toast } from "react-toastify";
import { normalizeOrder } from "../../utils/apiData";

export default function OrdersManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [viewingOrder, setViewingOrder] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [status, setStatus] = useState("pending");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/orders");
      setOrders((response.data || []).map((order) => normalizeOrder(order)));
    } catch (e) {
      console.error("Failed to load orders:", e);
      toast.error("Failed to fetch sales orders database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId, nextStatus) => {
    try {
      await apiClient.patch(`/orders/${orderId}/status`, {
        status: nextStatus,
      });
      toast.success(`Order status updated to: ${nextStatus}`);

      setOrders((prev) =>
        prev.map((o) => {
          if ((o._id || o.id) === orderId) {
            return { ...o, status: nextStatus };
          }
          return o;
        }),
      );

      if (viewingOrder && (viewingOrder._id || viewingOrder.id) === orderId) {
        setViewingOrder((prev) => ({ ...prev, status: nextStatus }));
      }
    } catch (err) {
      console.error("Status change error:", err);
      toast.error("Could not modify order status.");
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!customerName.trim() || !productName.trim()) {
      toast.warning("Customer name and product name are required.");
      return;
    }

    const payload = {
      customerName,
      customerPhone,
      customerEmail,
      productName,
      quantity: Number(quantity || 1),
      size,
      totalAmount: Number(totalAmount || 0),
      status,
      items: [
        {
          name: productName,
          size,
          quantity: Number(quantity || 1),
          price: Number(totalAmount || 0),
        },
      ],
    };

    try {
      const response = await apiClient.post("/orders", payload);
      const freshOrder = normalizeOrder(response.data);
      setOrders((prev) => [freshOrder, ...prev]);
      setShowCreateModal(false);
      setCustomerName("");
      setCustomerPhone("");
      setCustomerEmail("");
      setProductName("");
      setQuantity(1);
      setSize("");
      setTotalAmount("");
      setStatus("pending");
      toast.success("Order created successfully.");
    } catch (err) {
      console.error("Create order error:", err);
      toast.error("Could not create the order.");
    }
  };

  const handleCancelOrder = (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    handleUpdateStatus(orderId, "cancelled");
  };

  const filteredOrders = orders.filter((o) => {
    const custName = o.customerName || o.customer?.name || "";
    const phone = o.customerPhone || o.customer?.phone || "";
    const matchesSearch =
      custName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phone.includes(searchQuery) ||
      (o._id || o.id || "").includes(searchQuery);

    const matchesStatus =
      selectedStatus === "All" ||
      o.status?.toLowerCase() === selectedStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in text-warm-ivory">
      <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-start">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl text-white font-light tracking-wide">
            Orders Management
          </h1>
          <p className="text-xs text-warm-ivory/50 mt-1 uppercase tracking-widest">
            View customer orders, filter states, manage fulfillment milestones,
            and create new orders for the team.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gold text-dark-base font-semibold px-4 py-2.5 rounded-lg text-xs uppercase tracking-widest hover:bg-gold-light transition duration-300 flex items-center gap-1.5 gold-glow"
        >
          <Plus size={16} />
          Create Order
        </button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center bg-dark-charcoal border border-gold/10 p-4 rounded-xl">
        <div className="relative w-full md:w-80">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gold/50"
            size={16}
          />
          <input
            type="text"
            placeholder="Search by customer name, phone, order ref..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-dark-base border border-gold/10 rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-gold/30"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {["All", "Pending", "Confirmed", "Delivered", "Cancelled"].map(
            (statusOption) => (
              <button
                key={statusOption}
                onClick={() => setSelectedStatus(statusOption)}
                className={`px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider transition duration-300 border border-gold/5 ${
                  selectedStatus === statusOption
                    ? "bg-gold text-dark-base font-semibold"
                    : "bg-dark-base text-warm-ivory/60 hover:text-gold"
                }`}
              >
                {statusOption}
              </button>
            ),
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gold">
          <RefreshCw size={24} className="animate-spin mx-auto mb-3" />
          <span className="text-xs uppercase tracking-widest">
            Loading Orders...
          </span>
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="bg-dark-charcoal border border-gold/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-dark-base/50 text-[10px] uppercase tracking-widest border-b border-gold/10 text-warm-ivory/50">
                  <th className="px-6 py-4 font-semibold">Order Reference</th>
                  <th className="px-6 py-4 font-semibold">Customer</th>
                  <th className="px-6 py-4 font-semibold">Purchase items</th>
                  <th className="px-6 py-4 font-semibold">Total Amount</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/5 text-xs font-light text-warm-ivory/80">
                {filteredOrders.map((order) => {
                  const orderId = order._id || order.id;
                  const dateStr =
                    order.createdAt || order.date
                      ? new Date(
                          order.createdAt || order.date,
                        ).toLocaleDateString()
                      : "";
                  const totalItems = order.items
                    ? order.items.reduce(
                        (acc, curr) => acc + (curr.quantity || 1),
                        0,
                      )
                    : 0;
                  const custName =
                    order.customerName || order.customer?.name || "Customer";

                  return (
                    <tr
                      key={orderId}
                      className="hover:bg-gold/5 transition duration-300"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-white">
                            #{orderId.slice(-6).toUpperCase()}
                          </p>
                          <p className="text-[10px] text-warm-ivory/40 uppercase mt-0.5">
                            {dateStr}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-white/90">
                            {custName}
                          </p>
                          <p className="text-[10px] text-warm-ivory/40 uppercase mt-0.5">
                            {order.customerPhone ||
                              order.customer?.phone ||
                              "No Phone"}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-warm-ivory/60 font-light">
                        {totalItems} item(s)
                      </td>

                      <td className="px-6 py-4 font-serif text-gold font-medium">
                        KES{" "}
                        {order.totalAmount
                          ? order.totalAmount.toLocaleString()
                          : (order.total || 0).toLocaleString()}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-block text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            order.status?.toLowerCase() === "pending"
                              ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                              : order.status?.toLowerCase() === "delivered"
                                ? "bg-green-500/10 text-green-500 border border-green-500/20"
                                : order.status?.toLowerCase() === "cancelled"
                                  ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                                  : "bg-teal-500/10 text-teal-500 border border-teal-500/20"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => setViewingOrder(order)}
                            className="p-1.5 hover:bg-gold/10 text-warm-ivory/60 hover:text-gold rounded transition"
                            title="View Order Invoice details"
                          >
                            <Eye size={14} />
                          </button>

                          {order.status?.toLowerCase() === "pending" && (
                            <button
                              onClick={() =>
                                handleUpdateStatus(orderId, "confirmed")
                              }
                              className="p-1.5 hover:bg-emerald-500/10 text-warm-ivory/60 hover:text-emerald-400 rounded transition"
                              title="Confirm Order"
                            >
                              <CheckCircle2 size={14} />
                            </button>
                          )}

                          {order.status?.toLowerCase() === "confirmed" && (
                            <button
                              onClick={() =>
                                handleUpdateStatus(orderId, "delivered")
                              }
                              className="p-1.5 hover:bg-green-500/10 text-warm-ivory/60 hover:text-green-400 rounded transition"
                              title="Mark as Delivered"
                            >
                              <Truck size={14} />
                            </button>
                          )}

                          {order.status?.toLowerCase() !== "cancelled" &&
                            order.status?.toLowerCase() !== "delivered" && (
                              <button
                                onClick={() => handleCancelOrder(orderId)}
                                className="p-1.5 hover:bg-rose-500/10 text-warm-ivory/60 hover:text-rose-400 rounded transition"
                                title="Cancel Order"
                              >
                                <XCircle size={14} />
                              </button>
                            )}
                        </div>
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
          <ClipboardList size={36} className="mx-auto text-gold/30 mb-3" />
          <p className="font-serif italic text-warm-ivory/60">
            No orders logged
          </p>
          <p className="text-xs text-warm-ivory/40">
            Sales orders generated on storefront will appear here.
          </p>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-dark-charcoal border border-gold/25 rounded-xl overflow-hidden shadow-2xl animate-fade-in text-warm-ivory">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gold/15 bg-dark-base">
              <h3 className="font-serif text-base text-gold font-medium tracking-wide">
                Create New Order
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-warm-ivory/50 hover:text-gold"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="p-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-warm-ivory/60 mb-1.5 font-semibold">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-dark-base border border-gold/15 rounded px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-gold/30"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-warm-ivory/60 mb-1.5 font-semibold">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-dark-base border border-gold/15 rounded px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-gold/30"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-warm-ivory/60 mb-1.5 font-semibold">
                    Email
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full bg-dark-base border border-gold/15 rounded px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-gold/30"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-warm-ivory/60 mb-1.5 font-semibold">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-dark-base border border-gold/15 rounded px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-gold/30"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-warm-ivory/60 mb-1.5 font-semibold">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full bg-dark-base border border-gold/15 rounded px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-gold/30"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-warm-ivory/60 mb-1.5 font-semibold">
                    Size
                  </label>
                  <input
                    type="text"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    placeholder="S / M / L"
                    className="w-full bg-dark-base border border-gold/15 rounded px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-gold/30"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-warm-ivory/60 mb-1.5 font-semibold">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full bg-dark-base border border-gold/15 rounded px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-gold/30"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-warm-ivory/60 mb-1.5 font-semibold">
                    Total Amount
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    className="w-full bg-dark-base border border-gold/15 rounded px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-gold/30"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-dark-base border border-gold/25 text-warm-ivory/70 py-2.5 rounded text-xs uppercase tracking-widest hover:bg-gold/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gold text-dark-base font-semibold py-2.5 rounded text-xs uppercase tracking-widest hover:bg-gold-light gold-glow"
                >
                  Save Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-dark-charcoal border border-gold/25 rounded-xl overflow-hidden shadow-2xl animate-fade-in text-warm-ivory">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gold/15 bg-dark-base">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-gold" />
                <h3 className="font-serif text-base text-gold font-medium tracking-wide">
                  Order Invoice: #
                  {viewingOrder._id?.slice(-6).toUpperCase() || viewingOrder.id}
                </h3>
              </div>
              <button
                onClick={() => setViewingOrder(null)}
                className="text-warm-ivory/50 hover:text-gold"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              <div className="grid gap-4 sm:grid-cols-2 text-xs font-light bg-dark-base/40 p-4 rounded-lg border border-gold/5">
                <div>
                  <h4 className="font-semibold text-white/50 uppercase tracking-wider mb-1">
                    Billing Customer
                  </h4>
                  <p className="text-sm font-semibold text-white">
                    {viewingOrder.customerName ||
                      viewingOrder.customer?.name ||
                      "Customer"}
                  </p>
                  <p className="mt-1">
                    {viewingOrder.customerPhone || viewingOrder.customer?.phone}
                  </p>
                  <p>
                    {viewingOrder.customerEmail || viewingOrder.customer?.email}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-white/50 uppercase tracking-wider mb-1">
                    Order Summary
                  </h4>
                  <p>
                    Date:{" "}
                    {viewingOrder.createdAt || viewingOrder.date
                      ? new Date(
                          viewingOrder.createdAt || viewingOrder.date,
                        ).toLocaleDateString()
                      : "N/A"}
                  </p>
                  <p className="mt-1">
                    Status:{" "}
                    <span className="text-gold uppercase font-semibold">
                      {viewingOrder.status}
                    </span>
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-[10px] uppercase tracking-widest text-warm-ivory/40 font-semibold">
                  Purchase Items
                </h4>
                <div className="border border-gold/10 rounded-lg overflow-hidden">
                  <div className="bg-dark-base/50 px-4 py-2 grid grid-cols-12 text-[9px] uppercase tracking-widest font-semibold text-warm-ivory/50">
                    <span className="col-span-6">Item description</span>
                    <span className="col-span-2 text-center">Size</span>
                    <span className="col-span-2 text-center">Qty</span>
                    <span className="col-span-2 text-right">Price</span>
                  </div>
                  <div className="divide-y divide-gold/5 bg-dark-base/10 px-4">
                    {viewingOrder.items && viewingOrder.items.length > 0 ? (
                      viewingOrder.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="py-2.5 grid grid-cols-12 text-xs font-light"
                        >
                          <span className="col-span-6 text-white font-medium">
                            {item.name}
                          </span>
                          <span className="col-span-2 text-center uppercase">
                            {item.size || "—"}
                          </span>
                          <span className="col-span-2 text-center">
                            {item.quantity || 1}
                          </span>
                          <span className="col-span-2 text-right font-serif text-gold">
                            KES {(item.price || 0).toLocaleString()}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="py-4 text-center text-xs text-warm-ivory/40">
                        No items cataloged under order.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-gold/10 pt-4 font-serif">
                <span className="text-sm font-semibold uppercase text-warm-ivory/50 tracking-wider">
                  Total Value
                </span>
                <span className="text-2xl text-gold font-semibold">
                  KES{" "}
                  {(
                    viewingOrder.totalAmount ||
                    viewingOrder.total ||
                    0
                  ).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
