import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const { api, user, addSkin } = useApp();
  const [battle, setBattle] = useState(null);
  const [round, setRound] = useState(0);
  const [winners, setWinners] = useState([]);
  const [totals, setTotals] = useState([]);
  const [started, setStarted] = useState(false);
  const [finalWinner, setFinalWinner] = useState(null);
  const awarded = useRef(false);

  // Load battle and poll for new players
  useEffect(() => {
    let intv;
    const fetchBattle = async () => {
      try {
        const r = await api.get(`/battles/${id}`);
        setBattle(r.data);
      } catch (e) {
        navigate('/battles');
      }
    };
    fetchBattle();
    intv = setInterval(() => {
      if (!started) fetchBattle();
    }, 2000);
    return () => clearInterval(intv);
    // eslint-disable-next-line
  }, [id, started]);

  const cases = useMemo(() => {
    if (!battle) return [];
    return battle.cases.map((cid) => CASES.find((c) => c.id === cid)).filter(Boolean);
  }, [battle]);

  const playerCount = useMemo(() => {
    if (!battle) return 2;
    return battle.mode === '2v2' ? 4 : battle.mode.split('v').length;
  }, [battle]);

  const players = useMemo(() => {
    if (!battle) return [];
    const list = [...battle.players];
    if (battle.vs_bot || list.length < playerCount) {
      // fill with bots
      const botNames = ['BotAlpha', 'BotBravo', 'BotCharlie', 'BotDelta'];
      while (list.length < playerCount) {
        const i = list.length;
        list.push({
          steam_id: `bot_${i}`,
          name: botNames[i - 1] || `Bot${i}`,
          avatar: '',
          isBot: true,
        });
      }
    }
    return list;
  }, [battle, playerCount]);

  useEffect(() => {
    if (started && totals.length === 0) {
      setTotals(Array(players.length).fill(0));
    }
  }, [started, players.length, totals.length]);

  // Run battle rounds
  useEffect(() => {
    if (!started || !battle || round >= cases.length) return;
    const caseData = cases[round];
    const items = getCaseItems(caseData.id);
    const picks = players.map(() => weightedPick(items));
    const t = setTimeout(() => {
      setWinners((w) => [...w, picks]);
      setTotals((t) => t.map((v, i) => +(v + picks[i].price).toFixed(2)));
      if (round === cases.length - 1) {
        setTimeout(() => {
          const finalTotals = (totals.length ? totals : Array(players.length).fill(0)).map((v, i) => v + picks[i].price);
          const winIdx = finalTotals.indexOf(Math.max(...finalTotals));
          setFinalWinner(winIdx);
          // Award all picks across rounds to winner if winner is the user
          if (!awarded.current && players[winIdx]?.steam_id === user?.steam_id) {
            awarded.current = true;
            const allRounds = [...winners, picks];
            allRounds.forEach((round) => addSkin(round[winIdx]));
          }
        }, 500);
      }
      setRound((r) => r + 1);
    }, 3500);
    return () => clearTimeout(t);
    // eslint-disable-next-line
  }, [started, round, battle]);

  if (!battle) {
    return <div className="p-10 text-gray-400">A carregar battle...</div>;
  }

  const isCreator = battle.creator_id === user?.steam_id;
  const canStart = battle.vs_bot || battle.players.length >= playerCount;

  return (
    <div className="max-w-[1400px] mx-auto">
      <button onClick={() => navigate('/battles')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-4">
        <ArrowLeft size={16} /> BACK TO BATTLES
      </button>
      <div className="td-card p-4 mb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold flex items-center gap-2">
            <Swords className="text-[#1ad8ff]" /> BATTLE LOBBY
          </h2>
          <div className="text-xs text-gray-500">
            ROUND <span className="text-white font-bold">{Math.min(round + 1, cases.length)}</span> /{' '}
            <span className="text-white font-bold">{cases.length}</span> • MODE {battle.mode}
            {battle.underdog ? ' • UNDERDOG' : ''} • {battle.vs_bot ? 'VS BOT' : 'VS PLAYER'}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {cases.map((c, i) => (
            <div key={i} className={`w-12 h-12 bg-[#0f141b] rounded flex items-center justify-center ${i === round && started ? 'ring-2 ring-[#1ad8ff]' : ''} ${i < round ? 'opacity-30' : ''}`}>
              <img src={c.image} className="max-h-10 object-contain" alt="" />
            </div>
          ))}
        </div>
        {!started && (
          <button onClick={() => setStarted(true)} disabled={!canStart} className="cyan-btn">
            {canStart ? 'FIGHT!' : `Aguarda ${playerCount - battle.players.length} jogador(es)...`}
          </button>
        )}
        {finalWinner !== null && (
          <div className="text-[#1ad8ff] font-extrabold text-xl">WINNER: {players[finalWinner].name}</div>
        )}
      </div>

      <div className={`grid gap-4 ${playerCount === 2 ? 'grid-cols-1 md:grid-cols-2' : playerCount === 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-2 md:grid-cols-4'}`}>
        {players.map((p, pi) => (
          <div key={pi} className={`td-card p-4 ${finalWinner === pi ? 'winning-glow' : ''}`}>
            <div className="flex items-center gap-2 mb-3">
              {p.avatar ? (
                <img src={p.avatar} alt="" className="w-10 h-10 rounded-full border border-[#1ad8ff]" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#12171f] border border-[#1ad8ff] flex items-center justify-center text-[10px] text-gray-500">
                  {p.isBot ? 'BOT' : '?'}
                </div>
              )}
              <div className="flex-1">
                <div className="font-bold text-sm">{p.name}</div>
                <div className="text-[10px] text-gray-500">{p.isBot ? 'BOT' : 'PLAYER'}</div>
              </div>
              <div className="text-[#1ad8ff] font-bold">€{(totals[pi] || 0).toFixed(2)}</div>
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
                  <div className="text-[10px] text-[#1ad8ff]">€{w[pi].price.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
