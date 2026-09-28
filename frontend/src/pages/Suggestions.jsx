import React, { useState, useEffect } from 'react';
import analyticsService from '../services/analyticsService';
import {
  Lightbulb,
  AlertTriangle,
  AlertCircle,
  TrendingUp,
  CheckCircle,
  Coffee,
  Tv,
  Bus,
  Utensils,
  Gamepad2,
  ShoppingBag,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const iconMap = {
  AlertTriangle,
  AlertCircle,
  TrendingUp,
  CheckCircle,
  Coffee,
  Tv,
  Bus,
  Utensils,
  Gamepad2,
  ShoppingBag,
  Lightbulb
};

export default function Suggestions() {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    async function loadSuggestions() {
      setIsLoading(true);
      try {
        const res = await analyticsService.getSuggestions();
        if (res.success && res.data) {
          setSuggestions(res.data);
        }
      } catch (err) {
        console.error('Failed to load suggestions:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSuggestions();
  }, []);

  const filtered = suggestions.filter(s => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'alerts') return s.level === 'danger' || s.level === 'warning';
    if (activeFilter === 'tips') return s.level === 'info' || s.level === 'success';
    return true;
  });

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#fff' }}>
            Smart Spending Suggestions
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Personalized advice computed directly from your real expenses and category limits.
          </p>
        </div>

        {/* Filter Buttons */}
        <div style={{
          display: 'flex',
          backgroundColor: 'var(--bg-input)',
          padding: '4px',
          borderRadius: '10px',
          border: '1px solid var(--border-color)'
        }}>
          <button
            onClick={() => setActiveFilter('all')}
            className={`btn btn-sm ${activeFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '8px', border: 'none', padding: '6px 14px' }}
          >
            All Suggestions ({suggestions.length})
          </button>
          <button
            onClick={() => setActiveFilter('alerts')}
            className={`btn btn-sm ${activeFilter === 'alerts' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '8px', border: 'none', padding: '6px 14px' }}
          >
            Alerts & Warnings
          </button>
          <button
            onClick={() => setActiveFilter('tips')}
            className={`btn btn-sm ${activeFilter === 'tips' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '8px', border: 'none', padding: '6px 14px' }}
          >
            Insights & Habits
          </button>
        </div>
      </div>

      {/* Suggestion Engine Architecture Notice */}
      <div style={{
        padding: '16px 20px',
        backgroundColor: 'rgba(99, 102, 241, 0.08)',
        borderRadius: '14px',
        border: '1px solid rgba(99, 102, 241, 0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <Sparkles size={22} style={{ color: '#818cf8', flexShrink: 0 }} />
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
          <strong style={{ color: '#fff' }}>Rule-Based Intelligence:</strong> Every suggestion below is produced dynamically by our recommendation engine by inspecting your transaction frequency, category concentration, and budget usage.
        </p>
      </div>

      {/* Suggestions Cards List */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ height: '140px' }} className="skeleton" />
          <div style={{ height: '140px' }} className="skeleton" />
          <div style={{ height: '140px' }} className="skeleton" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card empty-state">
          <span className="empty-state-icon">✨</span>
          <h4 className="empty-state-title">No suggestions in this category</h4>
          <p className="empty-state-desc">
            All your spending is within reasonable limits and no critical threshold warnings were triggered.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filtered.map((item, idx) => {
            const Icon = iconMap[item.icon] || Lightbulb;
            const isDanger = item.level === 'danger';
            const isWarning = item.level === 'warning';
            const isSuccess = item.level === 'success';

            const cardBorder = isDanger ? 'rgba(239, 68, 68, 0.35)' :
                               isWarning ? 'rgba(245, 158, 11, 0.35)' :
                               isSuccess ? 'rgba(16, 185, 129, 0.35)' : 'var(--border-color)';

            const iconBg = isDanger ? 'var(--danger-light)' :
                           isWarning ? 'var(--warning-light)' :
                           isSuccess ? 'var(--success-light)' : 'rgba(99, 102, 241, 0.15)';

            const iconColor = isDanger ? '#f87171' :
                              isWarning ? '#fbbf24' :
                              isSuccess ? '#34d399' : '#818cf8';

            return (
              <div
                key={item.id || idx}
                className="card"
                style={{
                  border: `1px solid ${cardBorder}`,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '20px',
                  padding: '24px'
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  backgroundColor: iconBg,
                  color: iconColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Icon size={24} />
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>
                      {item.title}
                    </h3>
                    {item.category && (
                      <span className="badge badge-category">
                        {item.category}
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {item.message}
                  </p>

                  {item.actionable && (
                    <div style={{
                      marginTop: '8px',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.85rem'
                    }}>
                      <span style={{ color: '#818cf8', fontWeight: 700 }}>Recommended Action:</span>
                      <span style={{ color: '#e2e8f0' }}>{item.actionable}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
