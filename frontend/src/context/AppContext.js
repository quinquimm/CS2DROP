import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const AppProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('cs2drop_token'));
  const [user, setUser] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  const api = axios.create({ baseURL: API });
  api.interceptors.request.use((cfg) => {
    const t = localStorage.getItem('cs2drop_token');
    if (t) cfg.headers.Authorization = `Bearer ${t}`;
    return cfg;
  });

  const fetchMe = useCallback(async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
      const inv = await api.get('/inventory');
      setInventory(inv.data || []);
    } catch (e) {
      localStorage.removeItem('cs2drop_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (token) {
      localStorage.setItem('cs2drop_token', token);
      fetchMe();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line
  }, [token]);

  const loginViaSteam = () => {
    window.location.href = `${API}/auth/steam`;
  };
  const setTokenAndLoad = (t) => {
    localStorage.setItem('cs2drop_token', t);
    setToken(t);
  };
  const logout = () => {
    localStorage.removeItem('cs2drop_token');
    setToken(null);
    setUser(null);
    setInventory([]);
  };

  const refreshUser = async () => {
    try {
      const r = await api.get('/auth/me');
      setUser(r.data);
    } catch (e) {}
  };
  const refreshInventory = async () => {
    try {
      const r = await api.get('/inventory');
      setInventory(r.data || []);
    } catch (e) {}
  };

  const addSkin = async (skin) => {
    try {
      const r = await api.post('/inventory/add', { skin });
      setInventory((inv) => [r.data, ...inv]);
    } catch (e) {}
  };
  const sellSkin = async (id) => {
    try {
      const r = await api.post(`/inventory/${id}/sell`);
      setUser((u) => ({ ...u, balance: r.data.balance }));
      setInventory((inv) => inv.filter((s) => s.id !== id));
    } catch (e) {}
  };
  const sellAll = async () => {
    try {
      const r = await api.post('/inventory/sell-all');
      setUser((u) => ({ ...u, balance: r.data.balance }));
      setInventory((inv) => inv.filter((s) => s.locked));
    } catch (e) {}
  };
  const toggleLock = async (id) => {
    try {
      const r = await api.post(`/inventory/${id}/lock`);
      setInventory((inv) => inv.map((s) => (s.id === id ? { ...s, locked: r.data.locked } : s)));
    } catch (e) {}
  };
  const spend = async (amount) => {
    try {
      const r = await api.post('/balance/spend', { amount });
      setUser((u) => ({ ...u, balance: r.data.balance }));
      return true;
    } catch (e) {
      return false;
    }
  };
  const deposit = async (amount) => {
    try {
      const r = await api.post('/balance/add', { amount });
      setUser((u) => ({ ...u, balance: r.data.balance }));
    } catch (e) {}
  };

  return (
    <AppContext.Provider value={{
      api, user, token, loading, inventory,
      balance: user?.balance ?? 0,
      loginViaSteam, setTokenAndLoad, logout,
      addSkin, sellSkin, sellAll, toggleLock, spend, deposit,
      refreshUser, refreshInventory,
    }}>
      {children}
    </AppContext.Provider>
  );
};
