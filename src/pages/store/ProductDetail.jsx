import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Truck,
  BadgeCheck,
  Layers,
} from "lucide-react";
import apiClient from "../../api/apiClient";
import ProductCard from "../../components/store/ProductCard";
import InquiryModal from "../../components/store/InquiryModal";
import { toast } from "react-toastify";
import { normalizeProduct } from "../../utils/apiData";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showInquiry, setShowInquiry] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get(`/products/${id}`);
        const normalizedProduct = normalizeProduct(response.data);
        setProduct(normalizedProduct);
        setActiveIndex(0);

        try {
          const allProductsRes = await apiClient.get("/products");
          const catId =
            typeof response.data.category === "object"
              ? response.data.category._id || response.data.category.id
              : response.data.category;

          const filtered = (allProductsRes.data || [])
            .filter(
              (p) =>
                p.isActive !== false &&
                (p._id || p.id) !== id &&
                (typeof p.category === "object"
                  ? p.category._id || p.category.id
                  : p.category) === catId,
            )
            .map((product) => normalizeProduct(product))
            .slice(0, 4);
          setRelatedProducts(filtered);
        } catch (err) {
          console.error("Failed to load related products", err);
        }
      } catch (error) {
        console.error("Error fetching product detail:", error);
        toast.error("Failed to load product details.");
        navigate("/shop");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductDetails();
    }
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-dark-base flex flex-col items-center justify-center text-warm-ivory">
        <div className="w-12 h-12 border-2 border-gold/10 border-t-2 border-gold rounded-full animate-spin mb-4"></div>
        <p className="text-xs uppercase tracking-widest text-gold/80 animate-pulse">
          Loading Collection Item...
        </p>
      </div>
    );
  }

  if (!product) return null;

  const images =
    product.images && product.images.length > 0
      ? product.images
      : [product.image].filter(Boolean);
  const hasSizes = product.sizes && Object.keys(product.sizes).length > 0;
  const isOutOfStock =
    product.stock === 0 ||
    (hasSizes && Object.values(product.sizes).every((qty) => qty === 0));

  const goToPrev = () =>
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  const goToNext = () => setActiveIndex((prev) => (prev + 1) % images.length);

  const pageTitle = `${product.name} | Salmax Suppliers`;
  const pageDescription =
    product.description ||
    `Shop ${product.name} at Salmax Suppliers — premium boutique quality, curated and ready to own.`;

  return (
    <div className="bg-dark-base min-h-screen text-warm-ivory py-12 font-sans">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription.slice(0, 160)} />
        {images[0] && <meta property="og:image" content={images[0]} />}
        <meta property="og:title" content={pageTitle} />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div className="max-w-7xl mx-auto px-6">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-gold hover:text-gold-light transition duration-300 mb-8"
        >
          <ChevronLeft size={16} />
          Back to Catalogue
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-20">
          {/* Product Gallery */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative bg-dark-charcoal/50 border border-gold/10 rounded-xl overflow-hidden flex items-center justify-center h-[380px] sm:h-[460px] md:h-[540px]">
              {images.length > 0 ? (
                <img
                  src={images[activeIndex]}
                  alt={`${product.name} — image ${activeIndex + 1}`}
                  className="w-full h-full object-contain p-4"
                />
              ) : (
                <span className="font-serif italic text-gold/30">
                  Collection Item
                </span>
              )}

              {isOutOfStock && (
                <div className="absolute top-4 left-4 bg-red-500 text-white text-xs uppercase font-bold tracking-widest px-3 py-1.5 rounded z-10">
                  Sold Out
                </div>
              )}

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={goToPrev}
                    aria-label="Previous image"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-dark-base/70 border border-gold/20 text-gold flex items-center justify-center hover:bg-gold hover:text-dark-base transition duration-300 backdrop-blur-sm"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={goToNext}
                    aria-label="Next image"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-dark-base/70 border border-gold/20 text-gold flex items-center justify-center hover:bg-gold hover:text-dark-base transition duration-300 backdrop-blur-sm"
                  >
                    <ChevronRight size={18} />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, idx) => (
                      <span
                        key={idx}
                        className={`w-1.5 h-1.5 rounded-full transition ${
                          idx === activeIndex ? "bg-gold w-4" : "bg-white/30"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((imgUrl, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border shrink-0 premium-transition bg-dark-charcoal/50 ${
                      activeIndex === index
                        ? "border-gold"
                        : "border-gold/10 hover:border-gold/40"
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2 items-center text-xs tracking-widest uppercase">
                {product.category && (
                  <span className="text-gold font-medium">
                    {typeof product.category === "object"
                      ? product.category.name
                      : product.category}
                  </span>
                )}
                <span className="text-white/20">&bull;</span>
                <span className="text-warm-ivory/50">
                  {product.productType || "Curated Supply"}
                </span>
                {product.group && (
                  <>
                    <span className="text-white/20">&bull;</span>
                    <span className="text-warm-ivory/50">{product.group}</span>
                  </>
                )}
              </div>

              <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-light text-white tracking-wide leading-tight">
                {product.name}
              </h1>

              <div className="font-serif text-2xl text-gold border-b border-gold/10 pb-5">
                {product.price
                  ? `KES ${product.price.toLocaleString()}`
                  : "Price on request"}
              </div>

              <div className="space-y-3 text-sm font-light text-warm-ivory/70 leading-relaxed">
                <h3 className="text-xs uppercase tracking-widest text-white/40 font-semibold font-sans">
                  Description
                </h3>
                <p>
                  {product.description ||
                    "No description provided for this boutique collection item."}
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t border-gold/5">
                <h3 className="text-xs uppercase tracking-widest text-white/40 font-semibold">
                  Available Sizes & Stock
                </h3>

                {hasSizes ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {Object.entries(product.sizes).map(([size, quantity]) => (
                      <div
                        key={size}
                        className={`border rounded-lg p-2.5 text-center flex flex-col items-center justify-center premium-transition ${
                          quantity > 0
                            ? "border-gold/20 bg-gold/5 text-warm-ivory"
                            : "border-white/5 bg-white/0 text-white/20 cursor-not-allowed"
                        }`}
                      >
                        <span className="text-xs font-semibold uppercase">
                          {size}
                        </span>
                        <span className="text-[10px] mt-0.5 text-warm-ivory/50">
                          {quantity > 0 ? `${quantity} left` : "Out"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-warm-ivory/60 font-light">
                    <Layers size={16} className="text-gold" />
                    <span>
                      {product.stock > 0
                        ? `${product.stock} items remaining in boutique stock`
                        : "Currently out of stock — inquire for restock updates"}
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gold/5 text-xs font-light text-warm-ivory/50">
                <div className="flex items-start gap-2.5">
                  <Truck size={16} className="text-gold shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-white/80">
                      Secured Dispatch
                    </h4>
                    <p className="mt-0.5">Reliable local courier delivery.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <BadgeCheck size={16} className="text-gold shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-white/80">
                      Quality Checked
                    </h4>
                    <p className="mt-0.5">
                      Every piece inspected before dispatch.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 lg:mt-6">
              <button
                onClick={() => setShowInquiry(true)}
                className="w-full bg-gold text-dark-base font-semibold py-4 rounded-lg text-sm uppercase tracking-widest hover:bg-gold-light gold-glow transition duration-300 flex items-center justify-center gap-2"
              >
                <ShoppingBag size={18} />
                Inquire About This Product
              </button>
              <p className="text-center text-[10px] text-warm-ivory/40 uppercase tracking-wider mt-3 font-light">
                Secure inquiry records. Automated WhatsApp connection.
              </p>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="border-t border-gold/10 pt-16">
            <h2 className="font-serif text-2xl md:text-3xl font-light text-white tracking-wide mb-8">
              You May Also Appreciate
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p._id || p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {showInquiry && (
        <InquiryModal product={product} onClose={() => setShowInquiry(false)} />
      )}
    </div>
  );
}
