/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Package, Calendar, Clock, MapPin, Settings, LogOut, 
  Plus, Edit2, Copy, Trash2, Eye, Play, Pause, FastForward, ArrowLeftRight,
  Database, UserCheck, ShieldAlert, CheckCircle, RefreshCw, AlertTriangle, FileText, Globe
} from 'lucide-react';
import { Tracking, TrackingEvent, RouteStep, SystemSettings, SystemLog, TrackingStatus } from '../types';
import { formatDate, getStatusLabel, getStatusBadgeClass } from '../utils';

interface AdminDashboardProps {
  token: string;
  adminUser: { username: string; name: string } | null;
  onLogout: () => void;
  publicUrl: string;
}

// Local CEP lookup for immediate frontend autocomplete
function frontendCEP(cep: string) {
  const clean = cep.replace(/\D/g, '');
  if (clean.length !== 8) return { valid: false, city: '', state: '' };
  
  const p1 = parseInt(clean.substring(0, 1));
  const p2 = parseInt(clean.substring(0, 2));

  let state = 'SP';
  let city = 'São Paulo';

  if (p1 === 0 || p1 === 1) {
    state = 'SP';
    if (p1 === 0) city = 'São Paulo';
    else if (p2 === 13) city = 'Campinas';
    else if (p2 === 14) city = 'Ribeirão Preto';
    else if (p2 === 11) city = 'Santos';
    else if (p2 === 18) city = 'Sorocaba';
    else city = 'São José dos Campos';
  } else if (p2 >= 20 && p2 <= 28) {
    state = 'RJ';
    if (p2 === 20 || p2 === 21 || p2 === 22 || p2 === 23) city = 'Rio de Janeiro';
    else if (p2 === 24) city = 'Niterói';
    else if (p2 === 25) city = 'Duque de Caxias';
    else city = 'Campos dos Goytacazes';
  } else if (p2 === 29) {
    state = 'ES';
    city = 'Vitória';
  } else if (p1 === 3) {
    state = 'MG';
    if (p2 === 30 || p2 === 31) city = 'Belo Horizonte';
    else if (p2 === 32) city = 'Contagem';
    else if (p2 === 33) city = 'Betim';
    else if (p2 === 38) city = 'Uberlândia';
    else city = 'Juiz de Fora';
  } else if (p1 === 4) {
    if (p2 >= 40 && p2 <= 48) {
      state = 'BA';
      if (p2 === 40 || p2 === 41 || p2 === 42) city = 'Salvador';
      else if (p2 === 44) city = 'Feira de Santana';
      else city = 'Vitória da Conquista';
    } else {
      state = 'SE';
      city = 'Aracaju';
    }
  } else if (p1 === 5) {
    if (p2 >= 50 && p2 <= 56) {
      state = 'PE';
      city = 'Recife';
    } else if (p2 === 57) {
      state = 'AL';
      city = 'Maceió';
    } else if (p2 === 58) {
      state = 'PB';
      city = 'João Pessoa';
    } else if (p2 === 59) {
      state = 'RN';
      city = 'Natal';
    }
  } else if (p1 === 6) {
    if (p2 >= 60 && p2 <= 63) {
      state = 'CE';
      city = 'Fortaleza';
    } else if (p2 === 64) {
      state = 'PI';
      city = 'Teresina';
    } else if (p2 === 65) {
      state = 'MA';
      city = 'São Luís';
    } else if (p2 === 66 || p2 === 67) {
      state = 'PA';
      city = 'Belém';
    } else if (p2 === 68) {
      state = 'AP';
      city = 'Macapá';
    } else if (p2 === 69) {
      state = 'AM';
      city = 'Manaus';
    } else {
      state = 'CE';
      city = 'Sobral';
    }
  } else if (p1 === 7) {
    if (p2 >= 70 && p2 <= 72) {
      state = 'DF';
      city = 'Brasília';
    } else if (p2 >= 73 && p2 <= 76) {
      state = 'GO';
      city = 'Goiânia';
    } else if (p2 === 77) {
      state = 'TO';
      city = 'Palmas';
    } else if (p2 === 78) {
      state = 'MT';
      city = 'Cuiabá';
    } else if (p2 === 79) {
      state = 'MS';
      city = 'Campo Grande';
    }
  } else if (p1 === 8) {
    if (p2 >= 80 && p2 <= 87) {
      state = 'PR';
      if (p2 === 80 || p2 === 81 || p2 === 82) city = 'Curitiba';
      else if (p2 === 86) city = 'Londrina';
      else city = 'Maringá';
    } else if (p2 >= 88 && p2 <= 89) {
      state = 'SC';
      if (p2 === 88) city = 'Florianópolis';
      else city = 'Joinville';
    }
  } else if (p1 === 9) {
    state = 'RS';
    if (p2 === 90 || p2 === 91 || p2 === 92 || p2 === 93) city = 'Porto Alegre';
    else if (p2 === 94) city = 'Caxias do Sul';
    else city = 'Pelotas';
  }

  return { valid: true, city, state };
}

export default function AdminDashboard({ token, adminUser, onLogout, publicUrl }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'trackings' | 'settings' | 'logs' | 'profile'>('dashboard');
  
  // Dashboard Metrics
  const [metrics, setMetrics] = useState({
    total: 0,
    transit: 0,
    delivered: 0,
    pending: 0,
    paused: 0,
    updatesToday: 0
  });

  // State Lists
  const [trackings, setTrackings] = useState<Tracking[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [settings, setSettings] = useState<SystemSettings>({
    platformName: '', logoUrl: '', primaryColor: '#B30000', updateIntervalDays: 2,
    institutionalText: '', aboutUs: '', contactEmail: '', contactPhone: ''
  });

  // UI state managers
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Modals / Editors
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingTracking, setEditingTracking] = useState<Tracking | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventTargetTrackingId, setEventTargetTrackingId] = useState<string | null>(null);

  // New Tracking Form Fields
  const [formId, setFormId] = useState('');
  const [formRecipient, setFormRecipient] = useState('');
  const [formSenderCEP, setFormSenderCEP] = useState('');
  const [formSenderCity, setFormSenderCity] = useState('');
  const [formSenderState, setFormSenderState] = useState('');
  const [formRecipientCEP, setFormRecipientCEP] = useState('');
  const [formRecipientCity, setFormRecipientCity] = useState('');
  const [formRecipientState, setFormRecipientState] = useState('');
  const [formWeight, setFormWeight] = useState('0.500');
  const [formObservations, setFormObservations] = useState('');
  const [formPostDate, setFormPostDate] = useState(new Date().toISOString().split('T')[0]);
  const [formPostTime, setFormPostTime] = useState(new Date().toTimeString().substring(0, 5));
  const [formAutoUpdate, setFormAutoUpdate] = useState(true);

  // Custom Event Form Fields
  const [evtType, setEvtType] = useState<string>('custom');
  const [evtCity, setEvtCity] = useState('');
  const [evtState, setEvtState] = useState('');
  const [evtDate, setEvtDate] = useState(new Date().toISOString().split('T')[0]);
  const [evtTime, setEvtTime] = useState(new Date().toTimeString().substring(0, 5));
  const [evtDesc, setEvtDesc] = useState('');

  // Profile Form Fields
  const [profileName, setProfileName] = useState(adminUser?.name || '');
  const [profilePassword, setProfilePassword] = useState('');

  // Fetch Stats and Data on load
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Metrics
      const mRes = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (mRes.ok) {
        const mData = await mRes.json();
        setMetrics(mData);
      }

      // 2. Trackings
      const tRes = await fetch('/api/admin/trackings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (tRes.ok) {
        const tData = await tRes.json();
        setTrackings(tData);
      }

      // 3. Settings
      const sRes = await fetch('/api/admin/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (sRes.ok) {
        const sData = await sRes.json();
        setSettings(sData);
      }

      // 4. Logs
      const lRes = await fetch('/api/admin/logs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (lRes.ok) {
        const lData = await lRes.json();
        setLogs(lData);
      }

    } catch (err: any) {
      setError('Erro ao sincronizar dados com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, token]);

  // CEP inputs triggers
  useEffect(() => {
    const sLookup = frontendCEP(formSenderCEP);
    if (sLookup.valid) {
      setFormSenderCity(sLookup.city);
      setFormSenderState(sLookup.state);
    }
  }, [formSenderCEP]);

  useEffect(() => {
    const rLookup = frontendCEP(formRecipientCEP);
    if (rLookup.valid) {
      setFormRecipientCity(rLookup.city);
      setFormRecipientState(rLookup.state);
    }
  }, [formRecipientCEP]);

  // Copy tracking URL helper
  const copyTrackingUrl = (id: string) => {
    // Generate copyable URL
    const url = `${publicUrl}?track=${id}`;
    navigator.clipboard.writeText(url);
    showToast(`Link de rastreamento de ${id} copiado!`);
  };

  const showToast = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Create or Update Tracking submit handler
  const handleTrackingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formRecipient.trim() || !formSenderCEP || !formRecipientCEP) {
      setError('Por favor, preencha o destinatário e os CEPs de origem e destino.');
      return;
    }

    const payload = {
      id: formId ? formId.toUpperCase() : undefined,
      recipientName: formRecipient,
      senderCEP: formSenderCEP,
      recipientCEP: formRecipientCEP,
      postDate: formPostDate,
      postTime: formPostTime,
      weight: parseFloat(formWeight) || 0.5,
      observations: formObservations,
      autoUpdate: formAutoUpdate
    };

    try {
      const url = editingTracking 
        ? `/api/admin/trackings/${editingTracking.id}`
        : '/api/admin/trackings';
      const method = editingTracking ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Falha ao salvar dados.');
      }

      showToast(editingTracking ? 'Encomenda editada com sucesso!' : 'Nova encomenda criada com sucesso!');
      setShowFormModal(false);
      resetFormFields();
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Create custom event handler
  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!evtCity.trim() || !evtState.trim() || !evtDesc.trim()) {
      setError('Por favor, preencha todos os campos obrigatórios do evento.');
      return;
    }

    const payload = {
      city: evtCity,
      state: evtState.toUpperCase(),
      date: evtDate,
      time: evtTime,
      description: evtDesc,
      type: evtType
    };

    try {
      const res = await fetch(`/api/admin/trackings/${eventTargetTrackingId}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Falha ao criar evento.');
      }

      showToast('Evento customizado adicionado com sucesso!');
      setShowEventModal(false);
      resetEventFields();
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Toggle Auto-Update
  const handleToggleAutoUpdate = async (tracking: Tracking) => {
    try {
      const res = await fetch(`/api/admin/trackings/${tracking.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ autoUpdate: !tracking.autoUpdate })
      });
      if (res.ok) {
        showToast(`Atualização automática de ${tracking.id} ${!tracking.autoUpdate ? 'reativada' : 'pausada'}!`);
        fetchData();
      }
    } catch (err) {
      setError('Erro ao alterar automação.');
    }
  };

  // Advance state manually
  const handleAdvanceState = async (tracking: Tracking, direction: 'forward' | 'backward') => {
    // Stage indexes
    const stages: TrackingStatus[] = ['posted', 'transit', 'hub', 'regional', 'delivery', 'delivered'];
    const currentIdx = stages.indexOf(tracking.status);
    
    let targetIdx = currentIdx;
    if (direction === 'forward' && currentIdx < 5) targetIdx++;
    if (direction === 'backward' && currentIdx > 0) targetIdx--;

    if (targetIdx === currentIdx) return;

    const targetStatus = stages[targetIdx];
    
    // Map of text descs
    const descs: Record<TrackingStatus, string> = {
      posted: 'Objeto postado na agência de origem.',
      transit: 'Objeto em transferência para o centro logístico.',
      hub: 'Objeto recebido no centro logístico nacional.',
      regional: 'Objeto recebido na unidade de distribuição regional.',
      delivery: 'Objeto saiu para entrega domiciliar ao destinatário.',
      delivered: 'Objeto entregue ao destinatário com sucesso.',
      paused: 'Trânsito de entrega pausado pelo administrador.',
      canceled: 'Deslocamento cancelado e objeto devolvido ao remetente.'
    };

    // Get city from route for target step
    const stepCity = tracking.route[targetIdx]?.city || tracking.recipientCity;
    const stepState = tracking.route[targetIdx]?.state || tracking.recipientState;

    // We can append this event directly
    const payload = {
      city: stepCity,
      state: stepState,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().substring(0, 5),
      description: descs[targetStatus],
      type: targetStatus
    };

    try {
      const res = await fetch(`/api/admin/trackings/${tracking.id}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast(`Encomenda ${tracking.id} atualizada para '${getStatusLabel(targetStatus)}'!`);
        fetchData();
      }
    } catch (err) {
      setError('Erro ao forçar transição manual.');
    }
  };

  // Duplicate Tracking
  const handleDuplicate = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/trackings/${id}/duplicate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Encomenda duplicada com sucesso!');
        fetchData();
      }
    } catch (err) {
      setError('Erro ao duplicar.');
    }
  };

  // Delete Tracking
  const handleDelete = async (id: string) => {
    if (!confirm(`Tem certeza que deseja excluir permanentemente o código de rastreio ${id}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/trackings/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Rastreamento excluído com sucesso.');
        fetchData();
      }
    } catch (err) {
      setError('Erro ao excluir.');
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });

      if (res.ok) {
        showToast('Configurações salvas com sucesso!');
        fetchData();
      } else {
        const d = await res.json();
        throw new Error(d.error);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar configurações.');
    }
  };

  // Clear Audit Logs
  const handleClearLogs = async () => {
    if (!confirm('Deseja limpar todos os registros de auditoria do sistema?')) return;
    try {
      const res = await fetch('/api/admin/logs/clear', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Logs de auditoria limpos!');
        fetchData();
      }
    } catch (err) {
      setError('Erro ao limpar logs.');
    }
  };

  // Update Admin Profile Credentials
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/express/..' /* Fallback or exact route */, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: profileName, password: profilePassword })
      });
      
      // Since profile route is put at /api/admin/profile in server.ts
      const finalRes = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: profileName, password: profilePassword })
      });

      if (finalRes.ok) {
        showToast('Perfil administrativo salvo com sucesso!');
        setProfilePassword('');
      } else {
        const d = await finalRes.json();
        throw new Error(d.error);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar perfil.');
    }
  };


  // Resets
  const resetFormFields = () => {
    setFormId('');
    setFormRecipient('');
    setFormSenderCEP('');
    setFormSenderCity('');
    setFormSenderState('');
    setFormRecipientCEP('');
    setFormRecipientCity('');
    setFormRecipientState('');
    setFormWeight('0.500');
    setFormObservations('');
    setFormPostDate(new Date().toISOString().split('T')[0]);
    setFormPostTime(new Date().toTimeString().substring(0, 5));
    setFormAutoUpdate(true);
    setEditingTracking(null);
  };

  const resetEventFields = () => {
    setEvtType('custom');
    setEvtCity('');
    setEvtState('');
    setEvtDate(new Date().toISOString().split('T')[0]);
    setEvtTime(new Date().toTimeString().substring(0, 5));
    setEvtDesc('');
    setEventTargetTrackingId(null);
  };

  const openCreateModal = () => {
    resetFormFields();
    setShowFormModal(true);
  };

  const openEditModal = (t: Tracking) => {
    setEditingTracking(t);
    setFormId(t.id);
    setFormRecipient(t.recipientName);
    setFormSenderCEP(t.senderCEP);
    setFormSenderCity(t.senderCity);
    setFormSenderState(t.senderState);
    setFormRecipientCEP(t.recipientCEP);
    setFormRecipientCity(t.recipientCity);
    setFormRecipientState(t.recipientState);
    setFormWeight(t.weight.toString());
    setFormObservations(t.observations);
    setFormPostDate(t.postDate);
    setFormPostTime(t.postTime);
    setFormAutoUpdate(t.autoUpdate);
    setShowFormModal(true);
  };

  const openEventModal = (tId: string, currentCity: string, currentState: string) => {
    resetEventFields();
    setEventTargetTrackingId(tId);
    setEvtCity(currentCity);
    setEvtState(currentState);
    setShowEventModal(true);
  };

  // Filter trackings based on search
  const filteredTrackings = trackings.filter(t => {
    const q = searchQuery.toLowerCase().trim();
    return t.id.toLowerCase().includes(q) || 
           t.recipientName.toLowerCase().includes(q) ||
           t.recipientCity.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-gray-100 flex flex-col md:flex-row font-sans">
      
      {/* Toast Notification */}
      {successMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#B30000] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center space-x-3 border border-red-700 animate-bounce">
          <CheckCircle className="h-5 w-5" />
          <span className="font-bold text-sm">{successMsg}</span>
        </div>
      )}

      {/* Sidebar navigation */}
      <aside className="w-full md:w-64 bg-neutral-900/65 border-b md:border-b-0 md:border-r border-neutral-850 flex-shrink-0 flex flex-col">
        {/* Brand header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-neutral-850 bg-black">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded bg-[#B30000] flex items-center justify-center text-white">
              <Database className="h-5 w-5" />
            </div>
            <span className="font-extrabold text-sm tracking-wide">
              {settings.platformName || 'Jadlog'} <span className="text-[#B30000] text-xs">Admin</span>
            </span>
          </div>
          <span className="md:hidden bg-red-950 text-[#ff4d4d] px-2 py-0.5 rounded text-[10px] font-bold">Painel</span>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'dashboard' ? 'bg-[#B30000] text-white shadow-lg' : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'}`}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span>Painel</span>
          </button>

          <button
            onClick={() => setActiveTab('trackings')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'trackings' ? 'bg-[#B30000] text-white shadow-lg' : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'}`}
          >
            <Package className="h-5 w-5" />
            <span>Rastreamentos</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'settings' ? 'bg-[#B30000] text-white shadow-lg' : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'}`}
          >
            <Settings className="h-5 w-5" />
            <span>Configurações</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'logs' ? 'bg-[#B30000] text-white shadow-lg' : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'}`}
          >
            <FileText className="h-5 w-5" />
            <span>Logs de Auditoria</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'profile' ? 'bg-[#B30000] text-white shadow-lg' : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'}`}
          >
            <UserCheck className="h-5 w-5" />
            <span>Perfil</span>
          </button>
        </nav>

        {/* User context footer */}
        <div className="p-4 border-t border-neutral-850 bg-black/40 flex items-center justify-between">
          <div className="truncate pr-2">
            <span className="block text-xs text-neutral-500 font-bold uppercase tracking-wider">Logado como</span>
            <span className="block text-sm font-bold text-white truncate">{adminUser?.name || 'Administrador'}</span>
          </div>
          <button
            onClick={onLogout}
            className="p-2 text-neutral-400 hover:text-[#B30000] hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
            title="Sair"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header info */}
        <header className="h-16 border-b border-neutral-850 bg-neutral-900/40 flex items-center justify-between px-6 md:px-8">
          <h1 className="text-lg font-extrabold text-white capitalize">
            {activeTab === 'dashboard' && 'Visão Geral do Painel'}
            {activeTab === 'trackings' && 'Gerenciamento de Encomendas'}
            {activeTab === 'settings' && 'Ajustes Globais de Configuração'}
            {activeTab === 'logs' && 'Histórico Geral de Atividades'}
            {activeTab === 'profile' && 'Minhas Credenciais de Acesso'}
          </h1>

          <div className="flex items-center space-x-4">
            {activeTab === 'trackings' && (
              <button
                onClick={openCreateModal}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-bold text-white bg-[#B30000] hover:bg-[#900000] transition-colors cursor-pointer shadow-lg shadow-red-950/20"
              >
                <Plus className="h-4 w-4" />
                <span>Nova Encomenda</span>
              </button>
            )}
            
            <button
              onClick={fetchData}
              disabled={isLoading}
              className="p-2 border border-neutral-850 rounded-lg text-neutral-450 bg-neutral-900/50 hover:bg-neutral-850 hover:text-white disabled:opacity-50 transition-all cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-[#B30000]' : ''}`} />
            </button>
          </div>
        </header>

        {/* Inner Scrollable Panel */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#0A0A0A]">
          
          {error && (
            <div className="p-4 bg-red-950/40 border border-red-900/60 text-red-200 rounded-xl mb-6 flex items-start space-x-3 text-sm">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-500 mt-0.5" />
              <div>
                <span className="font-bold block text-red-400">Ocorreu um erro operacional:</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* 1. DASHBOARD VIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* KPIs Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                
                <div className="p-5 bg-gray-900 border border-gray-800 rounded-xl shadow-xs">
                  <span className="text-xs text-gray-500 font-extrabold uppercase tracking-wider block mb-1">Total Geral</span>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-black text-white">{metrics.total}</span>
                    <span className="text-xs text-gray-400">itens</span>
                  </div>
                </div>

                <div className="p-5 bg-gray-900 border border-gray-800 rounded-xl shadow-xs">
                  <span className="text-xs text-gray-500 font-extrabold uppercase tracking-wider block mb-1 text-amber-500">Em Trânsito</span>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-black text-amber-500">{metrics.transit}</span>
                    <span className="text-xs text-gray-400">cargas</span>
                  </div>
                </div>

                <div className="p-5 bg-gray-900 border border-gray-800 rounded-xl shadow-xs">
                  <span className="text-xs text-gray-500 font-extrabold uppercase tracking-wider block mb-1 text-emerald-500">Entregues</span>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-black text-emerald-400">{metrics.delivered}</span>
                    <span className="text-xs text-gray-400">concluídos</span>
                  </div>
                </div>

                <div className="p-5 bg-gray-900 border border-gray-800 rounded-xl shadow-xs">
                  <span className="text-xs text-gray-500 font-extrabold uppercase tracking-wider block mb-1 text-blue-400">Pendentes</span>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-black text-blue-400">{metrics.pending}</span>
                    <span className="text-xs text-gray-400">aguardando</span>
                  </div>
                </div>

                <div className="col-span-2 lg:col-span-1 p-5 bg-gray-900 border border-gray-800 rounded-xl shadow-xs">
                  <span className="text-xs text-gray-500 font-extrabold uppercase tracking-wider block mb-1 text-rose-500">Eventos do Dia</span>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-black text-rose-400">{metrics.updatesToday}</span>
                    <span className="text-xs text-gray-400">logs</span>
                  </div>
                </div>

              </div>

              {/* Quick actions box & Setup status */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Control card */}
                <div className="lg:col-span-2 p-6 bg-gray-900 border border-gray-800 rounded-2xl space-y-4">
                  <h3 className="text-lg font-bold text-white flex items-center">
                    <ShieldAlert className="h-5 w-5 text-[#B30000] mr-2" />
                    <span>Automação e Agendamento Logístico</span>
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    O painel de controle logístico permite o acompanhamento cronológico automático. A cada <span className="text-white font-bold">{settings.updateIntervalDays} dias</span> passados da data de postagem original de uma encomenda ativa com "automação" habilitada, o sistema gera o evento seguinte na linha do tempo.
                  </p>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Você pode pausar a automação de qualquer rastreamento para controlar os eventos manualmente, ou avançar instantaneamente clicando em <span className="text-[#ff4d4d] font-bold">Avançar</span> na tabela.
                  </p>
                  <div className="pt-2 flex flex-wrap gap-3">
                    <button
                      onClick={openCreateModal}
                      className="px-4 py-2 rounded bg-[#B30000] hover:bg-[#900000] text-sm font-bold text-white transition-all cursor-pointer"
                    >
                      Criar Código Customizado
                    </button>
                    <button
                      onClick={() => setActiveTab('trackings')}
                      className="px-4 py-2 rounded bg-gray-850 hover:bg-gray-800 text-sm font-bold text-gray-300 transition-all border border-gray-800 cursor-pointer"
                    >
                      Ir para Encomendas
                    </button>
                  </div>
                </div>

                {/* Info Card */}
                <div className="p-6 bg-gray-900 border border-gray-800 rounded-2xl flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2 flex items-center">
                      <Globe className="h-5 w-5 text-blue-500 mr-2" />
                      <span>URL Pública de Acesso</span>
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed mb-4">
                      Seus clientes ou alunos podem acessar diretamente a área de busca sem necessidade de login utilizando a URL base da plataforma.
                    </p>
                    <div className="bg-gray-950 p-3 rounded-lg border border-gray-800 font-mono text-xs select-all text-blue-400 break-all">
                      {publicUrl}
                    </div>
                  </div>
                  <a
                    href={publicUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 text-xs font-bold text-[#ff4d4d] hover:underline flex items-center self-start"
                  >
                    <span>Visualizar portal de consulta</span>
                    <Plus className="h-3 w-3 ml-1 rotate-45" />
                  </a>
                </div>

              </div>

              {/* Recent activity Logs */}
              <div className="p-6 bg-gray-900 border border-gray-800 rounded-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-white">Auditoria Operacional Recente</h3>
                  <button
                    onClick={() => setActiveTab('logs')}
                    className="text-xs font-bold text-[#ff4d4d] hover:underline cursor-pointer"
                  >
                    Ver todos os logs
                  </button>
                </div>

                <div className="space-y-4">
                  {logs.slice(0, 5).map(log => (
                    <div key={log.id} className="p-3 bg-gray-950 border border-gray-800/60 rounded-xl text-xs flex items-start justify-between">
                      <div>
                        <span className="font-extrabold text-[#ff4d4d] block mb-1 uppercase tracking-wide">{log.action}</span>
                        <p className="text-gray-300 leading-relaxed font-semibold">{log.details}</p>
                      </div>
                      <span className="text-[10px] text-gray-500 font-mono pl-4 flex-shrink-0">
                        {new Date(log.timestamp).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  ))}

                  {logs.length === 0 && (
                    <p className="text-center text-xs text-gray-500 py-6">Nenhum evento registrado no histórico.</p>
                  )}
                </div>
              </div>

            </div>
          )}


          {/* 2. TRACKINGS MANAGEMENT VIEW */}
          {activeTab === 'trackings' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Search & filters */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:max-w-sm">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filtrar por código, destinatário ou cidade..."
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-4 pr-10 py-2 text-sm text-white placeholder-gray-500 focus:outline-hidden focus:ring-1 focus:ring-[#B30000]"
                  />
                </div>

                <div className="text-xs text-gray-500 font-semibold">
                  Mostrando {filteredTrackings.length} de {trackings.length} encomendas
                </div>
              </div>

              {/* Main trackings table list */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-950 border-b border-gray-800 text-gray-400 font-bold text-xs uppercase tracking-wider">
                        <th className="p-4">Código / Destinatário</th>
                        <th className="p-4">Origem / Destino</th>
                        <th className="p-4">Localização Atual</th>
                        <th className="p-4">Status / Progresso</th>
                        <th className="p-4">Automação</th>
                        <th className="p-4 text-right">Ações de Controle</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800 font-semibold text-gray-300">
                      {filteredTrackings.map(t => (
                        <tr key={t.id} className="hover:bg-gray-850/40 transition-colors">
                          <td className="p-4">
                            <span className="block font-black font-mono text-white text-base">{t.id}</span>
                            <span className="text-xs text-gray-400 block truncate max-w-[150px]">{t.recipientName}</span>
                          </td>
                          
                          <td className="p-4">
                            <div className="text-xs space-y-0.5">
                              <span className="block text-gray-400">O: {t.senderCity} ({t.senderCEP})</span>
                              <span className="block text-white">D: {t.recipientCity} ({t.recipientCEP})</span>
                            </div>
                          </td>

                          <td className="p-4">
                            <span className="block text-sm font-bold text-gray-100">{t.currentCity}</span>
                            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Estado: {t.currentState}</span>
                          </td>

                          <td className="p-4">
                            <div className="mb-1 flex items-center justify-between text-xs">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusBadgeClass(t.status)}`}>
                                {getStatusLabel(t.status)}
                              </span>
                              <span className="font-mono text-gray-400">{t.progressPercent}%</span>
                            </div>
                            <div className="w-24 bg-gray-950 h-1 rounded-full overflow-hidden">
                              <div className="bg-[#B30000] h-full" style={{ width: `${t.progressPercent}%` }} />
                            </div>
                          </td>

                          <td className="p-4">
                            <button
                              onClick={() => handleToggleAutoUpdate(t)}
                              className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${t.autoUpdate ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/40' : 'bg-amber-950 text-amber-400 border border-amber-900/40'}`}
                            >
                              {t.autoUpdate ? (
                                <>
                                  <Play className="h-3 w-3" />
                                  <span>Ativa</span>
                                </>
                              ) : (
                                <>
                                  <Pause className="h-3 w-3" />
                                  <span>Pausada</span>
                                </>
                              )}
                            </button>
                          </td>

                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end space-x-2.5">
                              {/* Add Event shortcut */}
                              <button
                                onClick={() => openEventModal(t.id, t.currentCity, t.currentState)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
                                title="Adicionar Ocorrência / Evento"
                              >
                                <Plus className="h-4 w-4" />
                              </button>

                              {/* Quick manual progression */}
                              <button
                                onClick={() => handleAdvanceState(t, 'forward')}
                                disabled={t.status === 'delivered'}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-gray-800 transition-colors disabled:opacity-30 cursor-pointer"
                                title="Avançar Etapa Logística"
                              >
                                <FastForward className="h-4 w-4" />
                              </button>

                              {/* Copy URL */}
                              <button
                                onClick={() => copyTrackingUrl(t.id)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-gray-800 transition-colors cursor-pointer"
                                title="Copiar Link de Rastreio"
                              >
                                <Copy className="h-4 w-4" />
                              </button>

                              {/* Duplicate */}
                              <button
                                onClick={() => handleDuplicate(t.id)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-400 hover:bg-gray-800 transition-colors cursor-pointer"
                                title="Duplicar Rastreamento"
                              >
                                <ArrowLeftRight className="h-4 w-4" />
                              </button>

                              {/* Edit details */}
                              <button
                                onClick={() => openEditModal(t)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-[#ff4d4d] hover:bg-gray-800 transition-colors cursor-pointer"
                                title="Editar Informações"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => handleDelete(t.id)}
                                className="p-1.5 rounded-lg text-gray-500 hover:text-red-500 hover:bg-gray-800 transition-colors cursor-pointer"
                                title="Excluir Rastreamento"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {filteredTrackings.length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-gray-500">
                            Nenhuma encomenda encontrada com os filtros de busca.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}


          {/* 3. SYSTEM SETTINGS VIEW */}
          {activeTab === 'settings' && (
            <div className="max-w-3xl animate-fadeIn">
              <form onSubmit={handleSaveSettings} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Nome da Plataforma
                    </label>
                    <input
                      type="text"
                      value={settings.platformName}
                      onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                      className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-hidden focus:ring-1 focus:ring-[#B30000]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Cor Principal da Marca (HEX)
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="color"
                        value={settings.primaryColor}
                        onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                        className="h-10 w-10 bg-transparent border border-gray-800 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={settings.primaryColor}
                        onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                        className="flex-1 bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-sm text-white font-mono"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Intervalo de Atualização de Etapas (Dias)
                    </label>
                    <input
                      type="number"
                      value={settings.updateIntervalDays}
                      onChange={(e) => setSettings({ ...settings, updateIntervalDays: Number(e.target.value) || 2 })}
                      min={1}
                      max={30}
                      className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-hidden focus:ring-1 focus:ring-[#B30000]"
                      required
                    />
                    <span className="text-[10px] text-gray-500 mt-1 block">
                      A cada quantos dias de postagem a encomenda deve avançar de etapa automaticamente.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      URL de Logo Customizado (Opcional)
                    </label>
                    <input
                      type="text"
                      value={settings.logoUrl}
                      onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                      placeholder="Ex: https://dominio.com/logo.png"
                      className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Email de Contato Público
                    </label>
                    <input
                      type="email"
                      value={settings.contactEmail}
                      onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                      className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Telefone de Contato Público
                    </label>
                    <input
                      type="text"
                      value={settings.contactPhone}
                      onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                      className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Texto Institucional / Termos de Uso
                  </label>
                  <textarea
                    rows={4}
                    value={settings.institutionalText}
                    onChange={(e) => setSettings({ ...settings, institutionalText: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-hidden leading-relaxed font-semibold"
                    required
                  />
                  <span className="text-[10px] text-gray-500 mt-1 block">
                    Defina o texto institucional e os termos legais exibidos publicamente no rodapé.
                  </span>
                </div>

                <div className="pt-4 border-t border-gray-800 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-[#B30000] hover:bg-[#900000] transition-colors cursor-pointer shadow-lg"
                  >
                    Salvar Configurações
                  </button>
                </div>
              </form>
            </div>
          )}


          {/* 4. AUDIT LOGS VIEW */}
          {activeTab === 'logs' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-400 font-semibold">
                  Auditoria de eventos gerados por automação e controle administrativo
                </p>
                <button
                  onClick={handleClearLogs}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded bg-gray-900 border border-gray-800 text-xs font-bold text-gray-400 hover:text-red-400 hover:bg-gray-850 transition-all cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Limpar Histórico</span>
                </button>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4 shadow-sm">
                {logs.map(log => (
                  <div key={log.id} className="p-4 bg-gray-950 border border-gray-800/40 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2 mb-1.5">
                        <span className="font-black text-xs text-[#ff4d4d] uppercase tracking-wider">{log.action}</span>
                        <span className="text-gray-600 font-bold">•</span>
                        <span className="text-[10px] text-gray-500 font-mono">ID: {log.id.substring(0, 8)}</span>
                      </div>
                      <p className="text-gray-300 leading-relaxed font-semibold">{log.details}</p>
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono flex-shrink-0 self-end sm:self-center">
                      {new Date(log.timestamp).toLocaleString('pt-BR')}
                    </span>
                  </div>
                ))}

                {logs.length === 0 && (
                  <p className="text-center text-xs text-gray-500 py-12">Nenhum evento registrado no histórico.</p>
                )}
              </div>
            </div>
          )}


          {/* 5. PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="max-w-xl animate-fadeIn">
              <form onSubmit={handleUpdateProfile} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6">
                
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Nome Completo do Administrador
                  </label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Nova Senha de Acesso (Deixe em branco para manter a atual)
                  </label>
                  <input
                    type="password"
                    value={profilePassword}
                    onChange={(e) => setProfilePassword(e.target.value)}
                    placeholder="Ex: novaSenha123"
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-hidden"
                  />
                </div>

                <div className="pt-4 border-t border-gray-800 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-[#B30000] hover:bg-[#900000] transition-colors cursor-pointer"
                  >
                    Salvar Perfil
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </main>

      {/* ======================================================== */}
      {/* 6. MODAL: CREATE OR EDIT TRACKING FORM */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-scaleUp max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-950">
              <h3 className="text-lg font-bold text-white">
                {editingTracking ? `Editar Encomenda ${editingTracking.id}` : 'Nova Encomenda Logística'}
              </h3>
              <button
                onClick={() => setShowFormModal(false)}
                className="text-gray-400 hover:text-white font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <form onSubmit={handleTrackingSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              
              {/* Customizable Tracking Code */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Código de Rastreio Personalizado (Ex: BR123456789BR)
                </label>
                <input
                  type="text"
                  value={formId}
                  onChange={(e) => setFormId(e.target.value)}
                  placeholder="Deixe em branco para gerar aleatoriamente"
                  disabled={!!editingTracking}
                  maxLength={13}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-sm text-white font-mono uppercase focus:outline-hidden disabled:opacity-55"
                />
                {!editingTracking && (
                  <span className="text-[10px] text-gray-500 mt-1 block">
                    Deve conter 2 letras, 9 números e 2 letras. Se vazio, geramos um padrão fictício iniciante em RS...BR.
                  </span>
                )}
              </div>

              {/* Recipient Name */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Nome do Destinatário
                </label>
                <input
                  type="text"
                  value={formRecipient}
                  onChange={(e) => setFormRecipient(e.target.value)}
                  placeholder="Ex: Carlos Eduardo de Oliveira"
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-hidden"
                  required
                />
              </div>

              {/* Sender Details */}
              <div className="p-4 bg-gray-950 border border-gray-800/80 rounded-xl space-y-4">
                <span className="text-xs font-bold text-[#ff4d4d] block uppercase tracking-wide">Endereço de Origem</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">CEP Origem</label>
                    <input
                      type="text"
                      value={formSenderCEP}
                      onChange={(e) => setFormSenderCEP(e.target.value)}
                      placeholder="Ex: 01001-000"
                      className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-sm text-white font-mono focus:outline-hidden"
                      required
                    />
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Cidade / Estado Autocomplete</label>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={formSenderCity}
                        onChange={(e) => setFormSenderCity(e.target.value)}
                        placeholder="São Paulo"
                        className="col-span-2 w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-sm text-gray-400 font-bold focus:outline-hidden"
                        readOnly
                      />
                      <input
                        type="text"
                        value={formSenderState}
                        onChange={(e) => setFormSenderState(e.target.value)}
                        placeholder="SP"
                        className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-sm text-gray-400 font-bold text-center focus:outline-hidden"
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recipient Details */}
              <div className="p-4 bg-gray-950 border border-gray-800/80 rounded-xl space-y-4">
                <span className="text-xs font-bold text-emerald-400 block uppercase tracking-wide">Endereço de Destino</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">CEP Destino</label>
                    <input
                      type="text"
                      value={formRecipientCEP}
                      onChange={(e) => setFormRecipientCEP(e.target.value)}
                      placeholder="Ex: 22021-001"
                      className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-sm text-white font-mono focus:outline-hidden"
                      required
                    />
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Cidade / Estado Autocomplete</label>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={formRecipientCity}
                        onChange={(e) => setFormRecipientCity(e.target.value)}
                        placeholder="Rio de Janeiro"
                        className="col-span-2 w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-sm text-gray-400 font-bold focus:outline-hidden"
                        readOnly
                      />
                      <input
                        type="text"
                        value={formRecipientState}
                        onChange={(e) => setFormRecipientState(e.target.value)}
                        placeholder="RJ"
                        className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-sm text-gray-400 font-bold text-center focus:outline-hidden"
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Weight, Dates & Times */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Peso Estimado (KG)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={formWeight}
                    onChange={(e) => setFormWeight(e.target.value)}
                    placeholder="0.500"
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Data de Postagem</label>
                  <input
                    type="date"
                    value={formPostDate}
                    onChange={(e) => setFormPostDate(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Hora de Postagem</label>
                  <input
                    type="time"
                    value={formPostTime}
                    onChange={(e) => setFormPostTime(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              {/* Autocomplete dynamic route and automation */}
              <div className="p-4 bg-red-950/20 border border-red-900/30 rounded-xl">
                <div className="flex items-center space-x-2.5 mb-2">
                  <input
                    type="checkbox"
                    id="autoUpdate"
                    checked={formAutoUpdate}
                    onChange={(e) => setFormAutoUpdate(e.target.checked)}
                    className="h-4 w-4 rounded text-[#B30000]"
                  />
                  <label htmlFor="autoUpdate" className="text-xs font-bold text-white uppercase tracking-wider cursor-pointer">
                    Ativar Atualização Automática de Trânsito
                  </label>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed ml-6">
                  Se ativado, o sistema calculará e adicionará eventos automaticamente conforme a passagem do tempo, avançando 1 etapa a cada {settings.updateIntervalDays} dias após a postagem.
                </p>
              </div>

              {/* Internal Observations */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Observações / Notas Internas</label>
                <textarea
                  rows={2}
                  value={formObservations}
                  onChange={(e) => setFormObservations(e.target.value)}
                  placeholder="Ex: Conteúdo Frágil. Entrega agendada."
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-hidden font-semibold"
                />
              </div>

              {/* Modal Footer Controls */}
              <div className="pt-4 border-t border-gray-800 flex justify-end space-x-3 bg-gray-900">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-400 hover:text-white bg-gray-850 hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg text-sm font-bold text-white bg-[#B30000] hover:bg-[#900000] transition-colors cursor-pointer"
                >
                  {editingTracking ? 'Salvar Edições' : 'Criar Rastreamento'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}


      {/* ======================================================== */}
      {/* 7. MODAL: ADD CUSTOM OPERATIONAL EVENT */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scaleUp">
            
            <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-gray-950">
              <h3 className="text-base font-bold text-white flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-[#B30000]" />
                <span>Nova Ocorrência ({eventTargetTrackingId})</span>
              </h3>
              <button
                onClick={() => setShowEventModal(false)}
                className="text-gray-400 hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEventSubmit} className="p-5 space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Tipo de Evento</label>
                <select
                  value={evtType}
                  onChange={(e) => setEvtType(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-hidden"
                >
                  <option value="custom">Histórico Personalizado (Não altera status principal)</option>
                  <option value="posted">Objeto Postado (Avança p/ 10% progresso)</option>
                  <option value="transit">Em Transferência (Avança p/ 30% progresso)</option>
                  <option value="hub">Centro Logístico (Avança p/ 50% progresso)</option>
                  <option value="regional">Unidade Regional (Avança p/ 70% progresso)</option>
                  <option value="delivery">Saiu para Entrega (Avança p/ 90% progresso)</option>
                  <option value="delivered">Entregue com Sucesso (Avança p/ 100% progresso)</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Cidade Evento</label>
                  <input
                    type="text"
                    value={evtCity}
                    onChange={(e) => setEvtCity(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-1.5 text-sm text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">UF</label>
                  <input
                    type="text"
                    value={evtState}
                    onChange={(e) => setEvtState(e.target.value)}
                    maxLength={2}
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-1.5 text-sm text-white text-center uppercase"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Data Ocorrência</label>
                  <input
                    type="date"
                    value={evtDate}
                    onChange={(e) => setEvtDate(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-1.5 text-sm text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Hora Ocorrência</label>
                  <input
                    type="time"
                    value={evtTime}
                    onChange={(e) => setEvtTime(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-1.5 text-sm text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Descrição / Detalhes Evento</label>
                <textarea
                  rows={2}
                  value={evtDesc}
                  onChange={(e) => setEvtDesc(e.target.value)}
                  placeholder="Ex: Objeto recebido na agência local..."
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-1.5 text-sm text-white"
                  required
                />
              </div>

              <div className="pt-3 border-t border-gray-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-gray-400 hover:text-white bg-gray-850 hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-[#B30000] hover:bg-[#900000] transition-colors cursor-pointer"
                >
                  Registrar Evento
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
