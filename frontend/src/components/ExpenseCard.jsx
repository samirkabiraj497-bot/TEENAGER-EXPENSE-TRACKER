import React from 'react';
import { formatCurrency } from '../utils/currency';
import { formatDate } from '../utils/date';
import {
  Utensils,
  Bus,
  BookOpen,
  Film,
  ShoppingBag,
  Gamepad2,
  Tv,
  Smartphone,
  Dumbbell,
  Plane,
  Sparkles,
  Gift,
  Tag,
  CreditCard,
  Edit2,
  Trash2
} from 'lucide-react';

const categoryIcons = {
  Food: Utensils,
  Transport: Bus,
  Education: BookOpen,
  Entertainment: Film,
  Shopping: ShoppingBag,
  Gaming: Gamepad2,
  Subscriptions: Tv,
  'Mobile/Data': Smartphone,
  Sports: Dumbbell,
  Travel: Plane,
  'Personal Care': Sparkles,
  Gifts: Gift,
  Other: Tag
};

export default function ExpenseCard({ expense, onEdit, onDelete }) {
  const IconComponent = categoryIcons[expense.category] || Tag;

  return (
    <div
      className="card"
      style={{
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        transition: 'all 0.2s ease'
      }}
    >
      {/* Left: Icon & Details */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0 }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          backgroundColor: 'rgba(99, 102, 241, 0.12)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#818cf8',
          flexShrink: 0
        }}>
          <IconComponent size={22} />
        </div>

        <div style={{ minWidth: 0 }}>
          <h4 style={{
            fontSize: '1rem',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            color: '#fff'
          }}>
            {expense.title}
          </h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {formatDate(expense.expense_date)}
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>•</span>
            <span className="badge badge-category">
              {expense.category}
            </span>
            {expense.payment_method && (
              <span style={{
                fontSize: '0.725rem',
                color: 'var(--text-muted)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                padding: '2px 8px',
                borderRadius: '6px'
              }}>
                {expense.payment_method}
              </span>
            )}
          </div>
          {expense.description && (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', fontStyle: 'italic' }}>
              {expense.description}
            </p>
          )}
        </div>
      </div>

      {/* Right: Amount & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
        <span style={{
          fontSize: '1.25rem',
          fontWeight: 800,
          color: '#f8fafc',
          fontFamily: "'JetBrains Mono', monospace"
        }}>
          {formatCurrency(expense.amount)}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {onEdit && (
            <button
              onClick={() => onEdit(expense)}
              className="btn btn-secondary btn-sm"
              title="Edit Expense"
              aria-label="Edit Expense"
              style={{ padding: '8px' }}
            >
              <Edit2 size={15} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(expense)}
              className="btn btn-danger btn-sm"
              title="Delete Expense"
              aria-label="Delete Expense"
              style={{ padding: '8px' }}
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
