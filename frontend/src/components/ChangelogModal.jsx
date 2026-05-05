import React from 'react';
import { CHANGELOG } from '../mock';
import { X } from 'lucide-react';

export default function ChangelogModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="td-card w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-extrabold tracking-wider">WEBSITE CHANGELOG</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        <div className="space-y-6">
          {CHANGELOG.map((entry) => (
            <div key={entry.date}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-sm font-bold text-gray-300">{entry.date}</span>
                {entry.isNew && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#1ad8ff] text-[#0a0d12]">NEW</span>}
              </div>
              <ul className="space-y-2 text-sm text-gray-400 list-disc pl-5">
                {entry.items.map((it, i) => (
                  <li key={i} dangerouslySetInnerHTML={{ __html: it.replace(/([A-Z]{2,}(?:\s[A-Z]+)*)/g, '<strong class="text-[#1ad8ff]">$1</strong>') }} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
