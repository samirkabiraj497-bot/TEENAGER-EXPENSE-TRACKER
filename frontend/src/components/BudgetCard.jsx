import React from 'react';
import { formatCurrency } from '../utils/currency';
import { ShieldCheck, AlertCircle, AlertTriangle, Flame, Edit2, Trash2 } from 'lucide-react';

export default function BudgetCard({ budget, onEdit, onDelete }) {
  const { category, amount, spent, remaining, percentage, status } = budget;

  // Visual status indicators
  const statusConfig = {
    Safe: {
      badgeClass: 'badge-safe',
      fillClass: 'progress-fill-safe',
      icon: ShieldCheck,
      color: '#34d399',
      label: 'On Track'
    },
    Warning: {
      badgeClass: 'badge-warning',
      fillClass: 'progress-fill-warning',
      icon: AlertCircle,
      color: '#fbbf24',
      label: 'Warning (80%+)'
    },
    'Near limit': {
      badgeClass: 'badge-near_limit',
      fillClass: 'progress-fill-near_limit',
      icon: AlertTriangle,
      color: '#fb923c',
      label: 'Near Limit (90%+)'
    },
    Exceeded: {
      badgeClass: 'badge-exceeded',
      fillClass: 'progress-fill-exceeded',
      icon: Flame,
      color: '#f87171',
      label: 'Exceeded!'
    }
  };

  const currentStatus = statusConfig[status] || statusConfig.Safe;
  const StatusIcon = currentStatus.icon;

  // Clamp percentage for progress bar width
  const progressWidth = Math.min(100, Math.max(0, percentage));

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header: Category & Status Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
            {category}
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Monthly Budget
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className={`badge ${currentStatus.badgeClass}`}>
            <StatusIcon size={13} />
            <span>{currentStatus.label}</span>
          </span>

          {onEdit && (
            <button
              onClick={() => onEdit(budget)}
              className="btn btn-secondary btn-sm"
              title="Edit Budget"
              aria-label="Edit Budget"
              style={{ padding: '6px' }}
            >
              <Edit2 size={14} />
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(budget)}
              className="btn btn-danger btn-sm"
              title="Delete Budget"
              aria-label="Delete Budget"
              style={{ padding: '6px' }}
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Figures */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', fontFamily: "'JetBrains Mono', monospace" }}>
            {formatCurrency(spent)}
          </span>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginLeft: '6px' }}>
            / {formatCurrency(amount)}
          </span>
        </div>
        <span style={{ fontSize: '1.05rem', fontWeight: 800, color: currentStatus.color }}>
          {percentage}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar-container" role="progressbar" aria-valuenow={percentage} aria-valuemin="0" aria-valuemax="100">
        <div
          className={`progress-bar-fill ${currentStatus.fillClass}`}
          style={{ width: `${progressWidth}%` }}
        />
      </div>

      {/* Footer Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
        <span>
          {percentage >= 100 ? (
            <strong style={{ color: '#f87171' }}>Exceeded by {formatCurrency(spent - amount)}</strong>
          ) : (
            <>Remaining: <strong style={{ color: '#fff' }}>{formatCurrency(remaining)}</strong></>
          )}
        </span>
        <span style={{ color: 'var(--text-muted)' }}>
          {percentage < 100 ? `${100 - percentage}% left` : '0% left'}
        </span>
      </div>
    </div>
  );
}
