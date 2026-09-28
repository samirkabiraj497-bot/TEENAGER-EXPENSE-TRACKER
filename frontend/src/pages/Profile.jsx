import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import expenseService from '../services/expenseService';
import budgetService from '../services/budgetService';
import { formatDate } from '../utils/date';
import {
  User,
  Mail,
  Calendar,
  ShieldCheck,
  Database,
  LogOut,
  CheckCircle,
  AlertCircle,
  Sparkles
} from 'lucide-react';

const DEMO_EXPENSES = [
  { title: 'Pizza with school squad', amount: 350, category: 'Food', expense_date: '2026-09-27', payment_method: 'UPI', description: 'Weekend hangout' },
  { title: 'Monthly Metro Pass Recharge', amount: 450, category: 'Transport', expense_date: '2026-09-25', payment_method: 'UPI', description: 'Student travel pass' },
  { title: 'New Science & Math Notebooks', amount: 220, category: 'Education', expense_date: '2026-09-23', payment_method: 'Cash', description: 'Stationery shop' },
  { title: 'Steam Coop Game', amount: 599, category: 'Gaming', expense_date: '2026-09-21', payment_method: 'Debit Card', description: 'Autumn sale' },
  { title: 'Weekend Movie & Popcorn', amount: 420, category: 'Entertainment', expense_date: '2026-09-18', payment_method: 'UPI', description: 'IMAX screening' },
  { title: 'Spotify Student Subscription', amount: 59, category: 'Subscriptions', expense_date: '2026-09-15', payment_method: 'UPI', description: 'Music streaming' },
  { title: 'Oversized Graphic Tee', amount: 899, category: 'Shopping', expense_date: '2026-09-12', payment_method: 'Credit Card', description: 'Casual wear' },
  { title: 'Burger & Milkshake', amount: 210, category: 'Food', expense_date: '2026-09-08', payment_method: 'Cash', description: 'Post-sports snack' }
];

const DEMO_BUDGETS = [
  { category: 'Food', amount: 3000, month: 9, year: 2026 },
  { category: 'Transport', amount: 1500, month: 9, year: 2026 },
  { category: 'Entertainment', amount: 1200, month: 9, year: 2026 },
  { category: 'Gaming', amount: 1000, month: 9, year: 2026 },
  { category: 'Shopping', amount: 2000, month: 9, year: 2026 }
];

export default function Profile() {
  const { user, logout } = useAuth();
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);

  const handlePopulateDemoData = async () => {
    if (!window.confirm('Populate your account with sample expenses and budgets for development testing?')) {
      return;
    }

    setIsSeeding(true);
    setSeedSuccess(false);

    try {
      // Create budgets
      for (const b of DEMO_BUDGETS) {
        await budgetService.saveBudget(b);
      }
      // Create expenses
      for (const e of DEMO_EXPENSES) {
        await expenseService.createExpense(e);
      }

      setSeedSuccess(true);
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
    } catch (err) {
      alert(`Error populating demo data: ${err.message}`);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#fff' }}>
          User Profile
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
          Manage your account information and preferences.
        </p>
      </div>

      {/* Account Info Card */}
      <div className="card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #ec4899)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.75rem',
            fontWeight: 800,
            color: '#fff',
            boxShadow: '0 6px 20px rgba(99, 102, 241, 0.4)'
          }}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'T'}
          </div>

          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#fff' }}>
              {user?.name}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              TeenSpend Active Member
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '14px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Mail size={18} style={{ color: '#818cf8' }} />
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Email</span>
              <p style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600 }}>{user?.email}</p>
            </div>
          </div>

          <div style={{ padding: '14px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Calendar size={18} style={{ color: '#ec4899' }} />
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Member Since</span>
              <p style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600 }}>
                {user?.created_at ? formatDate(user.created_at) : 'Today'}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="btn btn-secondary"
          style={{ alignSelf: 'flex-start' }}
        >
          <LogOut size={16} />
          <span>Log Out</span>
        </button>
      </div>

      {/* Data Privacy & Security Notice */}
      <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck size={22} style={{ color: '#34d399' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
            Data Privacy Guarantee
          </h3>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          TeenSpend isolates and binds every transaction strictly to your account ID. No other user can view, edit, or delete your expenses or budget targets. Passwords are never stored in plain text and are securely hashed using bcrypt.
        </p>
      </div>

      {/* Optional Development Demo Data Section */}
      <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px', border: '1px dashed rgba(99, 102, 241, 0.4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Database size={20} style={{ color: '#818cf8' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
            Development Demo Data Loader
          </h3>
        </div>

        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Want to test the charts, analytics comparison, and recommendation alerts immediately without having to manually enter 10 expenses? Click below to populate your account with sample teen expenses and budgets.
        </p>

        {seedSuccess && (
          <div className="alert-box alert-box-success" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle size={18} />
            <span>Sample data loaded successfully! Redirecting to dashboard...</span>
          </div>
        )}

        <button
          onClick={handlePopulateDemoData}
          disabled={isSeeding}
          className="btn btn-secondary"
          style={{ alignSelf: 'flex-start' }}
        >
          <Sparkles size={16} />
          <span>{isSeeding ? 'Loading sample data...' : 'Populate Sample Data'}</span>
        </button>
      </div>
    </div>
  );
}
