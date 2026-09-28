import React, { useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { formatCurrency, formatCompactCurrency } from '../utils/currency';
import { PieChart as PieIcon, BarChart2 } from 'lucide-react';

const COLORS = [
  '#6366f1', // Indigo
  '#ec4899', // Pink
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#06b6d4', // Cyan
  '#8b5cf6', // Purple
  '#f43f5e', // Rose
  '#3b82f6', // Blue
  '#14b8a6', // Teal
  '#a855f7'  // Violet
];

export default function CategoryChart({ categoriesData = [] }) {
  const [chartType, setChartType] = useState('pie'); // 'pie' or 'bar'

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          backgroundColor: '#1f293d',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '10px',
          padding: '10px 14px',
          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.5)'
        }}>
          <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>
            {data.category}
          </p>
          <p style={{ fontSize: '1rem', fontWeight: 800, color: '#818cf8', fontFamily: "'JetBrains Mono', monospace" }}>
            {formatCurrency(data.total)}
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {data.percentage}% of spending ({data.count} items)
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: '#1f293d',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '10px',
          padding: '10px 14px',
          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.5)'
        }}>
          <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>
            {label}
          </p>
          <p style={{ fontSize: '1rem', fontWeight: 800, color: '#818cf8', fontFamily: "'JetBrains Mono', monospace" }}>
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
            Category Breakdown
          </h3>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
            Where your pocket money goes
          </p>
        </div>

        <div style={{ display: 'flex', backgroundColor: 'var(--bg-input)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setChartType('pie')}
            className={`btn btn-sm ${chartType === 'pie' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '6px', border: 'none', padding: '5px 10px' }}
            title="Donut Chart"
          >
            <PieIcon size={16} />
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`btn btn-sm ${chartType === 'bar' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '6px', border: 'none', padding: '5px 10px' }}
            title="Bar Chart"
          >
            <BarChart2 size={16} />
          </button>
        </div>
      </div>

      <div style={{ width: '100%', height: '280px' }}>
        {categoriesData.length === 0 ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            No category spending recorded yet.
          </div>
        ) : chartType === 'pie' ? (
          <div style={{ display: 'flex', height: '100%', alignItems: 'center' }}>
            <div style={{ flex: 1, height: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoriesData}
                    dataKey="total"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                  >
                    {categoriesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Custom Legend */}
            <div style={{
              width: '140px',
              maxHeight: '260px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              paddingRight: '6px'
            }}>
              {categoriesData.slice(0, 6).map((cat, index) => (
                <div key={cat.category} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                  <span style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '3px',
                    backgroundColor: COLORS[index % COLORS.length],
                    flexShrink: 0
                  }} />
                  <span style={{
                    color: 'var(--text-secondary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {cat.category} ({cat.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoriesData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" vertical={false} />
              <XAxis
                dataKey="category"
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
              <Tooltip content={<CustomBarTooltip />} />
              <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                {categoriesData.map((entry, index) => (
                  <Cell key={`bar-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
