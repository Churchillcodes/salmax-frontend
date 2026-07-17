import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Menu, X, User, ShoppingBag, Shield } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/shop', label: 'Catalogue' },
    { path: '/about', label: 'Our Story' },
    { path: '/contact', label: 'Contact' },
  ];

  return (
    <nav className="bg-dark-base/95 backdrop-blur-md border-b border-gold/20 text-white sticky top-0 z-50 font-sans px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex flex-col items-start">
          <span className="font-serif text-2xl font-bold tracking-widest text-gold leading-none hover:text-gold-light transition duration-300">
            SALMAX
          </span>
          <span className="text-[9px] uppercase tracking-[0.25em] text-white/50 leading-none mt-1">SUPPLIERS</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `text-sm tracking-widest uppercase transition-colors duration-300 ${
                  isActive ? 'text-gold border-b border-gold pb-1' : 'text-warm-ivory/80 hover:text-gold'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* User / Admin Controls */}
        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <div className="flex items-center gap-4">
              {isAdmin && (
                <Link
                  to="/admin/dashboard"
                  className="flex items-center gap-1 text-xs tracking-widest uppercase text-gold border border-gold/30 hover:border-gold px-3 py-1.5 rounded premium-transition hover:bg-gold/5"
                >
                  <Shield size={14} />
                  Dashboard
                </Link>
              )}
              <div className="text-xs text-warm-ivory/60 flex items-center gap-1.5">
                <User size={14} className="text-gold" />
                <span className="max-w-[120px] truncate">{user.name || user.email || user.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs uppercase tracking-widest text-white/60 hover:text-gold transition duration-300"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/shop"
              className="flex items-center gap-2 text-xs uppercase tracking-widest bg-gold text-dark-base px-5 py-2.5 rounded font-medium hover:bg-gold-light gold-glow premium-transition"
            >
              <ShoppingBag size={14} />
              Explore Collection
            </Link>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-warm-ivory hover:text-gold transition-colors duration-300"
          aria-label="Toggle Menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile nav drawer */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-dark-base border-b border-gold/20 flex flex-col items-center py-6 gap-5 shadow-2xl animate-fade-in">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `text-sm tracking-widest uppercase py-2 transition duration-300 ${
                  isActive ? 'text-gold' : 'text-warm-ivory/80 hover:text-gold'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}

          <hr className="w-4/5 border-gold/10 my-1" />

          {user ? (
            <div className="flex flex-col items-center gap-4">
              {isAdmin && (
                <Link
                  to="/admin/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-1.5 text-xs tracking-widest uppercase text-gold border border-gold/30 px-5 py-2 rounded hover:bg-gold/5"
                >
                  <Shield size={14} />
                  Dashboard Overview
                </Link>
              )}
              <div className="text-xs text-warm-ivory/60 flex items-center gap-1.5">
                <User size={14} className="text-gold" />
                <span>{user.name || user.email || user.username}</span>
              </div>
              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="text-xs uppercase tracking-widest text-white/60 hover:text-gold py-2"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/admin/login"
              onClick={() => setIsOpen(false)}
              className="text-xs uppercase tracking-widest text-gold/70 hover:text-gold py-2"
            >
              Staff Portal Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
