import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { formatCurrency, formatCompactCurrency } from '../utils/currency';

export default function SpendingChart({ dailyData = [], weeklyData = [] }) {
  const [viewMode, setViewMode] = useState('daily'); // 'daily' or 'weekly'

  const activeData = viewMode === 'daily' ? dailyData : weeklyData;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: '#1f293d',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '10px',
          padding: '10px 14px',
          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.5)'
        }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            {payload[0].payload.label || label}
          </p>
          <p style={{ fontSize: '1.05rem', fontWeight: 800, color: '#a5b4fc', fontFamily: "'JetBrains Mono', monospace" }}>
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>
            Spending Over Time
          </h3>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
            Track how your money moves day by day
          </p>
        </div>

        <div style={{ display: 'flex', backgroundColor: 'var(--bg-input)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setViewMode('daily')}
            className={`btn btn-sm ${viewMode === 'daily' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '6px', border: 'none', padding: '5px 12px' }}
          >
            Daily
          </button>
          <button
            onClick={() => setViewMode('weekly')}
            className={`btn btn-sm ${viewMode === 'weekly' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '6px', border: 'none', padding: '5px 12px' }}
          >
            Weekly
          </button>
        </div>
      </div>

      <div style={{ width: '100%', height: '280px' }}>
        {activeData.length === 0 ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            No spending activity recorded for this period.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activeData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" vertical={false} />
              <XAxis
                dataKey={viewMode === 'daily' ? 'label' : 'name'}
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => formatCompactCurrency(val)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#818cf8"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#spendingGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
