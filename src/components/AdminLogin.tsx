/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shield, Key, User, ArrowLeft, Package, AlertCircle } from 'lucide-react';

interface AdminLoginProps {
  onLogin: (username: string, password: string) => void;
  onBack: () => void;
  isLoading: boolean;
  error: string | null;
}

export default function AdminLogin({ onLogin, onBack, isLoading, error }: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!username.trim() || !password.trim()) {
      setLocalError('Preencha os campos de usuário e senha para continuar.');
      return;
    }

    onLogin(username.trim(), password.trim());
  };
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Decorative background radial effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-950/25 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 h-[400px] w-[400px] rounded-full bg-[#B30000]/5 blur-3xl pointer-events-none" />

      {/* Back button */}
      <div className="absolute top-6 left-6 z-10">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-2 text-sm text-neutral-450 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar ao site público</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-4">
          <div className="h-14 w-14 rounded-2xl bg-[#B30000] flex items-center justify-center text-white shadow-lg shadow-red-900/35">
            <Shield className="h-8 w-8 animate-pulse" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-black text-white tracking-tight">
          Área Restrita
        </h2>
        <p className="mt-2 text-center text-sm text-neutral-400">
          Acesse o Painel Administrativo de Controle Logístico
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-neutral-900/80 py-8 px-4 border border-neutral-850 shadow-2xl rounded-2xl sm:px-10 backdrop-blur-md">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Username Input */}
            <div>
              <label htmlFor="username" className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                Nome de Usuário
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-neutral-500" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="block w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-10 pr-3 py-2.5 text-white placeholder-neutral-600 focus:outline-hidden focus:ring-2 focus:ring-[#B30000]/50 focus:border-[#B30000] text-sm font-semibold transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                Senha de Acesso
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-neutral-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-10 pr-3 py-2.5 text-white placeholder-neutral-600 focus:outline-hidden focus:ring-2 focus:ring-[#B30000]/50 focus:border-[#B30000] text-sm font-semibold transition-all"
                />
              </div>
            </div>

            {/* Error Indicators */}
            {(error || localError) && (
              <div className="p-3 bg-red-950/60 border border-red-900/50 rounded-lg text-red-200 text-sm flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <span className="font-semibold leading-relaxed">{localError || error}</span>
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-[#B30000] hover:bg-[#900000] focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-[#B30000] disabled:opacity-70 transition-all cursor-pointer shadow-red-900/10"
              >
                {isLoading ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Entrar no Painel'
                )}
              </button>
            </div>
          </form>

          {/* Quick instructions (helps review) */}
          <div className="mt-6 pt-6 border-t border-neutral-850 text-center text-xs text-neutral-500">
            <p>Utilize as credenciais padrão do sistema:</p>
            <p className="mt-1 font-mono text-[#ff4d4d]">usuário: <span className="font-bold text-white">admin</span> / senha: <span className="font-bold text-white">admin123</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
