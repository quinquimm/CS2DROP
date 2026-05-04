import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CASES } from '../mock';
import { Search } from 'lucide-react';

export default function CasesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [filter, setFilter] = useState('ALL');

  const series = useMemo(() => ['ALL', ...new Set(CASES.map((c) => c.series))], []);

  const filtered = useMemo(() => {
    let list = CASES.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
    if (filter !== 'ALL') list = list.filter((c) => c.series === filter);
    if (sort === 'price_high') list = [...list].sort((a, b) => b.price - a.price);
    else if (sort === 'price_low') list = [...list].sort((a, b) => a.price - b.price);
    return list;
  }, [search, sort, filter]);

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-wide">CASES</h1>
          <p className="text-gray-500 text-sm mt-1">Abre caixas para receber skins CS2 — sincroniza com o servidor.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input className="td-input pl-9 w-64" placeholder="Search case..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="td-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
            {series.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="td-select" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="newest">Newest</option>
            <option value="price_high">Price: High</option>
            <option value="price_low">Price: Low</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {filtered.map((c) => (
          <button
            key={c.id}
            onClick={() => navigate(`/case/${c.id}`)}
            className="td-card p-4 flex flex-col items-center text-center hover:-translate-y-1 group"
          >
            <div className="text-[10px] font-bold text-gray-500 tracking-widest mb-2">{c.series}</div>
            <div className="w-full h-28 flex items-center justify-center mb-3">
              <img src={c.image} alt={c.name} className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-300" onError={(e) => { e.target.style.visibility = 'hidden'; }} />
            </div>
            <div className="font-bold text-sm mb-2 truncate w-full">{c.name}</div>
            <div className="text-[#1ad8ff] font-extrabold text-lg">${c.price.toFixed(2)}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
