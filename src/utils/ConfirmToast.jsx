import React from "react";
import { toast } from "react-toastify";

/**
 * Styled confirmation toast with Continue / Cancel actions.
 * Replaces window.confirm() across the app.
 *
 * @returns {Promise<boolean>} true if confirmed, false if cancelled/dismissed
 */
export function confirmToast({
  message,
  detail = "",
  confirmLabel = "Continue",
  cancelLabel = "Cancel",
  tone = "danger",
} = {}) {
  return new Promise((resolve) => {
    toast(
      ({ closeToast }) => (
        <div className="text-warm-ivory">
          <p className="text-sm font-semibold text-white mb-1">{message}</p>
          {detail && (
            <p className="text-xs text-warm-ivory/60 font-light leading-relaxed mb-3">
              {detail}
            </p>
          )}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => {
                resolve(false);
                closeToast();
              }}
              className="flex-1 border border-gold/20 text-warm-ivory/70 py-1.5 rounded text-[10px] uppercase tracking-widest hover:bg-white/5 transition"
            >
              {cancelLabel}
            </button>
            <button
              onClick={() => {
                resolve(true);
                closeToast();
              }}
              className={`flex-1 py-1.5 rounded text-[10px] font-semibold uppercase tracking-widest transition ${
                tone === "danger"
                  ? "bg-rose-500/90 text-white hover:bg-rose-500"
                  : "bg-gold text-dark-base hover:bg-gold-light"
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      ),
      {
        autoClose: false,
        closeOnClick: false,
        closeButton: false,
        draggable: false,
        className: "!bg-dark-charcoal !border !border-gold/20 !rounded-xl",
        onClose: () => resolve(false),
      },
    );
  });
}

export default confirmToast;
