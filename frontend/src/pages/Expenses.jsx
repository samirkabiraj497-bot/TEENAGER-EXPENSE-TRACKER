import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import expenseService from '../services/expenseService';
import ExpenseCard from '../components/ExpenseCard';
import ExpenseForm from '../components/ExpenseForm';
import { formatCurrency } from '../utils/currency';
import {
  Search,
  Filter,
  ArrowUpDown,
  PlusCircle,
  AlertTriangle,
  Receipt,
  X
} from 'lucide-react';

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Sorting state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOption, setSortOption] = useState('newest');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Modal states
  const [expenseToEdit, setExpenseToEdit] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchExpenses = async () => {
    setIsLoading(true);
    try {
      const params = {
        page,
        limit: 15,
        sort: sortOption
      };
      if (selectedCategory && selectedCategory !== 'All') params.category = selectedCategory;
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;

      const res = await expenseService.getExpenses(params);
      if (res.success && res.data) {
        setExpenses(res.data.expenses);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch expenses:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await expenseService.getCategories();
        if (res.success && res.data) {
          setCategories(res.data.map(c => c.name));
        }
      } catch (err) {
        // fallback
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [selectedCategory, sortOption, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchExpenses();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSortOption('newest');
    setFromDate('');
    setToDate('');
    setPage(1);
  };

  const handleUpdateExpense = async (formData) => {
    if (!expenseToEdit) return;
    setIsUpdating(true);
    try {
      const res = await expenseService.updateExpense(expenseToEdit.id, formData);
      if (res.success) {
        setExpenseToEdit(null);
        await fetchExpenses();
      }
    } catch (err) {
      alert(`Error updating expense: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteExpense = async () => {
    if (!expenseToDelete) return;
    setIsDeleting(true);
    try {
      await expenseService.deleteExpense(expenseToDelete.id);
      setExpenseToDelete(null);
      await fetchExpenses();
    } catch (err) {
      alert(`Error deleting expense: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#fff' }}>
            Expenses
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Track, filter, and manage every single rupee you spend.
          </p>
        </div>

        <Link to="/add-expense" className="btn btn-primary">
          <PlusCircle size={18} />
          <span>Add Expense</span>
        </Link>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search expenses by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
            <Search
              size={18}
              style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
            />
          </div>

          <button type="submit" className="btn btn-secondary">
            Search
          </button>
        </form>

        {/* Filter Controls Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Category Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Category:
              </span>
              <select
                className="form-select"
                style={{ width: 'auto', padding: '8px 12px', fontSize: '0.85rem' }}
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
              >
                <option value="All">All Categories</option>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Sort:
              </span>
              <select
                className="form-select"
                style={{ width: 'auto', padding: '8px 12px', fontSize: '0.85rem' }}
                value={sortOption}
                onChange={(e) => {
                  setSortOption(e.target.value);
                  setPage(1);
                }}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Amount</option>
                <option value="lowest">Lowest Amount</option>
              </select>
            </div>

            {/* Date Range Inputs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="date"
                className="form-input"
                style={{ width: 'auto', padding: '6px 10px', fontSize: '0.825rem' }}
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                placeholder="From"
              />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>to</span>
              <input
                type="date"
                className="form-input"
                style={{ width: 'auto', padding: '6px 10px', fontSize: '0.825rem' }}
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                placeholder="To"
              />
              <button
                type="button"
                onClick={() => { setPage(1); fetchExpenses(); }}
                className="btn btn-secondary btn-sm"
              >
                Filter Date
              </button>
            </div>
          </div>

          {(searchTerm || selectedCategory !== 'All' || fromDate || toDate) && (
            <button
              onClick={clearFilters}
              className="btn btn-secondary btn-sm"
              style={{ color: '#fca5a5' }}
            >
              <X size={14} />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Expense List Content */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ height: '70px' }} className="skeleton" />
          <div style={{ height: '70px' }} className="skeleton" />
          <div style={{ height: '70px' }} className="skeleton" />
        </div>
      ) : expenses.length === 0 ? (
        <div className="card empty-state">
          <span className="empty-state-icon">📋</span>
          <h4 className="empty-state-title">No expenses match your filters</h4>
          <p className="empty-state-desc">
            Try adjusting your search criteria, or add a brand new expense entry.
          </p>
          <Link to="/add-expense" className="btn btn-primary">
            <PlusCircle size={18} />
            <span>+ Add Expense</span>
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', padding: '0 4px' }}>
            <span>Showing {expenses.length} of {pagination.total} expenses</span>
            <span>Page {pagination.page} of {pagination.totalPages}</span>
          </div>

          {expenses.map(expense => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              onEdit={(e) => setExpenseToEdit(e)}
              onDelete={(e) => setExpenseToDelete(e)}
            />
          ))}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '16px' }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="btn btn-secondary btn-sm"
                disabled={page <= 1}
              >
                Previous
              </button>
              <span style={{ display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                className="btn btn-secondary btn-sm"
                disabled={page >= pagination.totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Edit Expense Modal */}
      {expenseToEdit && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
                Edit Expense
              </h3>
              <button
                onClick={() => setExpenseToEdit(null)}
                className="btn btn-secondary btn-sm"
                style={{ padding: '6px' }}
              >
                <X size={16} />
              </button>
            </div>

            <ExpenseForm
              initialData={expenseToEdit}
              onSubmit={handleUpdateExpense}
              isSubmitting={isUpdating}
              onCancel={() => setExpenseToEdit(null)}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {expenseToDelete && (
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
                  Delete this expense?
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <p style={{ fontSize: '0.925rem', color: 'var(--text-primary)', marginBottom: '24px', padding: '12px', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '8px' }}>
              <strong>{expenseToDelete.title}</strong> — {formatCurrency(expenseToDelete.amount)} ({expenseToDelete.category})
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setExpenseToDelete(null)}
                className="btn btn-secondary"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteExpense}
                className="btn btn-danger"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
