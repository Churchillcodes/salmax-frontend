import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit,
  Archive,
  Trash2,
  Image as ImageIcon,
  Package,
  Check,
  X,
  AlertTriangle,
  RefreshCw,
  FolderOpen,
} from "lucide-react";
import apiClient from "../../api/apiClient";
import { toast } from "react-toastify";
import {
  buildProductPayload,
  normalizeCategory,
  normalizeProduct,
  SIZE_OPTIONS,
} from "../../utils/apiData";

export default function ProductsManagement() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState("all"); // all, active, archived, low-stock

  // Modal forms states
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null if adding
  const [formName, setFormName] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formProductType, setFormProductType] = useState("");
  const [formGroup, setFormGroup] = useState("");
  const [formStock, setFormStock] = useState(0);
  const [formIsActive, setFormIsActive] = useState(true);
  const [formSizes, setFormSizes] = useState({ S: 0, M: 0, L: 0, XL: 0 });
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formImages, setFormImages] = useState([]);

  // Image Upload States
  const [stagedFiles, setStagedFiles] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [rawImages, setRawImages] = useState([]);

  // Fetch Products & Categories
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, archRes] = await Promise.all([
        apiClient.get("/products"),
        apiClient.get("/categories"),
        apiClient.get("/products/archived").catch(() => ({ data: [] })),
      ]);

      const activeList = (prodRes.data || []).map((product) =>
        normalizeProduct(product),
      );
      const archivedList = (archRes.data || []).map((product) => {
        const normalized = normalizeProduct(product);
        normalized.isActive = false;
        return normalized;
      });

      setProducts([...activeList, ...archivedList]);
      setCategories(
        (catRes.data || []).map((category) => normalizeCategory(category)),
      );
    } catch (error) {
      console.error("Failed to load products/categories:", error);
      toast.error("Error fetching inventory datasets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Open modal for Adding
  const handleAddClick = () => {
    setEditingProduct(null);
    setFormName("");
    setFormPrice("");
    setFormDescription("");
    setFormCategory("");
    setFormProductType("");
    setFormGroup("");
    setFormStock(0);
    setFormIsActive(true);
    setFormSizes({});
    setFormImageUrl("");
    setFormImages([]);
    setStagedFiles([]);
    setShowFormModal(true);
  };

  // Open modal for Editing
  const handleEditClick = (product) => {
    setEditingProduct(product);
    setFormName(product.name || "");
    setFormPrice(product.price || "");
    setFormDescription(product.description || "");

    const catId =
      typeof product.category === "object"
        ? product.category._id || product.category.id
        : product.category;
    setFormCategory(catId || "");
    setFormProductType(product.productType || "");
    setFormGroup(product.group || product.productGroup || "");
    setFormStock(product.stock || 0);
    setFormIsActive(product.isActive !== false);
    setFormSizes(product.sizes || {});
    setFormImageUrl(
      product.image || (product.images && product.images[0]) || "",
    );
    setFormImages(product.images || (product.image ? [product.image] : []));
    setRawImages(product.rawImages || []);
    setStagedFiles([]);
    setShowFormModal(true);
  };

  // Toggle archive status
  const handleToggleActive = async (product) => {
    const isCurrentlyActive = product.isActive !== false;
    const pId = product._id || product.id;

    if (isCurrentlyActive) {
      // Archive (Soft Delete)
      const confirmArchive = window.confirm(
        `WARNING: You are about to archive the product "${product.name}".\n\nThis will remove it from all storefront catalog pages and search views. You can restore it later if needed.\n\nDo you want to proceed?`,
      );
      if (!confirmArchive) return;

      try {
        await apiClient.delete(`/products/${pId}`);
        toast.success("Product archived successfully.");
        fetchProducts();
      } catch (e) {
        console.error("Failed to archive product:", e);
        toast.error("Could not archive product.");
      }
    } else {
      // Restore from archive
      const confirmRestore = window.confirm(
        `You are about to restore the product "${product.name}".\n\nThis will make it active and visible in the boutique catalog again.\n\nDo you want to proceed?`,
      );
      if (!confirmRestore) return;

      try {
        await apiClient.patch(`/products/${pId}/restore`);
        toast.success("Product restored successfully.");
        fetchProducts();
      } catch (e) {
        console.error("Failed to restore product:", e);
        toast.error("Could not restore product.");
      }
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = 5 - formImages.length - stagedFiles.length;
    if (remainingSlots <= 0) {
      toast.warning("Maximum of 5 images allowed per product.");
      e.target.value = "";
      return;
    }

    const filesToAdd = files.slice(0, remainingSlots);
    if (files.length > remainingSlots) {
      toast.warning(
        `Only ${remainingSlots} more image(s) can be staged (max 5 total).`,
      );
    }

    setStagedFiles((prev) => [...prev, ...filesToAdd]);
    e.target.value = ""; // allows re-selecting the same file later if removed
  };

  const handleRemoveStagedFile = (index) => {
    setStagedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Manual upload trigger — only for an EXISTING product being edited
  const handleUploadStagedImages = async () => {
    if (!editingProduct || stagedFiles.length === 0) return;
    setUploadingImage(true);
    const pId = editingProduct._id || editingProduct.id;
    const formData = new FormData();
    stagedFiles.forEach((file) => formData.append("images", file));

    try {
      const res = await apiClient.post(`/products/${pId}/images`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const updatedProd = normalizeProduct(res.data.product);
      setFormImages(updatedProd.images);
      setRawImages(updatedProd.rawImages);
      setStagedFiles([]);
      toast.success("Images uploaded successfully to Cloudinary.");
    } catch (err) {
      console.error("Image upload failed:", err);
      toast.error(
        err.response?.data?.message || "Failed to upload images to Cloudinary.",
      );
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle Form Submit (Add or Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formName.trim() || !formCategory || !formPrice) {
      toast.warning("Please fill in required fields.");
      return;
    }

    const priceNum = parseFloat(formPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.warning("Price must be a valid positive number.");
      return;
    }

    const stockNum = parseInt(formStock, 10);
    if (isNaN(stockNum) || stockNum < 0) {
      toast.warning("Stock count cannot be negative.");
      return;
    }

    const invalidSizes = Object.values(formSizes).some((qty) => qty < 0);
    if (invalidSizes) {
      toast.warning("Sizing quantities cannot be negative.");
      return;
    }

    if (formImages.length === 0 && stagedFiles.length === 0) {
      toast.warning(
        "Please provide at least 1 product image URL or upload a file.",
      );
      return;
    }

    const payload = buildProductPayload({
      name: formName,
      price: formPrice,
      description: formDescription,
      category: formCategory,
      productType: formProductType,
      group: formGroup,
      isActive: formIsActive,
      sizes: formSizes,
      image: formImageUrl || formImages[0] || "",
      images: formImages,
    });

    try {
      let savedProduct = null;

      if (editingProduct) {
        // Edit existing
        const pId = editingProduct._id || editingProduct.id;
        const res = await apiClient.patch(`/products/${pId}`, payload);
        savedProduct = res.data;
        toast.success("Product details updated successfully.");
      } else {
        // Create new
        const res = await apiClient.post("/products", payload);
        savedProduct = res.data;
        toast.success("Product created successfully.");
      }

      // Handle staged file upload if selected (primarily for new product)
      if (stagedFiles.length > 0 && savedProduct) {
        setUploadingImage(true);
        const pId = savedProduct._id || savedProduct.id;
        const formData = new FormData();
        stagedFiles.forEach((file) => formData.append("images", file));
        try {
          await apiClient.post(`/products/${pId}/images`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          toast.success("Product images uploaded to Cloudinary successfully.");
        } catch (imgErr) {
          console.error("Staged file upload failed:", imgErr);
          toast.error("Staged file upload failed (product details saved).");
        }
      }

      setShowFormModal(false);
      fetchProducts();
    } catch (error) {
      console.error("Save product failed:", error);
      toast.error(
        error.response?.data?.message || "Failed to save product details.",
      );
    } finally {
      setUploadingImage(false);
      setStagedFiles([]);
    }
  };

  // Adjust stock per size inline
  const handleStockAdjust = async (productId, size, direction) => {
    const endpoint =
      direction === "increase" ? "increase-stock" : "reduce-stock";
    try {
      const response = await apiClient.patch(
        `/products/${productId}/${endpoint}`,
        {
          size,
          quantity: 1,
        },
      );
      toast.success("Stock adjusted.");

      // Update state locally to avoid full fetch
      setProducts((prev) =>
        prev.map((p) => {
          if ((p._id || p.id) === productId) {
            const currentSizes = { ...p.sizes };
            if (direction === "increase") {
              currentSizes[size] = (currentSizes[size] || 0) + 1;
            } else {
              currentSizes[size] = Math.max(0, (currentSizes[size] || 0) - 1);
            }
            const totalStock = Object.values(currentSizes).reduce(
              (a, b) => a + b,
              0,
            );
            return { ...p, sizes: currentSizes, stock: totalStock };
          }
          return p;
        }),
      );
    } catch (e) {
      console.error(
        "Stock adjustment endpoint failed, editing details in payload...",
        e,
      );
      // Fallback: Edit the full product sizing
      const product = products.find((p) => (p._id || p.id) === productId);
      if (product) {
        const nextSizes = { ...product.sizes };
        if (direction === "increase") {
          nextSizes[size] = (nextSizes[size] || 0) + 1;
        } else {
          nextSizes[size] = Math.max(0, (nextSizes[size] || 0) - 1);
        }
        const nextTotal = Object.values(nextSizes).reduce((a, b) => a + b, 0);
        try {
          await apiClient.patch(`/products/${productId}`, {
            sizes: nextSizes,
            stock: nextTotal,
          });
          toast.success("Stock updated.");
          fetchProducts();
        } catch (err) {
          toast.error("Unable to adjust stock.");
        }
      }
    }
  };

  // Filter products list
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.productType?.toLowerCase().includes(searchQuery.toLowerCase());

    const hasSizes = p.sizes && Object.keys(p.sizes).length > 0;
    const isLowStock = hasSizes
      ? Object.values(p.sizes).some((qty) => qty <= 5)
      : p.stock <= 5;

    if (filterMode === "active") return matchesSearch && p.isActive !== false;
    if (filterMode === "archived") return matchesSearch && p.isActive === false;
    if (filterMode === "low-stock") return matchesSearch && isLowStock;
    return matchesSearch;
  });

  const getAvailableSizes = () => {
    if (formProductType === "Shoes") {
      return SIZE_OPTIONS.Shoes || [];
    }
    if (formProductType === "Bags") {
      return SIZE_OPTIONS.Bags || [];
    }
    if (formProductType === "Clothes") {
      if (formGroup === "Girls" || formGroup === "Boys") {
        return SIZE_OPTIONS.Clothes?.Children || [];
      }
      return SIZE_OPTIONS.Clothes?.Adult || [];
    }
    return [];
  };

  const availableSizes = getAvailableSizes();

  const filteredCategoriesForProduct = categories.filter((cat) => {
    if (!formProductType) return false;
    if (cat.productType?.toLowerCase() !== formProductType.toLowerCase())
      return false;
    if (formProductType === "Bags") return true;
    const catGroup =
      cat.group === null || cat.group === "None" ? "" : cat.group.toLowerCase();
    const fGroup =
      formGroup === "None" || !formGroup ? "" : formGroup.toLowerCase();
    return catGroup === fGroup;
  });

  return (
    <div className="space-y-6 animate-fade-in text-warm-ivory">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl text-white font-light tracking-wide">
            Products Management
          </h1>
          <p className="text-xs text-warm-ivory/50 mt-1 uppercase tracking-widest">
            Inventory controls, sizing quantities, image assets, and catalog
            display settings.
          </p>
        </div>
        <button
          onClick={handleAddClick}
          className="bg-gold text-dark-base font-semibold px-4 py-2.5 rounded-lg text-xs uppercase tracking-widest hover:bg-gold-light transition duration-300 flex items-center gap-1.5 gold-glow"
        >
          <Plus size={16} />
          Add New Product
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-dark-charcoal border border-gold/10 p-4 rounded-xl">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gold/50"
            size={16}
          />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-dark-base border border-gold/10 rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-gold"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {["all", "active", "archived", "low-stock"].map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider transition duration-300 border border-gold/5 ${
                filterMode === mode
                  ? "bg-gold text-dark-base font-semibold"
                  : "bg-dark-base text-warm-ivory/60 hover:text-gold"
              }`}
            >
              {mode.replace("-", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Grid or Table */}
      {loading ? (
        <div className="text-center py-16 text-gold">
          <RefreshCw size={24} className="animate-spin mx-auto mb-3" />
          <span className="text-xs uppercase tracking-widest">
            Loading Catalog...
          </span>
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="bg-dark-charcoal border border-gold/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-205 text-left border-collapse">
              <thead>
                <tr className="bg-dark-base/50 text-[10px] uppercase tracking-widest border-b border-gold/10 text-warm-ivory/50">
                  <th className="px-6 py-4 font-semibold">Product</th>
                  <th className="px-6 py-4 font-semibold">Category / Type</th>
                  <th className="px-6 py-4 font-semibold">Price</th>
                  <th className="px-6 py-4 font-semibold">
                    Sizing Stock Levels
                  </th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/5 text-xs font-light text-warm-ivory/80">
                {filteredProducts.map((p) => {
                  const hasSizes = p.sizes && Object.keys(p.sizes).length > 0;
                  const isLow = hasSizes
                    ? Object.values(p.sizes).some((qty) => qty <= 5)
                    : p.stock <= 5;

                  const mainImage = p.image || (p.images && p.images[0]) || "";
                  const catName =
                    typeof p.category === "object"
                      ? p.category.name
                      : categories.find((c) => (c._id || c.id) === p.category)
                          ?.name || p.category;

                  return (
                    <tr
                      key={p._id || p.id}
                      className="hover:bg-gold/5 transition duration-300"
                    >
                      {/* Product identity */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded border border-gold/15 bg-dark-base overflow-hidden shrink-0 flex items-center justify-center">
                            {mainImage ? (
                              <img
                                src={mainImage}
                                alt={p.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ImageIcon size={14} className="text-gold/30" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-white truncate max-w-[200px]">
                              {p.name}
                            </p>
                            <p className="text-[9px] text-warm-ivory/40 uppercase mt-0.5 tracking-wider">
                              {p.group || "General"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category & type */}
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-white/95">
                            {catName || "None"}
                          </p>
                          <p className="text-[10px] text-warm-ivory/40 uppercase mt-0.5">
                            {p.productType || "Curated Item"}
                          </p>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4 font-serif text-gold font-medium">
                        KES {p.price ? p.price.toLocaleString() : "—"}
                      </td>

                      {/* Sizing & Stock levels */}
                      <td className="px-6 py-4">
                        {hasSizes ? (
                          <div className="flex flex-wrap gap-2 items-center">
                            {Object.entries(p.sizes).map(([size, quantity]) => (
                              <div
                                key={`${p._id || p.id}-${size}`}
                                className="rounded border border-gold/10 bg-dark-base/50 px-2 py-1 text-[10px]"
                              >
                                <span className="text-warm-ivory/50 uppercase">
                                  {size}:
                                </span>
                                <span className="text-white font-medium">
                                  {quantity}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <Package size={12} className="text-gold" />
                            <span>{p.stock} units</span>
                          </div>
                        )}
                        {isLow && (
                          <span className="inline-flex items-center gap-1 text-[8px] uppercase tracking-wider text-amber-400 bg-amber-400/5 px-2 py-0.5 rounded border border-amber-400/10 mt-1.5">
                            <AlertTriangle size={8} />
                            Low Stock Alert
                          </span>
                        )}
                      </td>

                      {/* Active Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            p.isActive !== false
                              ? "bg-green-500/10 text-green-500 border border-green-500/20"
                              : "bg-zinc-500/10 text-zinc-500 border border-zinc-500/20"
                          }`}
                        >
                          {p.isActive !== false ? "Active" : "Archived"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => handleEditClick(p)}
                            className="p-1.5 hover:bg-gold/10 text-warm-ivory/60 hover:text-gold rounded transition"
                            title="Edit Product Details"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleToggleActive(p)}
                            className={`p-1.5 rounded transition ${
                              p.isActive !== false
                                ? "hover:bg-rose-500/10 text-warm-ivory/60 hover:text-rose-400"
                                : "hover:bg-green-500/10 text-warm-ivory/60 hover:text-green-400"
                            }`}
                            title={
                              p.isActive !== false
                                ? "Archive Item"
                                : "Restore Item"
                            }
                          >
                            <Archive size={14} />
                          </button>
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
          <Package size={36} className="mx-auto text-gold/30 mb-3" />
          <p className="font-serif italic text-warm-ivory/60">
            No products found
          </p>
          <p className="text-xs text-warm-ivory/40">
            Try creating a product or adjusting the query filters.
          </p>
        </div>
      )}

      {/* Add / Edit Form Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-dark-charcoal border border-gold/25 rounded-xl overflow-hidden shadow-2xl animate-fade-in text-warm-ivory my-8">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gold/15 bg-dark-base">
              <h3 className="font-serif text-base text-gold font-medium tracking-wide">
                {editingProduct
                  ? "Modify Boutique Product"
                  : "Add New Boutique Product"}
              </h3>
              <button
                onClick={() => setShowFormModal(false)}
                className="text-warm-ivory/50 hover:text-gold"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-5 max-h-[80vh] overflow-y-auto"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Name */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-warm-ivory/60 mb-1.5 font-semibold">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g., Silk Maxi Gown"
                    className="w-full bg-dark-base border border-gold/15 focus:border-gold rounded px-3 py-2 text-xs text-white"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-warm-ivory/60 mb-1.5 font-semibold">
                    Category *
                  </label>
                  <select
                    required
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    disabled={!formProductType}
                    className="w-full bg-dark-base border border-gold/15 focus:border-gold rounded px-3 py-2.5 text-xs text-white disabled:opacity-50"
                  >
                    <option value="" disabled>
                      {!formProductType
                        ? "Select Product Type First"
                        : "Select Category"}
                    </option>
                    {filteredCategoriesForProduct.map((cat) => (
                      <option key={cat._id || cat.id} value={cat._id || cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {/* Price */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-warm-ivory/60 mb-1.5 font-semibold">
                    Price (KES) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="e.g., 5500"
                    className="w-full bg-dark-base border border-gold/15 focus:border-gold rounded px-3 py-2 text-xs text-white"
                  />
                </div>

                {/* Product Type */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-warm-ivory/60 mb-1.5 font-semibold">
                    Product Type *
                  </label>
                  <select
                    required
                    value={formProductType}
                    onChange={(e) => {
                      setFormProductType(e.target.value);
                      setFormGroup("");
                      setFormCategory("");
                      setFormSizes({});
                      setFormStock(0);
                    }}
                    className="w-full bg-dark-base border border-gold/15 focus:border-gold rounded px-3 py-2.5 text-xs text-white"
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
                    Catalog Group
                  </label>
                  <select
                    value={formGroup || ""}
                    onChange={(e) => {
                      setFormGroup(e.target.value);
                      setFormCategory("");
                    }}
                    disabled={!formProductType || formProductType === "Bags"}
                    className="w-full bg-dark-base border border-gold/15 focus:border-gold rounded px-3 py-2.5 text-xs text-white disabled:opacity-50"
                  >
                    <option value="">None</option>
                    {formProductType === "Shoes" && (
                      <>
                        <option value="Men">Men</option>
                        <option value="Ladies">Ladies</option>
                        <option value="Kids">Kids</option>
                      </>
                    )}
                    {formProductType === "Clothes" && (
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

              {/* Description */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-warm-ivory/60 mb-1.5 font-semibold">
                  Product Description
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Detail fabric material, fit styles..."
                  className="w-full bg-dark-base border border-gold/15 focus:border-gold rounded px-3 py-2 text-xs text-white resize-none"
                />
              </div>

              {/* Images Manager */}
              <div className="pt-4 border-t border-gold/10 space-y-4">
                <label className="block text-[10px] uppercase tracking-widest text-warm-ivory/60 font-semibold">
                  Product Images (Max 5, Min 1)
                </label>

                {/* Existing Images Grid */}
                {formImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    {formImages.map((imgUrl, index) => (
                      <div
                        key={index}
                        className="relative w-full h-24 rounded border border-gold/15 bg-dark-base overflow-hidden group"
                      >
                        <img
                          src={imgUrl}
                          alt={`product-${index}`}
                          className="w-full h-full object-cover"
                        />
                        {formImages.length > 1 && (
                          <button
                            type="button"
                            onClick={async () => {
                              const confirmDel = window.confirm(
                                `WARNING: Are you sure you want to remove this product image?\n\nThis will permanently delete it from Cloudinary.\n\nDo you want to proceed?`,
                              );
                              if (!confirmDel) return;

                              const imgObj = rawImages[index];
                              if (!editingProduct || !imgObj?._id) {
                                // Fallback for a product not yet saved — just remove locally
                                setFormImages((prev) =>
                                  prev.filter((_, i) => i !== index),
                                );
                                return;
                              }

                              try {
                                const pId =
                                  editingProduct._id || editingProduct.id;
                                const res = await apiClient.delete(
                                  `/products/${pId}/images/${imgObj._id}`,
                                );
                                const updated = normalizeProduct(
                                  res.data.product,
                                );
                                setFormImages(updated.images);
                                setRawImages(updated.rawImages);
                                toast.success("Image deleted successfully.");
                              } catch (err) {
                                console.error("Image delete failed:", err);
                                toast.error(
                                  err.response?.data?.message ||
                                    "Could not delete image.",
                                );
                              }
                            }}
                            className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 text-xs font-semibold"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Add new image controls */}
                {formImages.length < 5 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Add URL */}
                    <div className="space-y-1.5">
                      <label className="block text-[9px] uppercase tracking-widest text-warm-ivory/40">
                        Add Image URL
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          id="new-image-url"
                          placeholder="https://example.com/image.jpg"
                          className="flex-1 bg-dark-base border border-gold/15 focus:border-gold rounded px-3 py-1.5 text-xs text-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const inputEl =
                              document.getElementById("new-image-url");
                            const url = inputEl ? inputEl.value.trim() : "";
                            if (!url) return;
                            if (formImages.length >= 5) {
                              toast.warning("Maximum of 5 images allowed.");
                              return;
                            }
                            setFormImages((prev) => [...prev, url]);
                            if (inputEl) inputEl.value = "";
                          }}
                          className="bg-gold text-dark-base px-3 py-1.5 rounded text-[10px] font-semibold uppercase tracking-wider hover:bg-gold-light"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    {/* Upload Local File */}
                    <div className="space-y-1.5">
                      <label className="block text-[9px] uppercase tracking-widest text-warm-ivory/40">
                        Upload Local File
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        disabled={uploadingImage}
                        className="w-full bg-dark-base border border-gold/15 rounded text-xs text-white file:bg-gold/15 file:text-gold file:border-none file:px-3 file:py-1.5 file:rounded file:mr-3 file:cursor-pointer disabled:opacity-50"
                      />

                      {stagedFiles.length > 0 && (
                        <div className="space-y-2 mt-2">
                          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                            {stagedFiles.map((file, index) => (
                              <div
                                key={index}
                                className="relative w-full h-16 rounded border border-gold/30 bg-dark-base overflow-hidden group"
                              >
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={`staged-${index}`}
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveStagedFile(index)}
                                  className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-[10px] font-semibold"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                          {editingProduct && (
                            <button
                              type="button"
                              onClick={handleUploadStagedImages}
                              disabled={uploadingImage}
                              className="w-full bg-gold/15 border border-gold/30 text-gold text-[10px] uppercase tracking-widest font-semibold py-2 rounded hover:bg-gold/25 transition disabled:opacity-50"
                            >
                              {uploadingImage
                                ? "Uploading..."
                                : `Upload ${stagedFiles.length} Image(s) to Cloudinary`}
                            </button>
                          )}
                          {!editingProduct && (
                            <p className="text-[9px] text-warm-ivory/40 italic">
                              These images will upload automatically once you
                              save the new product.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] text-amber-500 italic bg-amber-500/5 p-2 rounded border border-amber-500/10">
                    Maximum limit of 5 product images reached. Remove an image
                    to add or upload another.
                  </p>
                )}
              </div>

              {/* Sizing & Stock levels */}
              <div className="pt-4 border-t border-gold/10 space-y-3">
                <label className="block text-[10px] uppercase tracking-widest text-warm-ivory/60 font-semibold">
                  Sizing stock inventory levels
                </label>

                {availableSizes.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {availableSizes.map((size) => {
                      const isChecked = formSizes[size] !== undefined;
                      return (
                        <div
                          key={size}
                          className={`p-3 border rounded-lg text-center transition ${
                            isChecked
                              ? "bg-gold/10 border-gold"
                              : "bg-dark-base/50 border-gold/10 opacity-60"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormSizes((prev) => ({
                                    ...prev,
                                    [size]: 0,
                                  }));
                                } else {
                                  setFormSizes((prev) => {
                                    const next = { ...prev };
                                    delete next[size];
                                    const nextStock = Object.values(
                                      next,
                                    ).reduce((a, b) => a + b, 0);
                                    setFormStock(nextStock);
                                    return next;
                                  });
                                }
                              }}
                              className="w-3.5 h-3.5 accent-gold cursor-pointer"
                            />
                            <span className="text-xs font-semibold text-gold uppercase">
                              {size}
                            </span>
                          </div>
                          {isChecked && (
                            <input
                              type="number"
                              min={0}
                              required
                              value={formSizes[size] ?? 0}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                setFormSizes((prev) => {
                                  const next = { ...prev, [size]: val };
                                  const nextStock = Object.values(next).reduce(
                                    (a, b) => a + b,
                                    0,
                                  );
                                  setFormStock(nextStock);
                                  return next;
                                });
                              }}
                              className="w-full bg-dark-base border border-gold/10 text-center rounded py-1 text-xs text-white"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[10px] text-warm-ivory/40 italic">
                    Select a Product Type to configure sizing options.
                  </p>
                )}
              </div>

              {/* Status checkboxes */}
              <div className="pt-4 border-t border-gold/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    id="form-is-active"
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="w-4 h-4 accent-gold"
                  />
                  <label
                    htmlFor="form-is-active"
                    className="text-xs text-warm-ivory/80"
                  >
                    Product is Active and Visible in Catalogue
                  </label>
                </div>
                <div className="text-xs text-warm-ivory/50">
                  Total computed stock:{" "}
                  <strong className="text-gold">{formStock}</strong>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4 border-t border-gold/15">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  disabled={uploadingImage}
                  className="flex-1 bg-dark-base border border-gold/25 text-warm-ivory/70 py-2.5 rounded text-xs uppercase tracking-widest hover:bg-gold/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingImage}
                  className="flex-1 bg-gold text-dark-base font-semibold py-2.5 rounded text-xs uppercase tracking-widest hover:bg-gold-light flex items-center justify-center gap-2 gold-glow"
                >
                  {uploadingImage ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-dark-base border-t-transparent rounded-full animate-spin"></span>
                      Uploading Image...
                    </>
                  ) : (
                    "Save Details"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
