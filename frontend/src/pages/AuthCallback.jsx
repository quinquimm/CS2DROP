import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function AuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setTokenAndLoad } = useApp();

  useEffect(() => {
    const t = params.get('token');
    if (t) {
      setTokenAndLoad(t);
      setTimeout(() => navigate('/cases', { replace: true }), 300);
    } else {
      navigate('/login?error=notoken', { replace: true });
    }
    // eslint-disable-next-line
  }, []);

  return (
    <div className="App min-h-screen flex items-center justify-center text-gray-400">
      <div className="text-center">
        <div className="brand-text text-3xl mb-4">CS2<span className="drop">DROP</span></div>
        <p>A sincronizar com Steam...</p>
      </div>
    </div>
  );
}
