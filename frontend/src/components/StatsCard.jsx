import React from 'react';

export default function StatsCard({ title, value, subtitle, icon: Icon, color = 'primary', badgeText }) {
  const colorMap = {
    primary: {
      bg: 'rgba(99, 102, 241, 0.12)',
      text: '#818cf8',
      border: 'rgba(99, 102, 241, 0.25)'
    },
    success: {
      bg: 'rgba(16, 185, 129, 0.12)',
      text: '#34d399',
      border: 'rgba(16, 185, 129, 0.25)'
    },
    warning: {
      bg: 'rgba(245, 158, 11, 0.12)',
      text: '#fbbf24',
      border: 'rgba(245, 158, 11, 0.25)'
    },
    secondary: {
      bg: 'rgba(236, 72, 153, 0.12)',
      text: '#f472b6',
      border: 'rgba(236, 72, 153, 0.25)'
    },
    info: {
      bg: 'rgba(6, 182, 212, 0.12)',
      text: '#22d3ee',
      border: 'rgba(6, 182, 212, 0.25)'
    }
  };

  const scheme = colorMap[color] || colorMap.primary;

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {title}
        </span>
        {Icon && (
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            backgroundColor: scheme.bg,
            border: `1px solid ${scheme.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: scheme.text
          }}>
            <Icon size={19} />
          </div>
        )}
      </div>

      <div>
        <div style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>
          {value}
        </div>
        {subtitle && (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {subtitle}
          </p>
        )}
      </div>

      {badgeText && (
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          alignSelf: 'flex-start',
          fontSize: '0.75rem',
          fontWeight: 700,
          padding: '2px 8px',
          borderRadius: '999px',
          backgroundColor: scheme.bg,
          color: scheme.text
        }}>
          {badgeText}
        </div>
      )}
    </div>
  );
}
