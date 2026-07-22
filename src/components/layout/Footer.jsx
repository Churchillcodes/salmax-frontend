import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, MapPin } from "lucide-react";
import { BUSINESS_INFO } from "../../config/siteConfig";

const FALLBACK_VERSES = [
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

const MAX_VERSE_LENGTH = 260; // keep the footer layout tidy

export default function Footer() {
  const [verse, setVerse] = useState(FALLBACK_VERSES[0]);
  const [fade, setFade] = useState(true);
  const [fallbackIndex, setFallbackIndex] = useState(0);

  const pickFallback = () => {
    const idx = Math.floor(Math.random() * FALLBACK_VERSES.length);
    setFallbackIndex(idx);
    return FALLBACK_VERSES[idx];
  };

  const fetchRandomVerse = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    try {
      const res = await fetch("https://bible-api.com/?random=verse", {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error("Bad response");
      const data = await res.json();
      const text = (data?.text || "").trim().replace(/\s+/g, " ");
      if (text && text.length <= MAX_VERSE_LENGTH && data.reference) {
        return { text, ref: data.reference };
      }
      throw new Error("Verse unsuitable");
    } catch (e) {
      clearTimeout(timeoutId);
      return null;
    }
  };

  useEffect(() => {
    let cancelled = false;

    // Show a curated verse immediately, then try to enrich with a fresh one.
    setVerse(pickFallback());
    fetchRandomVerse().then((fetched) => {
      if (!cancelled && fetched) setVerse(fetched);
    });

    const interval = setInterval(async () => {
      setFade(false);
      const fetched = await fetchRandomVerse();
      setTimeout(() => {
        if (cancelled) return;
        if (fetched) {
          setVerse(fetched);
        } else {
          setFallbackIndex((prev) => {
            const next = (prev + 1) % FALLBACK_VERSES.length;
            setVerse(FALLBACK_VERSES[next]);
            return next;
          });
        }
        setFade(true);
      }, 500);
    }, 18000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <footer className="bg-dark-charcoal border-t border-gold/20 text-warm-ivory/80 pt-16 pb-8 px-6 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        {/* Brand info */}
        <div className="space-y-4">
          <Link to="/" className="inline-block">
            <img
              src="/brand/salmax-horizontal-color.png"
              alt="Salmax Suppliers"
              className="h-14 w-auto object-contain"
            />
          </Link>
          <p className="text-sm font-light text-warm-ivory/60 leading-relaxed">
            Curators of premium products and elegant supplies. We offer a
            premium boutique experience for those who appreciate fine quality,
            timeless craftsmanship, and exceptional customer service.
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
                Inquire &amp; Contact
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
              <span className="text-warm-ivory/60">
                {BUSINESS_INFO.location}
              </span>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={16} className="text-gold shrink-0" />
              <a
                href={BUSINESS_INFO.phoneHref}
                className="hover:text-gold transition-colors duration-300 text-warm-ivory/60"
              >
                {BUSINESS_INFO.phone}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={16} className="text-gold shrink-0" />
              <a
                href={`mailto:${BUSINESS_INFO.email}`}
                className="hover:text-gold transition-colors duration-300 text-warm-ivory/60"
              >
                {BUSINESS_INFO.email}
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
              href={BUSINESS_INFO.instagramUrl}
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
              href={BUSINESS_INFO.facebookUrl}
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

      {/* Rotating verse section */}
      <div className="max-w-3xl mx-auto my-12 text-center px-4">
        <div
          className={`transition-all duration-500 transform ${fade ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
        >
          <p className="font-serif italic text-base md:text-lg text-gold/90 font-light leading-relaxed">
            "{verse.text}"
          </p>
          <p className="text-xs uppercase tracking-widest text-white/40 mt-3">
            — {verse.ref}
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
            to="/privacy-policy"
            className="hover:text-gold transition-colors duration-300"
          >
            Privacy Policy
          </Link>
          <Link
            to="/terms-of-service"
            className="hover:text-gold transition-colors duration-300"
          >
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}
