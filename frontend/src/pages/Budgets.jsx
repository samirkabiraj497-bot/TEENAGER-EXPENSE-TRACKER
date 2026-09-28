import React, { useState, useEffect } from 'react';
import budgetService from '../services/budgetService';
import expenseService from '../services/expenseService';
import BudgetCard from '../components/BudgetCard';
import { formatCurrency } from '../utils/currency';
import { getMonthName, getCurrentMonthAndYear } from '../utils/date';
import {
  PiggyBank,
  PlusCircle,
  AlertTriangle,
  Flame,
  CheckCircle,
  X,
  Loader2
} from 'lucide-react';

const DEFAULT_CATEGORIES = [
  'Food', 'Transport', 'Education', 'Entertainment', 'Shopping',
  'Gaming', 'Subscriptions', 'Mobile/Data', 'Sports', 'Travel',
  'Personal Care', 'Gifts', 'Other'
];

export default function Budgets() {
  const currentPeriod = getCurrentMonthAndYear();
  const [selectedMonth, setSelectedMonth] = useState(currentPeriod.month);
  const [selectedYear, setSelectedYear] = useState(currentPeriod.year);

  const [budgetData, setBudgetData] = useState(null);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [budgetToEdit, setBudgetToEdit] = useState(null);
  const [budgetToDelete, setBudgetToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formCategory, setFormCategory] = useState('Food');
  const [formAmount, setFormAmount] = useState('');
  const [formError, setFormError] = useState('');

  const fetchBudgets = async () => {
    setIsLoading(true);
    try {
      const res = await budgetService.getBudgets(selectedMonth, selectedYear);
      if (res.success && res.data) {
        setBudgetData(res.data);
      }
    } catch (err) {
      console.error('Failed to load budgets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    async function loadCats() {
      try {
        const res = await expenseService.getCategories();
        if (res.success && res.data) {
          setCategories(res.data.map(c => c.name));
        }
      } catch (e) {}
    }
    loadCats();
  }, []);

  useEffect(() => {
    fetchBudgets();
  }, [selectedMonth, selectedYear]);

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    setFormError('');

    const numericAmount = parseFloat(formAmount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setFormError('Please enter a valid positive budget amount.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await budgetService.saveBudget({
        category: formCategory,
        amount: numericAmount,
        month: selectedMonth,
        year: selectedYear
      });

      if (res.success) {
        setShowAddModal(false);
        setBudgetToEdit(null);
        setFormAmount('');
        await fetchBudgets();
      }
    } catch (err) {
      setFormError(err.message || 'Error saving budget.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (budget) => {
    setBudgetToEdit(budget);
    setFormCategory(budget.category);
    setFormAmount(budget.amount);
    setFormError('');
    setShowAddModal(true);
  };

  const handleDeleteBudget = async () => {
    if (!budgetToDelete) return;
    setIsSubmitting(true);
    try {
      await budgetService.deleteBudget(budgetToDelete.id);
      setBudgetToDelete(null);
      await fetchBudgets();
    } catch (err) {
      alert(`Error deleting budget: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeAlerts = budgetData?.budgets?.filter(b => b.percentage >= 80) || [];

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Page Header with Month/Year Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#fff' }}>
            Budgets
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Set category limits, prevent overspending, and grow your savings.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Month Selector */}
          <select
            className="form-select"
            style={{ width: 'auto', padding: '8px 14px' }}
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>{getMonthName(m)}</option>
            ))}
          </select>

          {/* Year Selector */}
          <select
            className="form-select"
            style={{ width: 'auto', padding: '8px 14px' }}
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
          >
            {[2024, 2025, 2026, 2027].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <button
            onClick={() => {
              setBudgetToEdit(null);
              setFormCategory(categories[0] || 'Food');
              setFormAmount('');
              setFormError('');
              setShowAddModal(true);
            }}
            className="btn btn-primary"
          >
            <PlusCircle size={18} />
            <span>Set Budget</span>
          </button>
        </div>
      </div>

      {/* Critical Alert Banners if any budget warning or exceeded */}
      {activeAlerts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {activeAlerts.map(alert => (
            <div
              key={alert.id || alert.category}
              className={`alert-box ${alert.percentage >= 100 ? 'alert-box-danger' : 'alert-box-warning'}`}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {alert.percentage >= 100 ? <Flame size={20} /> : <AlertTriangle size={20} />}
                <span>
                  <strong>{alert.percentage >= 100 ? 'Budget Exceeded:' : 'Budget Alert:'}</strong> You have used {alert.percentage}% of your <strong>{alert.category}</strong> budget ({formatCurrency(alert.spent)} / {formatCurrency(alert.amount)}).
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Budgeted</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', fontFamily: "'JetBrains Mono', monospace" }}>
            {formatCurrency(budgetData?.totalBudget || 0)}
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            For {getMonthName(selectedMonth)} {selectedYear}
          </span>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Spent in Budgets</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f87171', fontFamily: "'JetBrains Mono', monospace" }}>
            {formatCurrency(budgetData?.totalSpentInBudgets || 0)}
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Across {budgetData?.budgets?.length || 0} active categories
          </span>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Remaining</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34d399', fontFamily: "'JetBrains Mono', monospace" }}>
            {formatCurrency(budgetData?.totalRemaining || 0)}
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Available cushion for the month
          </span>
        </div>
      </div>

      {/* Budgets Grid */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          <div style={{ height: '180px' }} className="skeleton" />
          <div style={{ height: '180px' }} className="skeleton" />
          <div style={{ height: '180px' }} className="skeleton" />
        </div>
      ) : !budgetData?.budgets || budgetData.budgets.length === 0 ? (
        <div className="card empty-state">
          <span className="empty-state-icon">🎯</span>
          <h4 className="empty-state-title">No budgets set for {getMonthName(selectedMonth)} {selectedYear}</h4>
          <p className="empty-state-desc">
            Setting monthly budgets is the single best habit to stop asking "where did all my money go?".
          </p>
          <button
            onClick={() => {
              setBudgetToEdit(null);
              setFormCategory('Food');
              setFormAmount('2500');
              setShowAddModal(true);
            }}
            className="btn btn-primary"
          >
            <PlusCircle size={18} />
            <span>Create First Budget</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {budgetData.budgets.map(budget => (
            <BudgetCard
              key={budget.id || budget.category}
              budget={budget}
              onEdit={handleOpenEdit}
              onDelete={(b) => setBudgetToDelete(b)}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Budget Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
                {budgetToEdit ? 'Edit Budget' : 'Set Category Budget'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="btn btn-secondary btn-sm"
                style={{ padding: '6px' }}
              >
                <X size={16} />
              </button>
            </div>

            {formError && (
              <div className="alert-box alert-box-danger">
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveBudget} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" htmlFor="budget-category">
                  Category *
                </label>
                <select
                  id="budget-category"
                  className="form-select"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  disabled={Boolean(budgetToEdit)}
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {budgetToEdit && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Category cannot be changed during edit. Create a new budget for a different category.
                  </p>
                )}
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" htmlFor="budget-amount">
                  Monthly Limit (₹) *
                </label>
                <input
                  id="budget-amount"
                  type="number"
                  step="1"
                  min="1"
                  className="form-input"
                  placeholder="e.g. 2500"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  required
                />
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', padding: '10px 14px', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '8px' }}>
                Applies to: <strong>{getMonthName(selectedMonth)} {selectedYear}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-secondary"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Budget</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {budgetToDelete && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'var(--danger-light)',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <AlertTriangle size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>
                  Delete {budgetToDelete.category} Budget?
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  This will remove the monthly cap for {budgetToDelete.category}.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
              <button
                onClick={() => setBudgetToDelete(null)}
                className="btn btn-secondary"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBudget}
                className="btn btn-danger"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Deleting...' : 'Delete Budget'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
