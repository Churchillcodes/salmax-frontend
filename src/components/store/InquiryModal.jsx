import React, { useState, useEffect } from "react";
import { X, Send, AlertCircle } from "lucide-react";
import apiClient from "../../api/apiClient";
import { toast } from "react-toastify";
import { normalizeLead } from "../../utils/apiData";

const CUSTOMER_STORAGE_KEY = "salmax_customer";

const STORAGE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

const saveCustomerDetails = (name, phone) => {
  localStorage.setItem(
    CUSTOMER_STORAGE_KEY,
    JSON.stringify({
      customerName: name,
      customerPhone: phone,
      expiresAt: Date.now() + STORAGE_DURATION,
    }),
  );
};

const getSavedCustomerDetails = () => {
  const saved = localStorage.getItem(CUSTOMER_STORAGE_KEY);

  if (!saved) return null;

  try {
    const parsed = JSON.parse(saved);

    if (Date.now() > parsed.expiresAt) {
      localStorage.removeItem(CUSTOMER_STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch {
    localStorage.removeItem(CUSTOMER_STORAGE_KEY);
    return null;
  }
};

const clearSavedCustomerDetails = () => {
  localStorage.removeItem(CUSTOMER_STORAGE_KEY);
};

export default function InquiryModal({ product, onClose }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [source, setSource] = useState("");
  const [otherSource, setOtherSource] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const saved = getSavedCustomerDetails();

    if (saved) {
      setName(saved.customerName || "");
      setPhone(saved.customerPhone || "");
    }
  }, []);

  // Configuration for Salmax WhatsApp number
  const WHATSAPP_NUMBER =
    import.meta.env.VITE_WHATSAPP_NUMBER || "254719246761"; // Target business number

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !phone || !source) {
      toast.warning("Please fill in all required fields.");
      return;
    }

    const phoneRegex = /^\+?[0-9\s\-()]{7,15}$/;
    if (!phoneRegex.test(phone.trim())) {
      toast.warning("Please enter a valid phone number.");
      return;
    }

    if (source === "Other" && !otherSource.trim()) {
      toast.warning("Please specify how you found out about us.");
      return;
    }

    setSubmitting(true);
    const selectedSource =
      source === "Other" ? `Other: ${otherSource}` : source;

    const leadData = {
      customerName: name.trim(),
      customerPhone: phone.trim(),
      source: selectedSource,
      product: product._id || product.id,
      productName: product.name,
    };

    try {
      await apiClient.post("/leads", leadData);
      saveCustomerDetails(name.trim(), phone.trim());
      const normalizedLead = normalizeLead({
        ...leadData,
        _id: product._id || product.id,
      });
      console.info("Lead created successfully", normalizedLead);

      toast.success(
        "Inquiry submitted successfully! Redirecting to WhatsApp...",
      );

      // Construct WhatsApp message
      const textMessage = `Hello Salmax Suppliers,\n\nI am interested in inquiring about this product:\n- *Product Name*: ${product.name}\n- *Price*: ${product.price ? `KES ${product.price.toLocaleString()}` : "Contact for Price"}\n\nMy Details:\n- *Name*: ${name}\n- *Phone*: ${phone}\n- *Referral*: ${selectedSource}\n\nThank you!`;

      const encodedText = encodeURIComponent(textMessage);
      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedText}`;

      // Open WhatsApp redirection URL after a short timeout
      setTimeout(() => {
        window.open(whatsappUrl, "_blank", "noopener,noreferrer");
        onClose();
      }, 1000);
    } catch (error) {
      console.error("Lead submission failed:", error);
      toast.error(
        "Unable to record inquiry lead. Proceeding to WhatsApp anyway...",
      );

      // Fallback redirection to WhatsApp even if backend save fails
      const textMessage = `Hello Salmax Suppliers, I am interested in inquiring about: ${product.name}. My name is ${name}.`;
      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(textMessage)}`;

      setTimeout(() => {
        window.open(whatsappUrl, "_blank", "noopener,noreferrer");
        onClose();
      }, 1500);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div
        className="w-full max-w-md bg-dark-charcoal border border-gold/30 rounded-xl overflow-hidden shadow-2xl animate-fade-in text-warm-ivory"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gold/15 bg-dark-base">
          <h3 className="font-serif text-lg text-gold tracking-wide font-medium">
            Inquire About This Product
          </h3>
          <button
            onClick={onClose}
            className="text-warm-ivory/60 hover:text-gold transition duration-300"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Product context card */}
          <div className="flex gap-4 p-3 bg-dark-base/50 border border-gold/10 rounded-lg">
            {product.image || (product.images && product.images[0]) ? (
              <img
                src={product.image || product.images[0]}
                alt={product.name}
                className="w-16 h-16 object-cover rounded border border-gold/10"
              />
            ) : (
              <div className="w-16 h-16 bg-gold/5 flex items-center justify-center border border-gold/10 rounded text-gold">
                No Img
              </div>
            )}
            <div className="flex flex-col justify-center">
              <h4 className="text-sm font-medium font-serif tracking-wide text-white">
                {product.name}
              </h4>
              <p className="text-xs text-gold mt-0.5">
                {product.price
                  ? `KES ${product.price.toLocaleString()}`
                  : "Price on request"}
              </p>
              {product.category && (
                <span className="text-[10px] uppercase text-warm-ivory/40 tracking-wider mt-1">
                  {typeof product.category === "object"
                    ? product.category.name
                    : product.category}
                </span>
              )}
            </div>
          </div>

          {/* Disclaimer Alert */}
          <div className="flex gap-2.5 p-3.5 bg-gold/5 border border-gold/20 rounded-lg text-xs leading-relaxed text-gold/90 font-light">
            <AlertCircle size={18} className="shrink-0 mt-0.5 text-gold" />
            <p>
              <strong>Notice:</strong> Submitting this form registers your
              interest on our portal, and you will be automatically redirected
              to WhatsApp to complete your message with our sales
              representatives.
            </p>
          </div>

          {/* Form fields */}
          <div className="space-y-4">
            <div>
              <label
                htmlFor="inquiry-name"
                className="block text-xs uppercase tracking-widest text-warm-ivory/60 mb-1.5 font-medium"
              >
                Your Name <span className="text-gold">*</span>
              </label>
              <input
                id="inquiry-name"
                type="text"
                required
                disabled={submitting}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Jane Doe"
                className="w-full bg-dark-base border border-gold/20 rounded px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold premium-transition"
              />
            </div>

            <div>
              <label
                htmlFor="inquiry-phone"
                className="block text-xs uppercase tracking-widest text-warm-ivory/60 mb-1.5 font-medium"
              >
                Phone Number <span className="text-gold">*</span>
              </label>
              <input
                id="inquiry-phone"
                type="tel"
                required
                disabled={submitting}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g., +254 719 246 761"
                className="w-full bg-dark-base border border-gold/20 rounded px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold premium-transition"
              />
              <div className="mt-2 text-right">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => {
                    clearSavedCustomerDetails();
                    setName("");
                    setPhone("");
                  }}
                  className="text-xs text-gold hover:text-gold-light underline underline-offset-2 transition"
                >
                  Clear saved name & phone
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="inquiry-source"
                className="block text-xs uppercase tracking-widest text-warm-ivory/60 mb-1.5 font-medium"
              >
                How did you find Salmax? <span className="text-gold">*</span>
              </label>
              <select
                id="inquiry-source"
                required
                disabled={submitting}
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full bg-dark-base border border-gold/20 rounded px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold premium-transition"
              >
                <option value="" disabled>
                  Select referral source
                </option>
                <option value="Social Media">
                  Social Media (Instagram/Facebook)
                </option>
                <option value="Search Engine">
                  Search Engine (Google/Bing)
                </option>
                <option value="Friend Referral">Friend Referral</option>
                <option value="Exhibition/Banner">
                  Exhibition or Banner Ad
                </option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Dynamic Other Source Field */}
            {source === "Other" && (
              <div className="animate-fade-in">
                <label
                  htmlFor="inquiry-other"
                  className="block text-xs uppercase tracking-widest text-warm-ivory/60 mb-1.5 font-medium"
                >
                  Please specify <span className="text-gold">*</span>
                </label>
                <input
                  id="inquiry-other"
                  type="text"
                  required
                  disabled={submitting}
                  value={otherSource}
                  onChange={(e) => setOtherSource(e.target.value)}
                  placeholder="e.g., Local flyer, magazine..."
                  className="w-full bg-dark-base border border-gold/20 rounded px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold premium-transition"
                />
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 border border-gold/20 text-warm-ivory/70 py-2.5 rounded text-sm uppercase tracking-widest hover:bg-gold/5 transition duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-gold text-dark-base font-semibold py-2.5 rounded text-sm uppercase tracking-widest hover:bg-gold-light transition duration-300 flex items-center justify-center gap-2 gold-glow"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-dark-base border-t-transparent rounded-full animate-spin"></span>
                  Sending...
                </>
              ) : (
                <>
                  <Send size={14} />
                  Inquire
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
