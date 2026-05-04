import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { CASES, getCaseItems, RARITY_COLORS } from '../mock';
import { Zap, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function UpgraderPage() {
  const { inventory, balance, spend, addSkin, removeSkin } = useApp();
  const [selectedSkins, setSelectedSkins] = useState([]);
  const [targetSkin, setTargetSkin] = useState(null);
  const [multiplier, setMultiplier] = useState(2);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [searchTarget, setSearchTarget] = useState('');

  const allTargets = useMemo(() => {
    const all = [];
    CASES.forEach((c) => all.push(...getCaseItems(c.id)));
    const map = new Map();
    all.forEach((it) => {
      const key = `${it.name}_${it.wear}`;
      if (!map.has(key)) map.set(key, it);
    });
    return Array.from(map.values()).sort((a, b) => a.price - b.price);
  }, []);

  const filteredTargets = useMemo(() => {
    return allTargets.filter((t) => t.name.toLowerCase().includes(searchTarget.toLowerCase()));
  }, [allTargets, searchTarget]);

  const selectedValue = selectedSkins.reduce((s, sk) => s + sk.price, 0);
  const targetValue = targetSkin ? targetSkin.price : selectedValue * multiplier;
  const winChance = targetValue > 0 ? Math.min(90, (selectedValue / targetValue) * 95) : 0;

  const toggleSelect = (skin) => {
    if (spinning) return;
    if (selectedSkins.find((s) => s.id === skin.id)) {
      setSelectedSkins(selectedSkins.filter((s) => s.id !== skin.id));
    } else if (selectedSkins.length < 10) {
      setSelectedSkins([...selectedSkins, skin]);
    }
  };

  const performUpgrade = () => {
    if (spinning) return;
    if (selectedSkins.length === 0 && selectedValue === 0) {
      toast.error('Seleciona skins ou adiciona saldo');
      return;
    }
    if (!targetSkin) {
      toast.error('Seleciona uma skin alvo');
      return;
    }
    setSpinning(true);
    setResult(null);
    const win = Math.random() * 100 < winChance;
    const winAngle = Math.random() * (winChance * 3.6);
    const loseAngle = winChance * 3.6 + Math.random() * (360 - winChance * 3.6);
    const finalAngle = 360 * 5 + (win ? winAngle : loseAngle);
    setRotation(finalAngle);
    setTimeout(() => {
      selectedSkins.forEach((s) => removeSkin(s.id));
      if (win) {
        addSkin(targetSkin);
        setResult({ win: true, skin: targetSkin });
        toast.success(`Upgrade SUCESSO! Ganhaste ${targetSkin.name}`);
      } else {
        setResult({ win: false });
        toast.error('Upgrade falhou');
      }
      setSpinning(false);
      setSelectedSkins([]);
      setRotation(0);
    }, 4200);
  };

  return (
    <div className="max-w-[1400px] mx-auto">
      <h1 className="text-3xl font-extrabold tracking-wide mb-2">UPGRADER</h1>
      <p className="text-gray-500 text-sm mb-6">Troca skins por outras de maior valor.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Your skins */}
        <div className="td-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold tracking-wide text-sm">YOUR SELECTION</h3>
            <span className="text-[#1ad8ff] font-bold text-sm">${selectedValue.toFixed(2)}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 min-h-[220px]">
            {selectedSkins.length === 0 && <div className="col-span-3 text-center text-gray-600 text-xs py-10">Clica nas skins do inventario para selecionar (máx 10)</div>}
            {selectedSkins.map((s) => (
              <div key={s.id} onClick={() => toggleSelect(s)} className={`td-card rarity-${s.rarity} p-2 cursor-pointer text-center`}>
                <img src={s.image} className="h-14 object-contain mx-auto" alt="" />
                <div className="text-[10px] truncate font-semibold">{s.name}</div>
                <div className="text-[10px] text-[#1ad8ff]">${s.price.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Wheel */}
        <div className="td-card p-4 flex flex-col items-center justify-center">
          <div className="relative" style={{ width: 280, height: 280 }}>
            <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-0 h-0 z-10" style={{ borderLeft: '12px solid transparent', borderRight: '12px solid transparent', borderTop: '20px solid #1ad8ff' }} />
            <div
              className="w-full h-full rounded-full"
              style={{
                background: `conic-gradient(#1ad8ff 0deg ${winChance * 3.6}deg, #1c2430 ${winChance * 3.6}deg 360deg)`,
                transform: `rotate(${rotation}deg)`,
                transition: spinning ? 'transform 4s cubic-bezier(0.15, 0.85, 0.2, 1)' : 'none',
                boxShadow: '0 0 40px rgba(26,216,255,0.25)',
              }}
            />
            <div className="absolute inset-[20px] rounded-full bg-[#0a0d12] flex flex-col items-center justify-center">
              <div className="text-3xl font-extrabold text-[#1ad8ff]">{winChance.toFixed(2)}%</div>
              <div className="text-xs text-gray-500">WIN CHANCE</div>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            {[1.5, 2, 5, 10].map((m) => (
              <button key={m} onClick={() => { setMultiplier(m); setTargetSkin(null); }} className={`px-3 py-1 rounded text-sm font-bold ${multiplier === m && !targetSkin ? 'bg-[#1ad8ff] text-[#0a0d12]' : 'bg-[#12171f] text-gray-400 hover:text-white'}`}>{m}x</button>
            ))}
          </div>
          <button onClick={performUpgrade} disabled={spinning} className="cyan-btn mt-4 w-full flex items-center justify-center gap-2">
            <Zap size={16} /> UPGRADE ITEM
          </button>
          {result && !spinning && (
            <div className={`mt-3 text-sm font-bold ${result.win ? 'text-[#1ad8ff]' : 'text-[#eb4b4b]'}`}>
              {result.win ? `GANHASTE ${result.skin.name}!` : 'PERDESTE'}
            </div>
          )}
        </div>

        {/* Target skin */}
        <div className="td-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold tracking-wide text-sm">TARGET SKIN</h3>
            {targetSkin && <span className="text-[#1ad8ff] font-bold text-sm">${targetSkin.price.toFixed(2)}</span>}
          </div>
          <div className="relative mb-2">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input className="td-input pl-8 w-full" placeholder="Search target skin" value={searchTarget} onChange={(e) => setSearchTarget(e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-2 max-h-[240px] overflow-y-auto">
            {filteredTargets.slice(0, 60).map((t) => (
              <div key={t.id} onClick={() => setTargetSkin(t)} className={`td-card rarity-${t.rarity} p-2 cursor-pointer text-center ${targetSkin?.id === t.id ? 'ring-2 ring-[#1ad8ff]' : ''}`}>
                <img src={t.image} className="h-12 object-contain mx-auto" alt="" />
                <div className="text-[10px] truncate font-semibold">{t.name}</div>
                <div className="text-[10px] text-[#1ad8ff]">${t.price.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Inventory */}
      <div>
        <h3 className="font-bold tracking-wide text-sm mb-3">YOUR INVENTORY ({inventory.length})</h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {inventory.map((s) => {
            const isSelected = selectedSkins.find((x) => x.id === s.id);
            return (
              <div key={s.id} onClick={() => toggleSelect(s)} className={`td-card rarity-${s.rarity} p-2 cursor-pointer text-center ${isSelected ? 'ring-2 ring-[#1ad8ff]' : ''}`}>
                <img src={s.image} className="h-14 object-contain mx-auto" alt="" />
                <div className="text-[10px] truncate font-semibold">{s.name}</div>
                <div className="text-[10px] text-[#1ad8ff]">${s.price.toFixed(2)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
