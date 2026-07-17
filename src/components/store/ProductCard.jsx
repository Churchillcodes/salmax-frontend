import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Eye, PhoneCall } from "lucide-react";
import InquiryModal from "./InquiryModal";

export default function ProductCard({ product }) {
  const [showInquiry, setShowInquiry] = useState(false);

  const mainImage =
    product.image || (product.images && product.images[0]) || "";
  const categoryName =
    typeof product.category === "object"
      ? product.category?.name
      : product.category || "Salmax Collection";

  return (
    <>
      <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gold/15 bg-dark-charcoal shadow-[0_20px_45px_rgba(0,0,0,0.25)] transition duration-300 hover:-translate-y-1 hover:border-gold/30">
        <div className="relative aspect-4/5 overflow-hidden bg-dark-base/70">
          <div className="absolute left-3 top-3 z-10 rounded-full border border-gold/20 bg-dark-base/80 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-gold">
            Negotiable
          </div>

          {mainImage ? (
            <img
              src={mainImage}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center text-gold/30">
              <span className="font-serif text-sm italic">
                Collection Salmax
              </span>
            </div>
          )}

          <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/10 to-transparent" />

          <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-gold/90">
                {categoryName}
              </p>
              <h3 className="mt-1 font-serif text-lg font-medium text-white">
                {product.name}
              </h3>
            </div>
            <div className="self-start rounded-full border border-gold/20 bg-dark-base/80 px-3 py-1 text-sm font-semibold text-gold">
              {product.price
                ? `KES ${product.price.toLocaleString()}`
                : "Price on request"}
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <p className="text-sm leading-6 text-warm-ivory/70">
            {product.description ||
              "Tailored for the modern lifestyle with refined texture and craftsmanship."}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-gold/15 bg-gold/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-gold">
              {product.productType || "Boutique Collection"}
            </span>
            {product.group ? (
              <span className="rounded-full border border-gold/10 bg-dark-base/70 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-warm-ivory/50">
                {product.group}
              </span>
            ) : null}
          </div>

          <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Link
              to={`/product/${product._id || product.id}`}
              className="flex items-center justify-center gap-2 rounded-lg border border-gold/20 bg-dark-base/80 px-2.5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-warm-ivory transition hover:border-gold hover:text-gold sm:px-3 sm:text-[11px]"
            >
              <Eye size={14} />
              Details
            </Link>
            <button
              onClick={() => setShowInquiry(true)}
              className="flex items-center justify-center gap-2 rounded-lg bg-gold px-2.5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-dark-base transition hover:bg-gold-light sm:px-3 sm:text-[11px]"
            >
              <PhoneCall size={14} />
              Inquire
            </button>
          </div>
        </div>
      </div>

      {showInquiry && (
        <InquiryModal product={product} onClose={() => setShowInquiry(false)} />
      )}
    </>
  );
}
