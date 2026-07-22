import React, { useState, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import apiClient from "../../api/apiClient";
import { toast } from "react-toastify";
import { BUSINESS_INFO } from "../../config/siteConfig";

export default function Contact() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [interest, setInterest] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState(""); // bot trap — real users never see this
  const [submitting, setSubmitting] = useState(false);
  const lastSubmitRef = useRef(0);

  const resetForm = () => {
    setName("");
    setPhone("");
    setEmail("");
    setInterest("");
    setMessage("");
    setHoneypot("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Silently "succeed" for bots without ever hitting the backend.
    if (honeypot) {
      setSubmitting(true);
      setTimeout(() => {
        toast.success(
          "Your message has been sent successfully. We will get back to you shortly!",
        );
        resetForm();
        setSubmitting(false);
      }, 800);
      return;
    }

    const now = Date.now();
    if (now - lastSubmitRef.current < 15000) {
      toast.info("Please wait a moment before sending another message.");
      return;
    }

    if (!name || !phone || !email || !message) {
      toast.warning("Please fill in all required fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.warning("Please enter a valid email address.");
      return;
    }

    const phoneRegex = /^\+?[0-9\s\-()]{7,15}$/;
    if (!phoneRegex.test(phone.trim())) {
      toast.warning("Please enter a valid phone number.");
      return;
    }

    setSubmitting(true);
    const leadData = {
      name,
      phone,
      email,
      source: "General Contact Form",
      product: interest ? `Interest: ${interest}` : "General Inquiry",
      message,
      date: new Date().toISOString(),
    };

    try {
      await apiClient.post("/leads", leadData);
      lastSubmitRef.current = Date.now();

      toast.success(
        "Your message has been sent successfully. We will get back to you shortly!",
      );
      resetForm();
    } catch (error) {
      console.error("Contact lead submission failed:", error);
      toast.error(
        "Unable to send inquiry message. Please try again later, or contact us directly on WhatsApp.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-dark-base min-h-screen text-warm-ivory py-16 font-sans">
      <Helmet>
        <title>Contact Us | Salmax Suppliers</title>
        <meta
          name="description"
          content="Get in touch with Salmax Suppliers for questions about our collections, sizing, delivery, or wholesale boutique supply. Chat with us on WhatsApp or send a message."
        />
        <link rel="canonical" href="https://www.salmaxsuppliers.com/contact" />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-gold uppercase tracking-[0.25em] text-xs font-semibold">
            Get In Touch
          </span>
          <h1 className="font-serif text-3xl md:text-5xl font-light text-white tracking-wide">
            Connect With Salmax
          </h1>
          <p className="text-warm-ivory/60 text-sm font-light leading-relaxed">
            Have questions about our collections, sizing, delivery options, or
            wholesale boutique supply? Send us a message below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Contact Details */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <h2 className="font-serif text-2xl font-light text-white tracking-wide">
                Boutique Information
              </h2>
              <p className="text-sm font-light text-warm-ivory/60 leading-relaxed">
                {BUSINESS_INFO.hoursNote} We aim to respond to all web forms and
                emails within 24 hours.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-gold/5 border border-gold/20 flex items-center justify-center text-gold shrink-0">
                  <MapPin size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white tracking-wide">
                    Boutique Location
                  </h4>
                  <p className="text-xs text-warm-ivory/60 mt-1 font-light">
                    {BUSINESS_INFO.location}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-gold/5 border border-gold/20 flex items-center justify-center text-gold shrink-0">
                  <Phone size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white tracking-wide">
                    Speak With Us
                  </h4>
                  <a
                    href={BUSINESS_INFO.phoneHref}
                    className="text-xs text-warm-ivory/60 hover:text-gold transition duration-300 font-light block mt-1"
                  >
                    {BUSINESS_INFO.phone}
                  </a>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-gold/5 border border-gold/20 flex items-center justify-center text-gold shrink-0">
                  <Mail size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white tracking-wide">
                    Write To Us
                  </h4>
                  <a
                    href={`mailto:${BUSINESS_INFO.email}`}
                    className="text-xs text-warm-ivory/60 hover:text-gold transition duration-300 font-light block mt-1"
                  >
                    {BUSINESS_INFO.email}
                  </a>
                </div>
              </div>
            </div>

            <div className="p-6 bg-dark-charcoal/40 border border-gold/10 rounded-xl space-y-3">
              <h3 className="font-serif text-sm font-medium text-gold tracking-wide">
                Need Immediate Assistance?
              </h3>
              <p className="text-xs text-warm-ivory/60 font-light leading-relaxed">
                Skip the web form and text our live support agents on WhatsApp.
                We are online to answer stock questions instantly.
              </p>
              <a
                href={`https://wa.me/${BUSINESS_INFO.whatsappNumber}`}
                target="_blank"
                rel="noreferrer"
                className="inline-block text-xs uppercase tracking-widest bg-gold text-dark-base px-4 py-2.5 rounded font-semibold hover:bg-gold-light transition duration-300 mt-2"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7 bg-dark-charcoal border border-gold/10 rounded-xl p-8 shadow-xl">
            <h3 className="font-serif text-lg text-white font-medium mb-6 tracking-wide">
              Send Us A Message
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Honeypot field — hidden from real users, catches basic bots */}
              <input
                type="text"
                name="companyWebsite"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex="-1"
                autoComplete="off"
                aria-hidden="true"
                className="absolute -left-[9999px] w-px h-px opacity-0"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-xs uppercase tracking-widest text-warm-ivory/60 mb-1.5 font-medium"
                  >
                    Your Name <span className="text-gold">*</span>
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    disabled={submitting}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full bg-dark-base border border-gold/15 focus:border-gold rounded px-4 py-2.5 text-sm text-white focus:outline-none premium-transition"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-phone"
                    className="block text-xs uppercase tracking-widest text-warm-ivory/60 mb-1.5 font-medium"
                  >
                    Phone Number <span className="text-gold">*</span>
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    required
                    disabled={submitting}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g., +254 700 000"
                    className="w-full bg-dark-base border border-gold/15 focus:border-gold rounded px-4 py-2.5 text-sm text-white focus:outline-none premium-transition"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-email"
                  className="block text-xs uppercase tracking-widest text-warm-ivory/60 mb-1.5 font-medium"
                >
                  Email Address <span className="text-gold">*</span>
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  disabled={submitting}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane.doe@example.com"
                  className="w-full bg-dark-base border border-gold/15 focus:border-gold rounded px-4 py-2.5 text-sm text-white focus:outline-none premium-transition"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-interest"
                  className="block text-xs uppercase tracking-widest text-warm-ivory/60 mb-1.5 font-medium"
                >
                  Product Interest (Optional)
                </label>
                <input
                  id="contact-interest"
                  type="text"
                  disabled={submitting}
                  value={interest}
                  onChange={(e) => setInterest(e.target.value)}
                  placeholder="e.g., Silk Dresses, Leather Bags..."
                  className="w-full bg-dark-base border border-gold/15 focus:border-gold rounded px-4 py-2.5 text-sm text-white focus:outline-none premium-transition"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="block text-xs uppercase tracking-widest text-warm-ivory/60 mb-1.5 font-medium"
                >
                  Your Message <span className="text-gold">*</span>
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={4}
                  disabled={submitting}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Detail your inquiry here..."
                  className="w-full bg-dark-base border border-gold/15 focus:border-gold rounded px-4 py-2.5 text-sm text-white focus:outline-none premium-transition resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gold text-dark-base font-semibold py-3.5 rounded text-sm uppercase tracking-widest hover:bg-gold-light transition duration-300 flex items-center justify-center gap-2 gold-glow"
                >
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-dark-base border-t-transparent rounded-full animate-spin"></span>
                      Submitting Message...
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      Send Message
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
