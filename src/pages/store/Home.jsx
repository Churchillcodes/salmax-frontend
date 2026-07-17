import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ArrowRight, Compass, ShieldCheck, Heart, Sparkles, AlertCircle } from 'lucide-react';
import apiClient from '../../api/apiClient';
import ProductCard from '../../components/store/ProductCard';

const HERO_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop',
    title: 'The Autumn Boutique Collection',
    subtitle: 'Meticulously Selected Apparel & Textures',
    cta: 'Explore Collection'
  },
  {
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600&auto=format&fit=crop',
    title: 'Timeless Luxury Accessories',
    subtitle: 'Refined Craftsmanship, Handpicked Elegance',
    cta: 'Shop Accessories'
  },
  {
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1600&auto=format&fit=crop',
    title: 'Premium Boutique Interiors',
    subtitle: 'Transforming Spaces With Exquisite Accents',
    cta: 'Browse Catalogue'
  }
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Rotate Hero Slides
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(slideInterval);
  }, []);

  // Fetch Featured Products (first 4 active products)
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await apiClient.get('/products');
        // Filter active products and take first 4
        const active = (response.data || [])
          .filter(p => p.isActive !== false)
          .slice(0, 4);
        setFeaturedProducts(active);
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="bg-dark-base min-h-screen text-warm-ivory">
      
      {/* Dynamic Hero Section */}
      <section className="relative h-[85vh] overflow-hidden">
        {HERO_SLIDES.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {/* Background Image with Dark Overlay */}
            <div className="absolute inset-0 bg-black/60 z-10" />
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover transform scale-105 transition-transform duration-[6000ms] ease-out"
            />

            {/* Content overlay */}
            <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-center px-6">
              <span className="text-gold uppercase tracking-[0.35em] text-xs md:text-sm font-semibold mb-3 animate-fade-in">
                {slide.subtitle}
              </span>
              <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-light text-white tracking-wide max-w-4xl leading-tight mb-8">
                {slide.title}
              </h1>
              
              <div className="flex gap-4">
                <RouterLink
                  to="/shop"
                  className="bg-gold text-dark-base font-semibold px-8 py-3.5 rounded text-sm uppercase tracking-widest hover:bg-gold-light gold-glow transition duration-300 flex items-center gap-2"
                >
                  Explore Collection
                  <ArrowRight size={16} />
                </RouterLink>
              </div>
            </div>
          </div>
        ))}

        {/* Slide Indicators */}
        <div className="absolute bottom-6 left-0 right-0 z-30 flex justify-center gap-3">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-2.5 h-2.5 rounded-full transition duration-300 ${
                idx === currentSlide ? 'bg-gold w-8' : 'bg-white/30 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Brand Narrative Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-6">
          <span className="text-gold uppercase tracking-[0.25em] text-xs font-semibold block">
            Est. 2024 &bull; Salmax Suppliers
          </span>
          <h2 className="font-serif text-3xl md:text-5xl font-light text-white tracking-wide leading-tight">
            Curators of Premium <br />Boutique Essentials
          </h2>
          <p className="text-warm-ivory/70 font-light leading-relaxed">
            At Salmax Suppliers, we believe that elegance lies in the details. We catalog only the finest fabrics, boutique collectibles, and premium products, serving as a trusted supplier for discerning clientele.
          </p>
          <p className="text-warm-ivory/70 font-light leading-relaxed">
            Every product in our boutique catalogue undergoes rigorous assessment for design integrity, quality, and functionality. We take pride in bridging high-fashion aesthetics with seamless purchase processes.
          </p>
          <div className="pt-4">
            <RouterLink
              to="/about"
              className="text-gold hover:text-gold-light border-b border-gold/40 hover:border-gold pb-1 text-sm uppercase tracking-widest font-medium transition duration-300"
            >
              Read Our Story
            </RouterLink>
          </div>
        </div>
        
        {/* Collage Display */}
        <div className="grid grid-cols-12 gap-4 relative">
          <div className="col-span-8 rounded-lg overflow-hidden border border-gold/10 aspect-[4/3] bg-dark-charcoal">
            <img
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800"
              alt="Tailoring details"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="col-span-4 rounded-lg overflow-hidden border border-gold/10 aspect-[3/4] self-end bg-dark-charcoal">
            <img
              src="https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=600"
              alt="Boutique display"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-8 -left-8 w-24 h-24 border-b border-l border-gold/20 -z-10 hidden lg:block" />
          <div className="absolute -top-8 -right-8 w-24 h-24 border-t border-r border-gold/20 -z-10 hidden lg:block" />
        </div>
      </section>

      {/* Featured Arrivals Section */}
      <section className="py-20 bg-dark-charcoal/30 border-y border-gold/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <span className="text-gold uppercase tracking-[0.25em] text-xs font-semibold block mb-2">
                Featured Highlights
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-light text-white tracking-wide">
                Exquisite New Additions
              </h2>
            </div>
            <RouterLink
              to="/shop"
              className="text-xs uppercase tracking-widest text-gold hover:text-gold-light transition duration-300 flex items-center gap-1 mt-4 md:mt-0 font-medium"
            >
              Browse All Products
              <ArrowRight size={14} />
            </RouterLink>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse bg-dark-charcoal border border-gold/5 rounded-xl aspect-[3/4]" />
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id || product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border border-dashed border-gold/10 rounded-xl bg-dark-base/40">
              <Sparkles size={32} className="mx-auto text-gold/40 mb-3" />
              <p className="font-serif italic text-warm-ivory/60 text-lg mb-1">Catalogue is currently being curated</p>
              <p className="text-xs text-warm-ivory/40">Check back shortly to discover new arrivals.</p>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Salmax Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-gold uppercase tracking-[0.25em] text-xs font-semibold">
            The Salmax Experience
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-light text-white tracking-wide">
            Commitment to Excellence
          </h2>
          <p className="text-warm-ivory/60 text-sm font-light leading-relaxed">
            We provide a bespoke retail supply chain tailored around boutique authenticity and transparent client interactions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-dark-charcoal border border-gold/10 p-8 rounded-xl space-y-4 hover:border-gold/30 premium-transition">
            <div className="w-12 h-12 rounded-lg bg-gold/5 flex items-center justify-center text-gold border border-gold/20">
              <Compass size={22} />
            </div>
            <h3 className="font-serif text-lg font-medium text-white tracking-wide">
              Curated Selections
            </h3>
            <p className="text-warm-ivory/60 text-sm font-light leading-relaxed">
              We hand-select every collection, cataloging only unique materials and designs that fit premium luxury fashion and lifestyle demands.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-dark-charcoal border border-gold/10 p-8 rounded-xl space-y-4 hover:border-gold/30 premium-transition">
            <div className="w-12 h-12 rounded-lg bg-gold/5 flex items-center justify-center text-gold border border-gold/20">
              <ShieldCheck size={22} />
            </div>
            <h3 className="font-serif text-lg font-medium text-white tracking-wide">
              Unrivaled Quality
            </h3>
            <p className="text-warm-ivory/60 text-sm font-light leading-relaxed">
              No compromises. We source directly from trusted manufacturers and perform rigorous quality audits on all items before delivery.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-dark-charcoal border border-gold/10 p-8 rounded-xl space-y-4 hover:border-gold/30 premium-transition">
            <div className="w-12 h-12 rounded-lg bg-gold/5 flex items-center justify-center text-gold border border-gold/20">
              <Heart size={22} />
            </div>
            <h3 className="font-serif text-lg font-medium text-white tracking-wide">
              Bespoke Services
            </h3>
            <p className="text-warm-ivory/60 text-sm font-light leading-relaxed">
              From our dedicated WhatsApp inquiry flows to quick responses and post-purchase followups, we support client requests personally.
            </p>
          </div>
        </div>
      </section>

      {/* Boutique Testimonials / Trust Elements */}
      <section className="py-20 bg-dark-charcoal/20 border-t border-gold/5 text-center">
        <div className="max-w-4xl mx-auto px-6 space-y-8">
          <span className="text-gold uppercase tracking-[0.25em] text-xs font-semibold block">
            Client Impressions
          </span>
          <p className="font-serif text-2xl md:text-3xl italic text-white/95 leading-relaxed font-light">
            "The customer service was absolutely spectacular. They handled my apparel inquiry on WhatsApp within minutes and made sure delivery to my office was seamless. Highly recommend Salmax."
          </p>
          <div className="space-y-1">
            <p className="text-sm font-semibold tracking-wider uppercase text-gold">Victoria N. W.</p>
            <p className="text-xs text-warm-ivory/40 uppercase tracking-widest">Bespoke Buyer</p>
          </div>
        </div>
      </section>

    </div>
  );
}
