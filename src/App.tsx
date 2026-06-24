/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Package, Loader2 } from 'lucide-react';
import { SystemSettings, Tracking } from './types';

// Components
import HomeView from './components/HomeView';
import TrackingView from './components/TrackingView';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'tracking' | 'login' | 'admin'>('home');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Core States
  const [settings, setSettings] = useState<SystemSettings>({
    platformName: 'Jadlog Express Rastreamento',
    logoUrl: '',
    primaryColor: '#B30000',
    updateIntervalDays: 2,
    institutionalText: 'Jadlog Express Rastreamento - Plataforma corporativa de rastreamento de cargas e encomendas expressas.',
    aboutUs: 'A Jadlog Express Rastreamento é uma das maiores empresas de logística de cargas expressas do Brasil, oferecendo alta precisão, rapidez e controle total de encomendas.',
    contactEmail: 'contato@jadlog.com.br',
    contactPhone: '(11) 4004-0000'
  });

  const [activeTracking, setActiveTracking] = useState<Tracking | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(localStorage.getItem('rastro_token'));
  const [adminUser, setAdminUser] = useState<{ username: string; name: string } | null>(null);

  const [appUrl, setAppUrl] = useState<string>('');

  // Extract App URL from window location
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.protocol}//${window.location.host}`;
      setAppUrl(url);
    }
  }, []);

  // On Mount: Load public settings, check for deep-links, and validate token
  useEffect(() => {
    const initApp = async () => {
      setIsLoading(true);
      
      // 1. Load settings
      try {
        const sRes = await fetch('/api/settings');
        if (sRes.ok) {
          const sData = await sRes.json();
          setSettings(sData);
        }
      } catch (err) {
        console.error('Failed to load settings', err);
      }

      // 2. Validate Token if exists in local storage
      const token = localStorage.getItem('rastro_token');
      if (token) {
        try {
          const uRes = await fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (uRes.ok) {
            const uData = await uRes.json();
            setAdminUser(uData);
            setAuthToken(token);
            // If we are not tracking a deep link, we can stay or jump to admin
            setCurrentView('admin');
          } else {
            // Token stale
            localStorage.removeItem('rastro_token');
            setAuthToken(null);
          }
        } catch (err) {
          console.error('Failed to validate session token', err);
        }
      }

      // 3. Check for URL deep links e.g. ?track=BR123456789BR
      const params = new URLSearchParams(window.location.search);
      const deepLinkCode = params.get('track') || params.get('codigo');
      if (deepLinkCode) {
        await handleSearch(deepLinkCode.trim().toUpperCase());
      }

      // 4. Hidden Admin access via parameters (?admin=true or ?painel=1)
      if (params.get('admin') === 'true' || params.get('painel') === '1') {
        const token = localStorage.getItem('rastro_token');
        setCurrentView(token ? 'admin' : 'login');
      }

      setIsLoading(false);
    };

    initApp();
  }, []);

  // Apply Primary Color branding to document root variables dynamically
  useEffect(() => {
    if (settings.primaryColor) {
      document.documentElement.style.setProperty('--primary-brand', settings.primaryColor);
    }
  }, [settings.primaryColor]);

  // Search logic
  const handleSearch = async (code: string) => {
    if (!code) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/tracking/${code}`);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Código de rastreamento inválido ou inexistente.');
      }

      setActiveTracking(data);
      setCurrentView('tracking');

      // Update URL query parameter without reloading
      const newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?track=${code}`;
      window.history.pushState({ path: newUrl }, '', newUrl);

    } catch (err: any) {
      setError(err.message || 'Código de rastreamento não encontrado.');
      setCurrentView('home');
    } finally {
      setIsLoading(false);
    }
  };

  // Re-fetch active tracking (Refresh action)
  const handleRefreshTracking = async () => {
    if (!activeTracking) return;
    await handleSearch(activeTracking.id);
  };

  // Login handler
  const handleLogin = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Credenciais de acesso inválidas.');
      }

      localStorage.setItem('rastro_token', data.token);
      setAuthToken(data.token);
      setAdminUser(data.user);
      setCurrentView('admin');
    } catch (err: any) {
      setError(err.message || 'Falha na autenticação.');
    } finally {
      setIsLoading(false);
    }
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('rastro_token');
    setAuthToken(null);
    setAdminUser(null);
    setCurrentView('home');
    
    // Clear track deep-link query on logout
    const newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
  };

  // Back to home search
  const handleBackToHome = () => {
    setActiveTracking(null);
    setError(null);
    setCurrentView('home');

    // Remove tracking query parameter
    const newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 transition-colors duration-150">
      
      {/* Global loading spinner cover */}
      {isLoading && currentView === 'home' && (
        <div className="fixed inset-0 z-50 bg-gray-950/40 backdrop-blur-xs flex items-center justify-center">
          <div className="bg-white p-5 rounded-2xl shadow-2xl flex flex-col items-center space-y-4 max-w-xs text-center border border-gray-100">
            <Loader2 className="h-10 w-10 text-[#B30000] animate-spin" />
            <span className="text-sm font-extrabold text-gray-700 font-sans">Carregando Informações...</span>
          </div>
        </div>
      )}

      {/* Main View Router */}
      {currentView === 'home' && (
        <HomeView
          settings={settings}
          onSearch={handleSearch}
          onNavigateToLogin={() => {
            setError(null);
            setCurrentView(authToken ? 'admin' : 'login');
          }}
          isLoading={isLoading}
          error={error}
        />
      )}

      {currentView === 'tracking' && activeTracking && (
        <TrackingView
          tracking={activeTracking}
          settings={settings}
          onBack={handleBackToHome}
          onRefresh={handleRefreshTracking}
          isLoading={isLoading}
        />
      )}

      {currentView === 'login' && (
        <AdminLogin
          onLogin={handleLogin}
          onBack={handleBackToHome}
          isLoading={isLoading}
          error={error}
        />
      )}

      {currentView === 'admin' && authToken && (
        <AdminDashboard
          token={authToken}
          adminUser={adminUser}
          onLogout={handleLogout}
          publicUrl={appUrl}
        />
      )}

    </div>
  );
}
