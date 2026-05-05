import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import AuthCallback from './pages/AuthCallback';
import CasesPage from './pages/CasesPage';
import CaseOpeningPage from './pages/CaseOpeningPage';
import UpgraderPage from './pages/UpgraderPage';
import BattlesPage from './pages/BattlesPage';
import BattleRoomPage from './pages/BattleRoomPage';
import CrashPage from './pages/CrashPage';
import LeaderboardPage from './pages/LeaderboardPage';
import InventoryPage from './pages/InventoryPage';
import SettingsPage from './pages/SettingsPage';
import { Toaster } from './components/ui/sonner';

const Protected = ({ children }) => {
  const { user, loading } = useApp();
  if (loading) return <div className="App min-h-screen flex items-center justify-center text-gray-500">A carregar...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const Root = () => {
  const { user, loading } = useApp();
  if (loading) return <div className="App min-h-screen flex items-center justify-center text-gray-500">A carregar...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to="/cases" replace />;
};

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/" element={<Protected><Layout /></Protected>}>
            <Route index element={<Root />} />
            <Route path="cases" element={<CasesPage />} />
            <Route path="case/:id" element={<CaseOpeningPage />} />
            <Route path="upgrader" element={<UpgraderPage />} />
            <Route path="battles" element={<BattlesPage />} />
            <Route path="battles/:id" element={<BattleRoomPage />} />
            <Route path="crash" element={<CrashPage />} />
            <Route path="leaderboard" element={<LeaderboardPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" theme="dark" richColors />
    </AppProvider>
  );
}

export default App;
