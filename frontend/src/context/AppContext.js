import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEFAULT_USER, INITIAL_INVENTORY } from '../mock';

const AppContext = createContext(null);

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('cs2drop_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [inventory, setInventory] = useState(() => {
    const stored = localStorage.getItem('cs2drop_inventory');
    return stored ? JSON.parse(stored) : INITIAL_INVENTORY;
  });
  const [balance, setBalance] = useState(() => {
    const stored = localStorage.getItem('cs2drop_balance');
    return stored ? parseFloat(stored) : DEFAULT_USER.balance;
  });

  useEffect(() => {
    if (user) localStorage.setItem('cs2drop_user', JSON.stringify(user));
    else localStorage.removeItem('cs2drop_user');
  }, [user]);
  useEffect(() => {
    localStorage.setItem('cs2drop_inventory', JSON.stringify(inventory));
  }, [inventory]);
  useEffect(() => {
    localStorage.setItem('cs2drop_balance', balance.toString());
  }, [balance]);

  const login = () => setUser(DEFAULT_USER);
  const logout = () => setUser(null);
  const addSkin = (skin) => setInventory((inv) => [{ ...skin, id: `inv_${Date.now()}_${Math.random()}`, locked: false }, ...inv]);
  const removeSkin = (id) => setInventory((inv) => inv.filter((s) => s.id !== id));
  const toggleLock = (id) => setInventory((inv) => inv.map((s) => (s.id === id ? { ...s, locked: !s.locked } : s)));
  const sellSkin = (id) => {
    const skin = inventory.find((s) => s.id === id);
    if (!skin) return;
    setBalance((b) => +(b + skin.price).toFixed(2));
    removeSkin(id);
  };
  const sellAll = () => {
    const total = inventory.filter((s) => !s.locked).reduce((sum, s) => sum + s.price, 0);
    setBalance((b) => +(b + total).toFixed(2));
    setInventory((inv) => inv.filter((s) => s.locked));
  };
  const deposit = (amount) => setBalance((b) => +(b + amount).toFixed(2));
  const spend = (amount) => {
    if (balance < amount) return false;
    setBalance((b) => +(b - amount).toFixed(2));
    return true;
  };

  return (
    <AppContext.Provider value={{ user, login, logout, inventory, balance, addSkin, removeSkin, toggleLock, sellSkin, sellAll, deposit, spend, setInventory }}>
      {children}
    </AppContext.Provider>
  );
};
