import React, { useState, useEffect } from 'react';
import { Search, Filter, ArrowUpDown, RefreshCw, SlidersHorizontal, EyeOff } from 'lucide-react';
import apiClient from '../../api/apiClient';
import ProductCard from '../../components/store/ProductCard';

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProductType, setSelectedProductType] = useState('All');
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [sortOption, setSortOption] = useState('newest');

  // UI state
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          apiClient.get('/products'),
          apiClient.get('/categories')
        ]);
        
        // Filter out inactive products in storefront
        const activeProducts = (productsRes.data || []).filter(p => p.isActive !== false);
        setProducts(activeProducts);
        
        // Filter out inactive categories
        const activeCategories = (categoriesRes.data || []).filter(c => c.isActive !== false);
        setCategories(activeCategories);
      } catch (error) {
        console.error('Error fetching catalogue data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Extract unique product types and groups from active products for filter dropdowns
  const productTypes = ['All', ...new Set(products.map(p => p.productType).filter(Boolean))];
  const groups = ['All', ...new Set(products.map(p => p.group || p.productGroup).filter(Boolean))];

  // Filtering & Sorting Logic
  const filteredProducts = products.filter((product) => {
    const matchesSearch = 
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.productType?.toLowerCase().includes(searchQuery.toLowerCase());

    const productCatId = typeof product.category === 'object' ? product.category._id || product.category.id : product.category;
    const matchesCategory = 
      selectedCategory === 'All' || 
      productCatId === selectedCategory ||
      (typeof product.category === 'object' && product.category.name === selectedCategory);

    const matchesType = 
      selectedProductType === 'All' || 
      product.productType === selectedProductType;

    const productGroup = product.group || product.productGroup;
    const matchesGroup = 
      selectedGroup === 'All' || 
      productGroup === selectedGroup;

    return matchesSearch && matchesCategory && matchesType && matchesGroup;
  });

  // Sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOption === 'price-asc') {
      return (a.price || 0) - (b.price || 0);
    }
    if (sortOption === 'price-desc') {
      return (b.price || 0) - (a.price || 0);
    }
    if (sortOption === 'name-asc') {
      return a.name.localeCompare(b.name);
    }
    // Newest / default
    return new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0);
  });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedProductType('All');
    setSelectedGroup('All');
    setSortOption('newest');
  };

  return (
    <div className="bg-dark-base min-h-screen text-warm-ivory py-12 font-sans">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="text-gold uppercase tracking-[0.25em] text-xs font-semibold">
            Salmax Catalogue
          </span>
          <h1 className="font-serif text-3xl md:text-5xl font-light text-white tracking-wide">
            Explore Curated Supplies
          </h1>
          <p className="text-warm-ivory/60 text-sm font-light leading-relaxed">
            Browse through our portfolio of clothing, premium accessories, and boutique materials. Inquire directly on WhatsApp to order.
          </p>
        </div>

        {/* Toolbar: Search and Filter Toggles */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8 bg-dark-charcoal/40 p-4 border border-gold/10 rounded-xl">
          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold/45" size={16} />
            <input
              type="text"
              placeholder="Search catalogue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dark-base border border-gold/10 focus:border-gold rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none text-white premium-transition"
            />
          </div>

          {/* Desktop Filter Selectors */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Category Select */}
            <div className="flex items-center gap-1.5 text-xs text-warm-ivory/60 uppercase tracking-widest">
              <span>Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-dark-base border border-gold/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-gold cursor-pointer"
              >
                <option value="All">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat._id || cat.id} value={cat._id || cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Product Type Select */}
            {productTypes.length > 2 && (
              <div className="flex items-center gap-1.5 text-xs text-warm-ivory/60 uppercase tracking-widest">
                <span>Type:</span>
                <select
                  value={selectedProductType}
                  onChange={(e) => setSelectedProductType(e.target.value)}
                  className="bg-dark-base border border-gold/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-gold cursor-pointer"
                >
                  {productTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Group Select */}
            {groups.length > 2 && (
              <div className="flex items-center gap-1.5 text-xs text-warm-ivory/60 uppercase tracking-widest">
                <span>Group:</span>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="bg-dark-base border border-gold/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-gold cursor-pointer"
                >
                  {groups.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Mobile Filter Toggle & Sort Select */}
          <div className="flex items-center justify-between w-full md:w-auto gap-4">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden flex items-center gap-2 bg-dark-base border border-gold/10 px-4 py-2.5 rounded-lg text-sm hover:border-gold text-gold/80"
            >
              <SlidersHorizontal size={16} />
              Filters
            </button>

            {/* Sorting */}
            <div className="flex items-center gap-2">
              <ArrowUpDown size={14} className="text-gold/60" />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="bg-dark-base border border-gold/10 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-gold cursor-pointer"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Alphabetical (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mobile Filters Panel */}
        {showMobileFilters && (
          <div className="lg:hidden bg-dark-charcoal/60 border border-gold/10 rounded-xl p-5 mb-6 space-y-4 animate-fade-in">
            <div className="flex justify-between items-center border-b border-gold/10 pb-3">
              <h3 className="font-serif text-sm text-gold tracking-wide">Filter Catalogue</h3>
              <button 
                onClick={clearFilters}
                className="text-[10px] uppercase tracking-widest text-warm-ivory/50 hover:text-gold"
              >
                Reset All
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-warm-ivory/40 mb-1">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-dark-base border border-gold/10 rounded p-2 text-xs text-white"
                >
                  <option value="All">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat._id || cat.id} value={cat._id || cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-warm-ivory/40 mb-1">Product Type</label>
                <select
                  value={selectedProductType}
                  onChange={(e) => setSelectedProductType(e.target.value)}
                  className="w-full bg-dark-base border border-gold/10 rounded p-2 text-xs text-white"
                >
                  {productTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-warm-ivory/40 mb-1">Group</label>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="w-full bg-dark-base border border-gold/10 rounded p-2 text-xs text-white"
                >
                  {groups.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Filter Badges Display */}
        {(selectedCategory !== 'All' || selectedProductType !== 'All' || selectedGroup !== 'All' || searchQuery) && (
          <div className="flex flex-wrap items-center gap-2 mb-6 text-xs text-warm-ivory/60">
            <span>Active filters:</span>
            {searchQuery && (
              <span className="bg-gold/10 border border-gold/20 text-gold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                Query: "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="text-white hover:text-gold">&times;</button>
              </span>
            )}
            {selectedCategory !== 'All' && (
              <span className="bg-gold/10 border border-gold/20 text-gold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                Category
                <button onClick={() => setSelectedCategory('All')} className="text-white hover:text-gold">&times;</button>
              </span>
            )}
            {selectedProductType !== 'All' && (
              <span className="bg-gold/10 border border-gold/20 text-gold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                Type: {selectedProductType}
                <button onClick={() => setSelectedProductType('All')} className="text-white hover:text-gold">&times;</button>
              </span>
            )}
            {selectedGroup !== 'All' && (
              <span className="bg-gold/10 border border-gold/20 text-gold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                Group: {selectedGroup}
                <button onClick={() => setSelectedGroup('All')} className="text-white hover:text-gold">&times;</button>
              </span>
            )}
            <button 
              onClick={clearFilters}
              className="text-[10px] uppercase text-gold/80 hover:text-gold tracking-widest ml-2"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse bg-dark-charcoal border border-gold/5 rounded-xl aspect-[3/4]" />
            ))}
          </div>
        ) : sortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sortedProducts.map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 border border-dashed border-gold/10 rounded-xl bg-dark-charcoal/20">
            <EyeOff size={40} className="mx-auto text-gold/30 mb-4" />
            <h3 className="font-serif italic text-lg text-warm-ivory/80 mb-2">No Matching Products Found</h3>
            <p className="text-xs text-warm-ivory/40 max-w-sm mx-auto leading-relaxed">
              We couldn't find any products in our current boutique inventory matching your search query or filter criteria.
            </p>
            <button
              onClick={clearFilters}
              className="mt-6 border border-gold/30 text-gold hover:border-gold hover:bg-gold/5 text-xs uppercase tracking-widest px-6 py-2.5 rounded font-medium transition duration-300"
            >
              Clear Filters
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
