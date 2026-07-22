import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Unhandled application error:", error, info);
    // Hook a monitoring service (e.g. Sentry) here once you have one set up.
  }

  handleReload = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-dark-base flex items-center justify-center px-6 text-warm-ivory font-sans">
          <div className="max-w-md text-center border border-gold/15 rounded-2xl p-10 bg-dark-charcoal/40">
            <h1 className="font-serif text-2xl text-gold mb-3">
              Something went wrong
            </h1>
            <p className="text-xs text-warm-ivory/60 font-light leading-relaxed mb-8">
              We hit an unexpected error loading this page. Please try returning
              to the homepage, or refresh your browser.
            </p>
            <button
              onClick={this.handleReload}
              className="bg-gold text-dark-base font-semibold px-6 py-3 rounded text-xs uppercase tracking-widest hover:bg-gold-light transition duration-300 gold-glow"
            >
              Return Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
