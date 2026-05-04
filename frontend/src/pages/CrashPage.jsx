import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { TrendingUp, Rocket } from 'lucide-react';
import { toast } from 'sonner';

export default function CrashPage() {
  const { balance, spend, deposit } = useApp();
  const [betAmount, setBetAmount] = useState(10);
  const [autoCashout, setAutoCashout] = useState(2);
  const [multiplier, setMultiplier] = useState(1.0);
  const [phase, setPhase] = useState('idle'); // idle, flying, crashed
  const [crashPoint, setCrashPoint] = useState(null);
  const [cashedOut, setCashedOut] = useState(null);
  const [history, setHistory] = useState([2.34, 1.05, 15.67, 1.88, 3.21, 1.12, 7.5, 1.04, 2.18, 1.56]);
  const intervalRef = useRef(null);
  const hasBet = useRef(false);
  const startRef = useRef(0);

  const startGame = async () => {
    if (phase !== 'idle') return;
    const ok = await spend(betAmount);
    if (!ok) {
      toast.error('Saldo insuficiente');
      return;
    }
    hasBet.current = true;
    const cp = +(1 + Math.pow(Math.random(), 2.5) * 30).toFixed(2);
    setCrashPoint(cp);
    setCashedOut(null);
    setMultiplier(1.0);
    setPhase('flying');
    startRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      const m = +(Math.pow(1.06, elapsed * 3)).toFixed(2);
      if (m >= cp) {
        setMultiplier(cp);
        setPhase('crashed');
        setHistory((h) => [cp, ...h].slice(0, 12));
        clearInterval(intervalRef.current);
        setTimeout(() => { setPhase('idle'); hasBet.current = false; }, 2500);
      } else {
        setMultiplier(m);
        if (autoCashout && m >= autoCashout && !cashedOut && hasBet.current) {
          cashOut(m);
        }
      }
    }, 60);
  };

  const cashOut = (mVal) => {
    const m = mVal || multiplier;
    if (!hasBet.current || cashedOut) return;
    const winAmount = +(betAmount * m).toFixed(2);
    deposit(winAmount);
    setCashedOut({ m, amount: winAmount });
    hasBet.current = false;
    toast.success(`Cashed out @ ${m}x • +€${winAmount.toFixed(2)}`);
  };

  useEffect(() => () => clearInterval(intervalRef.current), []);

  return (
    <div className="max-w-[1200px] mx-auto">
      <h1 className="text-3xl font-extrabold tracking-wide mb-2 flex items-center gap-3"><TrendingUp className="text-[#1ad8ff]" /> CRASH</h1>
      <p className="text-gray-500 text-sm mb-6">Aposta e retira antes do foguetão cair.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="td-card crash-bg p-8 h-[420px] flex flex-col items-center justify-center relative overflow-hidden">
            {phase === 'idle' && <div className="text-gray-500 text-sm mb-2">Waiting for bet</div>}
            <div className={`text-7xl font-extrabold ${phase === 'crashed' ? 'text-[#eb4b4b]' : 'text-cyan-grad'}`}>
              {multiplier.toFixed(2)}x
            </div>
            <div className="text-xs tracking-widest mt-2 text-gray-400">
              {phase === 'flying' ? (<span className="flex items-center gap-1"><Rocket size={14} className="text-[#1ad8ff]" /> FLYING...</span>) : phase === 'crashed' ? 'CRASHED' : 'READY'}
            </div>
            {cashedOut && (
              <div className="absolute top-6 right-6 bg-[#12171f] border border-[#1ad8ff] rounded px-4 py-2 text-[#1ad8ff] font-bold float-up">
                CASHED OUT @ {cashedOut.m}x • +${cashedOut.amount.toFixed(2)}
              </div>
            )}
          </div>
          <div className="mt-3 flex gap-2 flex-wrap">
            {history.map((h, i) => (
              <div key={i} className={`px-3 py-1 rounded text-xs font-bold ${h >= 2 ? 'bg-[#12171f] text-[#1ad8ff] border border-[#1ad8ff]/30' : 'bg-[#12171f] text-[#eb4b4b] border border-[#eb4b4b]/30'}`}>
                {h.toFixed(2)}x
              </div>
            ))}
          </div>
        </div>

        <div className="td-card p-6">
          <h3 className="font-bold tracking-wide text-sm mb-4">PLACE BET</h3>
          <label className="block text-xs text-gray-500 mb-1">Bet amount</label>
          <div className="flex gap-1 mb-3">
            <input type="number" className="td-input flex-1" value={betAmount} onChange={(e) => setBetAmount(parseFloat(e.target.value) || 0)} />
            <button onClick={() => setBetAmount((v) => +(v / 2).toFixed(2))} className="px-2 py-1 bg-[#12171f] rounded text-xs font-bold">½</button>
            <button onClick={() => setBetAmount((v) => +(v * 2).toFixed(2))} className="px-2 py-1 bg-[#12171f] rounded text-xs font-bold">2×</button>
          </div>
          <label className="block text-xs text-gray-500 mb-1">Auto cashout @ (x)</label>
          <input type="number" step="0.1" className="td-input w-full mb-4" value={autoCashout} onChange={(e) => setAutoCashout(parseFloat(e.target.value) || 0)} />
          {phase === 'flying' && hasBet.current && !cashedOut ? (
            <button onClick={() => cashOut()} className="cyan-btn w-full">CASH OUT @ {multiplier.toFixed(2)}x</button>
          ) : (
            <button onClick={startGame} disabled={phase !== 'idle'} className="cyan-btn w-full">
              {phase === 'idle' ? `PLACE BET €${betAmount.toFixed(2)}` : phase === 'crashed' ? 'CRASHED' : 'IN PROGRESS'}
            </button>
          )}
          <div className="mt-4 text-xs text-gray-500 text-center">Balance: <span className="text-white font-bold">€{balance.toFixed(2)}</span></div>
        </div>
      </div>
    </div>
  );
}
