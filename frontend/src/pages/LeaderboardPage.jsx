import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Trophy, Crown, Medal } from 'lucide-react';

export default function LeaderboardPage() {
  const { api } = useApp();
  const [timeLeft, setTimeLeft] = useState('00:00:00');
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      const diff = end - now;
      const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
      setTimeLeft(`${h}:${m}:${s}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const r = await api.get('/leaderboard');
        setLeaders(r.data || []);
      } catch (e) {}
      finally { setLoading(false); }
    };
    load();
    const id = setInterval(load, 10000);
    return () => clearInterval(id);
    // eslint-disable-next-line
  }, []);

  const top3 = leaders.slice(0, 3);
  const rest = leaders.slice(3);

  return (
    <div className="max-w-[1100px] mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold tracking-wider flex items-center justify-center gap-3">
          <Trophy className="text-[#e4ae39]" size={36} /> DAILY LEADERBOARD
        </h1>
        <div className="mt-2 text-gray-400 text-sm">ENDS IN: <span className="text-[#1ad8ff] font-bold font-mono">{timeLeft}</span></div>
        <div className="mt-1 text-gray-500 text-xs">Top 3 players win exclusive daily rewards!</div>
      </div>

      {loading ? (
        <div className="td-card p-12 text-center text-gray-500">A carregar...</div>
      ) : leaders.length === 0 ? (
        <div className="td-card p-12 text-center text-gray-500">
          <Trophy size={48} className="mx-auto mb-3 opacity-30" />
          <p>Sem jogadores no leaderboard ainda. Sê o primeiro a apostar!</p>
        </div>
      ) : (
        <>
          {top3.length >= 3 && (
            <div className="grid grid-cols-3 gap-4 mb-8 items-end">
              {[top3[1], top3[0], top3[2]].map((p, i) => {
                const heights = ['h-40', 'h-56', 'h-32'];
                const borders = ['#c0c0c0', '#e4ae39', '#cd7f32'];
                const icons = [Medal, Crown, Medal];
                const Icon = icons[i];
                return (
                  <div key={p.steam_id} className="td-card flex flex-col items-center justify-end p-4" style={{ borderColor: borders[i], height: i === 1 ? '14rem' : i === 0 ? '10rem' : '8rem' }}>
                    <Icon size={28} style={{ color: borders[i] }} />
                    {p.avatar ? (
                      <img src={p.avatar} alt="" className="w-16 h-16 rounded-full my-2 border-2" style={{ borderColor: borders[i] }} />
                    ) : (
                      <div className="w-16 h-16 rounded-full my-2 border-2 bg-[#12171f]" style={{ borderColor: borders[i] }} />
                    )}
                    <div className="font-bold text-sm truncate max-w-full">{p.name}</div>
                    <div className="text-[#1ad8ff] font-bold text-sm">€{p.wagered.toFixed(2)}</div>
                    <div className="text-[10px] text-gray-400 mt-1 tracking-widest">#{p.rank} • {p.reward}</div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="td-card p-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] text-gray-500 tracking-widest">
                  <th className="text-left py-2 px-3">RANK</th>
                  <th className="text-left py-2 px-3">PLAYER</th>
                  <th className="text-right py-2 px-3">WAGERED</th>
                  <th className="text-right py-2 px-3">REWARD</th>
                </tr>
              </thead>
              <tbody>
                {(top3.length < 3 ? leaders : rest).map((p) => (
                  <tr key={p.steam_id} className="border-t border-[#1c2430] hover:bg-[#0f141b]">
                    <td className="py-3 px-3 font-bold">#{p.rank}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        {p.avatar ? (
                          <img src={p.avatar} alt="" className="w-8 h-8 rounded-full" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#12171f]" />
                        )}
                        <span>{p.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right text-[#1ad8ff] font-bold">€{p.wagered.toFixed(2)}</td>
                    <td className="py-3 px-3 text-right text-gray-500">{p.reward}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
