import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import expenseService from '../services/expenseService';
import ExpenseForm from '../components/ExpenseForm';
import { Sparkles, ArrowLeft, CheckCircle2 } from 'lucide-react';

const QUICK_PRESETS = [
  { title: 'Pizza with friends', amount: 250, category: 'Food', payment_method: 'UPI' },
  { title: 'Local Bus / Metro', amount: 40, category: 'Transport', payment_method: 'Cash' },
  { title: 'Notebooks & Pens', amount: 150, category: 'Education', payment_method: 'UPI' },
  { title: 'Weekend Movie Ticket', amount: 350, category: 'Entertainment', payment_method: 'Debit Card' },
  { title: 'Mobile Data Pack', amount: 199, category: 'Mobile/Data', payment_method: 'UPI' },
  { title: 'Steam Video Game', amount: 499, category: 'Gaming', payment_method: 'UPI' }
];

export default function AddExpense() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [presetData, setPresetData] = useState(null);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setSuccessMessage('');

    try {
      const res = await expenseService.createExpense(formData);
      if (res.success) {
        setSuccessMessage('🎉 Expense added successfully!');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1200);
      }
    } catch (err) {
      alert(`Error adding expense: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplyPreset = (preset) => {
    setPresetData({
      ...preset,
      description: `Quick log: ${preset.title}`
    });
  };

  return (
    <div className="page-container" style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Back button and page title */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-secondary btn-sm"
          style={{ marginBottom: '12px' }}
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#fff' }}>
          Add New Expense
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
          Record where your money went so you never lose track.
        </p>
      </div>

      {/* Quick Teen Presets */}
      <div className="card" style={{ padding: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Sparkles size={17} style={{ color: '#818cf8' }} />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>
            Quick Teen Presets (Click to autofill):
          </span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {QUICK_PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className="btn btn-secondary btn-sm"
              style={{
                fontSize: '0.8rem',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              <span>{p.title}</span>
              <strong style={{ color: '#a5b4fc', marginLeft: '4px' }}>₹{p.amount}</strong>
            </button>
          ))}
        </div>
      </div>

      {/* Main Expense Form Card */}
      <div className="card" style={{ padding: '32px' }}>
        {successMessage && (
          <div className="alert-box alert-box-success" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 size={18} />
            <span style={{ fontWeight: 600 }}>{successMessage} Redirecting to dashboard...</span>
          </div>
        )}

        <ExpenseForm
          key={presetData ? JSON.stringify(presetData) : 'default'}
          initialData={presetData}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          onCancel={() => navigate('/dashboard')}
        />
      </div>
    </div>
  );
}
