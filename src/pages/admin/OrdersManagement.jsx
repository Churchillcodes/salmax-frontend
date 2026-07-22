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
import {
  normalizeOrder,
  normalizeProduct,
  normalizeCategory,
  SIZE_OPTIONS,
} from "../../utils/apiData";
import { confirmToast } from "../../utils/confirmToast";

export default function OrdersManagement() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [viewingOrder, setViewingOrder] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerLocation, setCustomerLocation] = useState("");

  // Structured order creation flow states
  const [createProductType, setCreateProductType] = useState("");
  const [createGroup, setCreateGroup] = useState("");
  const [createCategory, setCreateCategory] = useState("");
  const [createProduct, setCreateProduct] = useState(null); // Selected product object
  const [createSize, setCreateSize] = useState("");
  const [createQuantity, setCreateQuantity] = useState(1);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersRes, productsRes, categoriesRes] = await Promise.all([
        apiClient.get("/orders"),
        apiClient.get("/products"),
        apiClient.get("/categories"),
      ]);
      setOrders((ordersRes.data || []).map((o) => normalizeOrder(o)));
      setProducts((productsRes.data || []).map((p) => normalizeProduct(p)));
      setCategories(
        (categoriesRes.data || []).map((c) => normalizeCategory(c)),
      );
    } catch (e) {
      console.error("Failed to load orders, products or categories data:", e);
      toast.error("Failed to retrieve inventory or orders data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (orderId, nextStatus) => {
    const order = orders.find((o) => (o._id || o.id) === orderId);
    if (!order) return;

    const currentStatus = (order.status || "pending").toLowerCase();
    const targetStatus = nextStatus.toLowerCase();

    // Check if order is already in a final state
    if (currentStatus === "delivered" || currentStatus === "cancelled") {
      toast.warning(
        `Order is in a final status "${order.status}" and cannot be updated.`,
      );
      return;
    }

    // Validate transition path
    let isValid = false;
    if (currentStatus === "pending") {
      isValid = targetStatus === "confirmed" || targetStatus === "cancelled";
    } else if (currentStatus === "confirmed") {
      isValid = targetStatus === "ready" || targetStatus === "cancelled";
    } else if (currentStatus === "ready") {
      isValid = targetStatus === "delivered" || targetStatus === "cancelled";
    }

    if (!isValid) {
      toast.error(
        `Cannot change status from "${order.status}" to "${nextStatus}". Please follow the strict flow: Pending -> Confirmed -> Ready -> Delivered.`,
      );
      return;
    }

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
      toast.error(
        err.response?.data?.message || "Could not modify order status.",
      );
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!customerName.trim()) {
      toast.warning("Customer name is required.");
      return;
    }

    if (customerPhone && customerPhone.trim()) {
      const phoneRegex = /^\+?[0-9\s\-()]{7,15}$/;
      if (!phoneRegex.test(customerPhone.trim())) {
        toast.warning("Please enter a valid phone number.");
        return;
      }
    }

    if (!createProduct) {
      toast.warning("Please select a product.");
      return;
    }
    if (!createSize) {
      toast.warning("Please select a size.");
      return;
    }

    if (Number(createQuantity) <= 0) {
      toast.warning("Quantity must be a positive integer.");
      return;
    }

    const availableStock = createProduct.sizes?.[createSize] || 0;
    if (availableStock <= 0) {
      toast.error("The selected product size is currently out of stock.");
      return;
    }
    if (createQuantity > availableStock) {
      toast.error(
        `Requested quantity (${createQuantity}) exceeds available stock (${availableStock}) for size ${createSize}.`,
      );
      return;
    }

    const price = Number(createProduct.price || 0);
    const orderTotal = price * Number(createQuantity);

    const payload = {
      customerName,
      customerPhone,
      customerLocation,
      product: createProduct._id || createProduct.id,
      productName: createProduct.name,
      quantity: Number(createQuantity),
      size: createSize,
      agreedPrice: price,
      totalAmount: orderTotal,
      status: "pending",
      items: [
        {
          name: createProduct.name,
          product: createProduct._id || createProduct.id,
          size: createSize,
          quantity: Number(createQuantity),
          price: price,
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
      setCustomerLocation("");
      setCreateProductType("");
      setCreateGroup("");
      setCreateCategory("");
      setCreateProduct(null);
      setCreateSize("");
      setCreateQuantity(1);
      toast.success("Order created successfully in pending status.");
      fetchData();
    } catch (err) {
      console.error("Create order error:", err);
      toast.error(err.response?.data?.message || "Could not create the order.");
    }
  };

  const handleCancelOrder = async (orderId) => {
    const order = orders.find((o) => (o._id || o.id) === orderId);
    if (!order) return;
    if (
      order.status?.toLowerCase() === "delivered" ||
      order.status?.toLowerCase() === "cancelled"
    ) {
      toast.warning(
        `Order is already in a final status "${order.status}" and cannot be cancelled.`,
      );
      return;
    }

    const confirmed = await confirmToast({
      message: "Cancel this order?",
      detail: "This action cannot be undone.",
      confirmLabel: "Cancel Order",
      cancelLabel: "Keep Order",
    });
    if (!confirmed) return;

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
          {[
            "All",
            "Pending",
            "Confirmed",
            "Ready",
            "Delivered",
            "Cancelled",
          ].map((statusOption) => (
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
          ))}
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
            <table className="w-full min-w-205 text-left border-collapse">
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
                              : order.status?.toLowerCase() === "confirmed"
                                ? "bg-teal-500/10 text-teal-500 border border-teal-500/20"
                                : order.status?.toLowerCase() === "ready"
                                  ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                  : order.status?.toLowerCase() === "delivered"
                                    ? "bg-green-500/10 text-green-500 border border-green-500/20"
                                    : order.status?.toLowerCase() ===
                                        "cancelled"
                                      ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                                      : "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20"
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
                                handleUpdateStatus(orderId, "Confirmed")
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
                                handleUpdateStatus(orderId, "Ready")
                              }
                              className="p-1.5 hover:bg-teal-500/10 text-warm-ivory/60 hover:text-teal-400 rounded transition"
                              title="Mark as Ready for Pickup"
                            >
                              <CheckCircle2 size={14} />
                            </button>
                          )}

                          {order.status?.toLowerCase() === "ready" && (
                            <button
                              onClick={() =>
                                handleUpdateStatus(orderId, "Delivered")
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

      {showCreateModal &&
        (() => {
          // Compute derived selections inside modal
          const modalSizes = (() => {
            if (createProductType === "Shoes") return SIZE_OPTIONS.Shoes || [];
            if (createProductType === "Bags") return SIZE_OPTIONS.Bags || [];
            if (createProductType === "Clothes") {
              if (createGroup === "Girls" || createGroup === "Boys")
                return SIZE_OPTIONS.Clothes?.Children || [];
              return SIZE_OPTIONS.Clothes?.Adult || [];
            }
            return [];
          })();

          const modalCategories = categories.filter((cat) => {
            if (!createProductType) return false;
            if (
              cat.productType?.toLowerCase() !== createProductType.toLowerCase()
            )
              return false;
            if (createProductType === "Bags") return true;
            const cg =
              !cat.group || cat.group === "None" ? "" : cat.group.toLowerCase();
            const fg =
              !createGroup || createGroup === "None"
                ? ""
                : createGroup.toLowerCase();
            return cg === fg;
          });

          const modalProducts = products.filter((p) => {
            if (!createCategory) return false;
            const pCatId =
              typeof p.category === "object"
                ? p.category?._id || p.category?.id
                : p.category;
            return pCatId === createCategory;
          });

          const selectedProductSizes = createProduct
            ? Object.entries(createProduct.sizes || {}).filter(
                ([, qty]) => qty > 0,
              )
            : [];

          const stockForSize =
            createProduct && createSize
              ? createProduct.sizes?.[createSize] || 0
              : null;

          const orderTotal = createProduct
            ? Number(createProduct.price || 0) * Number(createQuantity || 1)
            : 0;

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
              <div className="w-full max-w-lg max-h-[90vh] bg-dark-charcoal border border-gold/25 rounded-xl shadow-2xl animate-fade-in text-warm-ivory flex flex-col overflow-hidden">
                <div className="flex justify-between items-center px-6 py-4 border-b border-gold/15 bg-dark-base shrink-0">
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

                <form
                  onSubmit={handleCreateOrder}
                  className="p-6 space-y-5 overflow-y-auto flex-1"
                >
                  {/* Customer Details */}
                  <div className="space-y-1">
                    <p className="text-[9px] uppercase tracking-widest text-warm-ivory/30 font-semibold">
                      Step 1 — Customer Details
                    </p>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-warm-ivory/60 mb-1.5 font-semibold">
                          Customer Name *
                        </label>
                        <input
                          type="text"
                          required
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
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-warm-ivory/60 mb-1.5 font-semibold">
                        Delivery Location
                      </label>
                      <input
                        type="text"
                        value={customerLocation}
                        onChange={(e) => setCustomerLocation(e.target.value)}
                        placeholder="e.g., Westlands, Nairobi"
                        className="w-full bg-dark-base border border-gold/15 rounded px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-gold/30"
                      />
                    </div>
                  </div>

                  {/* Product Selection Flow */}
                  <div className="pt-4 border-t border-gold/10 space-y-4">
                    <p className="text-[9px] uppercase tracking-widest text-warm-ivory/30 font-semibold">
                      Step 2 — Select Product
                    </p>

                    <div className="grid gap-4 md:grid-cols-2">
                      {/* Product Type */}
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-warm-ivory/60 mb-1.5 font-semibold">
                          Product Type *
                        </label>
                        <select
                          value={createProductType}
                          onChange={(e) => {
                            setCreateProductType(e.target.value);
                            setCreateGroup("");
                            setCreateCategory("");
                            setCreateProduct(null);
                            setCreateSize("");
                          }}
                          className="w-full bg-dark-base border border-gold/15 rounded px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-gold/30"
                        >
                          <option value="">Select Type</option>
                          <option value="Shoes">Shoes</option>
                          <option value="Clothes">Clothes</option>
                          <option value="Bags">Bags</option>
                        </select>
                      </div>

                      {/* Group */}
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-warm-ivory/60 mb-1.5 font-semibold">
                          Group
                        </label>
                        <select
                          value={createGroup}
                          disabled={
                            !createProductType || createProductType === "Bags"
                          }
                          onChange={(e) => {
                            setCreateGroup(e.target.value);
                            setCreateCategory("");
                            setCreateProduct(null);
                            setCreateSize("");
                          }}
                          className="w-full bg-dark-base border border-gold/15 rounded px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-gold/30 disabled:opacity-50"
                        >
                          <option value="">None</option>
                          {createProductType === "Shoes" && (
                            <>
                              <option value="Men">Men</option>
                              <option value="Ladies">Ladies</option>
                              <option value="Kids">Kids</option>
                            </>
                          )}
                          {createProductType === "Clothes" && (
                            <>
                              <option value="Women">Women</option>
                              <option value="Girls">Girls</option>
                              <option value="Men">Men</option>
                              <option value="Boys">Boys</option>
                            </>
                          )}
                        </select>
                      </div>
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-warm-ivory/60 mb-1.5 font-semibold">
                        Category *
                      </label>
                      <select
                        value={createCategory}
                        disabled={!createProductType}
                        onChange={(e) => {
                          setCreateCategory(e.target.value);
                          setCreateProduct(null);
                          setCreateSize("");
                        }}
                        className="w-full bg-dark-base border border-gold/15 rounded px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-gold/30 disabled:opacity-50"
                      >
                        <option value="">
                          {!createProductType
                            ? "Select product type first"
                            : "Select Category"}
                        </option>
                        {modalCategories.map((cat) => (
                          <option
                            key={cat._id || cat.id}
                            value={cat._id || cat.id}
                          >
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Product */}
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-warm-ivory/60 mb-1.5 font-semibold">
                        Product *
                      </label>
                      <select
                        value={createProduct?._id || createProduct?.id || ""}
                        disabled={!createCategory}
                        onChange={(e) => {
                          const p = modalProducts.find(
                            (pr) => (pr._id || pr.id) === e.target.value,
                          );
                          setCreateProduct(p || null);
                          setCreateSize("");
                        }}
                        className="w-full bg-dark-base border border-gold/15 rounded px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-gold/30 disabled:opacity-50"
                      >
                        <option value="">
                          {!createCategory
                            ? "Select category first"
                            : "Select Product"}
                        </option>
                        {modalProducts.map((p) => (
                          <option key={p._id || p.id} value={p._id || p.id}>
                            {p.name} — KES {(p.price || 0).toLocaleString()}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Size selection & stock display */}
                    {createProduct && (
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-warm-ivory/60 mb-1.5 font-semibold">
                          Size & Available Stock *
                        </label>
                        {selectedProductSizes.length > 0 ? (
                          <div className="grid grid-cols-3 gap-2">
                            {selectedProductSizes.map(([sz, qty]) => (
                              <button
                                key={sz}
                                type="button"
                                onClick={() => setCreateSize(sz)}
                                className={`p-2 rounded border text-xs text-center transition ${
                                  createSize === sz
                                    ? "bg-gold text-dark-base border-gold font-semibold"
                                    : qty <= 3
                                      ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                                      : "bg-dark-base border-gold/20 text-warm-ivory hover:border-gold"
                                }`}
                              >
                                <span className="font-bold block">{sz}</span>
                                <span className="text-[9px] opacity-70">
                                  {qty} in stock
                                </span>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-rose-400 italic">
                            This product has no available stock in any size.
                          </p>
                        )}
                      </div>
                    )}

                    {/* Stock warning */}
                    {stockForSize !== null &&
                      stockForSize <= 3 &&
                      stockForSize > 0 && (
                        <p className="text-[10px] text-amber-400 bg-amber-400/5 border border-amber-400/20 rounded px-3 py-2">
                          ⚠ Low stock: Only {stockForSize} units left in size{" "}
                          {createSize}.
                        </p>
                      )}

                    {/* Quantity */}
                    {createProduct && createSize && (
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-warm-ivory/60 mb-1.5 font-semibold">
                          Quantity * (Max: {stockForSize})
                        </label>
                        <input
                          type="number"
                          min="1"
                          max={stockForSize || 1}
                          value={createQuantity}
                          onChange={(e) =>
                            setCreateQuantity(Number(e.target.value))
                          }
                          className="w-full bg-dark-base border border-gold/15 rounded px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-gold/30"
                        />
                      </div>
                    )}

                    {/* Order Total Preview */}
                    {createProduct && createSize && (
                      <div className="bg-dark-base/50 border border-gold/15 rounded-lg p-3 flex justify-between items-center">
                        <span className="text-[10px] uppercase tracking-widest text-warm-ivory/50">
                          Estimated Order Total
                        </span>
                        <span className="font-serif text-gold font-semibold text-lg">
                          KES {orderTotal.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4 pt-2 border-t border-gold/10">
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
                      Create Order
                    </button>
                  </div>
                </form>
              </div>
            </div>
          );
        })()}

      {viewingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-lg max-h-[90vh] bg-dark-charcoal border border-gold/25 rounded-xl shadow-2xl animate-fade-in text-warm-ivory flex flex-col overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gold/15 bg-dark-base shrink-0">
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

            <div className="p-6 space-y-6 overflow-y-auto flex-1">
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
                    {viewingOrder.customerLocation || "No location provided"}
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

              {/* Status Transition Actions */}
              {(() => {
                const vStatus = (viewingOrder.status || "").toLowerCase();
                const vId = viewingOrder._id || viewingOrder.id;
                const isFinal =
                  vStatus === "delivered" || vStatus === "cancelled";
                return (
                  <div className="pt-4 border-t border-gold/10 space-y-3">
                    <p className="text-[10px] uppercase tracking-widest text-warm-ivory/40 font-semibold">
                      Update Order Status
                    </p>
                    {isFinal ? (
                      <p className="text-xs text-warm-ivory/40 italic bg-dark-base/30 border border-gold/10 rounded px-3 py-2">
                        This order is in a final status (
                        <span className="text-gold font-semibold capitalize">
                          {viewingOrder.status}
                        </span>
                        ) and cannot be updated further.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {vStatus === "pending" && (
                          <button
                            onClick={() => handleUpdateStatus(vId, "Confirmed")}
                            className="flex-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 py-2 rounded text-xs uppercase tracking-widest hover:bg-emerald-500/20 transition"
                          >
                            ✓ Confirm Order
                          </button>
                        )}
                        {vStatus === "confirmed" && (
                          <button
                            onClick={() => handleUpdateStatus(vId, "Ready")}
                            className="flex-1 bg-teal-500/10 text-teal-400 border border-teal-500/20 py-2 rounded text-xs uppercase tracking-widest hover:bg-teal-500/20 transition"
                          >
                            ✓ Mark as Ready
                          </button>
                        )}
                        {vStatus === "ready" && (
                          <button
                            onClick={() => handleUpdateStatus(vId, "Delivered")}
                            className="flex-1 bg-green-500/10 text-green-400 border border-green-500/20 py-2 rounded text-xs uppercase tracking-widest hover:bg-green-500/20 transition"
                          >
                            ✓ Mark as Delivered
                          </button>
                        )}
                        <button
                          onClick={() => handleCancelOrder(vId)}
                          className="flex-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 py-2 rounded text-xs uppercase tracking-widest hover:bg-rose-500/20 transition"
                        >
                          ✕ Cancel Order
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
