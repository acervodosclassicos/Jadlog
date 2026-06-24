/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { Package, MapPin, Calendar, Clock, Weight, ChevronLeft, Printer, RefreshCw, CheckCircle, ArrowRight, CornerDownRight } from 'lucide-react';
import { Tracking, SystemSettings } from '../types';
import { formatDate, getStatusLabel, getStatusBadgeClass } from '../utils';

interface TrackingViewProps {
  tracking: Tracking;
  settings: SystemSettings;
  onBack: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export default function TrackingView({ tracking, settings, onBack, onRefresh, isLoading }: TrackingViewProps) {
  const printAreaRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  // Find current active step in route
  const activeRouteSteps = tracking.route.filter(step => step.active);
  const latestRouteStep = activeRouteSteps.reduce((max, step) => step.order > max.order ? step : max, tracking.route[0]);

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0A] text-white font-sans pb-16">
      {/* Header */}
      <header className="no-print bg-black/50 backdrop-blur-md border-b border-neutral-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center space-x-2 text-sm font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5" />
            <span>Voltar para busca</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 border border-neutral-800 rounded-lg text-neutral-400 bg-neutral-900/50 hover:bg-neutral-800 hover:text-white disabled:opacity-50 transition-all cursor-pointer"
              title="Atualizar Status"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-[#B30000]' : ''}`} />
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-2 px-3 py-2 border border-neutral-800 rounded-lg text-sm font-semibold text-neutral-300 bg-neutral-900/50 hover:bg-neutral-800 hover:text-white transition-all cursor-pointer"
            >
              <Printer className="h-4 w-4 text-[#B30000]" />
              <span className="hidden sm:inline">Imprimir Comprovante</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full print-area" ref={printAreaRef}>
        {/* Package Header Card */}
        <div className="bg-neutral-900/80 rounded-2xl border border-neutral-850 shadow-2xl p-6 mb-8 relative overflow-hidden">
          {/* Accent decoration */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#B30000]" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider font-mono">Código Localizador</span>
                <span className="bg-[#B30000]/10 text-[#B30000] px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border border-[#B30000]/25">Jadlog Cargo</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-mono">
                {tracking.id}
              </h2>
            </div>
            
            <div className="flex flex-col items-start sm:items-end">
              <span className="text-xs text-neutral-500 font-semibold mb-1">Status do Transporte</span>
              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold border ${getStatusBadgeClass(tracking.status)}`}>
                {getStatusLabel(tracking.status)}
              </span>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-neutral-800">
            <div>
              <div className="text-xs text-neutral-500 font-semibold flex items-center mb-1">
                <Calendar className="h-3.5 w-3.5 mr-1 text-[#B30000]" />
                <span>Previsão de Entrega</span>
              </div>
              <span className="text-sm font-bold text-white font-mono">
                {formatDate(tracking.deliveryEstimate) || 'Em definição'}
              </span>
            </div>
            
            <div>
              <div className="text-xs text-neutral-500 font-semibold flex items-center mb-1">
                <Weight className="h-3.5 w-3.5 mr-1 text-[#B30000]" />
                <span>Peso Estimado</span>
              </div>
              <span className="text-sm font-bold text-white font-mono">
                {tracking.weight ? `${tracking.weight.toFixed(3)} kg` : '0.500 kg'}
              </span>
            </div>

            <div>
              <div className="text-xs text-neutral-500 font-semibold flex items-center mb-1">
                <MapPin className="h-3.5 w-3.5 mr-1 text-[#B30000]" />
                <span>Cidade Atual</span>
              </div>
              <span className="text-sm font-bold text-white truncate block">
                {tracking.currentCity} - {tracking.currentState}
              </span>
            </div>

            <div>
              <div className="text-xs text-neutral-500 font-semibold flex items-center mb-1">
                <Clock className="h-3.5 w-3.5 mr-1 text-[#B30000]" />
                <span>Data de Postagem</span>
              </div>
              <span className="text-sm font-bold text-white font-mono">
                {formatDate(tracking.postDate)} às {tracking.postTime}
              </span>
            </div>
          </div>

          {/* Completion Progress Bar */}
          <div className="mt-8 pt-6 border-t border-neutral-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-neutral-300">Progresso de Deslocamento</span>
              <span className="text-sm font-extrabold text-[#B30000] font-mono">{tracking.progressPercent}%</span>
            </div>
            <div className="w-full bg-neutral-950 h-3 rounded-full overflow-hidden border border-neutral-800">
              <div 
                className="bg-gradient-to-r from-[#B30000] to-red-600 h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${tracking.progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Route Map (Visual Steps Diagram) */}
        <div className="bg-neutral-900/80 rounded-2xl border border-neutral-850 p-6 mb-8 shadow-2xl">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center uppercase tracking-widest text-sm">
            <MapPin className="h-5 w-5 mr-2 text-[#B30000]" />
            <span>Mapa Esquemático de Rota</span>
          </h3>

          {/* Map layout helper */}
          <div className="relative">
            {/* Horizontal Line on Desktop */}
            <div className="hidden md:block absolute top-7 left-10 right-10 h-0.5 bg-neutral-800" />
            <div 
              className="hidden md:block absolute top-7 left-10 h-0.5 bg-[#B30000] transition-all duration-1000"
              style={{ 
                width: `${
                  tracking.progressPercent === 100 ? 'calc(100% - 80px)' :
                  tracking.progressPercent === 90 ? 'calc(80% - 30px)' :
                  tracking.progressPercent === 70 ? 'calc(60% - 20px)' :
                  tracking.progressPercent === 50 ? 'calc(40% - 10px)' :
                  tracking.progressPercent === 30 ? 'calc(20% - 5px)' : '0px'
                }`
              }}
            />

            {/* Steps Flow (Vertical on Mobile, Horizontal on Desktop) */}
            <div className="flex flex-col md:flex-row justify-between gap-6 md:gap-2">
              {tracking.route.map((step, index) => {
                const isActive = step.active;
                const isCurrent = latestRouteStep.order === step.order;
                
                return (
                  <div key={index} className="flex md:flex-col items-start md:items-center relative md:flex-1 text-left md:text-center group">
                    {/* Mobile vertical line connecting step */}
                    {index < tracking.route.length - 1 && (
                      <div className="md:hidden absolute left-5 top-10 bottom-[-16px] w-0.5 bg-neutral-800" />
                    )}
                    {index < tracking.route.length - 1 && step.active && tracking.route[index + 1].active && (
                      <div className="md:hidden absolute left-5 top-10 bottom-[-16px] w-0.5 bg-[#B30000] z-5 transition-all" />
                    )}

                    {/* Node Circle */}
                    <div className="flex-shrink-0 z-10">
                      <div className={`
                        h-10 w-10 rounded-full flex items-center justify-center border transition-all duration-500
                        ${isCurrent 
                          ? 'bg-[#B30000] text-white border-[#B30000] ring-4 ring-red-950/40 shadow-lg scale-110' 
                          : isActive 
                            ? 'bg-[#B30000]/10 text-[#B30000] border-[#B30000]/40' 
                            : 'bg-neutral-950 text-neutral-600 border-neutral-800'
                        }
                      `}>
                        {isCurrent ? (
                          <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                          </span>
                        ) : (
                          <span className="text-xs font-extrabold font-mono">{index + 1}</span>
                        )}
                      </div>
                    </div>

                    {/* Step details content */}
                    <div className="ml-4 md:ml-0 md:mt-4 flex-1">
                      <span className={`
                        text-xs font-bold block mb-0.5 uppercase tracking-wide
                        ${isCurrent ? 'text-[#B30000]' : isActive ? 'text-neutral-300' : 'text-neutral-500'}
                      `}>
                        {step.label}
                      </span>
                      <h4 className={`
                        text-sm font-extrabold
                        ${isCurrent ? 'text-white' : isActive ? 'text-neutral-300' : 'text-neutral-500'}
                      `}>
                        {step.city} - {step.state}
                      </h4>
                      {isCurrent && (
                        <span className="inline-block mt-1 px-1.5 py-0.5 bg-red-950/80 text-[#B30000] border border-red-900/40 rounded text-[10px] font-bold uppercase tracking-wider">
                          Localização Atual
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Timeline (Detailed logs) and Address information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main timeline of events (Left column spans 2) */}
          <div className="md:col-span-2 bg-neutral-900/80 rounded-2xl border border-neutral-850 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center uppercase tracking-widest text-sm">
              <Clock className="h-5 w-5 mr-2 text-[#B30000]" />
              <span>Histórico de Atualizações</span>
            </h3>

            <div className="relative border-l-2 border-neutral-800 pl-6 ml-3 space-y-8">
              {tracking.events.map((event, index) => {
                const isNewest = index === 0;
                
                return (
                  <div key={event.id} className="relative group">
                    {/* Event node marker */}
                    <div className={`
                      absolute left-[-31px] top-1.5 h-4 w-4 rounded-full border bg-[#0A0A0A] transition-all
                      ${isNewest 
                        ? 'border-[#B30000] bg-[#B30000] scale-125' 
                        : 'border-neutral-600 group-hover:border-neutral-300'
                      }
                    `} />
                    {isNewest && (
                      <span className="absolute left-[-35px] top-0.5 animate-ping inline-flex h-6 w-6 rounded-full bg-red-500 opacity-20"></span>
                    )}

                    {/* Timestamp */}
                    <div className="text-xs text-neutral-500 font-bold font-mono mb-1 flex items-center space-x-2">
                      <span>{formatDate(event.date)}</span>
                      <span>•</span>
                      <span>{event.time}</span>
                      {isNewest && (
                        <span className="bg-[#B30000]/10 text-[#B30000] text-[10px] font-bold px-1.5 py-0.2 rounded uppercase border border-[#B30000]/25">
                          Última atualização
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <h4 className={`text-base font-bold ${isNewest ? 'text-white' : 'text-neutral-300'}`}>
                      {event.description}
                    </h4>

                    {/* Location detail */}
                    <div className="text-sm text-neutral-400 font-semibold flex items-center mt-1">
                      <MapPin className="h-3.5 w-3.5 mr-1 text-[#B30000]/65" />
                      <span>{event.city} - {event.state}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Logistics Summary Details (Right column spans 1) */}
          <div className="space-y-6">
            {/* Origin & Destination Card */}
            <div className="bg-neutral-900/80 rounded-2xl border border-neutral-850 p-6 shadow-2xl">
              <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4">
                Informações de Rota
              </h3>

              <div className="space-y-4">
                {/* Remetente Origem */}
                <div className="relative pl-6">
                  <div className="absolute left-0 top-1 h-3 w-3 rounded-full border-2 border-blue-500 bg-neutral-950" />
                  <span className="text-xs text-neutral-500 font-bold block uppercase tracking-wider">Origem de Postagem</span>
                  <span className="text-sm font-bold text-white block">{tracking.senderCity} - {tracking.senderState}</span>
                  <span className="text-xs text-neutral-400 font-mono">CEP {tracking.senderCEP}</span>
                </div>

                {/* Vertical arrow */}
                <div className="border-l-2 border-dashed border-neutral-800 ml-1.5 py-2 pl-4 flex items-center text-xs text-neutral-500">
                  <ArrowRight className="h-3.5 w-3.5 rotate-90 text-neutral-700 mr-2" />
                  <span>Em trânsito nacional</span>
                </div>

                {/* Destinatário Destino */}
                <div className="relative pl-6">
                  <div className="absolute left-0 top-1 h-3 w-3 rounded-full border-2 border-emerald-500 bg-neutral-950" />
                  <span className="text-xs text-neutral-500 font-bold block uppercase tracking-wider">Entrega Destino</span>
                  <span className="text-sm font-bold text-white block">{tracking.recipientCity} - {tracking.recipientState}</span>
                  <span className="text-xs text-neutral-400 font-mono">CEP {tracking.recipientCEP}</span>
                </div>
              </div>
            </div>

            {/* Delivery Specifications Card */}
            <div className="bg-neutral-900/80 rounded-2xl border border-neutral-850 p-6 shadow-2xl">
              <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4">
                Especificações Técnicas
              </h3>

              <ul className="space-y-3 text-sm">
                <li className="flex justify-between pb-2 border-b border-neutral-850">
                  <span className="text-neutral-400 font-medium">Destinatário:</span>
                  <span className="font-bold text-white text-right truncate max-w-[150px]">{tracking.recipientName}</span>
                </li>
                <li className="flex justify-between pb-2 border-b border-neutral-850">
                  <span className="text-neutral-400 font-medium">Peso líquido:</span>
                  <span className="font-bold text-white font-mono">{tracking.weight ? tracking.weight.toFixed(3) : '0.500'} kg</span>
                </li>
                {tracking.observations && (
                  <li className="pt-2">
                    <span className="text-neutral-550 text-xs font-bold block uppercase mb-1">Notas Internas</span>
                    <p className="text-xs text-neutral-350 bg-neutral-950 p-2.5 rounded-lg border border-neutral-800 italic leading-relaxed">
                      "{tracking.observations}"
                    </p>
                  </li>
                )}
              </ul>
            </div>

            {/* Real logistics notice box */}
            <div className="bg-neutral-900/40 border border-neutral-850 p-4 rounded-xl text-xs text-neutral-300 leading-relaxed space-y-2 shadow-lg">
              <span className="font-bold flex items-center text-[#B30000] uppercase tracking-wider text-[10px]">
                <CheckCircle className="h-3.5 w-3.5 mr-1 text-[#B30000]/85" />
                <span>Rastreamento Oficial</span>
              </span>
              <p className="text-neutral-450 text-[11px]">
                As informações mostradas acima são atualizadas automaticamente conforme o progresso do frete e triagem logística de sua encomenda.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
