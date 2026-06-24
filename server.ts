/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { Tracking, TrackingEvent, RouteStep, SystemSettings, SystemLog, TrackingStatus } from './src/types';

const app = express();
const PORT = 3000;
const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

app.use(express.json());

// Ensure Database and Folder structure exist with seed data
function initDatabase() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  // Check if DB exists, if not write initial seeds
  if (!fs.existsSync(DB_FILE)) {
    const salt = crypto.randomBytes(16).toString('hex');
    // Default admin is "admin" and password "admin123"
    // Password hash for admin123
    const hash = crypto.pbkdf2Sync('admin123', salt, 1000, 64, 'sha512').toString('hex');

    const defaultSettings: SystemSettings = {
      platformName: 'Jadlog',
      logoUrl: '',
      primaryColor: '#B30000',
      updateIntervalDays: 2,
      institutionalText: 'A Jadlog é uma das maiores operadoras logísticas do país, especializada no transporte de cargas expressas e distribuição de encomendas corporativas e e-commerce.',
      aboutUs: 'A Jadlog oferece alta precisão, rapidez e controle total de encomendas nacionais e internacionais, com soluções modernas e eficientes para todas as suas necessidades de frete.',
      contactEmail: 'contato@jadlog.com.br',
      contactPhone: '(11) 4004-0000'
    };

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Seed 1: A package currently in transit (auto-advancing)
    // We set its postDate to 3 days ago, so it has automatically progressed
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
          id: crypto.randomUUID(),
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

    // Seed 2: A fully delivered package (completed)
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
      autoUpdate: false, // Stopped auto-update since it is fully delivered
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
          id: crypto.randomUUID(),
          city: 'Belo Horizonte',
          state: 'MG',
          date: tenDaysAgoStr,
          time: '14:20',
          description: 'Objeto postado na agência de origem.',
          type: 'posted'
        },
        {
          id: crypto.randomUUID(),
          city: 'Betim',
          state: 'MG',
          date: new Date(tenDaysAgo.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          time: '08:15',
          description: 'Objeto em transferência para o Centro de Distribuição.',
          type: 'transit'
        },
        {
          id: crypto.randomUUID(),
          city: 'Campinas',
          state: 'SP',
          date: new Date(tenDaysAgo.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          time: '19:40',
          description: 'Objeto recebido no centro de distribuição regional.',
          type: 'hub'
        },
        {
          id: crypto.randomUUID(),
          city: 'Canoas',
          state: 'RS',
          date: new Date(tenDaysAgo.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          time: '11:10',
          description: 'Objeto em transferência para a unidade regional.',
          type: 'regional'
        },
        {
          id: crypto.randomUUID(),
          city: 'Porto Alegre',
          state: 'RS',
          date: new Date(tenDaysAgo.getTime() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          time: '09:00',
          description: 'Objeto saiu para entrega ao destinatário.',
          type: 'delivery'
        },
        {
          id: crypto.randomUUID(),
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

    const initialData = {
      users: [
        {
          id: crypto.randomUUID(),
          username: 'admin',
          salt: salt,
          passwordHash: hash,
          name: 'Administrador do Sistema'
        }
      ],
      trackings: [tracking1, tracking2],
      settings: defaultSettings,
      logs: [
        {
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          action: 'Instalação do Sistema',
          details: 'Banco de dados inicial provisionado com sucesso para a Jadlog.'
        }
      ]
    };

    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    console.log('Database seeded successfully.');
  }
}

initDatabase();

// Load Database
function readDB() {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading database file, re-initializing...', err);
    initDatabase();
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  }
}

// Write Database
function writeDB(data: any) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Add system log
function addLog(action: string, details: string) {
  const db = readDB();
  const log: SystemLog = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    action,
    details
  };
  db.logs.unshift(log);
  // Keep last 1000 logs
  if (db.logs.length > 1000) {
    db.logs = db.logs.slice(0, 1000);
  }
  writeDB(db);
}

// Helper to validate CEP format and extract details
interface CEPLookupResult {
  valid: boolean;
  city: string;
  state: string;
}

function lookupCEP(cep: string): CEPLookupResult {
  const clean = cep.replace(/\D/g, '');
  if (clean.length !== 8) {
    return { valid: false, city: '', state: '' };
  }

  const prefix1 = parseInt(clean.substring(0, 1));
  const prefix2 = parseInt(clean.substring(0, 2));

  let state = 'SP';
  let city = 'São Paulo';

  // Real geographic rule mapping for CEPs in Brazil
  if (prefix1 === 0 || prefix1 === 1) {
    state = 'SP';
    if (prefix1 === 0) city = 'São Paulo';
    else if (prefix2 === 13) city = 'Campinas';
    else if (prefix2 === 14) city = 'Ribeirão Preto';
    else if (prefix2 === 11) city = 'Santos';
    else if (prefix2 === 18) city = 'Sorocaba';
    else city = 'São José dos Campos';
  } else if (prefix2 >= 20 && prefix2 <= 28) {
    state = 'RJ';
    if (prefix2 === 20 || prefix2 === 21 || prefix2 === 22 || prefix2 === 23) city = 'Rio de Janeiro';
    else if (prefix2 === 24) city = 'Niterói';
    else if (prefix2 === 25) city = 'Duque de Caxias';
    else city = 'Campos dos Goytacazes';
  } else if (prefix2 === 29) {
    state = 'ES';
    city = 'Vitória';
  } else if (prefix1 === 3) {
    state = 'MG';
    if (prefix2 === 30 || prefix2 === 31) city = 'Belo Horizonte';
    else if (prefix2 === 32) city = 'Contagem';
    else if (prefix2 === 33) city = 'Betim';
    else if (prefix2 === 38) city = 'Uberlândia';
    else city = 'Juiz de Fora';
  } else if (prefix1 === 4) {
    if (prefix2 >= 40 && prefix2 <= 48) {
      state = 'BA';
      if (prefix2 === 40 || prefix2 === 41 || prefix2 === 42) city = 'Salvador';
      else if (prefix2 === 44) city = 'Feira de Santana';
      else city = 'Vitória da Conquista';
    } else {
      state = 'SE';
      city = 'Aracaju';
    }
  } else if (prefix1 === 5) {
    if (prefix2 >= 50 && prefix2 <= 56) {
      state = 'PE';
      city = 'Recife';
    } else if (prefix2 === 57) {
      state = 'AL';
      city = 'Maceió';
    } else if (prefix2 === 58) {
      state = 'PB';
      city = 'João Pessoa';
    } else if (prefix2 === 59) {
      state = 'RN';
      city = 'Natal';
    }
  } else if (prefix1 === 6) {
    if (prefix2 >= 60 && prefix2 <= 63) {
      state = 'CE';
      city = 'Fortaleza';
    } else if (prefix2 === 64) {
      state = 'PI';
      city = 'Teresina';
    } else if (prefix2 === 65) {
      state = 'MA';
      city = 'São Luís';
    } else if (prefix2 === 66 || prefix2 === 67) {
      state = 'PA';
      city = 'Belém';
    } else if (prefix2 === 68) {
      state = 'AP';
      city = 'Macapá';
    } else if (prefix2 === 69) {
      state = 'AM';
      city = 'Manaus';
    } else {
      state = 'CE';
      city = 'Sobral';
    }
  } else if (prefix1 === 7) {
    if (prefix2 >= 70 && prefix2 <= 72) {
      state = 'DF';
      city = 'Brasília';
    } else if (prefix2 >= 73 && prefix2 <= 76) {
      state = 'GO';
      city = 'Goiânia';
    } else if (prefix2 === 77) {
      state = 'TO';
      city = 'Palmas';
    } else if (prefix2 === 78) {
      state = 'MT';
      city = 'Cuiabá';
    } else if (prefix2 === 79) {
      state = 'MS';
      city = 'Campo Grande';
    }
  } else if (prefix1 === 8) {
    if (prefix2 >= 80 && prefix2 <= 87) {
      state = 'PR';
      if (prefix2 === 80 || prefix2 === 81 || prefix2 === 82) city = 'Curitiba';
      else if (prefix2 === 86) city = 'Londrina';
      else city = 'Maringá';
    } else if (prefix2 >= 88 && prefix2 <= 89) {
      state = 'SC';
      if (prefix2 === 88) city = 'Florianópolis';
      else city = 'Joinville';
    }
  } else if (prefix1 === 9) {
    state = 'RS';
    if (prefix2 === 90 || prefix2 === 91 || prefix2 === 92 || prefix2 === 93) city = 'Porto Alegre';
    else if (prefix2 === 94) city = 'Caxias do Sul';
    else city = 'Pelotas';
  }

  return { valid: true, city, state };
}

// Generate Realistic Intermediary Logistics Route Steps
function generateRouteSteps(senderCity: string, senderState: string, recipientCity: string, recipientState: string): RouteStep[] {
  const steps: RouteStep[] = [];

  // Step 0: Origem
  steps.push({
    city: senderCity,
    state: senderState,
    label: 'Agência de Origem (Postagem)',
    active: true,
    order: 0
  });

  // Pick realistic logistics hubs in between
  // Intermediate Step 1: Regional Hub in Sender State
  let hub1City = 'Cajamar';
  let hub1State = senderState;
  if (senderState === 'SP') hub1City = 'Cajamar';
  else if (senderState === 'RJ') hub1City = 'Duque de Caxias';
  else if (senderState === 'MG') hub1City = 'Betim';
  else if (senderState === 'PR') hub1City = 'São José dos Pinhais';
  else if (senderState === 'RS') hub1City = 'Canoas';
  else if (senderState === 'BA') hub1City = 'Simões Filho';
  else if (senderState === 'PE') hub1City = 'Jaboatão dos Guararapes';
  else hub1City = `Centro de Tratamento Logístico (${senderState})`;

  steps.push({
    city: hub1City,
    state: hub1State,
    label: 'Unidade de Tratamento Logístico (Triagem)',
    active: false,
    order: 1
  });

  // Intermediate Step 2: Main Transit Hub
  // If states are identical, pick a local hub, else pick a cross-state transit point or national hub
  let hub2City = 'Campinas';
  let hub2State = 'SP';
  if (senderState === recipientState) {
    hub2City = 'Centro de Distribuição Regional';
    hub2State = senderState;
  } else {
    // Cross state transit
    if (recipientState === 'RJ') {
      hub2City = 'Resende';
      hub2State = 'RJ';
    } else if (recipientState === 'MG') {
      hub2City = 'Três Corações';
      hub2State = 'MG';
    } else if (recipientState === 'RS' || recipientState === 'PR' || recipientState === 'SC') {
      hub2City = 'Curitiba';
      hub2State = 'PR';
    } else {
      hub2City = 'Campinas';
      hub2State = 'SP';
    }
  }

  steps.push({
    city: hub2City,
    state: hub2State,
    label: 'Centro de Distribuição Integrada (Carga)',
    active: false,
    order: 2
  });

  // Intermediate Step 3: Regional Hub in Recipient State
  let hub3City = recipientCity;
  let hub3State = recipientState;
  if (recipientState === 'SP') hub3City = 'Campinas';
  else if (recipientState === 'RJ') hub3City = 'Niterói';
  else if (recipientState === 'MG') hub3City = 'Contagem';
  else if (recipientState === 'RS') hub3City = 'Canoas';
  else if (recipientState === 'PR') hub3City = 'Londrina';
  else if (recipientState === 'BA') hub3City = 'Feira de Santana';
  else hub3City = `Unidade Regional de Distribuição`;

  steps.push({
    city: hub3City,
    state: hub3State,
    label: 'Unidade Regional de Distribuição',
    active: false,
    order: 3
  });

  // Step 4: Final Delivery Hub in Destination City
  steps.push({
    city: recipientCity,
    state: recipientState,
    label: 'Centro de Distribuição Domiciliar (CDD)',
    active: false,
    order: 4
  });

  // Step 5: Destino Final
  steps.push({
    city: recipientCity,
    state: recipientState,
    label: 'Endereço de Destino (Entregue)',
    active: false,
    order: 5
  });

  return steps;
}

// Evaluate and apply Catch-up logic for dynamic simulated updates
function applyCatchUp(tracking: Tracking, intervalDays: number): boolean {
  if (!tracking.autoUpdate || tracking.status === 'delivered' || tracking.status === 'paused' || tracking.status === 'canceled') {
    return false; // No catch-up required
  }

  // Parse post date and time
  const [year, month, day] = tracking.postDate.split('-').map(Number);
  const [hour, min] = tracking.postTime.split(':').map(Number);
  
  // Date when it was posted
  const postDateTime = new Date(year, month - 1, day, hour, min);
  const now = new Date();

  // Days elapsed since post
  const timeDiff = now.getTime() - postDateTime.getTime();
  const daysElapsed = timeDiff / (1000 * 60 * 60 * 24);

  if (daysElapsed <= 0) {
    return false; // Just posted, nothing to catch up yet
  }

  // Auto progression schedule
  // Stage 0: Posted -> Day 0 (already has 1 event from post)
  // Stage 1: Transit -> Day 1 * interval
  // Stage 2: Hub -> Day 2 * interval
  // Stage 3: Regional -> Day 3 * interval
  // Stage 4: Delivery -> Day 4 * interval
  // Stage 5: Delivered -> Day 5 * interval

  const stages: { status: TrackingStatus; label: string; progress: number; routeIndex: number; desc: string }[] = [
    {
      status: 'posted',
      label: 'Objeto Postado',
      progress: 10,
      routeIndex: 0,
      desc: 'Objeto postado na agência de origem.'
    },
    {
      status: 'transit',
      label: 'Em Transferência',
      progress: 30,
      routeIndex: 1,
      desc: 'Objeto em transferência para a unidade de triagem.'
    },
    {
      status: 'hub',
      label: 'Centro Logístico',
      progress: 50,
      routeIndex: 2,
      desc: 'Objeto recebido no centro de distribuição regional.'
    },
    {
      status: 'regional',
      label: 'Unidade Regional',
      progress: 70,
      routeIndex: 3,
      desc: 'Objeto recebido na unidade regional para triagem interna.'
    },
    {
      status: 'delivery',
      label: 'Saiu para entrega',
      progress: 90,
      routeIndex: 4,
      desc: 'Objeto saiu para entrega ao destinatário.'
    },
    {
      status: 'delivered',
      label: 'Entregue',
      progress: 100,
      routeIndex: 5,
      desc: 'Objeto entregue ao destinatário com sucesso.'
    }
  ];

  let modified = false;

  // Evaluate which stages should be activated by now
  for (let i = 1; i <= 5; i++) {
    const triggerDay = i * intervalDays;
    
    // Check if enough time has elapsed to trigger this stage
    if (daysElapsed >= triggerDay) {
      const stage = stages[i];
      
      // Check if this stage event already exists in the tracking events to avoid duplication
      const exists = tracking.events.some(ev => ev.type === stage.status);
      if (!exists) {
        // Calculate the simulated event date/time
        const eventTime = new Date(postDateTime.getTime() + triggerDay * 24 * 60 * 60 * 1000);
        
        // Ensure the simulated date doesn't exceed current date/time
        const finalEventTime = eventTime > now ? now : eventTime;
        
        const dateStr = finalEventTime.toISOString().split('T')[0];
        const timeStr = finalEventTime.toTimeString().substring(0, 5);

        // Get location for this stage from the route
        const routeStep = tracking.route[stage.routeIndex];
        
        // Add event
        const newEvent: TrackingEvent = {
          id: crypto.randomUUID(),
          city: routeStep.city,
          state: routeStep.state,
          date: dateStr,
          time: timeStr,
          description: stage.desc,
          type: stage.status
        };

        tracking.events.push(newEvent);
        
        // Set state to active in route
        for (let r = 0; r <= stage.routeIndex; r++) {
          if (tracking.route[r]) {
            tracking.route[r].active = true;
          }
        }

        // Update tracking main status and location details
        tracking.status = stage.status;
        tracking.progressPercent = stage.progress;
        tracking.currentCity = routeStep.city;
        tracking.currentState = routeStep.state;
        
        modified = true;

        addLog('Atualização Automática', `Encomenda ${tracking.id} avançou automaticamente para '${stage.label}' em ${routeStep.city}-${routeStep.state}`);
      }
    }
  }

  // If fully delivered, we disable autoUpdate to lock the state
  if (tracking.status === 'delivered') {
    tracking.autoUpdate = false;
    modified = true;
  }

  return modified;
}

// In-Memory Sessions (Simple and Secure Session Handling)
const SESSIONS = new Map<string, { username: string; expiresAt: number }>();
const SESSION_EXPIRY_MS = 12 * 60 * 60 * 1000; // 12 hours

function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de autenticação não fornecido.' });
  }

  const session = SESSIONS.get(token);
  if (!session) {
    return res.status(403).json({ error: 'Sessão inválida ou expirada.' });
  }

  if (Date.now() > session.expiresAt) {
    SESSIONS.delete(token);
    return res.status(403).json({ error: 'Sessão expirada. Faça login novamente.' });
  }

  req.username = session.username;
  next();
}


// --- API ROUTES ---

// Public Search Tracking Endpoint
app.get('/api/tracking/:code', (req, res) => {
  const code = req.params.code.trim().toUpperCase();
  const db = readDB();
  const tracking = db.trackings.find((t: any) => t.id === code);

  if (!tracking) {
    return res.status(404).json({ error: db.settings.systemMessages?.not_found || 'Código de rastreamento não encontrado.' });
  }

  // Apply automatic catch-up of milestones
  const updated = applyCatchUp(tracking, db.settings.updateIntervalDays || 2);
  if (updated) {
    writeDB(db);
  }

  // Return tracking with full public data
  // Sort events from newest to oldest for timeline visualization
  const sortedEvents = [...tracking.events].sort((a, b) => {
    const dateTimeA = `${a.date}T${a.time}`;
    const dateTimeB = `${b.date}T${b.time}`;
    return dateTimeB.localeCompare(dateTimeA);
  });

  res.json({
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
});

// Public Settings info
app.get('/api/settings', (req, res) => {
  const db = readDB();
  res.json({
    platformName: db.settings.platformName,
    logoUrl: db.settings.logoUrl,
    primaryColor: db.settings.primaryColor,
    institutionalText: db.settings.institutionalText,
    aboutUs: db.settings.aboutUs,
    contactEmail: db.settings.contactEmail,
    contactPhone: db.settings.contactPhone
  });
});

// Admin Login Route
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Usuário e senha são obrigatórios.' });
  }

  const db = readDB();
  const user = db.users.find((u: any) => u.username === username.trim().toLowerCase());

  if (!user) {
    return res.status(401).json({ error: 'Credenciais de acesso incorretas.' });
  }

  // PBKDF2 hash verification
  const hash = crypto.pbkdf2Sync(password, user.salt, 1000, 64, 'sha512').toString('hex');
  if (hash !== user.passwordHash) {
    return res.status(401).json({ error: 'Credenciais de acesso incorretas.' });
  }

  // Generate Session token
  const token = crypto.randomUUID() + crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + SESSION_EXPIRY_MS;
  SESSIONS.set(token, { username: user.username, expiresAt });

  addLog('Login Efetuado', `Administrador ${user.name} fez login no painel.`);

  res.json({
    token,
    user: {
      username: user.username,
      name: user.name
    }
  });
});

// Admin Auth Status Route
app.get('/api/auth/me', authenticateToken, (req: any, res) => {
  const db = readDB();
  const user = db.users.find((u: any) => u.username === req.username);
  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado.' });
  }
  res.json({
    username: user.username,
    name: user.name
  });
});

// Admin stats
app.get('/api/admin/stats', authenticateToken, (req, res) => {
  const db = readDB();
  
  // Refresh autoUpdate packages before calculating stats to make sure dashboard is accurate
  let modified = false;
  db.trackings.forEach((t: any) => {
    if (applyCatchUp(t, db.settings.updateIntervalDays || 2)) {
      modified = true;
    }
  });
  if (modified) {
    writeDB(db);
  }

  const trackings = db.trackings;
  
  const total = trackings.length;
  const transit = trackings.filter((t: any) => t.status === 'transit' || t.status === 'hub' || t.status === 'regional').length;
  const delivered = trackings.filter((t: any) => t.status === 'delivered').length;
  const pending = trackings.filter((t: any) => t.status === 'posted' || t.status === 'delivery').length;
  const paused = trackings.filter((t: any) => t.status === 'paused' || t.status === 'canceled').length;

  // Updates today calculation
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const updatesToday = db.logs.filter((log: any) => new Date(log.timestamp) >= startOfDay).length;

  res.json({
    total,
    transit,
    delivered,
    pending,
    paused,
    updatesToday
  });
});

// Admin Trackings List
app.get('/api/admin/trackings', authenticateToken, (req, res) => {
  const db = readDB();
  
  // Refresh catch-ups
  let modified = false;
  db.trackings.forEach((t: any) => {
    if (applyCatchUp(t, db.settings.updateIntervalDays || 2)) {
      modified = true;
    }
  });
  if (modified) {
    writeDB(db);
  }

  // Sort trackings by date descending
  const sortedTrackings = [...db.trackings].sort((a: any, b: any) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  res.json(sortedTrackings);
});

// Create Tracking
app.post('/api/admin/trackings', authenticateToken, (req, res) => {
  const {
    id, // Optional custom code, if omitted generate random Correios pattern
    recipientName,
    senderCEP,
    recipientCEP,
    postDate,
    postTime,
    weight,
    observations,
    autoUpdate
  } = req.body;

  if (!recipientName || !senderCEP || !recipientCEP || !postDate || !postTime) {
    return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
  }

  const db = readDB();

  // Validate CEPs
  const senderLoc = lookupCEP(senderCEP);
  const recipientLoc = lookupCEP(recipientCEP);

  if (!senderLoc.valid) {
    return res.status(400).json({ error: 'CEP de Origem inválido. Certifique-se de preencher 8 dígitos.' });
  }
  if (!recipientLoc.valid) {
    return res.status(400).json({ error: 'CEP de Destino inválido. Certifique-se de preencher 8 dígitos.' });
  }

  // Check unique ID code
  let finalId = id ? id.trim().toUpperCase() : '';
  if (!finalId) {
    // Generate Correios-like random code e.g. RS 123456789 BR
    const randDigits = Math.floor(100000000 + Math.random() * 900000000).toString();
    finalId = `RS${randDigits}BR`;
  } else {
    // Ensure format
    const codeFormat = /^[A-Z]{2}\d{9}[A-Z]{2}$/;
    if (!codeFormat.test(finalId)) {
      return res.status(400).json({ error: 'Formato do código de rastreamento deve conter 2 letras, 9 números e 2 letras. Ex: BR123456789BR' });
    }
  }

  // Check uniqueness
  const existing = db.trackings.find((t: any) => t.id === finalId);
  if (existing) {
    return res.status(400).json({ error: `O código de rastreamento '${finalId}' já existe.` });
  }

  // Generate Route steps
  const route = generateRouteSteps(senderLoc.city, senderLoc.state, recipientLoc.city, recipientLoc.state);

  // Calculate delivery estimate: 7-12 days from postDate
  const [year, month, day] = postDate.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  dateObj.setDate(dateObj.getDate() + 8);
  const deliveryEstimate = dateObj.toISOString().split('T')[0];

  const firstEvent: TrackingEvent = {
    id: crypto.randomUUID(),
    city: senderLoc.city,
    state: senderLoc.state,
    date: postDate,
    time: postTime,
    description: 'Objeto postado na agência de origem.',
    type: 'posted'
  };

  const newTracking: Tracking = {
    id: finalId,
    recipientName: recipientName.trim(),
    senderCEP: senderCEP.trim(),
    recipientCEP: recipientCEP.trim(),
    senderCity: senderLoc.city,
    senderState: senderLoc.state,
    recipientCity: recipientLoc.city,
    recipientState: recipientLoc.state,
    postDate,
    postTime,
    weight: Number(weight) || 0.1,
    observations: observations ? observations.trim() : '',
    status: 'posted',
    currentCity: senderLoc.city,
    currentState: senderLoc.state,
    deliveryEstimate,
    progressPercent: 10,
    autoUpdate: autoUpdate === undefined ? true : !!autoUpdate,
    route,
    events: [firstEvent],
    createdAt: new Date().toISOString()
  };

  db.trackings.push(newTracking);
  writeDB(db);

  addLog('Criação de Rastreamento', `Nova encomenda ${finalId} criada para ${recipientName}. Origem: ${senderLoc.city}-${senderLoc.state}, Destino: ${recipientLoc.city}-${recipientLoc.state}`);

  res.status(201).json(newTracking);
});

// Update/Edit Tracking
app.put('/api/admin/trackings/:id', authenticateToken, (req, res) => {
  const trackingId = req.params.id.toUpperCase();
  const db = readDB();
  const index = db.trackings.findIndex((t: any) => t.id === trackingId);

  if (index === -1) {
    return res.status(404).json({ error: 'Encomenda não encontrada.' });
  }

  const {
    recipientName,
    senderCEP,
    recipientCEP,
    postDate,
    postTime,
    weight,
    observations,
    status,
    progressPercent,
    currentCity,
    currentState,
    deliveryEstimate,
    autoUpdate,
    events,
    route
  } = req.body;

  const original = db.trackings[index];

  // Re-validate CEPs if changed
  let senderCity = original.senderCity;
  let senderState = original.senderState;
  let recipientCity = original.recipientCity;
  let recipientState = original.recipientState;
  let finalRoute = route || original.route;

  if (senderCEP !== original.senderCEP) {
    const sLookup = lookupCEP(senderCEP);
    if (sLookup.valid) {
      senderCity = sLookup.city;
      senderState = sLookup.state;
    }
  }

  if (recipientCEP !== original.recipientCEP) {
    const rLookup = lookupCEP(recipientCEP);
    if (rLookup.valid) {
      recipientCity = rLookup.city;
      recipientState = rLookup.state;
    }
  }

  // If cities changed, re-generate route if route is not manually supplied
  if (!route && (senderCEP !== original.senderCEP || recipientCEP !== original.recipientCEP)) {
    finalRoute = generateRouteSteps(senderCity, senderState, recipientCity, recipientState);
  }

  const updatedTracking: Tracking = {
    ...original,
    recipientName: recipientName !== undefined ? recipientName.trim() : original.recipientName,
    senderCEP: senderCEP !== undefined ? senderCEP.trim() : original.senderCEP,
    recipientCEP: recipientCEP !== undefined ? recipientCEP.trim() : original.recipientCEP,
    senderCity,
    senderState,
    recipientCity,
    recipientState,
    postDate: postDate !== undefined ? postDate : original.postDate,
    postTime: postTime !== undefined ? postTime : original.postTime,
    weight: weight !== undefined ? Number(weight) : original.weight,
    observations: observations !== undefined ? observations.trim() : original.observations,
    status: status !== undefined ? status : original.status,
    progressPercent: progressPercent !== undefined ? Number(progressPercent) : original.progressPercent,
    currentCity: currentCity !== undefined ? currentCity.trim() : original.currentCity,
    currentState: currentState !== undefined ? currentState.trim().toUpperCase() : original.currentState,
    deliveryEstimate: deliveryEstimate !== undefined ? deliveryEstimate : original.deliveryEstimate,
    autoUpdate: autoUpdate !== undefined ? !!autoUpdate : original.autoUpdate,
    route: finalRoute,
    events: events !== undefined ? events : original.events
  };

  db.trackings[index] = updatedTracking;
  writeDB(db);

  addLog('Atualização Manual', `Encomenda ${trackingId} foi atualizada manualmente pelo administrador.`);

  res.json(updatedTracking);
});

// Create Custom Event on Tracking
app.post('/api/admin/trackings/:id/events', authenticateToken, (req, res) => {
  const trackingId = req.params.id.toUpperCase();
  const { city, state, date, time, description, type } = req.body;

  if (!city || !state || !date || !time || !description || !type) {
    return res.status(400).json({ error: 'Preencha todos os campos obrigatórios do evento.' });
  }

  const db = readDB();
  const index = db.trackings.findIndex((t: any) => t.id === trackingId);

  if (index === -1) {
    return res.status(404).json({ error: 'Encomenda não encontrada.' });
  }

  const tracking = db.trackings[index];

  const newEvent: TrackingEvent = {
    id: crypto.randomUUID(),
    city: city.trim(),
    state: state.trim().toUpperCase(),
    date,
    time,
    description: description.trim(),
    type
  };

  tracking.events.push(newEvent);

  // If this event overrides status or location, update tracking header state
  if (type !== 'custom') {
    tracking.status = type;
    tracking.currentCity = city.trim();
    tracking.currentState = state.trim().toUpperCase();

    // Set matching route progress based on stage
    const statusProgressMap: Record<TrackingStatus, number> = {
      posted: 10,
      transit: 30,
      hub: 50,
      regional: 70,
      delivery: 90,
      delivered: 100,
      paused: tracking.progressPercent,
      canceled: tracking.progressPercent
    };
    tracking.progressPercent = statusProgressMap[type as TrackingStatus];

    // Activate corresponding route steps
    const routeIndexMap: Record<string, number> = {
      posted: 0,
      transit: 1,
      hub: 2,
      regional: 3,
      delivery: 4,
      delivered: 5
    };

    const targetRouteIndex = routeIndexMap[type];
    if (targetRouteIndex !== undefined) {
      for (let r = 0; r <= 5; r++) {
        if (tracking.route[r]) {
          tracking.route[r].active = r <= targetRouteIndex;
        }
      }
    }
  }

  db.trackings[index] = tracking;
  writeDB(db);

  addLog('Evento Adicionado', `Evento '${description}' criado para encomenda ${trackingId} em ${city}-${state}.`);

  res.status(201).json(tracking);
});

// Duplicate Tracking
app.post('/api/admin/trackings/:id/duplicate', authenticateToken, (req, res) => {
  const trackingId = req.params.id.toUpperCase();
  const db = readDB();
  const original = db.trackings.find((t: any) => t.id === trackingId);

  if (!original) {
    return res.status(404).json({ error: 'Encomenda original não encontrada.' });
  }

  // Generate a new code
  const randDigits = Math.floor(100000000 + Math.random() * 900000000).toString();
  const newId = `RS${randDigits}BR`;

  // Create duplicate with new date and fresh UUID events
  const duplicatedEvents = original.events.map((ev: any) => ({
    ...ev,
    id: crypto.randomUUID()
  }));

  const duplicated: Tracking = {
    ...original,
    id: newId,
    recipientName: `${original.recipientName} (Cópia)`,
    createdAt: new Date().toISOString(),
    events: duplicatedEvents
  };

  db.trackings.push(duplicated);
  writeDB(db);

  addLog('Duplicação de Encomenda', `Encomenda ${trackingId} duplicada para o novo código ${newId}.`);

  res.status(201).json(duplicated);
});

// Delete Tracking
app.delete('/api/admin/trackings/:id', authenticateToken, (req, res) => {
  const trackingId = req.params.id.toUpperCase();
  const db = readDB();
  const initialCount = db.trackings.length;
  db.trackings = db.trackings.filter((t: any) => t.id !== trackingId);

  if (db.trackings.length === initialCount) {
    return res.status(404).json({ error: 'Encomenda não encontrada.' });
  }

  writeDB(db);

  addLog('Exclusão de Encomenda', `Encomenda ${trackingId} foi excluída permanentemente.`);

  res.json({ success: true, message: `Encomenda ${trackingId} excluída com sucesso.` });
});

// Get Settings
app.get('/api/admin/settings', authenticateToken, (req, res) => {
  const db = readDB();
  res.json(db.settings);
});

// Save Settings
app.put('/api/admin/settings', authenticateToken, (req, res) => {
  const {
    platformName,
    logoUrl,
    primaryColor,
    updateIntervalDays,
    institutionalText,
    aboutUs,
    contactEmail,
    contactPhone,
    systemMessages
  } = req.body;

  if (!platformName || !primaryColor || !updateIntervalDays) {
    return res.status(400).json({ error: 'Campos Nome da Plataforma, Cor Principal e Intervalo de Atualização são obrigatórios.' });
  }

  const db = readDB();
  db.settings = {
    platformName: platformName.trim(),
    logoUrl: logoUrl !== undefined ? logoUrl.trim() : db.settings.logoUrl,
    primaryColor: primaryColor.trim(),
    updateIntervalDays: Number(updateIntervalDays) || 2,
    institutionalText: institutionalText !== undefined ? institutionalText.trim() : db.settings.institutionalText,
    aboutUs: aboutUs !== undefined ? aboutUs.trim() : db.settings.aboutUs,
    contactEmail: contactEmail !== undefined ? contactEmail.trim() : db.settings.contactEmail,
    contactPhone: contactPhone !== undefined ? contactPhone.trim() : db.settings.contactPhone
  };

  if (systemMessages) {
    db.settings.systemMessages = systemMessages;
  }

  writeDB(db);

  addLog('Configurações Atualizadas', 'As configurações do sistema foram alteradas pelo administrador.');

  res.json(db.settings);
});

// Get Logs
app.get('/api/admin/logs', authenticateToken, (req, res) => {
  const db = readDB();
  res.json(db.logs || []);
});

// Clear Logs
app.post('/api/admin/logs/clear', authenticateToken, (req, res) => {
  const db = readDB();
  db.logs = [
    {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      action: 'Logs Limpos',
      details: 'O histórico de auditoria foi limpo pelo administrador.'
    }
  ];
  writeDB(db);
  res.json({ success: true });
});

// Edit Profile / Password change
app.put('/api/admin/profile', authenticateToken, (req: any, res) => {
  const { name, password } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Nome do administrador é obrigatório.' });
  }

  const db = readDB();
  const userIndex = db.users.findIndex((u: any) => u.username === req.username);

  if (userIndex === -1) {
    return res.status(404).json({ error: 'Usuário não encontrado.' });
  }

  db.users[userIndex].name = name.trim();

  if (password && password.trim()) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password.trim(), salt, 1000, 64, 'sha512').toString('hex');
    db.users[userIndex].salt = salt;
    db.users[userIndex].passwordHash = hash;
  }

  writeDB(db);

  addLog('Perfil Atualizado', `Perfil do administrador '${req.username}' atualizado.`);

  res.json({ success: true, user: { username: req.username, name: db.users[userIndex].name } });
});


// Serve static frontend assets and support Vite SPA
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    
    app.get('*', async (req, res, next) => {
      if (req.path.includes('.') && !req.path.endsWith('.html')) {
        return next();
      }

      const code = req.query.track || req.query.codigo || '';
      const cleanCode = typeof code === 'string' ? code.trim().toUpperCase() : '';

      let title = "Jadlog Express Rastreamento | Rastreamento de Encomendas";
      let description = "Consulte o status de sua entrega de forma simples e rápida.";
      let ogTitle = "Jadlog Express Rastreamento";
      let ogDescription = "Acompanhe o status, a rota e a previsão de entrega de sua encomenda em tempo real.";

      if (cleanCode) {
        try {
          const db = readDB();
          const tracking = db.trackings.find((t: any) => t.id === cleanCode);
          if (tracking) {
            applyCatchUp(tracking, db.settings.updateIntervalDays || 2);
            
            let statusText = "Objeto Postado";
            if (tracking.status === 'transit') statusText = "Em Trânsito";
            else if (tracking.status === 'regional') statusText = "Recebido na Unidade Regional";
            else if (tracking.status === 'delivery') statusText = "Saiu para Entrega";
            else if (tracking.status === 'delivered') statusText = "Entregue";
            else if (tracking.status === 'paused') statusText = "Pausado";
            else if (tracking.status === 'canceled') statusText = "Cancelado";

            title = `Jadlog Rastreio - ${tracking.id}`;
            description = `Status: ${statusText} | Destinatário: ${tracking.recipientName} | Destino: ${tracking.recipientCity}-${tracking.recipientState}.`;
            ogTitle = `Encomenda Jadlog: ${tracking.id}`;
            ogDescription = `Status: ${statusText} • Destinatário: ${tracking.recipientName} • Destino: ${tracking.recipientCity}-${tracking.recipientState}. Clique para acompanhar em tempo real.`;
          } else {
            title = `Rastreio Jadlog - ${cleanCode}`;
            ogTitle = `Rastreio Jadlog: ${cleanCode}`;
            ogDescription = `Consulte o progresso de entrega desta encomenda de código ${cleanCode} em nosso painel oficial.`;
          }
        } catch (err) {
          console.error('Error serving dynamic OG tags in dev mode:', err);
        }
      }

      try {
        const indexPath = path.join(process.cwd(), 'index.html');
        let html = fs.readFileSync(indexPath, 'utf8');
        html = await vite.transformIndexHtml(req.originalUrl, html);

        const metaTags = `
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${ogTitle}" />
    <meta property="og:description" content="${ogDescription}" />
    <meta property="og:image" content="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=600" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:title" content="${ogTitle}" />
    <meta property="twitter:description" content="${ogDescription}" />
    <meta property="twitter:image" content="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=600" />
        `;

        html = html.replace(/<title>[\s\S]*?<\/title>/, '');
        html = html.replace('</head>', `${metaTags}\n</head>`);

        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e) {
        next(e);
      }
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    
    app.get('*', (req, res) => {
      const code = req.query.track || req.query.codigo || '';
      const cleanCode = typeof code === 'string' ? code.trim().toUpperCase() : '';

      let title = "Jadlog Express Rastreamento | Rastreamento de Encomendas";
      let description = "Consulte o status de sua entrega de forma simples e rápida.";
      let ogTitle = "Jadlog Express Rastreamento";
      let ogDescription = "Acompanhe o status, a rota e a previsão de entrega de sua encomenda em tempo real.";

      if (cleanCode) {
        try {
          const db = readDB();
          const tracking = db.trackings.find((t: any) => t.id === cleanCode);
          if (tracking) {
            applyCatchUp(tracking, db.settings.updateIntervalDays || 2);
            
            let statusText = "Objeto Postado";
            if (tracking.status === 'transit') statusText = "Em Trânsito";
            else if (tracking.status === 'regional') statusText = "Recebido na Unidade Regional";
            else if (tracking.status === 'delivery') statusText = "Saiu para Entrega";
            else if (tracking.status === 'delivered') statusText = "Entregue";
            else if (tracking.status === 'paused') statusText = "Pausado";
            else if (tracking.status === 'canceled') statusText = "Cancelado";

            title = `Jadlog Rastreio - ${tracking.id}`;
            description = `Status: ${statusText} | Destinatário: ${tracking.recipientName} | Destino: ${tracking.recipientCity}-${tracking.recipientState}.`;
            ogTitle = `Encomenda Jadlog: ${tracking.id}`;
            ogDescription = `Status: ${statusText} • Destinatário: ${tracking.recipientName} • Destino: ${tracking.recipientCity}-${tracking.recipientState}. Clique para acompanhar em tempo real.`;
          } else {
            title = `Rastreio Jadlog - ${cleanCode}`;
            ogTitle = `Rastreio Jadlog: ${cleanCode}`;
            ogDescription = `Consulte o progresso de entrega desta encomenda de código ${cleanCode} em nosso painel oficial.`;
          }
        } catch (err) {
          console.error('Error serving dynamic OG tags in prod:', err);
        }
      }

      const indexPath = path.join(distPath, 'index.html');
      fs.readFile(indexPath, 'utf8', (err, html) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Error loading index.html');
        }

        const metaTags = `
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${ogTitle}" />
    <meta property="og:description" content="${ogDescription}" />
    <meta property="og:image" content="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=600" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:title" content="${ogTitle}" />
    <meta property="twitter:description" content="${ogDescription}" />
    <meta property="twitter:image" content="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=600" />
        `;

        let modifiedHtml = html.replace(/<title>[\s\S]*?<\/title>/, '');
        modifiedHtml = modifiedHtml.replace('</head>', `${metaTags}\n</head>`);

        res.status(200).set({ 'Content-Type': 'text/html' }).send(modifiedHtml);
      });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
