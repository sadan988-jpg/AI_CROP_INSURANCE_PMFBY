import React from 'react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendPositive,
  colorScheme = 'emerald',
}) => {
  const colorMap = {
    emerald: {
      bg: 'bg-emerald-50 text-emerald-700',
      border: 'border-emerald-100',
      iconBg: 'bg-emerald-100 text-emerald-800',
    },
    blue: {
      bg: 'bg-sky-50 text-sky-700',
      border: 'border-sky-100',
      iconBg: 'bg-sky-100 text-sky-800',
    },
    amber: {
      bg: 'bg-amber-50 text-amber-700',
      border: 'border-amber-100',
      iconBg: 'bg-amber-100 text-amber-800',
    },
    rose: {
      bg: 'bg-rose-50 text-rose-700',
      border: 'border-rose-100',
      iconBg: 'bg-rose-100 text-rose-800',
    },
  };

  const scheme = colorMap[colorScheme] || colorMap.emerald;

  return (
    <div className={`p-5 rounded-xl bg-white border ${scheme.border} shadow-sm transition hover:shadow-md relative overflow-hidden`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-800">{value}</p>
        </div>
        {Icon && (
          <div className={`p-3 rounded-lg ${scheme.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {trend && (
            <span
              className={`font-semibold px-1.5 py-0.5 rounded ${
                trendPositive
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {trend}
            </span>
          )}
          {subtitle && <span className="text-slate-500 truncate">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};

