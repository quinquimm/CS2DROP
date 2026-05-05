import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const SteamIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.4 0 0 5.4 0 12c0 5.5 3.7 10.1 8.8 11.5l1.9-2.7c-.4-.2-.9-.4-1.3-.7l1.8-.7c.4.2.8.3 1.2.3 1.7 0 3.1-1.4 3.1-3.1 0-.1 0-.3-.1-.4l4.3-3.1c.1 0 .3.1.4.1 2.2 0 4-1.8 4-4s-1.8-4-4-4-4 1.8-4 4c0 .1 0 .3.1.4L6.9 13c-.2 0-.3-.1-.5-.1-.7 0-1.3.2-1.8.6L0 11.2C.3 5 5.6 0 12 0zm6.3 6.3c1.2 0 2.2 1 2.2 2.2s-1 2.2-2.2 2.2-2.2-1-2.2-2.2 1-2.2 2.2-2.2zm-7.7 9.5c0-1 .8-1.8 1.8-1.8l1.2.5c.7.3 1 1.1.7 1.8-.3.7-1.1 1-1.8.7l-1.2-.5c-.4-.1-.7-.4-.7-.7z"/>
  </svg>
);

export default function LoginPage() {
  const { loginViaSteam } = useApp();
  const [params] = useSearchParams();
  const error = params.get('error');
  return (
    <div className="App min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="td-card p-10 text-center">
          <h1 className="brand-text text-4xl mb-6">CS2<span className="drop">DROP</span></h1>
          <p className="text-gray-400 mb-8 text-sm">Login via Steam para sincronizar as tuas skins com o servidor CS2.</p>
          {error && <div className="mb-4 text-xs text-[#eb4b4b]">Falha no login Steam ({error}). Tenta novamente.</div>}
          <button onClick={loginViaSteam} className="cyan-btn w-full flex items-center justify-center gap-2 text-sm uppercase">
            <SteamIcon /> Login with Steam
          </button>
          <p className="text-gray-600 text-xs mt-6">Cada novo jogador começa com 100€ de saldo</p>
        </div>
      </div>
    </div>
  );
}
