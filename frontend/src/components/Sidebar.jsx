import { NavLink, useNavigate } from "react-router-dom";
import {
  Home, Search, ClipboardList, FileText,
  User, X, BookOpen, Sparkles,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export default function Sidebar({ isOpen = false, onClose = () => {} }) {

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isPro = user?.plan === "pro" &&
                user?.planExpiresAt &&
                new Date(user.planExpiresAt) > new Date();

  const navItems = [
    { to: "/dashboard",       icon: Home,          label: "Dashboard" },
    { to: "/recommendations", icon: Search,         label: "Recommendations" },
    { to: "/applications",    icon: ClipboardList,  label: "Applications" },
    { to: "/resume",          icon: FileText,       label: "Resume" },
    { to: "/profile",         icon: User,           label: "Profile" },
    { to: "/pro",           icon: BookOpen,         label: "Pro Support",  badge: isPro ? null : "Pro",  proOnly: true,},
  ];

  return (
    <aside
      className={`w-64 lg:w-60 shrink-0 border-r border-neutral-100 bg-white flex flex-col py-6 px-4
        fixed inset-y-0 left-0 z-50 h-dvh overflow-y-auto
        transition-transform duration-base ease-out
        lg:sticky lg:top-0 lg:translate-x-0 lg:z-auto
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-2 mb-8">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
            <span className="text-white text-sm font-bold">M</span>
          </div>
          <span className="font-semibold">Matchora</span>
        </div>
        <button
          onClick={onClose}
          aria-label="Close menu"
          className="lg:hidden text-neutral-400 hover:text-neutral-600 focus-ring rounded-lg p-1"
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/dashboard"}
            onClick={() => {
              // Pro only pages — redirect to pricing if not pro
              if (item.proOnly && !isPro) {
                onClose();
                navigate("/pricing");
                return;
              }
              onClose();
            }}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors focus-ring ${
                isActive
                  ? "bg-violet-50 text-violet-700 font-medium"
                  : item.proOnly && !isPro
                  ? "text-neutral-400 hover:bg-neutral-50 cursor-pointer"
                  : "text-neutral-500 hover:bg-neutral-50"
              }`
            }
          >
            <span className="flex items-center gap-3">
              <item.icon size={17} />
              {item.label}
            </span>
            {/* Pro badge */}
            {item.badge && (
              <span className="text-[10px] bg-violet-100 text-violet-600 
                               px-1.5 py-0.5 rounded-full font-medium">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="mt-auto pt-6">

        {/* Upgrade banner — only for free users */}
        {!isPro && (
          <div className="rounded-xl bg-violet-50 border border-violet-100 p-4 mb-4">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={14} className="text-violet-600" />
              <p className="text-sm font-semibold text-violet-800">
                Upgrade to Pro
              </p>
            </div>
            <p className="text-xs text-violet-500 leading-relaxed mb-3">
              Unlock unlimited jobs, study support and more.
            </p>
            <button
              onClick={() => { navigate("/pricing"); onClose(); }}
              className="w-full text-xs font-semibold bg-violet-600 
                         hover:bg-violet-700 text-white rounded-lg py-2 
                         transition-colors"
            >
              Upgrade — ₹59/month
            </button>
          </div>
        )}

        {/* Pro badge for pro users */}
        {isPro && (
          <div className="rounded-xl bg-violet-50 border border-violet-100 
                          p-3 mb-4 flex items-center gap-2">
            <Sparkles size={14} className="text-violet-600" />
            <p className="text-xs font-semibold text-violet-700">
              Pro Plan Active ✨
            </p>
          </div>
        )}

        {/* User info */}
        <div className="flex items-center gap-3 px-1">
          {user?.picture ? (
            <img
              src={user.picture}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-violet-100 text-violet-700 
                            flex items-center justify-center text-sm font-semibold shrink-0">
              {user?.name
                ?.split(" ")
                .map((word) => word[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-neutral-900 truncate">
                {user?.name}
              </p>
              {/* Plan badge next to name */}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold shrink-0 ${
                isPro 
                  ? "bg-violet-100 text-violet-600" 
                  : "bg-neutral-100 text-neutral-500"
              }`}>
                {isPro ? "PRO" : "FREE"}
              </span>
            </div>
            <p className="text-xs text-neutral-500 truncate">
              {user?.email}
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="mt-3 w-full text-xs font-medium bg-violet-600 
                     hover:bg-violet-700 text-white rounded-lg py-2 
                     transition-colors focus-ring"
        >
          Log Out
        </button>

      </div>
    </aside>
  );
}