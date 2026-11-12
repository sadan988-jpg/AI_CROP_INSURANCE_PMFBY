import React from 'react';

export const StatusBadge = ({ status, size = "md" }) => {
  if (!status) return null;

  const getStyle = () => {
    switch (status.toUpperCase()) {
      case 'INSURED':
      case 'ACTIVE':
      case 'RESOLVED':
      case 'SUCCESSFUL':
      case 'APPROVED':
      case 'HEALTHY':
      case 'PASSED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20';
      case 'UNDER_OFFICER_REVIEW':
      case 'UNDER_VERIFICATION':
      case 'UNDER_SCRUTINY':
      case 'PROCESSING':
      case 'SCHEDULED':
      case 'RECOVERING':
        return 'bg-amber-50 text-amber-800 border-amber-200 ring-amber-600/20';
      case 'AFFECTED':
      case 'HIGH':
      case 'SEVERE':
      case 'URGENT':
      case 'REJECTED':
      case 'TAMPER_FLAGGED':
        return 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/20';
      case 'SETTLED_DISBURSED':
        return 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-600/20';
      case 'HARVESTED':
      case 'NORMAL':
      case 'MEDIUM':
        return 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-600/20';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20';
    }
  };

  const formatText = (text) => {
    return text.replace(/_/g, ' ');
  };

  const sizeClasses = size === 'sm' 
    ? 'text-[11px] px-2 py-0.5' 
    : size === 'lg'
    ? 'text-xs px-3 py-1 font-semibold'
    : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ring-1 ring-inset ${getStyle()} ${sizeClasses}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
      {formatText(status)}
    </span>
  );
};

