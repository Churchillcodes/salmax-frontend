import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Archive,
  FolderHeart,
  Trash2,
  X,
  RefreshCw,
} from "lucide-react";
import apiClient from "../../api/apiClient";
import { toast } from "react-toastify";

export default function CategoriesManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [filterMode, setFilterMode] = useState("all");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [productType, setProductType] = useState("");
  const [group, setGroup] = useState("");
  const [isActive, setIsActive] = useState(true);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const [activeRes, archivedRes] = await Promise.all([
        apiClient.get("/categories"),
        apiClient.get("/categories/archived").catch(() => ({ data: [] })),
      ]);
      const activeList = activeRes.data || [];
      const archivedList = (archivedRes.data || []).map((c) => ({
        ...c,
        isActive: false,
      }));
      setCategories([...activeList, ...archivedList]);
    } catch (e) {
      console.error("Failed to load categories:", e);
      toast.error("Failed to retrieve categories catalogue.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddClick = () => {
    setEditingCategory(null);
    setName("");
    setDescription("");
    setProductType("");
    setGroup("");
    setIsActive(true);
    setShowModal(true);
  };

  const handleEditClick = (cat) => {
    setEditingCategory(cat);
    setName(cat.name || "");
    setDescription(cat.description || "");
    setProductType(cat.productType || "");
    setGroup(cat.group || "");
    setIsActive(cat.isActive !== false);
    setShowModal(true);
  };

  const filteredCategories = categories.filter((cat) => {
    if (filterMode === "active") return cat.isActive !== false;
    if (filterMode === "archived") return cat.isActive === false;
    return true;
  });

  const handleToggleActive = async (cat) => {
    const nextActive = cat.isActive === false;
    if (!nextActive) {
      const confirmArchive = window.confirm(
        `WARNING: You are about to archive the category "${cat.name}".\n\nThis will hide this category from storefront filters, and any active products linked to this category may display empty categories.\n\nDo you want to proceed?`,
      );
      if (!confirmArchive) return;
    }

    try {
      await apiClient.patch(`/categories/${cat._id || cat.id}`, {
        isActive: nextActive,
      });
      toast.success(
        `Category ${nextActive ? "activated" : "archived"} successfully.`,
      );
      fetchCategories();
    } catch (err) {
      console.error("Failed to toggle category active status:", err);
      toast.error("Could not modify category status.");
    }
  };

  const handleDeleteCategory = async (catId) => {
    if (
      !window.confirm(
        "WARNING: You are about to permanently DELETE this category.\n\nThis action cannot be undone. Products linked to this category will display empty categories.\n\nDo you want to proceed?",
      )
    ) {
      return;
    }

    try {
      await apiClient.delete(`/categories/${catId}`);
      toast.success("Category deleted successfully.");
      fetchCategories();
    } catch (err) {
      console.error("Delete category failed:", err);
      toast.error("Failed to delete category.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.warning("Category title is required.");
      return;
    }
    if (!productType) {
      toast.warning("Product Type is required.");
      return;
    }

    const payload = {
      name,
      description,
      productType,
      group: group === "None" || !group ? null : group,
      isActive,
    };

    try {
      if (editingCategory) {
        await apiClient.patch(
          `/categories/${editingCategory._id || editingCategory.id}`,
          payload,
        );
        toast.success("Category updated successfully.");
      } else {
        await apiClient.post("/categories", payload);
        toast.success("Category created successfully.");
      }
      setShowModal(false);
      fetchCategories();
    } catch (error) {
      console.error("Save category error:", error);
      toast.error(error.response?.data?.message || "Failed to save category.");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-warm-ivory">
      <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl text-white font-light tracking-wide">
            Categories Catalogue
          </h1>
          <p className="text-xs text-warm-ivory/50 mt-1 uppercase tracking-widest">
            Manage catalogue departments, menu classifications, and product
            collections.
          </p>
        </div>
        <button
          onClick={handleAddClick}
          className="bg-gold text-dark-base font-semibold px-4 py-2.5 rounded-lg text-xs uppercase tracking-widest hover:bg-gold-light transition duration-300 flex items-center gap-1.5 gold-glow"
        >
          <Plus size={16} />
          Create Category
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { value: "all", label: "All" },
          { value: "active", label: "Active" },
          { value: "archived", label: "Archived" },
        ].map((filter) => (
          <button
            key={filter.value}
            onClick={() => setFilterMode(filter.value)}
            className={`rounded-lg border px-3 py-1.5 text-[10px] uppercase tracking-wider transition ${
              filterMode === filter.value
                ? "border-gold bg-gold text-dark-base font-semibold"
                : "border-gold/10 bg-dark-base text-warm-ivory/60 hover:text-gold"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-gold">
          <RefreshCw size={24} className="animate-spin mx-auto mb-3" />
          <span className="text-xs uppercase tracking-widest">
            Loading Categories...
          </span>
        </div>
      ) : filteredCategories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCategories.map((cat) => (
            <div
              key={cat._id || cat.id}
              className={`bg-dark-charcoal border rounded-xl p-6 flex flex-col justify-between h-52 premium-transition ${
                cat.isActive !== false
                  ? "border-gold/15"
                  : "border-zinc-800 opacity-70"
              }`}
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded bg-gold/5 flex items-center justify-center text-gold border border-gold/10">
                    <FolderHeart size={18} />
                  </div>
                  <span
                    className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded ${
                      cat.isActive !== false
                        ? "bg-green-500/10 text-green-500"
                        : "bg-zinc-500/10 text-zinc-500"
                    }`}
                  >
                    {cat.isActive !== false ? "Active" : "Archived"}
                  </span>
                </div>

                <h3 className="font-serif text-lg font-medium text-white truncate">
                  {cat.name}
                </h3>
                <p className="text-xs text-warm-ivory/60 line-clamp-2 font-light leading-relaxed">
                  {cat.description || "No description provided."}
                </p>
                <div className="flex flex-wrap gap-2 pt-1 text-[10px] uppercase tracking-widest text-warm-ivory/40">
                  {cat.productType ? <span>{cat.productType}</span> : null}
                  {cat.group ? <span>• {cat.group}</span> : null}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gold/5">
                <button
                  onClick={() => handleToggleActive(cat)}
                  className="text-[10px] uppercase tracking-widest text-warm-ivory/40 hover:text-gold transition duration-300"
                >
                  {cat.isActive !== false ? "Archive" : "Restore"}
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleEditClick(cat)}
                    className="p-1 text-warm-ivory/60 hover:text-gold transition"
                    title="Edit Details"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat._id || cat.id)}
                    className="p-1 text-warm-ivory/60 hover:text-red-400 transition"
                    title="Delete Category"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-gold/10 rounded-xl bg-dark-charcoal/20">
          <FolderHeart size={36} className="mx-auto text-gold/30 mb-3" />
          <p className="font-serif italic text-warm-ivory/60">
            No categories recorded
          </p>
          <p className="text-xs text-warm-ivory/40">
            Build a category department to tag products.
          </p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-dark-charcoal border border-gold/25 rounded-xl overflow-hidden shadow-2xl animate-fade-in text-warm-ivory">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gold/15 bg-dark-base">
              <h3 className="font-serif text-base text-gold font-medium tracking-wide">
                {editingCategory ? "Modify Category" : "Create New Category"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-warm-ivory/50 hover:text-gold"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-warm-ivory/60 mb-1.5 font-semibold">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Apparel, Accessories"
                  className="w-full bg-dark-base border border-gold/15 focus:border-gold rounded px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-warm-ivory/60 mb-1.5 font-semibold">
                  Category Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summary of products under this category..."
                  className="w-full bg-dark-base border border-gold/15 focus:border-gold rounded px-3 py-2 text-xs text-white resize-none"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-warm-ivory/60 mb-1.5 font-semibold">
                    Product Type
                  </label>
                  <select
                    value={productType}
                    onChange={(e) => {
                      setProductType(e.target.value);
                      setGroup("");
                    }}
                    className="w-full bg-dark-base border border-gold/15 focus:border-gold rounded px-3 py-2.5 text-xs text-white"
                  >
                    <option value="">Select Type</option>
                    <option value="Shoes">Shoes</option>
                    <option value="Clothes">Clothes</option>
                    <option value="Bags">Bags</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-warm-ivory/60 mb-1.5 font-semibold">
                    Collection Group
                  </label>
                  <select
                    value={group || ""}
                    onChange={(e) => setGroup(e.target.value)}
                    disabled={!productType || productType === "Bags"}
                    className="w-full bg-dark-base border border-gold/15 focus:border-gold rounded px-3 py-2.5 text-xs text-white disabled:opacity-50"
                  >
                    <option value="">None</option>
                    {productType === "Shoes" && (
                      <>
                        <option value="Men">Men</option>
                        <option value="Ladies">Ladies</option>
                        <option value="Kids">Kids</option>
                      </>
                    )}
                    {productType === "Clothes" && (
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

              <div className="flex items-center gap-2">
                <input
                  id="cat-is-active"
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 accent-gold"
                />
                <label
                  htmlFor="cat-is-active"
                  className="text-xs text-warm-ivory/80"
                >
                  Category is Active & Visible in Catalogs
                </label>
              </div>

              <div className="flex gap-4 pt-4 border-t border-gold/15">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-dark-base border border-gold/25 text-warm-ivory/70 py-2.5 rounded text-xs uppercase tracking-widest hover:bg-gold/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gold text-dark-base font-semibold py-2.5 rounded text-xs uppercase tracking-widest hover:bg-gold-light gold-glow"
                >
                  {editingCategory ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
