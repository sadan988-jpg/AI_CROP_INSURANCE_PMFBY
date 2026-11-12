import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  CloudRain,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  FileCheck2,
} from 'lucide-react';

export const FarmerNotifications = () => {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useApp();

  const farmerNotifs = notifications.filter((n) => n.role === 'FARMER');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Agro-Weather Advisories & Claim Notifications
          </h1>
          <p className="text-xs text-slate-500">
            Real-time IMD meteorological warnings, policy updates, and insurance processing alerts
          </p>
        </div>
        <div>
          <button
            type="button"
            onClick={() => markAllNotificationsRead('FARMER')}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition"
          >
            Mark All as Read
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
        {farmerNotifs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No notifications available.
          </div>
        ) : (
          farmerNotifs.map((notif) => (
            <div
              key={notif.id}
              onClick={() => markNotificationRead(notif.id)}
              className={`p-5 transition cursor-pointer flex items-start gap-4 ${
                !notif.read ? 'bg-emerald-50/40' : 'hover:bg-slate-50'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 shrink-0 mt-0.5">
                {notif.type.includes('WEATHER') ? (
                  <CloudRain className="w-5 h-5 text-blue-600" />
                ) : notif.type.includes('CLAIM') ? (
                  <FileCheck2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <Bell className="w-5 h-5 text-amber-600" />
                )}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900">{notif.title}</h3>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">{notif.timestamp}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

