import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import ChangelogModal from '../components/ChangelogModal';
import { Volume2, Bell, Globe, LogOut, FileText, ExternalLink } from 'lucide-react';

export default function SettingsPage() {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const [showChangelog, setShowChangelog] = useState(false);
  const [sound, setSound] = useState(true);
  const [notif, setNotif] = useState(true);

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-extrabold tracking-wide mb-6">SETTINGS</h1>

      <div className="td-card p-6 mb-4">
        <h2 className="font-bold tracking-wide text-sm text-gray-400 mb-4">STEAM ACCOUNT</h2>
        <div className="flex items-center gap-4">
          <img src={user.avatar} alt="" className="w-16 h-16 rounded-full border-2 border-[#1ad8ff]" />
          <div className="flex-1">
            <div className="font-bold text-lg">{user.name}</div>
            <div className="text-xs text-gray-500">Your profile information is synced with Steam.</div>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={() => { logout(); navigate('/login'); }} className="px-4 py-2 rounded bg-[#eb4b4b] text-white font-bold flex items-center gap-2 text-sm"><LogOut size={14} /> LOGOUT FROM STEAM</button>
          <button onClick={() => window.open('https://tobydrop2.onrender.com', '_blank')} className="px-4 py-2 rounded bg-[#12171f] text-gray-300 font-bold flex items-center gap-2 text-sm hover:text-white"><ExternalLink size={14} /> VIEW WEBSITE</button>
          <button onClick={() => setShowChangelog(true)} className="px-4 py-2 rounded bg-[#12171f] text-gray-300 font-bold flex items-center gap-2 text-sm hover:text-white"><FileText size={14} /> CHANGELOG</button>
        </div>
      </div>

      <div className="td-card p-6 mb-4">
        <h2 className="font-bold tracking-wide text-sm text-gray-400 mb-4">PREFERENCES</h2>
        <div className="space-y-4">
          <SettingRow icon={<Volume2 size={18} />} label="Sound effects" checked={sound} onChange={setSound} />
          <SettingRow icon={<Bell size={18} />} label="Notifications" checked={notif} onChange={setNotif} />
          <SettingRow icon={<Globe size={18} />} label="Language" value="Português (PT)" readonly />
        </div>
      </div>

      <div className="td-card p-6">
        <h2 className="font-bold tracking-wide text-sm text-gray-400 mb-4">LOADOUT SETTINGS</h2>
        <p className="text-sm text-gray-500">Personaliza como as skins ganhas são equipadas no servidor CS2.</p>
        <div className="grid grid-cols-2 gap-3 mt-4">
          {['Auto-equip rifle', 'Auto-equip pistol', 'Auto-equip knife', 'Auto-equip gloves'].map((s) => (
            <label key={s} className="flex items-center gap-2 bg-[#0f141b] rounded p-3 cursor-pointer">
              <input type="checkbox" defaultChecked />
              <span className="text-sm">{s}</span>
            </label>
          ))}
        </div>
      </div>

      <ChangelogModal open={showChangelog} onClose={() => setShowChangelog(false)} />
    </div>
  );
}

function SettingRow({ icon, label, checked, onChange, value, readonly }) {
  return (
    <div className="flex items-center gap-3 bg-[#0f141b] rounded p-3">
      <span className="text-[#1ad8ff]">{icon}</span>
      <span className="flex-1 text-sm font-semibold">{label}</span>
      {readonly ? (
        <span className="text-gray-400 text-sm">{value}</span>
      ) : (
        <button onClick={() => onChange(!checked)} className={`w-12 h-6 rounded-full relative transition-colors ${checked ? 'bg-[#1ad8ff]' : 'bg-[#1c2430]'}`}>
          <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-0.5'}`} />
        </button>
      )}
    </div>
  );
}
