import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PhoneCall, Eye, Info } from 'lucide-react';
import InquiryModal from './InquiryModal';

export default function ProductCard({ product }) {
  const [showInquiry, setShowInquiry] = useState(false);

  // Check if stock is available
  const isOutOfStock = product.stock === 0 || (product.sizes && Object.values(product.sizes).every(qty => qty === 0));

  // Determine main image
  const mainImage = product.image || (product.images && product.images[0]) || '';

  return (
    <>
      <div className="group bg-dark-charcoal border border-gold/10 hover:border-gold/30 rounded-xl overflow-hidden premium-transition flex flex-col h-full relative">
        
        {/* Out of Stock Label */}
        {isOutOfStock && (
          <div className="absolute top-3 left-3 z-10 bg-red-500/90 text-white text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded">
            Sold Out
          </div>
        )}

        {/* Product Image Area */}
        <div className="relative aspect-[4/5] bg-dark-base/40 overflow-hidden shrink-0">
          {mainImage ? (
            <img
              src={mainImage}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gold/30 p-4">
              <span className="font-serif text-sm italic">Collection Salmax</span>
            </div>
          )}

          {/* Hover Overlay Actions */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
            <Link
              to={`/product/${product._id || product.id}`}
              className="w-10 h-10 rounded-full bg-white text-dark-base flex items-center justify-center hover:bg-gold hover:text-white transition duration-300 shadow"
              title="View Details"
            >
              <Eye size={18} />
            </Link>
            <button
              onClick={() => setShowInquiry(true)}
              className="w-10 h-10 rounded-full bg-white text-dark-base flex items-center justify-center hover:bg-gold hover:text-white transition duration-300 shadow"
              title="Inquire on WhatsApp"
            >
              <PhoneCall size={16} />
            </button>
          </div>
        </div>

        {/* Product Details */}
        <div className="p-5 flex flex-col justify-between flex-1">
          <div className="space-y-1.5">
            {/* Category */}
            {product.category && (
              <span className="text-[10px] uppercase tracking-widest text-gold font-medium">
                {typeof product.category === 'object' ? product.category.name : product.category}
              </span>
            )}

            {/* Title */}
            <h3 className="font-serif text-base font-medium text-white tracking-wide truncate">
              <Link to={`/product/${product._id || product.id}`} className="hover:text-gold transition duration-300">
                {product.name}
              </Link>
            </h3>

            {/* Price */}
            <p className="text-sm text-warm-ivory/80 font-light font-sans">
              {product.price ? `KES ${product.price.toLocaleString()}` : 'Price upon Inquiry'}
            </p>
          </div>

          {/* Product Type or availability info */}
          <div className="mt-4 pt-4 border-t border-gold/5 flex items-center justify-between">
            <span className="text-[10px] text-warm-ivory/40 uppercase tracking-widest">
              {product.productType || 'Boutique Collection'}
            </span>
            
            <button
              onClick={() => setShowInquiry(true)}
              className="text-xs uppercase tracking-widest text-gold hover:text-gold-light transition duration-300 flex items-center gap-1 font-medium"
            >
              Inquire
            </button>
          </div>
        </div>
      </div>

      {/* Inquiry Modal */}
      {showInquiry && (
        <InquiryModal
          product={product}
          onClose={() => setShowInquiry(false)}
        />
      )}
    </>
  );
}
