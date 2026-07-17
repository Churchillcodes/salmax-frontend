import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, HelpCircle } from "lucide-react";
import apiClient from "../../api/apiClient";
import { toast } from "react-toastify";

export default function Contact() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [interest, setInterest] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      // Submit lead details to the backend leads collection
      await apiClient.post("/leads", leadData);

      toast.success(
        "Your message has been sent successfully. We will get back to you shortly!",
      );

      // Clear form on success
      setName("");
      setPhone("");
      setEmail("");
      setInterest("");
      setMessage("");
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
            Have questions about our collections, sizing, custom shipping, or
            wholesale boutique supply? Send us a message below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Contact Details (Columns 1-5) */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <h2 className="font-serif text-2xl font-light text-white tracking-wide">
                Boutique Information
              </h2>
              <p className="text-sm font-light text-warm-ivory/60 leading-relaxed">
                Our customer relationship team is active between 8:00 AM and
                6:00 PM (EAT). We aim to respond to all web forms and emails
                within 24 hours.
              </p>
            </div>

            <div className="space-y-6">
              {/* Location */}
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-gold/5 border border-gold/20 flex items-center justify-center text-gold shrink-0">
                  <MapPin size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white tracking-wide">
                    Boutique Location
                  </h4>
                  <p className="text-xs text-warm-ivory/60 mt-1 font-light">
                    Nairobi, Kenya
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-gold/5 border border-gold/20 flex items-center justify-center text-gold shrink-0">
                  <Phone size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white tracking-wide">
                    Speak With Us
                  </h4>
                  <a
                    href="tel:+254700000000"
                    className="text-xs text-warm-ivory/60 hover:text-gold transition duration-300 font-light block mt-1"
                  >
                    +254 719 246 761
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-gold/5 border border-gold/20 flex items-center justify-center text-gold shrink-0">
                  <Mail size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white tracking-wide">
                    Write To Us
                  </h4>
                  <a
                    href="mailto:info@salmaxsuppliers.com"
                    className="text-xs text-warm-ivory/60 hover:text-gold transition duration-300 font-light block mt-1"
                  >
                    info@salmaxsuppliers.com
                  </a>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Callout */}
            <div className="p-6 bg-dark-charcoal/40 border border-gold/10 rounded-xl space-y-3">
              <h3 className="font-serif text-sm font-medium text-gold tracking-wide">
                Need Immediate Assistance?
              </h3>
              <p className="text-xs text-warm-ivory/60 font-light leading-relaxed">
                Skip the web form and text our live support agents on WhatsApp.
                We are online to answer stock questions instantly.
              </p>
              <a
                href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || "254719246761"}`}
                target="_blank"
                rel="noreferrer"
                className="inline-block text-xs uppercase tracking-widest bg-gold text-dark-base px-4 py-2.5 rounded font-semibold hover:bg-gold-light transition duration-300 mt-2"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>

          {/* Contact Form (Columns 6-12) */}
          <div className="lg:col-span-7 bg-dark-charcoal border border-gold/10 rounded-xl p-8 shadow-xl">
            <h3 className="font-serif text-lg text-white font-medium mb-6 tracking-wide">
              Send Us A Message
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
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
