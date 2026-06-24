/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TrackingStatus = 
  | 'posted'      // Objeto postado
  | 'transit'     // Em transferência
  | 'hub'         // Centro logístico
  | 'regional'    // Unidade regional
  | 'delivery'    // Saiu para entrega
  | 'delivered'   // Entregue
  | 'paused'      // Pausado / Suspenso
  | 'canceled';   // Cancelado / Devolvido

export interface RouteStep {
  city: string;
  state: string;
  label: string;
  active: boolean;
  order: number;
}

export interface TrackingEvent {
  id: string;
  city: string;
  state: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  description: string;
  type: TrackingStatus | 'custom';
}

export interface Tracking {
  id: string; // Custom tracking code (e.g. RS123456789BR)
  recipientName: string;
  senderCEP: string;
  recipientCEP: string;
  senderCity: string;
  senderState: string;
  recipientCity: string;
  recipientState: string;
  postDate: string; // YYYY-MM-DD
  postTime: string; // HH:MM
  weight: number; // in kg
  observations: string;
  status: TrackingStatus;
  currentCity: string;
  currentState: string;
  deliveryEstimate: string; // YYYY-MM-DD or descriptive
  progressPercent: number;
  autoUpdate: boolean;
  route: RouteStep[];
  events: TrackingEvent[];
  createdAt: string;
}

export interface SystemSettings {
  platformName: string;
  logoUrl: string;
  primaryColor: string; // Hex color
  updateIntervalDays: number;
  institutionalText: string;
  aboutUs: string;
  contactEmail: string;
  contactPhone: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
}
