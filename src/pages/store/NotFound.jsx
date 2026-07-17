import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="bg-dark-base min-h-[80vh] flex flex-col items-center justify-center text-warm-ivory text-center px-6 py-16 font-sans">
      <div className="max-w-md p-10 border border-gold/15 rounded-2xl bg-dark-charcoal/40 relative">
        {/* Decorative corner borders */}
        <div className="absolute -top-1.5 -left-1.5 w-6 h-6 border-t-2 border-l-2 border-gold/40" />
        <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 border-b-2 border-r-2 border-gold/40" />

        <Sparkles size={36} className="mx-auto text-gold/60 mb-6" />
        
        <h1 className="font-serif text-6xl font-light text-white tracking-widest mb-4">404</h1>
        
        <h2 className="font-serif text-lg font-medium text-gold uppercase tracking-widest mb-4">
          Avenue Not Found
        </h2>
        
        <p className="text-xs text-warm-ivory/60 font-light leading-relaxed mb-8">
          The boutique directory or product you are looking for has been relocated, archived, or is temporarily unavailable. 
        </p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-gold text-dark-base font-semibold px-6 py-3 rounded text-xs uppercase tracking-widest hover:bg-gold-light transition duration-300 gold-glow"
        >
          <Home size={14} />
          Return Home
        </Link>
      </div>
    </div>
  );
}
