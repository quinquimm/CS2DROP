import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BATTLES_OPEN, CASES } from '../mock';
import { useApp } from '../context/AppContext';
import { Plus, Swords, X } from 'lucide-react';
import { toast } from 'sonner';

export default function BattlesPage() {
  const navigate = useNavigate();
  const { user } = useApp();
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState([]);
  const [mode, setMode] = useState('1v1');
  const [underdog, setUnderdog] = useState(false);

  const total = selected.reduce((s, c) => s + c.price, 0);

  const createBattle = () => {
    if (selected.length === 0) {
      toast.error('Adiciona pelo menos 1 caixa');
      return;
    }
    const id = 'my_' + Date.now();
    toast.success('Battle criada!');
    setShowCreate(false);
    navigate(`/battles/${id}?cases=${selected.map((c) => c.id).join(',')}&mode=${mode}`);
  };

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-wide flex items-center gap-3"><Swords className="text-[#1ad8ff]" /> BATTLES</h1>
          <p className="text-gray-500 text-sm mt-1">Batalhas de caixas contra outros jogadores.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="cyan-btn flex items-center gap-2">
          <Plus size={16} /> CREATE BATTLE
        </button>
      </div>

      <div className="grid gap-4">
        {BATTLES_OPEN.map((b) => (
          <div key={b.id} className="td-card p-4 flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center gap-3 min-w-[180px]">
              <img src={b.creator.avatar} alt="" className="w-12 h-12 rounded-full border border-[#1ad8ff]" />
              <div>
                <div className="font-bold text-sm">{b.creator.name}</div>
                <div className="text-[10px] text-gray-500">CREATED {Math.floor(Math.random() * 59)}s AGO</div>
              </div>
            </div>
            <div className="flex-1 flex items-center gap-2 flex-wrap">
              {b.cases.map((caseId, i) => {
                const c = CASES.find((x) => x.id === caseId);
                if (!c) return null;
                return (
                  <div key={i} className="w-14 h-14 bg-[#0f141b] rounded flex items-center justify-center">
                    <img src={c.image} alt="" className="max-h-12 max-w-12 object-contain" />
                  </div>
                );
              })}
              <span className="text-gray-500 text-xs ml-2">{b.cases.length} cases</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-[10px] text-gray-500 tracking-widest">MODE</div>
                <div className="font-bold text-[#1ad8ff]">{b.mode}</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-gray-500 tracking-widest">VALUE</div>
                <div className="font-bold">${b.value.toFixed(2)}</div>
              </div>
              <button onClick={() => navigate(`/battles/${b.id}?cases=${b.cases.join(',')}&mode=${b.mode}`)} className="cyan-btn">JOIN</button>
            </div>
          </div>
        ))}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <div className="td-card w-full max-w-5xl max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-extrabold tracking-wide">CREATE BATTLE</h2>
              <button onClick={() => setShowCreate(false)}><X className="text-gray-400 hover:text-white" /></button>
            </div>
            <div className="flex gap-2 mb-4 flex-wrap">
              {['1v1', '1v1v1', '1v1v1v1', '2v2'].map((m) => (
                <button key={m} onClick={() => setMode(m)} className={`px-4 py-2 rounded text-sm font-bold ${mode === m ? 'bg-[#1ad8ff] text-[#0a0d12]' : 'bg-[#12171f] text-gray-400'}`}>{m}</button>
              ))}
              <label className="flex items-center gap-2 ml-4 cursor-pointer">
                <input type="checkbox" checked={underdog} onChange={(e) => setUnderdog(e.target.checked)} />
                <span className="text-sm font-bold">UNDERDOG</span>
              </label>
            </div>
            <h3 className="text-sm font-bold tracking-wide mb-2">AVAILABLE CASES</h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 mb-4 max-h-[40vh] overflow-y-auto">
              {CASES.map((c) => (
                <button key={c.id} onClick={() => selected.length < 10 && setSelected([...selected, c])} className="td-card p-2 hover:border-[#1ad8ff] text-center">
                  <img src={c.image} alt="" className="h-16 object-contain mx-auto" />
                  <div className="text-[10px] font-bold truncate">{c.name}</div>
                  <div className="text-[10px] text-[#1ad8ff]">${c.price.toFixed(2)}</div>
                </button>
              ))}
            </div>
            <h3 className="text-sm font-bold tracking-wide mb-2">BATTLE CASES (${total.toFixed(2)})</h3>
            <div className="flex gap-2 min-h-[80px] bg-[#0f141b] rounded p-2 mb-4 flex-wrap">
              {selected.length === 0 && <div className="text-gray-600 text-xs m-auto">Clica numa caixa acima</div>}
              {selected.map((c, i) => (
                <div key={i} onClick={() => setSelected(selected.filter((_, idx) => idx !== i))} className="relative cursor-pointer">
                  <img src={c.image} className="h-16 object-contain" alt="" />
                  <X className="absolute top-0 right-0 w-4 h-4 text-red-400" />
                </div>
              ))}
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowCreate(false)} className="px-6 py-2 rounded bg-[#12171f] text-gray-400 font-bold">CANCEL</button>
              <button onClick={createBattle} className="cyan-btn">START BATTLE</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
