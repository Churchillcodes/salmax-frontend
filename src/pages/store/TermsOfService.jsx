import React from "react";
import { Helmet } from "react-helmet-async";
import { BUSINESS_INFO } from "../../config/siteConfig";

export default function TermsOfService() {
  return (
    <div className="bg-dark-base min-h-screen text-warm-ivory py-16 font-sans">
      <Helmet>
        <title>Terms of Service | Salmax Suppliers</title>
        <meta
          name="description"
          content="Terms and conditions governing the use of the Salmax Suppliers website and inquiry services."
        />
        <link
          rel="canonical"
          href="https://www.salmaxsuppliers.com/terms-of-service"
        />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div className="max-w-3xl mx-auto px-6 space-y-8">
        <div className="text-center space-y-3 mb-8">
          <span className="text-gold uppercase tracking-[0.25em] text-xs font-semibold">
            Legal
          </span>
          <h1 className="font-serif text-3xl md:text-5xl font-light text-white tracking-wide">
            Terms of Service
          </h1>
          <p className="text-warm-ivory/40 text-xs uppercase tracking-widest">
            Last updated: July 2026
          </p>
        </div>

        <div className="space-y-6 text-sm font-light text-warm-ivory/70 leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-serif text-lg text-gold font-medium">
              1. About Salmax Suppliers
            </h2>
            <p>
              Salmax Suppliers is a Nairobi-based boutique that imports and
              curates premium clothing, footwear, bags, and accessories for
              resale. We do not manufacture, tailor, or produce custom or
              made-to-order goods — all listed items are sourced,
              quality-checked, and sold as-is from our available stock.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-lg text-gold font-medium">
              2. Product Listings &amp; Pricing
            </h2>
            <p>
              Product prices, availability, and stock levels shown on this
              website are updated regularly but are not guaranteed until
              confirmed by our sales team via WhatsApp. Prices are quoted in
              Kenyan Shillings (KES) and may be subject to negotiation at the
              discretion of our team.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-lg text-gold font-medium">
              3. Inquiries &amp; Orders
            </h2>
            <p>
              Submitting a product inquiry through this website does not
              constitute a binding order. Orders are only confirmed once agreed
              directly with our sales team on WhatsApp, including final price,
              size availability, and delivery arrangements.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-lg text-gold font-medium">
              4. Delivery
            </h2>
            <p>
              Delivery timelines and costs are communicated directly by our team
              once an order is confirmed and depend on your location within
              Kenya.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-lg text-gold font-medium">
              5. Acceptable Use
            </h2>
            <p>
              You agree not to misuse this website, including attempting to
              access administrative areas without authorization, submitting
              false or abusive information through our forms, or interfering
              with the normal operation of the site.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-lg text-gold font-medium">
              6. Contact
            </h2>
            <p>
              Questions about these terms can be directed to{" "}
              <a
                href={`mailto:${BUSINESS_INFO.email}`}
                className="text-gold hover:text-gold-light"
              >
                {BUSINESS_INFO.email}
              </a>{" "}
              or {BUSINESS_INFO.phone}.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
