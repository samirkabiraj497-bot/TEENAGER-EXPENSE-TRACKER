import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { PlusCircle, LogOut, User, Menu, X, Sparkles } from 'lucide-react';

export default function Navbar({ onToggleMobileMenu, isMobileMenuOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header style={{
      height: '70px',
      borderBottom: '1px solid var(--border-color)',
      backgroundColor: 'rgba(17, 24, 39, 0.8)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      position: 'sticky',
      top: 0,
      zIndex: 40
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onToggleMobileMenu}
          className="btn btn-secondary btn-sm"
          style={{ display: 'none' }}
          id="mobile-menu-btn"
          aria-label="Toggle Navigation Menu"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, background: 'linear-gradient(135deg, #a5b4fc, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            TeenSpend
          </span>
          <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 700 }}>
            v1.0
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <Link to="/add-expense" className="btn btn-primary btn-sm">
          <PlusCircle size={17} />
          <span>Add Expense</span>
        </Link>

        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid var(--border-color)', paddingLeft: '16px' }}>
            <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'inherit' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #ec4899)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                color: '#fff',
                fontSize: '0.9rem',
                boxShadow: '0 2px 8px rgba(99, 102, 241, 0.4)'
              }}>
                {user.name ? user.name.charAt(0).toUpperCase() : 'T'}
              </div>
              <span style={{ fontWeight: 600, fontSize: '0.9rem', display: 'none' }} className="user-nav-name">
                {user.name}
              </span>
            </Link>

            <button
              onClick={handleLogout}
              className="btn btn-secondary btn-sm"
              title="Log Out"
              aria-label="Log Out"
              style={{ padding: '8px' }}
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 900px) {
          #mobile-menu-btn {
            display: inline-flex !important;
          }
        }
        @media (min-width: 640px) {
          .user-nav-name {
            display: inline !important;
          }
        }
      `}</style>
    </header>
  );
}
