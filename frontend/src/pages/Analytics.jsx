import React, { useState, useEffect } from 'react';
import analyticsService from '../services/analyticsService';
import SpendingChart from '../components/SpendingChart';
import CategoryChart from '../components/CategoryChart';
import { formatCurrency } from '../utils/currency';
import { getMonthName } from '../utils/date';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Shield,
  Zap,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Info
} from 'lucide-react';

const FILTER_OPTIONS = [
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'last_month', label: 'Last Month' },
  { id: 'year', label: 'This Year' }
];

export default function Analytics() {
  const [period, setPeriod] = useState('month');
  const [summary, setSummary] = useState(null);
  const [timeline, setTimeline] = useState({ dailyTimeline: [], weeklyTimeline: [] });
  const [categoryData, setCategoryData] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      setIsLoading(true);
      try {
        const [sumRes, timeRes, catRes, compRes] = await Promise.all([
          analyticsService.getSummary(period),
          analyticsService.getTimelineAnalytics(period),
          analyticsService.getCategoryAnalytics(period),
          analyticsService.getComparison()
        ]);

        if (sumRes.success) setSummary(sumRes.data);
        if (timeRes.success) setTimeline(timeRes.data);
        if (catRes.success) setCategoryData(catRes.data.categories || []);
        if (compRes.success) setComparison(compRes.data);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadAnalytics();
  }, [period]);

  const indicators = summary?.healthIndicators;

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header & Filter Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#fff' }}>
            Analytics & Insights
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Deep dive into your spending habits, trends, and financial health.
          </p>
        </div>

        <div style={{
          display: 'flex',
          backgroundColor: 'var(--bg-input)',
          padding: '4px',
          borderRadius: '10px',
          border: '1px solid var(--border-color)'
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

      {/* Spending Health Indicators Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={20} style={{ color: '#818cf8' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
            Spending Health Indicators
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '18px' }}>
          {/* Budget Usage */}
          <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Budget Usage
            </span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>
              {indicators?.budgetUsagePercent || 0}%
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Proportion of total set budgets consumed so far this period.
            </p>
          </div>

          {/* Savings Potential */}
          <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Savings Potential
            </span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34d399', fontFamily: "'JetBrains Mono', monospace" }}>
              {formatCurrency(indicators?.savingsPotential || 0)}
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Unspent budget headroom available to save or invest.
            </p>
          </div>

          {/* Spending Consistency */}
          <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Spending Consistency
            </span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fbbf24' }}>
              {indicators?.spendingConsistencyScore || 85} / 100
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              How steady your daily expenditure pattern is over time.
            </p>
          </div>

          {/* Category Concentration */}
          <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Category Concentration
            </span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#818cf8' }}>
              {indicators?.categoryConcentration || 0}%
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Percentage of total expenses dominated by your top category.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          <Info size={14} />
          <span>Note: Health indicators are strictly based on your recorded expenses and do not represent professional financial advice.</span>
        </div>
      </div>

      {/* Main Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
        <SpendingChart
          dailyData={timeline.dailyTimeline || []}
          weeklyData={timeline.weeklyTimeline || []}
        />
        <CategoryChart categoriesData={categoryData} />
      </div>

      {/* Month-to-Month Comparison Section */}
      {comparison && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
                Month-to-Month Comparison
              </h2>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                Comparing {getMonthName(comparison.currentMonth.month)} vs {getMonthName(comparison.previousMonth.month)}
              </p>
            </div>

            {/* Difference Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '999px',
              fontWeight: 700,
              fontSize: '0.875rem',
              backgroundColor: comparison.trend === 'increased' ? 'var(--danger-light)' : comparison.trend === 'decreased' ? 'var(--success-light)' : 'var(--bg-elevated)',
              color: comparison.trend === 'increased' ? '#f87171' : comparison.trend === 'decreased' ? '#34d399' : 'var(--text-secondary)'
            }}>
              {comparison.trend === 'increased' && <ArrowUpRight size={18} />}
              {comparison.trend === 'decreased' && <ArrowDownRight size={18} />}
              {comparison.trend === 'unchanged' && <Minus size={18} />}
              <span>
                {comparison.trend === 'increased' ? `Increased by ${formatCurrency(Math.abs(comparison.difference))}` :
                 comparison.trend === 'decreased' ? `Decreased by ${formatCurrency(Math.abs(comparison.difference))}` :
                 'No change'} ({comparison.percentageChange}%)
              </span>
            </div>
          </div>

          {/* Comparison Metric Columns */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>This Month Total</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
                {formatCurrency(comparison.currentMonth.total)}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {comparison.currentMonth.transactionCount} transactions
              </span>
            </div>

            <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Last Month Total</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#94a3b8', marginTop: '4px' }}>
                {formatCurrency(comparison.previousMonth.total)}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {comparison.previousMonth.transactionCount} transactions
              </span>
            </div>

            <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Avg Transaction (This Month)</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#818cf8', marginTop: '4px' }}>
                {formatCurrency(comparison.currentMonth.averageTransaction)}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                vs {formatCurrency(comparison.previousMonth.averageTransaction)} last month
              </span>
            </div>
          </div>

          {/* Category Breakdown Comparison Table */}
          {comparison.categories && comparison.categories.length > 0 && (
            <div style={{ marginTop: '10px' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>
                Category-by-Category Shift
              </h4>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '10px 12px' }}>Category</th>
                      <th style={{ padding: '10px 12px' }}>{getMonthName(comparison.currentMonth.month)}</th>
                      <th style={{ padding: '10px 12px' }}>{getMonthName(comparison.previousMonth.month)}</th>
                      <th style={{ padding: '10px 12px' }}>Difference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.categories.map(c => (
                      <tr key={c.category} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                        <td style={{ padding: '12px', fontWeight: 600, color: '#fff' }}>{c.category}</td>
                        <td style={{ padding: '12px' }}>{formatCurrency(c.currentMonth)}</td>
                        <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{formatCurrency(c.previousMonth)}</td>
                        <td style={{
                          padding: '12px',
                          fontWeight: 700,
                          color: c.diff > 0 ? '#f87171' : c.diff < 0 ? '#34d399' : 'var(--text-muted)'
                        }}>
                          {c.diff > 0 ? `+${formatCurrency(c.diff)}` : c.diff < 0 ? `-${formatCurrency(Math.abs(c.diff))}` : '₹0'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
