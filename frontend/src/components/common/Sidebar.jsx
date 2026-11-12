import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  UserCheck,
  Sprout,
  ListOrdered,
  Camera,
  Activity,
  Bug,
  AlertTriangle,
  Pill,
  History,
  ShieldCheck,
  FileCheck2,
  GitBranch,
  Bell,
  Users,
  CheckSquare,
  FileText,
  Image as ImageIcon,
  BrainCircuit,
  BarChart3,
  Search,
  CalendarClock,
  Landmark,
  TrendingUp,
  LogIn,
  UserPlus,
  ShieldAlert,
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { currentUserRole, claims, crops, cropImages, notifications } = useApp();

  const farmerLinks = [
    {
      category: "Main",
      items: [
        { to: "/farmer/dashboard", label: "Farmer Dashboard", icon: LayoutDashboard },
        { to: "/farmer/profile", label: "Farmer Profile", icon: UserCheck },
      ]
    },
    {
      category: "Crops & Farm Land",
      items: [
        { to: "/farmer/crop-registration", label: "Crop Registration", icon: Sprout },
        { to: "/farmer/registered-crops", label: "My Registered Crops", icon: ListOrdered, badge: crops.length },
        { to: "/farmer/image-upload", label: "Crop Image Upload", icon: Camera },
      ]
    },
    {
      category: "AI Health & Diagnostics",
      items: [
        { to: "/farmer/disease-detection", label: "AI Disease Detection", icon: Activity },
        { to: "/farmer/pest-detection", label: "AI Pest Detection", icon: Bug },
        { to: "/farmer/damage-assessment", label: "Crop Damage Assessment", icon: AlertTriangle },
        { to: "/farmer/treatment-recommendations", label: "Pesticide & Treatments", icon: Pill },
        { to: "/farmer/treatment-history", label: "Treatment History", icon: History },
      ]
    },
    {
      category: "PMFBY Insurance Claims",
      items: [
        { to: "/farmer/policy-details", label: "Insurance Policy Details", icon: ShieldCheck },
        { to: "/farmer/submit-claim", label: "Submit Insurance Claim", icon: FileCheck2 },
        { to: "/farmer/track-claim", label: "Track Claim Status", icon: GitBranch, badge: claims.length },
        { to: "/farmer/notifications", label: "Notifications & Alerts", icon: Bell, badge: notifications.filter(n => n.role === 'FARMER' && !n.read).length },
      ]
    },
    {
      category: "Authentication",
      items: [
        { to: "/farmer/login", label: "Farmer Login", icon: LogIn },
        { to: "/farmer/register", label: "Farmer Registration", icon: UserPlus },
      ]
    }
  ];

  const officerLinks = [
    {
      category: "Control Center",
      items: [
        { to: "/officer/dashboard", label: "Officer Dashboard", icon: LayoutDashboard },
        { to: "/officer/farmers", label: "Farmer Management", icon: Users },
      ]
    },
    {
      category: "Verification & Scrutiny",
      items: [
        { to: "/officer/crop-verification", label: "Crop Registration Verification", icon: CheckSquare, badge: crops.length },
        { to: "/officer/applications", label: "Insurance Applications", icon: FileText },
        { to: "/officer/crop-images", label: "Uploaded Crop Images", icon: ImageIcon, badge: cropImages.length },
      ]
    },
    {
      category: "AI Analytics & Intelligence",
      items: [
        { to: "/officer/ai-reports", label: "AI Assessment Reports", icon: BrainCircuit },
        { to: "/officer/damage-analysis", label: "Damage Analysis", icon: BarChart3 },
      ]
    },
    {
      category: "Claim Settlement Workflow",
      items: [
        { to: "/officer/claim-verification", label: "Claim Verification Dossier", icon: Search, badge: claims.filter(c => c.status === 'UNDER_OFFICER_REVIEW').length },
        { to: "/officer/inspection-requests", label: "Field Inspection Requests", icon: CalendarClock },
        { to: "/officer/claim-decisions", label: "Claim Approval / Rejection", icon: ShieldAlert },
        { to: "/officer/settlement-tracking", label: "Settlement Tracking (DBT)", icon: Landmark },
        { to: "/officer/analytics", label: "Reports & Analytics", icon: TrendingUp },
      ]
    },
    {
      category: "Security",
      items: [
        { to: "/officer/login", label: "Officer Login", icon: LogIn },
      ]
    }
  ];

  const sections = currentUserRole === 'FARMER' ? farmerLinks : officerLinks;

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Main Sidebar Element */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-30 w-72 bg-white border-r border-slate-200/90 overflow-y-auto transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Role Header Banner inside Sidebar */}
        <div className={`p-4 mx-3 my-3 rounded-xl text-white ${
          currentUserRole === 'FARMER' 
            ? 'bg-gradient-to-r from-emerald-800 to-green-700' 
            : 'bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-900'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-200">
              Active Environment
            </span>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-mono">
              PMFBY v2.6
            </span>
          </div>
          <p className="text-sm font-bold mt-1">
            {currentUserRole === 'FARMER' ? 'Farmer Self-Service Portal' : 'Insurance Officer Portal'}
          </p>
        </div>

        {/* Navigation Sections */}
        <nav className="px-3 pb-8 space-y-6">
          {sections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              <h3 className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {section.category}
              </h3>
              <div className="space-y-0.5 pt-1">
                {section.items.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={idx}
                      to={item.to}
                      onClick={() => {
                        if (window.innerWidth < 1024) onClose();
                      }}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition ${
                          isActive
                            ? currentUserRole === 'FARMER'
                              ? 'bg-emerald-50 text-emerald-800 font-bold shadow-xs border-l-4 border-emerald-600'
                              : 'bg-emerald-900/10 text-emerald-900 font-bold shadow-xs border-l-4 border-emerald-700'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`
                      }
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className="w-4 h-4 shrink-0 text-slate-500" />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};

