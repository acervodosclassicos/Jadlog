import { Tracking, TrackingEvent, RouteStep, SystemSettings, SystemLog, TrackingStatus } from '../types';

// Client-Side Local Storage Database Keys
const LOCAL_DB_KEY = 'rastro_local_db';

interface LocalDatabase {
  users: Array<{
    id: string;
    username: string;
    name: string;
    plainPassword?: string; // fallback plain password for mock db
  }>;
  trackings: Tracking[];
  settings: SystemSettings;
  logs: SystemLog[];
}

export function initClientDatabase(): LocalDatabase {
  const existing = localStorage.getItem(LOCAL_DB_KEY);
  if (existing) {
    try {
      return JSON.parse(existing);
    } catch (e) {
      console.error('Failed to parse local DB, resetting...', e);
    }
  }

  // Fallback initial seeds
  const defaultSettings: SystemSettings = {
    platformName: 'Jadlog Express Rastreamento',
    logoUrl: '',
    primaryColor: '#B30000',
    updateIntervalDays: 2,
    institutionalText: 'A Jadlog Express Rastreamento é uma das maiores operadoras logísticas do país, especializada no transporte de cargas expressas e distribuição de encomendas corporativas e e-commerce.',
    aboutUs: 'A Jadlog Express Rastreamento oferece alta precisão, rapidez e controle total de encomendas nacionais e internacionais, com soluções modernas e eficientes para todas as suas necessidades de frete.',
    contactEmail: 'contato@jadlog.com.br',
    contactPhone: '(11) 4004-0000'
  };

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  const threeDaysAgoStr = threeDaysAgo.toISOString().split('T')[0];

  const tracking1: Tracking = {
    id: 'BR123456789BR',
    recipientName: 'Mariana Silva',
    senderCEP: '01001-000',
    recipientCEP: '22021-001',
    senderCity: 'São Paulo',
    senderState: 'SP',
    recipientCity: 'Rio de Janeiro',
    recipientState: 'RJ',
    postDate: threeDaysAgoStr,
    postTime: '09:30',
    weight: 1.5,
    observations: 'Cuidado: Conteúdo frágil (Eletrônicos)',
    status: 'transit',
    currentCity: 'São Paulo',
    currentState: 'SP',
    deliveryEstimate: new Date(threeDaysAgo.getTime() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    progressPercent: 30,
    autoUpdate: true,
    route: [
      { city: 'São Paulo', state: 'SP', label: 'Agência de Origem', active: true, order: 0 },
      { city: 'Cajamar', state: 'SP', label: 'Centro de Tratamento Logístico', active: true, order: 1 },
      { city: 'Aparecida', state: 'SP', label: 'Centro de Distribuição de Carga', active: false, order: 2 },
      { city: 'Duque de Caxias', state: 'RJ', label: 'Centro de Distribuição Regional', active: false, order: 3 },
      { city: 'Rio de Janeiro', state: 'RJ', label: 'Unidade Regional de Distribuição', active: false, order: 4 },
      { city: 'Rio de Janeiro', state: 'RJ', label: 'Endereço de Destino', active: false, order: 5 }
    ],
    events: [
      {
        id: generateUUID(),
        city: 'São Paulo',
        state: 'SP',
        date: threeDaysAgoStr,
        time: '09:30',
        description: 'Objeto postado na agência de origem.',
        type: 'posted'
      }
    ],
    createdAt: threeDaysAgo.toISOString()
  };

  const tenDaysAgo = new Date();
  tenDaysAgo.setDate(tenDaysAgo.getDate() - 11);
  const tenDaysAgoStr = tenDaysAgo.toISOString().split('T')[0];

  const tracking2: Tracking = {
    id: 'BR987654321BR',
    recipientName: 'Carlos Souza',
    senderCEP: '30110-001',
    recipientCEP: '90010-001',
    senderCity: 'Belo Horizonte',
    senderState: 'MG',
    recipientCity: 'Porto Alegre',
    recipientState: 'RS',
    postDate: tenDaysAgoStr,
    postTime: '14:20',
    weight: 0.8,
    observations: 'Documentos urgentes',
    status: 'delivered',
    currentCity: 'Porto Alegre',
    currentState: 'RS',
    deliveryEstimate: new Date(tenDaysAgo.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    progressPercent: 100,
    autoUpdate: false,
    route: [
      { city: 'Belo Horizonte', state: 'MG', label: 'Agência de Origem', active: true, order: 0 },
      { city: 'Betim', state: 'MG', label: 'Centro de Tratamento Logístico', active: true, order: 1 },
      { city: 'Campinas', state: 'SP', label: 'Centro de Distribuição de Carga', active: true, order: 2 },
      { city: 'Canoas', state: 'RS', label: 'Centro de Distribuição Regional', active: true, order: 3 },
      { city: 'Porto Alegre', state: 'RS', label: 'Unidade Regional de Distribuição', active: true, order: 4 },
      { city: 'Porto Alegre', state: 'RS', label: 'Endereço de Destino', active: true, order: 5 }
    ],
    events: [
      {
        id: generateUUID(),
        city: 'Belo Horizonte',
        state: 'MG',
        date: tenDaysAgoStr,
        time: '14:20',
        description: 'Objeto postado na agência de origem.',
        type: 'posted'
      },
      {
        id: generateUUID(),
        city: 'Betim',
        state: 'MG',
        date: new Date(tenDaysAgo.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '08:15',
        description: 'Objeto em transferência para o Centro de Distribuição.',
        type: 'transit'
      },
      {
        id: generateUUID(),
        city: 'Campinas',
        state: 'SP',
        date: new Date(tenDaysAgo.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '19:40',
        description: 'Objeto recebido no centro de distribuição regional.',
        type: 'hub'
      },
      {
        id: generateUUID(),
        city: 'Canoas',
        state: 'RS',
        date: new Date(tenDaysAgo.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '11:10',
        description: 'Objeto em transferência para a unidade regional.',
        type: 'regional'
      },
      {
        id: generateUUID(),
        city: 'Porto Alegre',
        state: 'RS',
        date: new Date(tenDaysAgo.getTime() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '09:00',
        description: 'Objeto saiu para entrega ao destinatário.',
        type: 'delivery'
      },
      {
        id: generateUUID(),
        city: 'Porto Alegre',
        state: 'RS',
        date: new Date(tenDaysAgo.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '15:30',
        description: 'Objeto entregue ao destinatário com sucesso.',
        type: 'delivered'
      }
    ],
    createdAt: tenDaysAgo.toISOString()
  };

  const initialData: LocalDatabase = {
    users: [
      {
        id: generateUUID(),
        username: 'admin',
        name: 'Administrador do Sistema',
        plainPassword: 'admin123'
      }
    ],
    trackings: [tracking1, tracking2],
    settings: defaultSettings,
    logs: [
      {
        id: generateUUID(),
        timestamp: new Date().toISOString(),
        action: 'Instalação do Sistema',
        details: 'Banco de dados local em cache provisionado com sucesso para a Jadlog.'
      }
    ]
  };

  localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(initialData));
  return initialData;
}

export function readClientDB(): LocalDatabase {
  return initClientDatabase();
}

export function writeClientDB(data: LocalDatabase) {
  localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(data));
}

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function addClientLog(action: string, details: string) {
  const db = readClientDB();
  const log: SystemLog = {
    id: generateUUID(),
    timestamp: new Date().toISOString(),
    action,
    details
  };
  db.logs.unshift(log);
  if (db.logs.length > 1000) {
    db.logs = db.logs.slice(0, 1000);
  }
  writeClientDB(db);
}

// Emulate automatic catch-up milestones
function applyClientCatchUp(tracking: Tracking, intervalDays: number): boolean {
  if (!tracking.autoUpdate || tracking.status === 'delivered' || tracking.status === 'paused' || tracking.status === 'canceled') {
    return false;
  }

  const [year, month, day] = tracking.postDate.split('-').map(Number);
  const [hour, min] = tracking.postTime.split(':').map(Number);
  const postDateTime = new Date(year, month - 1, day, hour, min);
  const now = new Date();
  const timeDiff = now.getTime() - postDateTime.getTime();
  const daysElapsed = timeDiff / (1000 * 60 * 60 * 24);

  if (daysElapsed <= 0) return false;

  const stages: { status: TrackingStatus; label: string; progress: number; routeIndex: number; desc: string }[] = [
    { status: 'posted', label: 'Objeto Postado', progress: 10, routeIndex: 0, desc: 'Objeto postado na agência de origem.' },
    { status: 'transit', label: 'Em Transferência', progress: 30, routeIndex: 1, desc: 'Objeto em transferência para a unidade de triagem.' },
    { status: 'hub', label: 'Centro Logístico', progress: 50, routeIndex: 2, desc: 'Objeto recebido no centro de distribuição regional.' },
    { status: 'regional', label: 'Unidade Regional', progress: 70, routeIndex: 3, desc: 'Objeto recebido na unidade regional para triagem interna.' },
    { status: 'delivery', label: 'Saiu para entrega', progress: 90, routeIndex: 4, desc: 'Objeto saiu para entrega ao destinatário.' },
    { status: 'delivered', label: 'Entregue', progress: 100, routeIndex: 5, desc: 'Objeto entregue ao destinatário com sucesso.' }
  ];

  let modified = false;

  for (let i = 1; i <= 5; i++) {
    const triggerDay = i * intervalDays;
    if (daysElapsed >= triggerDay) {
      const stage = stages[i];
      const exists = tracking.events.some(ev => ev.type === stage.status);
      if (!exists) {
        const eventTime = new Date(postDateTime.getTime() + triggerDay * 24 * 60 * 60 * 1000);
        const finalEventTime = eventTime > now ? now : eventTime;
        const dateStr = finalEventTime.toISOString().split('T')[0];
        const timeStr = finalEventTime.toTimeString().substring(0, 5);
        const routeStep = tracking.route[stage.routeIndex];

        const newEvent: TrackingEvent = {
          id: generateUUID(),
          city: routeStep.city,
          state: routeStep.state,
          date: dateStr,
          time: timeStr,
          description: stage.desc,
          type: stage.status
        };

        tracking.events.push(newEvent);

        for (let r = 0; r <= stage.routeIndex; r++) {
          if (tracking.route[r]) {
            tracking.route[r].active = true;
          }
        }

        tracking.status = stage.status;
        tracking.progressPercent = stage.progress;
        tracking.currentCity = routeStep.city;
        tracking.currentState = routeStep.state;
        modified = true;

        addClientLog('Atualização Automática', `Encomenda ${tracking.id} avançou automaticamente para '${stage.label}' em ${routeStep.city}-${routeStep.state}`);
      }
    }
  }

  if (tracking.status === 'delivered') {
    tracking.autoUpdate = false;
    modified = true;
  }

  return modified;
}

// Client Side router mock fetch implementation
export async function handleMockRequest(url: string, options?: any): Promise<any> {
  const method = (options?.method || 'GET').toUpperCase();
  const headers = options?.headers || {};
  const body = options?.body ? JSON.parse(options.body) : null;

  // Simulate networking latency
  await new Promise(resolve => setTimeout(resolve, 150));

  const db = readClientDB();

  // Route: Public settings info
  if (url === '/api/settings' && method === 'GET') {
    return createResponse(200, {
      platformName: db.settings.platformName,
      logoUrl: db.settings.logoUrl,
      primaryColor: db.settings.primaryColor,
      institutionalText: db.settings.institutionalText,
      aboutUs: db.settings.aboutUs,
      contactEmail: db.settings.contactEmail,
      contactPhone: db.settings.contactPhone
    });
  }

  // Route: Public Search Tracking
  const trackingMatch = url.match(/^\/api\/tracking\/([^?]+)/);
  if (trackingMatch && method === 'GET') {
    const code = decodeURIComponent(trackingMatch[1]).trim().toUpperCase();
    const tracking = db.trackings.find(t => t.id === code);

    if (!tracking) {
      return createResponse(404, { error: 'Código de rastreamento não encontrado.' });
    }

    const updated = applyClientCatchUp(tracking, db.settings.updateIntervalDays || 2);
    if (updated) {
      writeClientDB(db);
    }

    const sortedEvents = [...tracking.events].sort((a, b) => {
      const dateTimeA = `${a.date}T${a.time}`;
      const dateTimeB = `${b.date}T${b.time}`;
      return dateTimeB.localeCompare(dateTimeA);
    });

    return createResponse(200, {
      ...tracking,
      events: sortedEvents,
      settings: {
        platformName: db.settings.platformName,
        logoUrl: db.settings.logoUrl,
        primaryColor: db.settings.primaryColor,
        institutionalText: db.settings.institutionalText,
        aboutUs: db.settings.aboutUs,
        contactEmail: db.settings.contactEmail,
        contactPhone: db.settings.contactPhone
      }
    });
  }

  // Route: Admin Login
  if (url === '/api/auth/login' && method === 'POST') {
    const { username, password } = body || {};
    if (!username || !password) {
      return createResponse(400, { error: 'Usuário e senha são obrigatórios.' });
    }

    const user = db.users.find(u => u.username === username.trim().toLowerCase());
    if (!user) {
      return createResponse(401, { error: 'Credenciais de acesso incorretas.' });
    }

    // Direct match fallback
    const isPasswordValid = user.plainPassword 
      ? user.plainPassword === password.trim()
      : password.trim() === 'admin123';

    if (!isPasswordValid) {
      return createResponse(401, { error: 'Credenciais de acesso incorretas.' });
    }

    const token = 'mock-token-' + generateUUID();
    localStorage.setItem('local_token_session', JSON.stringify({
      token,
      username: user.username,
      expiresAt: Date.now() + 12 * 60 * 60 * 1000
    }));

    addClientLog('Login Efetuado', `Administrador ${user.name} fez login no painel (Offline Mode).`);

    return createResponse(200, {
      token,
      user: {
        username: user.username,
        name: user.name
      }
    });
  }

  // Auth Guard verification helper
  const authHeader = headers['Authorization'] || headers['authorization'];
  const authToken = authHeader && authHeader.split(' ')[1];
  let sessionUsername: string | null = null;

  if (url.startsWith('/api/admin') || url === '/api/auth/me') {
    if (!authToken) {
      return createResponse(401, { error: 'Token de autenticação não fornecido.' });
    }
    const sessionStr = localStorage.getItem('local_token_session');
    if (!sessionStr) {
      return createResponse(403, { error: 'Sessão inválida ou expirada.' });
    }
    const session = JSON.parse(sessionStr);
    if (session.token !== authToken || Date.now() > session.expiresAt) {
      localStorage.removeItem('local_token_session');
      return createResponse(403, { error: 'Sessão expirada. Faça login novamente.' });
    }
    sessionUsername = session.username;
  }

  // Route: Auth validation (me)
  if (url === '/api/auth/me' && method === 'GET') {
    const user = db.users.find(u => u.username === sessionUsername);
    if (!user) {
      return createResponse(404, { error: 'Usuário não encontrado.' });
    }
    return createResponse(200, {
      username: user.username,
      name: user.name
    });
  }

  // Route: Admin Profile updates
  if (url === '/api/admin/profile' && method === 'PUT') {
    const { name, password } = body || {};
    if (!name) {
      return createResponse(400, { error: 'Nome do administrador é obrigatório.' });
    }

    const userIndex = db.users.findIndex(u => u.username === sessionUsername);
    if (userIndex === -1) {
      return createResponse(404, { error: 'Usuário não encontrado.' });
    }

    db.users[userIndex].name = name.trim();
    if (password && password.trim()) {
      db.users[userIndex].plainPassword = password.trim();
    }

    writeClientDB(db);
    addClientLog('Perfil Atualizado', `Perfil do administrador '${sessionUsername}' atualizado (Offline Mode).`);

    return createResponse(200, {
      success: true,
      user: {
        username: sessionUsername,
        name: db.users[userIndex].name
      }
    });
  }

  // Route: Admin statistics
  if (url === '/api/admin/stats' && method === 'GET') {
    // Sync-up first
    db.trackings.forEach(t => applyClientCatchUp(t, db.settings.updateIntervalDays || 2));
    writeClientDB(db);

    const total = db.trackings.length;
    const active = db.trackings.filter(t => t.status !== 'delivered' && t.status !== 'canceled').length;
    const delivered = db.trackings.filter(t => t.status === 'delivered').length;
    const canceled = db.trackings.filter(t => t.status === 'canceled').length;

    return createResponse(200, { total, active, delivered, canceled });
  }

  // Route: Admin all trackings
  if (url === '/api/admin/trackings' && method === 'GET') {
    db.trackings.forEach(t => applyClientCatchUp(t, db.settings.updateIntervalDays || 2));
    writeClientDB(db);

    const sorted = [...db.trackings].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return createResponse(200, sorted);
  }

  // Route: Admin settings
  if (url === '/api/admin/settings' && method === 'GET') {
    return createResponse(200, db.settings);
  }

  // Route: Admin update settings
  if (url === '/api/admin/settings' && method === 'PUT') {
    db.settings = { ...db.settings, ...body };
    writeClientDB(db);
    addClientLog('Configurações Atualizadas', 'Definições do sistema atualizadas.');
    return createResponse(200, { success: true });
  }

  // Route: Admin logs list
  if (url === '/api/admin/logs' && method === 'GET') {
    return createResponse(200, db.logs);
  }

  // Route: Admin clear logs
  if (url === '/api/admin/logs/clear' && method === 'DELETE') {
    db.logs = [];
    writeClientDB(db);
    addClientLog('Logs Limpos', 'O histórico de logs do sistema foi esvaziado pelo administrador.');
    return createResponse(200, { success: true });
  }

  // Route: Admin create tracking
  if (url === '/api/admin/trackings' && method === 'POST') {
    const newTracking: Tracking = {
      ...body,
      createdAt: new Date().toISOString()
    };

    const exists = db.trackings.some(t => t.id === newTracking.id);
    if (exists) {
      return createResponse(400, { error: 'Já existe uma encomenda com este código de rastreamento.' });
    }

    db.trackings.push(newTracking);
    writeClientDB(db);
    addClientLog('Rastreio Criado', `Nova encomenda ${newTracking.id} registrada com sucesso.`);
    return createResponse(200, newTracking);
  }

  // Route: Admin update tracking
  const matchUpdate = url.match(/^\/api\/admin\/trackings\/([^/]+)$/);
  if (matchUpdate && method === 'PUT') {
    const id = decodeURIComponent(matchUpdate[1]).trim().toUpperCase();
    const index = db.trackings.findIndex(t => t.id === id);

    if (index === -1) {
      return createResponse(404, { error: 'Encomenda não encontrada.' });
    }

    db.trackings[index] = { ...db.trackings[index], ...body };
    writeClientDB(db);
    addClientLog('Rastreio Editado', `Dados da encomenda ${id} atualizados pelo administrador.`);
    return createResponse(200, db.trackings[index]);
  }

  // Route: Admin delete tracking
  if (matchUpdate && method === 'DELETE') {
    const id = decodeURIComponent(matchUpdate[1]).trim().toUpperCase();
    const index = db.trackings.findIndex(t => t.id === id);

    if (index === -1) {
      return createResponse(404, { error: 'Encomenda não encontrada.' });
    }

    db.trackings.splice(index, 1);
    writeClientDB(db);
    addClientLog('Rastreio Excluído', `Rastreamento da encomenda ${id} foi excluído permanentemente.`);
    return createResponse(200, { success: true });
  }

  // Route: Admin duplicate tracking
  const matchDuplicate = url.match(/^\/api\/admin\/trackings\/([^/]+)\/duplicate$/);
  if (matchDuplicate && method === 'POST') {
    const id = decodeURIComponent(matchDuplicate[1]).trim().toUpperCase();
    const tracking = db.trackings.find(t => t.id === id);

    if (!tracking) {
      return createResponse(404, { error: 'Encomenda não encontrada.' });
    }

    // Generate a new code
    const baseCode = tracking.id.replace(/[0-9]/g, '');
    const prefix = baseCode.substring(0, 2) || 'BR';
    const suffix = baseCode.substring(2, 4) || 'BR';
    const num = Math.floor(100000000 + Math.random() * 900000000);
    const newCode = `${prefix}${num}${suffix}`;

    // Deep clone tracking
    const cloned: Tracking = JSON.parse(JSON.stringify(tracking));
    cloned.id = newCode;
    cloned.createdAt = new Date().toISOString();

    db.trackings.push(cloned);
    writeClientDB(db);
    addClientLog('Rastreio Duplicado', `Encomenda ${id} duplicada como ${newCode}.`);

    return createResponse(200, cloned);
  }

  // Route: Admin add/update events
  const matchEvents = url.match(/^\/api\/admin\/trackings\/([^/]+)\/events$/);
  if (matchEvents && method === 'POST') {
    const id = decodeURIComponent(matchEvents[1]).trim().toUpperCase();
    const index = db.trackings.findIndex(t => t.id === id);

    if (index === -1) {
      return createResponse(404, { error: 'Encomenda não encontrada.' });
    }

    const { events, currentCity, currentState, status, progressPercent, route, autoUpdate } = body || {};

    db.trackings[index].events = events;
    if (currentCity !== undefined) db.trackings[index].currentCity = currentCity;
    if (currentState !== undefined) db.trackings[index].currentState = currentState;
    if (status !== undefined) db.trackings[index].status = status;
    if (progressPercent !== undefined) db.trackings[index].progressPercent = progressPercent;
    if (route !== undefined) db.trackings[index].route = route;
    if (autoUpdate !== undefined) db.trackings[index].autoUpdate = autoUpdate;

    writeClientDB(db);
    addClientLog('Etapa Atualizada', `O itinerário de ${id} foi atualizado manualmente.`);

    return createResponse(200, db.trackings[index]);
  }

  // 404 Fallback
  return createResponse(404, { error: 'Endpoint não disponível no modo de compatibilidade do navegador.' });
}

function createResponse(status: number, data: any) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: async () => data,
    text: async () => JSON.stringify(data),
    headers: {
      get: (name: string) => name.toLowerCase() === 'content-type' ? 'application/json' : null
    }
  };
}
