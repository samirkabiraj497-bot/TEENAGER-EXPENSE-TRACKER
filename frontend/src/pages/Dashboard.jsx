import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import analyticsService from '../services/analyticsService';
import expenseService from '../services/expenseService';
import budgetService from '../services/budgetService';
import StatsCard from '../components/StatsCard';
import SpendingChart from '../components/SpendingChart';
import CategoryChart from '../components/CategoryChart';
import ExpenseCard from '../components/ExpenseCard';
import BudgetCard from '../components/BudgetCard';
import { formatCurrency } from '../utils/currency';
import {
  Wallet,
  Calendar,
  TrendingDown,
  PiggyBank,
  Award,
  Lightbulb,
  PlusCircle,
  ArrowRight,
  Filter,
  AlertTriangle
} from 'lucide-react';

const FILTER_OPTIONS = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'last_month', label: 'Last Month' },
  { id: 'year', label: 'This Year' }
];

export default function Dashboard() {
  const { user } = useAuth();

  const [period, setPeriod] = useState('month');
  const [summary, setSummary] = useState(null);
  const [timeline, setTimeline] = useState({ dailyTimeline: [], weeklyTimeline: [] });
  const [categoryData, setCategoryData] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Delete modal state
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Time-based dynamic greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [sumRes, timeRes, catRes, budRes, sugRes, expRes] = await Promise.all([
        analyticsService.getSummary(period),
        analyticsService.getTimelineAnalytics(period),
        analyticsService.getCategoryAnalytics(period),
        budgetService.getBudgets(),
        analyticsService.getSuggestions(),
        expenseService.getExpenses({ limit: 5, sort: 'newest' })
      ]);

      if (sumRes.success) setSummary(sumRes.data);
      if (timeRes.success) setTimeline(timeRes.data);
      if (catRes.success) setCategoryData(catRes.data.categories || []);
      if (budRes.success) setBudgets(budRes.data.budgets || []);
      if (sugRes.success) setSuggestions(sugRes.data || []);
      if (expRes.success) setRecentExpenses(expRes.data.expenses || []);
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [period]);

  const confirmDeleteExpense = async () => {
    if (!expenseToDelete) return;
    setIsDeleting(true);
    try {
      await expenseService.deleteExpense(expenseToDelete.id);
      setExpenseToDelete(null);
      await loadDashboardData();
    } catch (err) {
      alert(`Error deleting expense: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading && !summary) {
    return (
      <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ height: '70px' }} className="skeleton" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          <div style={{ height: '120px' }} className="skeleton" />
          <div style={{ height: '120px' }} className="skeleton" />
          <div style={{ height: '120px' }} className="skeleton" />
          <div style={{ height: '120px' }} className="skeleton" />
        </div>
        <div style={{ height: '320px' }} className="skeleton" />
      </div>
    );
  }

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Top Greeting & Period Filter */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#fff' }}>
            {getGreeting()}, {user?.name || 'Friend'} 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.95rem' }}>
            Here's how your money is doing.
          </p>
        </div>

        {/* Time Filters */}
        <div style={{
          display: 'flex',
          backgroundColor: 'var(--bg-input)',
          padding: '4px',
          borderRadius: '10px',
          border: '1px solid var(--border-color)',
          flexWrap: 'wrap'
        }}>
          {FILTER_OPTIONS.map(opt => (
            <button
              key={opt.id}
              onClick={() => setPeriod(opt.id)}
              className={`btn btn-sm ${period === opt.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                borderRadius: '8px',
                border: 'none',
                padding: '6px 14px',
                fontSize: '0.825rem'
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Tiles Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <StatsCard
          title={`Total Spent (${summary?.period || 'This Month'})`}
          value={formatCurrency(summary?.totalSpent || 0)}
          subtitle={`${summary?.transactionCount || 0} transactions logged`}
          icon={Wallet}
          color="primary"
        />

        <StatsCard
          title="Today's Spending"
          value={formatCurrency(summary?.todaySpent || 0)}
          subtitle="Spent in the last 24 hours"
          icon={Calendar}
          color="secondary"
        />

        <StatsCard
          title="Avg Daily Spending"
          value={formatCurrency(summary?.averageDailySpending || 0)}
          subtitle="Estimated burn rate per day"
          icon={TrendingDown}
          color="warning"
        />

        <StatsCard
          title="Remaining Budget"
          value={formatCurrency(summary?.remainingBudget || 0)}
          subtitle={summary?.totalBudget > 0 ? `of ${formatCurrency(summary?.totalBudget)} set limit` : 'No budget set yet'}
          icon={PiggyBank}
          color="success"
        />

        <StatsCard
          title="Top Category"
          value={summary?.topCategory?.category || 'None'}
          subtitle={summary?.topCategory ? `${summary.topCategory.percentage}% of total spending` : 'No expenses recorded'}
          icon={Award}
          color="info"
        />
      </div>

      {/* Main Charts Grid: Spending Timeline + Category Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        <SpendingChart
          dailyData={timeline.dailyTimeline || []}
          weeklyData={timeline.weeklyTimeline || []}
        />
        <CategoryChart categoriesData={categoryData} />
      </div>

      {/* Two Column Section: Budget Progress & Smart Suggestions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* Budget Progress Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>
                Budget Limits
              </h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                Monthly category caps
              </p>
            </div>
            <Link to="/budgets" className="btn btn-secondary btn-sm">
              Manage Budgets
            </Link>
          </div>

          {budgets.length === 0 ? (
            <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '0.9rem', marginBottom: '12px' }}>You haven't set any budgets for this month.</p>
              <Link to="/budgets" className="btn btn-primary btn-sm">
                + Set First Budget
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {budgets.slice(0, 4).map(b => (
                <div key={b.id || b.category} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 600, color: '#fff' }}>{b.category}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {formatCurrency(b.spent)} / {formatCurrency(b.amount)} ({b.percentage}%)
                    </span>
                  </div>
                  <div className="progress-bar-container">
                    <div
                      className={`progress-bar-fill ${
                        b.status === 'Exceeded' ? 'progress-fill-exceeded' :
                        b.status === 'Near limit' ? 'progress-fill-near_limit' :
                        b.status === 'Warning' ? 'progress-fill-warning' : 'progress-fill-safe'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, b.percentage))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Smart Suggestions Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                color: '#fbbf24',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Lightbulb size={18} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>
                Smart Spending Tips
              </h3>
            </div>
            <Link to="/suggestions" className="btn btn-secondary btn-sm">
              View All
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {suggestions.slice(0, 3).map((sug, idx) => (
              <div
                key={sug.id || idx}
                style={{
                  padding: '14px 16px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>
                  {sug.title}
                </div>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                  {sug.message}
                </p>
                {sug.actionable && (
                  <span style={{ fontSize: '0.775rem', color: '#818cf8', fontWeight: 600 }}>
                    👉 {sug.actionable}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Expenses List */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>
              Recent Expenses
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              Your latest purchases and expenditures
            </p>
          </div>
          <Link to="/expenses" className="btn btn-secondary btn-sm">
            <span>View All Expenses</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {recentExpenses.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">🎉</span>
            <h4 className="empty-state-title">No expenses yet!</h4>
            <p className="empty-state-desc">
              Start tracking your first expense and we'll help you understand where your money goes.
            </p>
            <Link to="/add-expense" className="btn btn-primary">
              <PlusCircle size={18} />
              <span>+ Add Expense</span>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentExpenses.map(exp => (
              <ExpenseCard
                key={exp.id}
                expense={exp}
                onDelete={(e) => setExpenseToDelete(e)}
              />
            ))}
          </div>
        )}
      </div>

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
                onClick={confirmDeleteExpense}
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
