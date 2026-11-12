import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  CloudRain,
  Shield,
  User,
  ArrowRightLeft,
  Menu,
  X,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';

export const Navbar = ({ onToggleSidebar, isSidebarOpen }) => {
  const {
    currentUserRole,
    switchRole,
    farmerProfile,
    officerProfile,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
  } = useApp();

  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  // Filter unread notifications relevant to current role
  const roleNotifications = notifications.filter((n) => n.role === currentUserRole);
  const unreadCount = roleNotifications.filter((n) => !n.read).length;

  const handleSwitchPortal = () => {
    if (currentUserRole === 'FARMER') {
      switchRole('OFFICER');
      navigate('/officer/dashboard');
    } else {
      switchRole('FARMER');
      navigate('/farmer/dashboard');
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200/80 shadow-xs">
      <div className="px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Left: Mobile hamburger + Brand */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            aria-label="Toggle menu"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-green-500 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-900">PMFBY</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                  AI Analytics
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium hidden sm:block">
                Real-Time Crop Damage & Insurance Assessment
              </p>
            </div>
          </Link>
        </div>

        {/* Center: Live Agro-Weather Telemetry Ticker (Hidden on small mobile) */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/90 text-xs text-slate-600">
          <CloudRain className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
          <span className="font-medium text-slate-700">Karnal Agri-Zone:</span>
          <span>28.4°C • 84% Hum • 18mm Rain</span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-[11px] text-emerald-700 font-medium">IMD Radar Active</span>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-3">
          {/* Quick Portal Switcher */}
          <button
            type="button"
            onClick={handleSwitchPortal}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition shadow-2xs hover:shadow-sm bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100"
            title="Switch between Farmer Portal and Insurance Officer Portal"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Switch to:</span>
            <span className="font-bold text-emerald-700">
              {currentUserRole === 'FARMER' ? 'Officer Portal' : 'Farmer Portal'}
            </span>
          </button>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-[10px] font-bold text-white flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-800">Notifications</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {roleNotifications.length}
                    </span>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={() => markAllNotificationsRead(currentUserRole)}
                      className="text-xs text-emerald-700 hover:text-emerald-800 font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {roleNotifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No notifications for this role.
                    </div>
                  ) : (
                    roleNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markNotificationRead(notif.id)}
                        className={`p-3.5 hover:bg-slate-50 transition cursor-pointer text-xs space-y-1 ${
                          !notif.read ? 'bg-emerald-50/40 font-medium' : 'text-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                            {!notif.read && (
                              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                            )}
                            {notif.title}
                          </span>
                          <span className="text-[10px] text-slate-400">{notif.timestamp}</span>
                        </div>
                        <p className="text-slate-600 line-clamp-2">{notif.message}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2 border-t border-slate-100 text-center">
                  <Link
                    to={currentUserRole === 'FARMER' ? '/farmer/notifications' : '/officer/dashboard'}
                    onClick={() => setShowNotifications(false)}
                    className="text-xs text-emerald-700 font-semibold hover:underline"
                  >
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center font-bold text-xs">
              {currentUserRole === 'FARMER' ? 'RP' : 'VS'}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-slate-800 leading-none">
                {currentUserRole === 'FARMER' ? farmerProfile.fullName : officerProfile.fullName}
              </p>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                {currentUserRole === 'FARMER' ? 'Registered Farmer' : 'Insurance Officer'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

