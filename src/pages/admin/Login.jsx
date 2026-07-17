import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { KeyRound, Mail, AlertCircle, Shield } from 'lucide-react';
import { toast } from 'react-toastify';

export default function Login() {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If user is already logged in, redirect them immediately to dashboard
  useEffect(() => {
    if (user) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const from = location.state?.from?.pathname || '/admin/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailOrUsername || !password) {
      setErrorMsg('Please enter both credentials.');
      return;
    }

    setErrorMsg('');
    setSubmitting(true);

    const result = await login(emailOrUsername, password);

    if (result.success) {
      toast.success('Welcome to Salmax Administrative Portal.');
      navigate(from, { replace: true });
    } else {
      setErrorMsg(result.message);
      toast.error(result.message);
    }
    setSubmitting(false);
  };

  return (
    <div className="bg-dark-base min-h-screen flex items-center justify-center px-6 py-12 font-sans text-warm-ivory">
      <div className="w-full max-w-md bg-dark-charcoal border border-gold/15 rounded-2xl overflow-hidden shadow-2xl p-8 relative">
        {/* Top gold line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gold" />
        
        {/* Header */}
        <div className="text-center mb-8 space-y-2">
          <div className="w-12 h-12 rounded-full border border-gold/25 bg-gold/5 flex items-center justify-center text-gold mx-auto mb-3">
            <Shield size={22} />
          </div>
          <h2 className="font-serif text-2xl font-semibold tracking-widest text-white uppercase">
            Salmax Suppliers
          </h2>
          <p className="text-[10px] text-warm-ivory/50 uppercase tracking-[0.25em]">
            Staff Administrative Portal
          </p>
        </div>

        {/* Error Callout */}
        {errorMsg && (
          <div className="flex gap-2.5 p-3.5 bg-red-500/10 border border-red-500/25 rounded-lg text-xs leading-relaxed text-red-400 font-light mb-6">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <p>{errorMsg}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="login-username" className="block text-xs uppercase tracking-widest text-warm-ivory/60 mb-2 font-medium">
              Email or Username
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold/50" size={16} />
              <input
                id="login-username"
                type="text"
                required
                disabled={submitting}
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                placeholder="e.g., admin@salmax.com"
                className="w-full bg-dark-base border border-gold/15 focus:border-gold rounded-lg pl-10 pr-4 py-3 text-sm text-white focus:outline-none premium-transition"
              />
            </div>
          </div>

          <div>
            <label htmlFor="login-password" className="block text-xs uppercase tracking-widest text-warm-ivory/60 mb-2 font-medium">
              Access Password
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold/50" size={16} />
              <input
                id="login-password"
                type="password"
                required
                disabled={submitting}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-dark-base border border-gold/15 focus:border-gold rounded-lg pl-10 pr-4 py-3 text-sm text-white focus:outline-none premium-transition"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gold text-dark-base font-semibold py-3.5 rounded-lg text-sm uppercase tracking-widest hover:bg-gold-light transition duration-300 flex items-center justify-center gap-2 gold-glow"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-dark-base border-t-transparent rounded-full animate-spin"></span>
                  Authenticating...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </div>
        </form>

        {/* Back Link */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="text-[10px] uppercase tracking-widest text-warm-ivory/40 hover:text-gold transition duration-300"
          >
            &larr; Return to Customer Storefront
          </a>
        </div>
      </div>
    </div>
  );
}
