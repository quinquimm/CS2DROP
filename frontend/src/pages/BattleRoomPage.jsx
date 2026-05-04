import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { CASES, getCaseItems } from '../mock';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Swords } from 'lucide-react';

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

export default function BattleRoomPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, addSkin } = useApp();
  const caseIds = (searchParams.get('cases') || '').split(',').filter(Boolean);
  const mode = searchParams.get('mode') || '1v1';
  const playerCount = mode === '2v2' ? 4 : parseInt(mode.split('v').length) || 2;
  const cases = caseIds.map((cid) => CASES.find((c) => c.id === cid)).filter(Boolean);

  const [round, setRound] = useState(0);
  const [winners, setWinners] = useState([]);
  const [totals, setTotals] = useState(() => Array(playerCount).fill(0));
  const [started, setStarted] = useState(false);
  const [finalWinner, setFinalWinner] = useState(null);

  const players = useMemo(() => {
    const bots = ['BotAlpha', 'BotBravo', 'BotCharlie'];
    const list = [{ name: user?.name || 'You', avatar: user?.avatar, isBot: false }];
    for (let i = 1; i < playerCount; i++) {
      list.push({ name: bots[i - 1] || `Bot${i}`, avatar: `https://images.unsplash.com/photo-177237127220${i}-412168748f2a?w=100&h=100&fit=crop`, isBot: true });
    }
    return list;
  }, [playerCount, user]);

  useEffect(() => {
    if (!started || round >= cases.length) return;
    const caseData = cases[round];
    const items = getCaseItems(caseData.id);
    const picks = players.map(() => weightedPick(items));
    const timer = setTimeout(() => {
      setWinners((w) => [...w, picks]);
      setTotals((t) => t.map((v, i) => +(v + picks[i].price).toFixed(2)));
      if (round === cases.length - 1) {
        // determine overall winner
        setTimeout(() => {
          const finalTotals = totals.map((v, i) => v + picks[i].price);
          const winIdx = finalTotals.indexOf(Math.max(...finalTotals));
          setFinalWinner(winIdx);
          // award winner skins
          if (winIdx === 0) {
            winners.flat().filter((_, idx) => idx % playerCount === 0).forEach(addSkin);
            picks.filter((_, idx) => idx === 0).forEach(addSkin);
          }
        }, 500);
      }
      setRound((r) => r + 1);
    }, 3500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line
  }, [started, round]);

  return (
    <div className="max-w-[1400px] mx-auto">
      <button onClick={() => navigate('/battles')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-4">
        <ArrowLeft size={16} /> BACK TO BATTLES
      </button>
      <div className="td-card p-4 mb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold flex items-center gap-2"><Swords className="text-[#1ad8ff]" /> BATTLE LOBBY</h2>
          <div className="text-xs text-gray-500">ROUND <span className="text-white font-bold">{Math.min(round + 1, cases.length)}</span> / <span className="text-white font-bold">{cases.length}</span> • MODE {mode}</div>
        </div>
        <div className="flex items-center gap-2">
          {cases.map((c, i) => (
            <div key={i} className={`w-12 h-12 bg-[#0f141b] rounded flex items-center justify-center ${i === round && started ? 'ring-2 ring-[#1ad8ff]' : ''} ${i < round ? 'opacity-30' : ''}`}>
              <img src={c.image} className="max-h-10 object-contain" alt="" />
            </div>
          ))}
        </div>
        {!started && (
          <button onClick={() => setStarted(true)} className="cyan-btn">FIGHT!</button>
        )}
        {finalWinner !== null && (
          <div className="text-[#1ad8ff] font-extrabold text-xl">WINNER: {players[finalWinner].name}</div>
        )}
      </div>

      <div className={`grid gap-4 ${playerCount === 2 ? 'grid-cols-1 md:grid-cols-2' : playerCount === 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-2 md:grid-cols-4'}`}>
        {players.map((p, pi) => (
          <div key={pi} className={`td-card p-4 ${finalWinner === pi ? 'winning-glow' : ''}`}>
            <div className="flex items-center gap-2 mb-3">
              <img src={p.avatar} alt="" className="w-10 h-10 rounded-full border border-[#1ad8ff]" />
              <div className="flex-1">
                <div className="font-bold text-sm">{p.name}</div>
                <div className="text-[10px] text-gray-500">{p.isBot ? 'BOT' : 'PLAYER'}</div>
              </div>
              <div className="text-[#1ad8ff] font-bold">${totals[pi].toFixed(2)}</div>
            </div>
            <div className="bg-[#0a0d12] rounded h-32 flex items-center justify-center mb-2 overflow-hidden">
              {started && round < cases.length ? (
                <div className="text-xs text-gray-500 animate-pulse">Opening {cases[round]?.name}...</div>
              ) : !started ? (
                <div className="text-xs text-gray-600">Aguardando start</div>
              ) : (
                <div className="text-xs text-gray-500">Done</div>
              )}
            </div>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {winners.map((w, ri) => (
                <div key={ri} className={`flex items-center gap-2 bg-[#0f141b] rounded p-1 rarity-${w[pi].rarity}`}>
                  <img src={w[pi].image} className="h-8 object-contain" alt="" />
                  <div className="flex-1 text-[10px] truncate">{w[pi].name}</div>
                  <div className="text-[10px] text-[#1ad8ff]">${w[pi].price.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
