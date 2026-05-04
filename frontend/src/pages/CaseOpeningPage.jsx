import React, { useState, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CASES, getCaseItems, RARITY_COLORS } from '../mock';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import { toast } from 'sonner';

const ITEM_W = 180;
const REEL_COUNT = 60;
const WINNING_INDEX = 50;

function weightedPick(items) {
  const weights = items.map((it) => {
    if (it.rarity === 'gold') return 1;
    if (it.rarity === 'covert') return 4;
    if (it.rarity === 'classified') return 10;
    if (it.rarity === 'restricted') return 25;
    return 60;
  });
  const total = weights.reduce((s, w) => s + w, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[0];
}

export default function CaseOpeningPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const caseData = CASES.find((c) => c.id === id);
  const items = useMemo(() => getCaseItems(id), [id]);
  const { balance, spend, addSkin } = useApp();
  const [spinning, setSpinning] = useState(false);
  const [won, setWon] = useState(null);
  const [reel, setReel] = useState([]);
  const [offset, setOffset] = useState(0);
  const trackRef = useRef(null);

  if (!caseData) return <div className="p-10">Case not found</div>;

  const openCase = async () => {
    if (spinning) return;
    const ok = await spend(caseData.price);
    if (!ok) {
      toast.error('Saldo insuficiente');
      return;
    }
    setWon(null);
    const winner = weightedPick(items);
    const newReel = Array.from({ length: REEL_COUNT }).map(() => items[Math.floor(Math.random() * items.length)]);
    newReel[WINNING_INDEX] = winner;
    setReel(newReel);
    setSpinning(true);
    // Compute offset so WINNING_INDEX lands on center of viewport
    const containerWidth = trackRef.current?.parentElement?.offsetWidth || 1000;
    const centerOffset = containerWidth / 2 - ITEM_W / 2;
    const jitter = (Math.random() * 0.6 - 0.3) * ITEM_W;
    const endOffset = -(WINNING_INDEX * ITEM_W) + centerOffset + jitter;
    setOffset(0);
    requestAnimationFrame(() => {
      setOffset(endOffset);
    });
    setTimeout(() => {
      setSpinning(false);
      setWon(winner);
      addSkin(winner);
      toast.success(`Ganhaste ${winner.name}!`, { description: `€${winner.price.toFixed(2)}` });
    }, 6200);
  };

  return (
    <div className="max-w-[1400px] mx-auto">
      <button onClick={() => navigate('/cases')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-4">
        <ArrowLeft size={16} /> BACK TO CASES
      </button>

      <div className="td-card p-6 mb-6 flex flex-col md:flex-row items-center gap-6">
        <img src={caseData.image} alt={caseData.name} className="w-32 h-32 object-contain" />
        <div className="flex-1 text-center md:text-left">
          <div className="text-xs text-gray-500 tracking-widest mb-1">{caseData.series} CASE</div>
          <h1 className="text-3xl font-extrabold">{caseData.name}</h1>
          <div className="text-[#1ad8ff] text-2xl font-extrabold mt-2">€{caseData.price.toFixed(2)}</div>
        </div>
        <button onClick={openCase} disabled={spinning || balance < caseData.price} className="cyan-btn text-base px-8 py-4">
          {spinning ? 'OPENING...' : `OPEN CASE • €${caseData.price.toFixed(2)}`}
        </button>
      </div>

      {/* Spinner */}
      <div className="td-card p-0 overflow-hidden relative mb-8" style={{ height: 240 }}>
        <div className="absolute inset-0 pointer-events-none z-20">
          <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-[#1ad8ff] shadow-[0_0_15px_#1ad8ff]"></div>
          <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-[#12171f] to-transparent"></div>
          <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-[#12171f] to-transparent"></div>
        </div>
        <div
          ref={trackRef}
          className="flex items-center h-full"
          style={{
            transform: `translateX(${offset}px)`,
            transition: spinning ? 'transform 6s cubic-bezier(0.08, 0.82, 0.17, 1)' : 'none',
          }}
        >
          {(reel.length ? reel : items.slice(0, 20)).map((it, i) => (
            <div key={i} className={`shrink-0 mx-1 rounded-lg bg-[#0f141b] rarity-${it.rarity} flex flex-col items-center justify-center p-3`} style={{ width: ITEM_W - 8, height: 200 }}>
              <img src={it.image} alt={it.name} className="h-24 object-contain mb-2" />
              <div className="text-xs font-semibold text-center truncate w-full">{it.name}</div>
              <div className="text-[10px] text-gray-500">{it.wear}</div>
              <div className="text-xs text-[#1ad8ff] font-bold">€{it.price.toFixed(2)}</div>
            </div>
          ))}
        </div>
      </div>

      {won && !spinning && (
        <div className="td-card p-6 mb-8 text-center" style={{ borderColor: RARITY_COLORS[won.rarity], borderWidth: 2 }}>
          <div className="text-xs tracking-widest text-[#1ad8ff] mb-2">WINNER!</div>
          <img src={won.image} alt="" className="h-32 mx-auto my-3" />
          <div className="text-2xl font-extrabold">{won.name}</div>
          <div className="text-sm text-gray-400">{won.wear}</div>
          <div className="text-[#1ad8ff] text-xl font-extrabold mt-2">€{won.price.toFixed(2)}</div>
          <button onClick={() => setWon(null)} className="cyan-btn mt-4 px-8">CONTINUE</button>
        </div>
      )}

      <div>
        <h2 className="text-xl font-extrabold mb-4 tracking-wide">CASE CONTENTS</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {items.map((it) => (
            <div key={it.id} className={`td-card p-3 rarity-${it.rarity}`}>
              <img src={it.image} alt={it.name} className="h-20 mx-auto object-contain mb-2" />
              <div className="text-xs font-semibold truncate">{it.name}</div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] text-gray-500">{it.wear}</span>
                <span className="text-xs text-[#1ad8ff] font-bold">€{it.price.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
