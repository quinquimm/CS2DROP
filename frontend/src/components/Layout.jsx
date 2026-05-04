import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Package, Zap, Swords, TrendingUp, Trophy, Backpack, Settings, LogOut, Wallet, Plus } from 'lucide-react';
import { CASES, RARITY_COLORS } from '../mock';
import ChangelogModal from './ChangelogModal';

const navItems = [
  { to: '/cases', label: 'CASES', icon: Package },
  { to: '/upgrader', label: 'UPGRADER', icon: Zap },
  { to: '/battles', label: 'BATTLES', icon: Swords },
  { to: '/crash', label: 'CRASH', icon: TrendingUp },
  { to: '/leaderboard', label: 'LEADERBOARD', icon: Trophy },
  { to: '/inventory', label: 'INVENTORY', icon: Backpack },
];

const LiveDrops = () => {
  const drops = Array.from({ length: 16 }).map((_, i) => {
    const c = CASES[i % CASES.length];
    const rarities = Object.keys(RARITY_COLORS);
    const r = rarities[i % rarities.length];
    return { id: i, user: ['Toby', 'xXDragon', 'Skin Master', 'Lucky', 'PashaBiceps'][i % 5], case: c, rarity: r };
  });
  return (
    <div className="border-b border-[#1c2430] bg-[#0d1219] overflow-hidden py-2">
      <div className="marquee-track flex gap-2 whitespace-nowrap">
        {[...drops, ...drops].map((d, i) => (
          <div key={i} className="flex items-center gap-2 px-3 py-1 bg-[#12171f] rounded-md border-b-2" style={{ borderBottomColor: RARITY_COLORS[d.rarity] }}>
            <img src={d.case.image} alt="" className="w-8 h-8 object-contain" />
            <div className="text-xs">
              <div className="text-gray-400">{d.user}</div>
              <div className="text-white font-semibold">{d.case.name}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function Layout() {
  const { user, balance, logout, deposit } = useApp();
  const navigate = useNavigate();
  const [changelogOpen, setChangelogOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="App min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-[220px] shrink-0 bg-[#0d1219] border-r border-[#1c2430] flex flex-col h-screen sticky top-0">
        <div className="p-5 border-b border-[#1c2430]">
          <div className="brand-text text-2xl">
            CS2<span className="drop">DROP</span>
          </div>
          <div className="text-[10px] text-gray-500 mt-1 tracking-widest">CS2 SKIN GAMBLING</div>
        </div>
        <nav className="flex-1 p-3 flex flex-col gap-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold tracking-wide transition-colors ${
                  isActive ? 'bg-[#12171f] text-[#1ad8ff] border-l-2 border-[#1ad8ff]' : 'text-gray-400 hover:text-white hover:bg-[#12171f]'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-[#1c2430] space-y-1">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold tracking-wide transition-colors ${
                isActive ? 'bg-[#12171f] text-[#1ad8ff]' : 'text-gray-400 hover:text-white hover:bg-[#12171f]'
              }`
            }
          >
            <Settings size={18} /> SETTINGS
          </NavLink>
          <button onClick={() => setChangelogOpen(true)} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold tracking-wide text-gray-400 hover:text-white hover:bg-[#12171f] transition-colors">
            <Package size={18} /> CHANGELOG
          </button>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold tracking-wide text-gray-400 hover:text-[#eb4b4b] hover:bg-[#12171f] transition-colors">
            <LogOut size={18} /> LOGOUT
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-[#0d1219] border-b border-[#1c2430] flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="text-sm text-gray-400">
            Bem-vindo, <span className="text-white font-semibold">{user?.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#12171f] border border-[#1c2430] rounded-lg px-4 py-2">
              <Wallet size={16} className="text-[#1ad8ff]" />
              <span className="font-bold text-white">${balance.toFixed(2)}</span>
              <button className="ml-2 w-6 h-6 rounded-md bg-[#1ad8ff] text-[#0a0d12] flex items-center justify-center hover:bg-[#4fe3ff] transition-colors" onClick={() => { const amt = prompt('Deposit amount (mock):'); if (amt) deposit(parseFloat(amt)); }}>
                <Plus size={14} strokeWidth={3} />
              </button>
            </div>
            <img src={user?.avatar} alt="avatar" className="w-10 h-10 rounded-full border-2 border-[#1ad8ff]" />
          </div>
        </header>

        <LiveDrops />

        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </main>

      <ChangelogModal open={changelogOpen} onClose={() => setChangelogOpen(false)} />
    </div>
  );
}
