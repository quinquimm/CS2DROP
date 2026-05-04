import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { RARITY_COLORS, RARITY_LABELS, WEAR_FULL } from '../mock';
import { Lock, Unlock, X, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function InventoryPage() {
  const { inventory, sellSkin, sellAll, toggleLock } = useApp();
  const [sort, setSort] = useState('newest');
  const [rarityFilter, setRarityFilter] = useState('ALL');
  const [confirmSell, setConfirmSell] = useState(false);
  const [preview, setPreview] = useState(null);

  const filtered = useMemo(() => {
    let list = [...inventory];
    if (rarityFilter !== 'ALL') list = list.filter((s) => s.rarity === rarityFilter);
    if (sort === 'price_high') list.sort((a, b) => b.price - a.price);
    else if (sort === 'price_low') list.sort((a, b) => a.price - b.price);
    return list;
  }, [inventory, sort, rarityFilter]);

  const totalValue = inventory.reduce((s, sk) => s + sk.price, 0);

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-wide">MY INVENTORY</h1>
          <p className="text-gray-500 text-sm mt-1">{inventory.length} items • valor total <span className="text-[#1ad8ff] font-bold">€{totalValue.toFixed(2)}</span></p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <select className="td-select" value={rarityFilter} onChange={(e) => setRarityFilter(e.target.value)}>
            <option value="ALL">All Rarities</option>
            {Object.entries(RARITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select className="td-select" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="newest">Newest First</option>
            <option value="price_high">Price: High to Low</option>
            <option value="price_low">Price: Low to High</option>
          </select>
          <button onClick={() => setConfirmSell(true)} className="px-4 py-2 rounded bg-[#eb4b4b] text-white font-bold hover:bg-[#ff6464] transition-colors">SELL ALL</button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="td-card p-16 text-center text-gray-500">Inventario vazio. Abre uma caixa!</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filtered.map((s) => (
            <div key={s.id} className={`td-card rarity-${s.rarity} p-3 relative cursor-pointer group`} onClick={() => setPreview(s)}>
              <button onClick={(e) => { e.stopPropagation(); toggleLock(s.id); toast.success(s.locked ? 'Skin desbloqueada' : 'Skin bloqueada'); }} className="absolute top-2 right-2 w-6 h-6 rounded bg-[#0a0d12]/80 flex items-center justify-center hover:bg-[#1ad8ff] hover:text-[#0a0d12]">
                {s.locked ? <Lock size={12} /> : <Unlock size={12} />}
              </button>
              <img src={s.image} alt={s.name} className="h-24 mx-auto object-contain mb-2" />
              <div className="text-xs font-semibold truncate">{s.name}</div>
              <div className="flex items-center justify-between mt-1">
                <span className="rarity-tag" style={{ background: RARITY_COLORS[s.rarity], color: '#fff' }}>{s.wear}</span>
                <span className="text-xs text-[#1ad8ff] font-bold">€{s.price.toFixed(2)}</span>
              </div>
              <button onClick={(e) => { e.stopPropagation(); sellSkin(s.id); toast.success(`Vendido por €${s.price.toFixed(2)}`); }} className="mt-2 w-full text-[10px] py-1 rounded bg-[#0f141b] hover:bg-[#1ad8ff] hover:text-[#0a0d12] font-bold transition-colors">SELL</button>
            </div>
          ))}
        </div>
      )}

      {/* Confirm sell all */}
      {confirmSell && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setConfirmSell(false)}>
          <div className="td-card p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="text-[#eb4b4b]" />
              <h3 className="text-xl font-extrabold">SELL EVERYTHING?</h3>
            </div>
            <p className="text-sm text-gray-400 mb-6">Isto irá vender todas as skins não-bloqueadas e converter em saldo. Esta ação não pode ser revertida.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setConfirmSell(false)} className="px-6 py-2 rounded bg-[#12171f] text-gray-400 font-bold">CANCEL</button>
              <button onClick={() => { sellAll(); setConfirmSell(false); toast.success('Tudo vendido!'); }} className="px-6 py-2 rounded bg-[#eb4b4b] text-white font-bold">CONFIRM SELL</button>
            </div>
          </div>
        </div>
      )}

      {/* Skin preview */}
      {preview && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className={`td-card p-6 max-w-md w-full rarity-border-${preview.rarity}`} style={{ borderWidth: 2 }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs tracking-widest" style={{ color: RARITY_COLORS[preview.rarity] }}>{RARITY_LABELS[preview.rarity]}</span>
              <button onClick={() => setPreview(null)}><X className="text-gray-400" /></button>
            </div>
            <img src={preview.image} alt="" className="h-48 mx-auto object-contain my-4" />
            <h2 className="text-2xl font-extrabold text-center">{preview.name}</h2>
            <div className="text-center text-gray-400 text-sm">{WEAR_FULL[preview.wear]}</div>
            <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
              <div className="bg-[#0f141b] rounded p-2">
                <div className="text-[10px] text-gray-500">Float</div>
                <div className="font-mono">{(Math.random() * 0.8).toFixed(6)}</div>
              </div>
              <div className="bg-[#0f141b] rounded p-2">
                <div className="text-[10px] text-gray-500">Pattern</div>
                <div className="font-mono">{Math.floor(Math.random() * 1000)}</div>
              </div>
            </div>
            <div className="text-3xl font-extrabold text-center text-[#1ad8ff] mt-4">€{preview.price.toFixed(2)}</div>
          </div>
        </div>
      )}
    </div>
  );
}
