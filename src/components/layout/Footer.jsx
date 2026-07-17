import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Compass, Phone, Mail, MapPin } from "lucide-react";

const BIBLE_VERSES = [
  {
    text: "Trust in the Lord with all your heart, and do not lean on your own understanding. In all your ways acknowledge him, and he will make straight your paths.",
    ref: "Proverbs 3:5-6",
  },
  {
    text: "Commit your work to the Lord, and your plans will be established.",
    ref: "Proverbs 16:3",
  },
  {
    text: "Whatever you do, work heartily, as for the Lord and not for men.",
    ref: "Colossians 3:23",
  },
  {
    text: "Have I not commanded you? Be strong and courageous. Do not be frightened, for the Lord your God is with you.",
    ref: "Joshua 1:9",
  },
  {
    text: "For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope.",
    ref: "Jeremiah 29:11",
  },
  {
    text: "But seek first the kingdom of God and his righteousness, and all these things will be added to you.",
    ref: "Matthew 6:33",
  },
  {
    text: "The Lord is my shepherd; I shall not want. He makes me lie down in green pastures.",
    ref: "Psalm 23:1-2",
  },
  {
    text: "And we know that for those who love God all things work together for good, for those who are called according to his purpose.",
    ref: "Romans 8:28",
  },
];

export default function Footer() {
  const [verseIndex, setVerseIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    // Select random verse on load
    const randomIndex = Math.floor(Math.random() * BIBLE_VERSES.length);
    setVerseIndex(randomIndex);

    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setVerseIndex((prev) => (prev + 1) % BIBLE_VERSES.length);
        setFade(true);
      }, 500); // match transition duration
    }, 15000); // 15 seconds rotation

    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="bg-dark-charcoal border-t border-gold/20 text-warm-ivory/80 pt-16 pb-8 px-6 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        {/* Brand info */}
        <div className="space-y-4">
          <Link to="/" className="inline-block">
            <span className="font-serif text-3xl font-semibold tracking-widest text-gold hover:text-gold-light transition duration-300">
              SALMAX
            </span>
            <span className="block text-xs uppercase tracking-[0.25em] text-white/50">
              SUPPLIERS
            </span>
          </Link>
          <p className="text-sm font-light text-warm-ivory/60 leading-relaxed">
            Curators of premium products and elegant supplies. We offer a
            bespoke boutique experience tailored for those who appreciate fine
            quality, timeless craftsmanship, and exceptional customer service.
          </p>
        </div>

        {/* Quick links */}
        <div>
          <h4 className="font-serif text-lg font-medium text-white mb-6 tracking-wide border-b border-gold/10 pb-2">
            Quick Navigation
          </h4>
          <ul className="space-y-3 text-sm font-light">
            <li>
              <Link
                to="/"
                className="hover:text-gold transition-colors duration-300"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/shop"
                className="hover:text-gold transition-colors duration-300"
              >
                Browse Collection
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className="hover:text-gold transition-colors duration-300"
              >
                Our Story
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className="hover:text-gold transition-colors duration-300"
              >
                Inquire & Contact
              </Link>
            </li>
            <li>
              <Link
                to="/admin/login"
                className="hover:text-gold transition-colors duration-300 text-gold/60"
              >
                Staff Portal
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact info */}
        <div>
          <h4 className="font-serif text-lg font-medium text-white mb-6 tracking-wide border-b border-gold/10 pb-2">
            Connect With Us
          </h4>
          <ul className="space-y-4 text-sm font-light">
            <li className="flex items-start gap-3">
              <MapPin size={16} className="text-gold shrink-0 mt-1" />
              <span className="text-warm-ivory/60">Nairobi, Kenya</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={16} className="text-gold shrink-0" />
              <a
                href="tel:+254700000000"
                className="hover:text-gold transition-colors duration-300 text-warm-ivory/60"
              >
                +254 719 246 761
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={16} className="text-gold shrink-0" />
              <a
                href="mailto:info@salmaxsuppliers.com"
                className="hover:text-gold transition-colors duration-300 text-warm-ivory/60"
              >
                info@salmaxsuppliers.com
              </a>
            </li>
          </ul>
        </div>

        {/* Social presence */}
        <div>
          <h4 className="font-serif text-lg font-medium text-white mb-6 tracking-wide border-b border-gold/10 pb-2">
            Socials
          </h4>
          <p className="text-sm font-light text-warm-ivory/60 mb-4 leading-relaxed">
            Follow our journey and explore curated arrivals online.
          </p>
          <div className="flex gap-4">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-full border border-gold/20 flex items-center justify-center hover:border-gold hover:text-gold transition duration-300 text-warm-ivory/70"
              aria-label="Instagram"
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-full border border-gold/20 flex items-center justify-center hover:border-gold hover:text-gold transition duration-300 text-warm-ivory/70"
              aria-label="Facebook"
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Rotating Bible Verse Section */}
      <div className="max-w-3xl mx-auto my-12 text-center px-4">
        <div
          className={`transition-all duration-500 transform ${fade ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
        >
          <p className="font-serif italic text-base md:text-lg text-gold/90 font-light leading-relaxed">
            "{BIBLE_VERSES[verseIndex].text}"
          </p>
          <p className="text-xs uppercase tracking-widest text-white/40 mt-3">
            — {BIBLE_VERSES[verseIndex].ref}
          </p>
        </div>
      </div>

      {/* Footer bottom */}
      <div className="max-w-7xl mx-auto border-t border-gold/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs font-light text-warm-ivory/40 gap-4">
        <div>
          &copy; {new Date().getFullYear()} Salmax Suppliers. All rights
          reserved.
        </div>
        <div className="flex gap-6">
          <Link
            to="/about"
            className="hover:text-gold transition-colors duration-300"
          >
            Privacy Policy
          </Link>
          <Link
            to="/contact"
            className="hover:text-gold transition-colors duration-300"
          >
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}
