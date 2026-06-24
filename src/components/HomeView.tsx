/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Package, Search, Shield, Truck, MapPin, CheckCircle, Clock, AlertTriangle, ChevronRight } from 'lucide-react';
import { SystemSettings } from '../types';

interface HomeViewProps {
  settings: SystemSettings;
  onSearch: (code: string) => void;
  onNavigateToLogin: () => void;
  isLoading: boolean;
  error: string | null;
}

export default function HomeView({ settings, onSearch, onNavigateToLogin, isLoading, error }: HomeViewProps) {
  const [trackingCode, setTrackingCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingCode.trim()) {
      onSearch(trackingCode.trim().toUpperCase());
    }
  };

  const handleQuickSearch = (code: string) => {
    setTrackingCode(code);
    onSearch(code);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0A] text-white font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/50 backdrop-blur-md border-b border-neutral-800" id="header_public">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleQuickSearch('')}>
            <div className="h-10 w-10 rounded-lg bg-[#B30000] flex items-center justify-center text-white shadow-lg shadow-red-900/20">
              <Package className="h-6 w-6 animate-pulse" />
            </div>
            <span className="text-xl font-bold text-white tracking-tighter uppercase italic font-sans">
              {settings.platformName || 'Jadlog'} <span className="text-[#B30000] text-sm font-semibold tracking-wide not-italic uppercase">Rastreamento</span>
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Admin entry is hidden and only accessible via url query parameters */}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative py-20 md:py-28 bg-[#0A0A0A] text-white overflow-hidden border-b border-neutral-900">
          {/* Decorative geometric overlays */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-950/20 via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 h-96 w-96 rounded-full bg-[#B30000]/5 blur-3xl pointer-events-none" />
          
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-950/50 border border-red-900/60 text-[#ff4d4d] mb-6">
              Rastreamento de Cargas e Encomendas Expressas
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
              Acompanhe sua encomenda em <span className="text-[#B30000]">Tempo Real</span>
            </h1>
            <p className="text-lg md:text-xl text-neutral-300 max-w-2xl mx-auto mb-10 leading-relaxed">
              Digite seu código de rastreamento de 13 dígitos para visualizar a rota, progresso de transferência geográfica e previsão exata de entrega de sua carga.
            </p>

            {/* Tracking Input Container */}
            <div className="max-w-xl mx-auto mb-6">
              <form onSubmit={handleSubmit} className="relative flex flex-col sm:flex-row gap-2 bg-neutral-900/50 p-2 border border-neutral-800 rounded-xl shadow-2xl backdrop-blur-md">
                <div className="relative flex-1 flex items-center">
                  <Search className="absolute left-4 text-neutral-500 h-5 w-5" />
                  <input
                    type="text"
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                    placeholder="Ex: BR123456789BR"
                    className="w-full bg-transparent pl-12 pr-4 py-3 text-white placeholder-neutral-650 focus:outline-hidden text-base tracking-widest font-mono uppercase"
                    maxLength={13}
                    id="input_tracking_code"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-[#B30000] hover:bg-red-700 text-white font-bold text-xs md:text-sm px-6 py-3 rounded-lg flex items-center justify-center space-x-2 transition-all active:scale-98 disabled:opacity-75 shadow-lg shadow-red-900/20 uppercase tracking-widest cursor-pointer"
                  id="btn_submit_search"
                >
                  {isLoading ? (
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Rastrear Agora</span>
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Error Alert */}
              {error && (
                <div className="mt-4 p-3 bg-red-950/40 border border-red-900/50 rounded-lg text-red-200 text-sm flex items-center space-x-2 text-left">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0 text-red-500" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Benefits section */}
        <section className="py-16 bg-[#0A0A0A] border-b border-neutral-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl uppercase tracking-wider">
                Tecnologia de Rastreamento Avançada
              </h2>
              <p className="mt-4 text-lg text-neutral-400">
                Uma solução corporativa robusta para acompanhamento de fluxos de transporte, triagem de pacotes e entregas rápidas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 bg-neutral-900/50 rounded-2xl border border-neutral-800 shadow-lg flex flex-col justify-between" id="benefit_card_1">
                <div>
                  <div className="h-12 w-12 rounded-lg bg-[#B30000]/10 border border-[#B30000]/25 text-[#B30000] flex items-center justify-center mb-4">
                    <Truck className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Traçado de Rota Preciso</h3>
                  <p className="text-neutral-400 text-sm leading-relaxed">
                    Mapeamento inteligente de rotas que projeta de forma geográfica etapas precisas entre cidades, baseado nos CEPs de postagem e destino.
                  </p>
                </div>
              </div>

              <div className="p-6 bg-neutral-900/50 rounded-2xl border border-neutral-800 shadow-lg flex flex-col justify-between" id="benefit_card_2">
                <div>
                  <div className="h-12 w-12 rounded-lg bg-[#B30000]/10 border border-[#B30000]/25 text-[#B30000] flex items-center justify-center mb-4">
                    <Clock className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Progresso em Tempo Real</h3>
                  <p className="text-neutral-400 text-sm leading-relaxed">
                    Sistema de cronologia automatizado que avança as etapas logísticas de acordo com o trânsito da carga, atualizando relatórios e previsões de entrega.
                  </p>
                </div>
              </div>

              <div className="p-6 bg-neutral-900/50 rounded-2xl border border-neutral-800 shadow-lg flex flex-col justify-between" id="benefit_card_3">
                <div>
                  <div className="h-12 w-12 rounded-lg bg-[#B30000]/10 border border-[#B30000]/25 text-[#B30000] flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Gestão Logística Completa</h3>
                  <p className="text-neutral-400 text-sm leading-relaxed">
                    Painel de controle operacional completo para atualizar etapas logísticas, registrar ocorrências personalizadas e gerenciar prazos de encomendas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic Stepper info */}
        <section className="py-16 bg-black/30 border-b border-neutral-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-white mb-8 text-center sm:text-3xl uppercase tracking-widest">
              Ciclo de Transporte Integrado
            </h2>
            
            <div className="relative">
              {/* Stepper horizontal line */}
              <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-neutral-800" />

              <div className="grid grid-cols-2 md:grid-cols-6 gap-6 relative">
                {[
                  { icon: Package, title: 'Objeto Postado', desc: 'Sua carga é registrada na agência postal de origem.' },
                  { icon: Truck, title: 'Em Transferência', desc: 'O pacote viaja entre polos logísticos integrados.' },
                  { icon: MapPin, title: 'Centro Logístico', desc: 'Triagem na central de distribuição logística nacional.' },
                  { icon: MapPin, title: 'Unidade Regional', desc: 'Chegada na central de entrega regional correspondente.' },
                  { icon: Truck, title: 'Saiu para Entrega', desc: 'O veículo sai para o endereço final de entrega.' },
                  { icon: CheckCircle, title: 'Entregue', desc: 'Finalização do ciclo logístico com confirmação de recebimento.' }
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center text-center p-4">
                    <div className="h-14 w-14 rounded-full bg-neutral-950 border border-neutral-850 hover:border-[#B30000] text-[#B30000] flex items-center justify-center shadow-lg mb-4 z-10 transition-all">
                      <item.icon className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-bold text-[#B30000] mb-1 font-mono uppercase tracking-widest">Passo 0{idx + 1}</span>
                    <h4 className="text-sm font-semibold text-white mb-2">{item.title}</h4>
                    <p className="text-xs text-neutral-400 leading-relaxed hidden sm:block">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-black text-neutral-400 border-t border-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Column 1: Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-8 w-8 rounded bg-[#B30000] flex items-center justify-center text-white">
                  <Package className="h-5 w-5" />
                </div>
                <span className="text-lg font-bold tracking-tighter uppercase italic text-white">
                  {settings.platformName || 'Jadlog'} <span className="text-[#B30000] not-italic uppercase text-xs font-semibold">Rastreamento</span>
                </span>
              </div>
              <p className="text-sm text-neutral-500 max-w-sm leading-relaxed mb-4">
                A mais completa plataforma de rastreamento logístico e controle de encomendas expressas.
              </p>
              <span className="text-xs text-neutral-600 block">
                © {new Date().getFullYear()} {settings.platformName || 'Jadlog'} Logística. Todos os direitos reservados.
              </span>
            </div>

            {/* Column 2: Legal */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">Portal Jadlog</h4>
              <ul className="space-y-2 text-sm text-neutral-500">
                <li className="hover:text-white transition-colors cursor-pointer">Termos de Uso</li>
                <li className="hover:text-white transition-colors cursor-pointer">Política de Privacidade</li>
                <li className="hover:text-white transition-colors cursor-pointer">FAQ da Plataforma</li>
                <li className="hover:text-white transition-colors cursor-pointer">Nossas Agências</li>
              </ul>
            </div>

            {/* Column 3: Contact details */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">Suporte & Contato</h4>
              <ul className="space-y-2 text-sm text-neutral-500">
                <li>Email: {settings.contactEmail || 'contato@jadlog.com.br'}</li>
                <li>Telefone: {settings.contactPhone || '(11) 4004-0000'}</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-neutral-900 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-xs text-neutral-600">
              Jadlog Rastreamento de Encomendas Nacionais Ltda. Todos os direitos reservados.
            </div>
            
            <div className="flex gap-4 items-center">
              <span className="w-3 h-3 rounded-full bg-green-500/20 flex items-center justify-center"><div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div></span>
              <span className="text-[10px] text-neutral-500 uppercase tracking-tighter">Status do Sistema: Operacional</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
