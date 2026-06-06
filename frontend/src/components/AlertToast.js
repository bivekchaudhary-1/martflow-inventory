/**
 * AlertToast
 * ----------
 * Renders a stack of live low-stock alert toasts in the bottom-right corner.
 * Each toast auto-dismisses after 8 seconds.
 */

import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

function Toast({ alert, onDismiss }) {
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => onDismiss(alert.item_id), 8000);
    return () => clearTimeout(timerRef.current);
  }, [alert.item_id, onDismiss]);

  const urgency = alert.stock_count === 0
    ? { bar: 'bg-rose-500',   ring: 'border-rose-500/30',   label: 'Out of Stock', dot: 'bg-rose-400' }
    : { bar: 'bg-amber-500',  ring: 'border-amber-500/30',  label: 'Low Stock',    dot: 'bg-amber-400' };

  return (
    <div className={`relative w-80 bg-slate-900 border ${urgency.ring} rounded-2xl shadow-2xl shadow-slate-950/60 overflow-hidden`}>
      {/* Countdown bar */}
      <div className={`absolute top-0 left-0 h-0.5 ${urgency.bar} animate-[shrink_8s_linear_forwards]`}
        style={{ width: '100%' }}
      />

      <div className="p-4 flex items-start gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
          alert.stock_count === 0 ? 'bg-rose-500/15' : 'bg-amber-500/15'
        }`}>
          <svg className={`w-4 h-4 ${alert.stock_count === 0 ? 'text-rose-400' : 'text-amber-400'}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`inline-flex items-center gap-1 text-xs font-semibold ${
              alert.stock_count === 0 ? 'text-rose-300' : 'text-amber-300'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${urgency.dot} animate-pulse`} />
              {urgency.label}
            </span>
          </div>
          <p className="text-sm font-medium text-slate-100 truncate">{alert.item_name}</p>
          <p className="text-xs text-slate-500 mt-0.5">
            {alert.stock_count === 0
              ? 'No units remaining'
              : `${alert.stock_count} unit${alert.stock_count !== 1 ? 's' : ''} left`}
            {alert.location ? ` · ${alert.location}` : ''}
          </p>
          <Link
            to={`/inventory/${alert.item_id}`}
            className="inline-block mt-2 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
            onClick={() => onDismiss(alert.item_id)}
          >
            View item →
          </Link>
        </div>

        {/* Dismiss */}
        <button
          onClick={() => onDismiss(alert.item_id)}
          className="flex-shrink-0 text-slate-600 hover:text-slate-400 transition-colors -mt-0.5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function AlertToast({ alerts, onDismiss }) {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {alerts.slice(0, 4).map((alert) => (
        <div key={alert.item_id} className="pointer-events-auto">
          <Toast alert={alert} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}
