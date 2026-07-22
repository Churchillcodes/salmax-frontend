import React from "react";
import { Helmet } from "react-helmet-async";
import { BUSINESS_INFO } from "../../config/siteConfig";

export default function PrivacyPolicy() {
  return (
    <div className="bg-dark-base min-h-screen text-warm-ivory py-16 font-sans">
      <Helmet>
        <title>Privacy Policy | Salmax Suppliers</title>
        <meta
          name="description"
          content="How Salmax Suppliers collects, uses, and protects your personal information when you browse our catalogue or submit an inquiry."
        />
        <link
          rel="canonical"
          href="https://www.salmaxsuppliers.com/privacy-policy"
        />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div className="max-w-3xl mx-auto px-6 space-y-8">
        <div className="text-center space-y-3 mb-8">
          <span className="text-gold uppercase tracking-[0.25em] text-xs font-semibold">
            Legal
          </span>
          <h1 className="font-serif text-3xl md:text-5xl font-light text-white tracking-wide">
            Privacy Policy
          </h1>
          <p className="text-warm-ivory/40 text-xs uppercase tracking-widest">
            Last updated: July 2026
          </p>
        </div>

        <div className="space-y-6 text-sm font-light text-warm-ivory/70 leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-serif text-lg text-gold font-medium">
              1. Information We Collect
            </h2>
            <p>
              When you submit a product inquiry or contact form on this site, we
              collect the information you provide directly: your name, phone
              number, email address (contact form only), the product you're
              interested in, and how you heard about us. We do not collect
              payment information through this website — all purchases are
              finalized directly with our team via WhatsApp.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-lg text-gold font-medium">
              2. How We Use Your Information
            </h2>
            <p>
              Your details are used solely to respond to your inquiry, follow up
              on orders, and improve our catalogue and referral channels. We do
              not sell, rent, or share your personal information with third
              parties for marketing purposes.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-lg text-gold font-medium">
              3. WhatsApp Redirection
            </h2>
            <p>
              Submitting an inquiry form redirects you to WhatsApp to continue
              the conversation with our sales team. Any messages you send on
              WhatsApp are subject to WhatsApp's own privacy policy and terms,
              which are outside our control.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-lg text-gold font-medium">
              4. Cookies &amp; Local Storage
            </h2>
            <p>
              Our administrative portal uses a secure, HTTP-only session cookie
              to keep staff logged in. This cookie is not accessible to
              client-side scripts and is not used for tracking or advertising.
              The public storefront does not use tracking cookies.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-lg text-gold font-medium">
              5. Data Retention &amp; Your Rights
            </h2>
            <p>
              We retain inquiry and order records for as long as necessary to
              provide customer service and maintain business records. You may
              request access to, correction of, or deletion of your personal
              data at any time by contacting us directly.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-lg text-gold font-medium">
              6. Contact Us
            </h2>
            <p>
              For any privacy-related questions, reach us at{" "}
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
