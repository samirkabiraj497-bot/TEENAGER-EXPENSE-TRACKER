import React, { useState, useEffect } from 'react';
import expenseService from '../services/expenseService';
import { getTodayString } from '../utils/date';
import { Loader2 } from 'lucide-react';

const DEFAULT_CATEGORIES = [
  'Food', 'Transport', 'Education', 'Entertainment', 'Shopping',
  'Gaming', 'Subscriptions', 'Mobile/Data', 'Sports', 'Travel',
  'Personal Care', 'Gifts', 'Other'
];

const PAYMENT_METHODS = ['Cash', 'UPI', 'Debit Card', 'Credit Card', 'Bank Transfer', 'Other'];

export default function ExpenseForm({ initialData = null, onSubmit, isSubmitting = false, onCancel }) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    amount: initialData?.amount || '',
    category: initialData?.category || 'Food',
    description: initialData?.description || '',
    expense_date: initialData?.expense_date || getTodayString(),
    payment_method: initialData?.payment_method || 'UPI'
  });

  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await expenseService.getCategories();
        if (res.success && res.data && res.data.length > 0) {
          setCategories(res.data.map(c => c.name));
        }
      } catch (err) {
        // Fallback to default categories if API fails
      }
    }
    loadCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Please provide an expense title.');
      return;
    }

    const numericAmount = parseFloat(formData.amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please enter a valid amount greater than zero.');
      return;
    }

    onSubmit({
      ...formData,
      amount: numericAmount
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {error && (
        <div className="alert-box alert-box-danger">
          <span>{error}</span>
        </div>
      )}

      {/* Title */}
      <div className="form-group" style={{ margin: 0 }}>
        <label className="form-label" htmlFor="expense-title">
          Expense Title *
        </label>
        <input
          id="expense-title"
          name="title"
          type="text"
          placeholder="e.g. Pizza, Metro pass, Steam game"
          className="form-input"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </div>

      {/* Amount & Category Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" htmlFor="expense-amount">
            Amount (₹) *
          </label>
          <input
            id="expense-amount"
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="e.g. 250"
            className="form-input"
            value={formData.amount}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" htmlFor="expense-category">
            Category *
          </label>
          <select
            id="expense-category"
            name="category"
            className="form-select"
            value={formData.category}
            onChange={handleChange}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Date & Payment Method Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" htmlFor="expense-date">
            Date *
          </label>
          <input
            id="expense-date"
            name="expense_date"
            type="date"
            className="form-input"
            value={formData.expense_date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" htmlFor="expense-payment">
            Payment Method
          </label>
          <select
            id="expense-payment"
            name="payment_method"
            className="form-select"
            value={formData.payment_method}
            onChange={handleChange}
          >
            {PAYMENT_METHODS.map(method => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Description */}
      <div className="form-group" style={{ margin: 0 }}>
        <label className="form-label" htmlFor="expense-description">
          Description (Optional)
        </label>
        <textarea
          id="expense-description"
          name="description"
          placeholder="Add any extra details (e.g. dinner with school friends, birthday gift)"
          className="form-textarea"
          value={formData.description}
          onChange={handleChange}
          rows={3}
        />
      </div>

      {/* Form Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
            disabled={isSubmitting}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
          style={{ minWidth: '140px' }}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <span>{initialData ? 'Update Expense' : 'Save Expense'}</span>
          )}
        </button>
      </div>
    </form>
  );
}
