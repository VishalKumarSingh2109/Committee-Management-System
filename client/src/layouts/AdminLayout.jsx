import { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, Receipt, CalendarDays, BarChart3, KeyRound, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getSummary } from '../services/statisticsService';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/members', label: 'Members', icon: Users },
  { to: '/admin/payments', label: 'Payments', icon: Receipt, badgeKey: 'dueMembers' },
  { to: '/admin/monthly', label: 'Monthly Table', icon: CalendarDays },
  { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [dueMembers, setDueMembers] = useState(0);

  useEffect(() => {
    getSummary()
      .then((res) => setDueMembers(res.data.data.dueMembers))
      .catch(() => {}); // badge is a nice-to-have, not worth surfacing an error for
  }, []);

  const badgeValues = { dueMembers };

  return (
    <div className="flex min-h-screen bg-[#f5f7fb]">
      {/* Sidebar */}
      <aside className="hidden w-60 flex-col border-r border-line bg-ink text-paper md:flex">
        <div className="flex items-center gap-3 px-6 py-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-gold-light/40 text-gold-light">
            <span className="font-serif text-base">C</span>
          </div>
          <span className="font-serif text-lg">Committee</span>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center justify-between rounded-md px-3 py-2 text-sm transition ${
                    isActive ? 'bg-gold/15 text-gold-light' : 'text-paper/70 hover:bg-white/5 hover:text-paper'
                  }`
                }
              >
                <span className="flex items-center gap-3">
                  <Icon size={17} />
                  {item.label}
                </span>
                {item.badgeKey && badgeValues[item.badgeKey] > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[11px] font-semibold text-white">
                    {badgeValues[item.badgeKey]}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-white/10 px-3 py-4">
          <NavLink
            to="/admin/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${
                isActive ? 'bg-gold/15 text-gold-light' : 'text-paper/70 hover:bg-white/5 hover:text-paper'
              }`
            }
          >
            <KeyRound size={17} />
            Change Password
          </NavLink>
          <button
            onClick={logout}
            className="mt-1 flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-paper/70 transition hover:bg-white/5 hover:text-paper"
          >
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-line bg-white px-6 py-4 md:hidden">
          <span className="font-serif text-lg text-ink">Committee</span>
          <button onClick={logout} className="text-sm text-ink/60">
            Sign out
          </button>
        </header>

        <header className="hidden items-center justify-between border-b border-line bg-white px-8 py-4 md:flex">
          <div />
          <div className="flex items-center gap-3 text-sm text-ink/70">
            <span>{user?.name}</span>
            <span className="rounded-full bg-ink/5 px-2.5 py-0.5 text-xs capitalize text-ink/60">{user?.role}</span>
          </div>
        </header>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
