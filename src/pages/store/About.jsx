import React from 'react';
import { Shield, Sparkles, Handshake, Gem } from 'lucide-react';

export default function About() {
  return (
    <div className="bg-dark-base min-h-screen text-warm-ivory py-16 font-sans">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-gold uppercase tracking-[0.25em] text-xs font-semibold">
            Our Story
          </span>
          <h1 className="font-serif text-3xl md:text-5xl font-light text-white tracking-wide">
            The Legacy of Salmax
          </h1>
          <p className="text-warm-ivory/60 text-sm font-light leading-relaxed">
            Curating rare craftsmanship, elegant textiles, and premium boutique supplies with absolute precision and devotion.
          </p>
        </div>

        {/* Narrative & Visual Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center mb-24">
          
          {/* Visual Showcase (Columns 1-6) */}
          <div className="lg:col-span-6 grid grid-cols-12 gap-4 relative">
            <div className="col-span-12 rounded-xl overflow-hidden border border-gold/15 aspect-[16/10] bg-dark-charcoal">
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200"
                alt="Salmax boutique shopfloor"
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Owner profile placeholder */}
            <div className="col-span-6 rounded-xl overflow-hidden border border-gold/15 aspect-square -mt-8 ml-8 bg-dark-charcoal z-10 hidden sm:block">
              <img
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=600"
                alt="Boutique curation detail"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="absolute -bottom-6 -left-6 w-20 h-20 border-b border-l border-gold/20 -z-10" />
          </div>

          {/* Narrative Content (Columns 7-12) */}
          <div className="lg:col-span-6 space-y-6">
            <h2 className="font-serif text-2xl md:text-3xl font-light text-white tracking-wide leading-tight">
              A Passion for Pure Craftsmanship and Unparalleled Retail Quality
            </h2>
            <p className="text-warm-ivory/70 text-sm font-light leading-relaxed">
              Founded on the belief that retail should be an intimate, premium experience, Salmax Suppliers began as a boutique curating custom orders for discerning clients. Over the years, we have expanded our reach, building relationships directly with global designers and fine craftsmen.
            </p>
            <p className="text-warm-ivory/70 text-sm font-light leading-relaxed">
              We operate at the intersection of traditional boutique aesthetics and modern convenience. Our digital catalogue allows clients to browse active collections effortlessly, while our WhatsApp inquiry workflow maintains the personal, warm touch of local boutique shopping.
            </p>
            <blockquote className="border-l-2 border-gold pl-4 py-1 italic text-gold/90 text-sm font-light">
              "We don't supply products. We offer curated experiences, premium qualities, and details that inspire beauty."
            </blockquote>
          </div>
        </div>

        {/* Pillars of Salmax */}
        <div className="border-t border-gold/10 pt-16">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="font-serif text-2xl md:text-3xl font-light text-white tracking-wide">
              The Principles We Live By
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-dark-charcoal/40 border border-gold/10 p-6 rounded-xl space-y-3">
              <Gem size={22} className="text-gold" />
              <h3 className="font-serif text-base font-semibold text-white">Refined Selection</h3>
              <p className="text-xs text-warm-ivory/60 leading-relaxed font-light">
                We catalog items with strict aesthetic criteria, making sure everything feels luxurious and unique.
              </p>
            </div>
            
            <div className="bg-dark-charcoal/40 border border-gold/10 p-6 rounded-xl space-y-3">
              <Shield size={22} className="text-gold" />
              <h3 className="font-serif text-base font-semibold text-white">Trust & Quality</h3>
              <p className="text-xs text-warm-ivory/60 leading-relaxed font-light">
                We source only genuine fabrics and goods, performing meticulous pre-delivery checks.
              </p>
            </div>

            <div className="bg-dark-charcoal/40 border border-gold/10 p-6 rounded-xl space-y-3">
              <Handshake size={22} className="text-gold" />
              <h3 className="font-serif text-base font-semibold text-white">Personal Care</h3>
              <p className="text-xs text-warm-ivory/60 leading-relaxed font-light">
                Every customer interaction is personal, centered around direct communication and custom service.
              </p>
            </div>

            <div className="bg-dark-charcoal/40 border border-gold/10 p-6 rounded-xl space-y-3">
              <Sparkles size={22} className="text-gold" />
              <h3 className="font-serif text-base font-semibold text-white">Faith & Devotion</h3>
              <p className="text-xs text-warm-ivory/60 leading-relaxed font-light">
                Operating with absolute integrity, transparency, and grace in all our commercial endeavors.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
