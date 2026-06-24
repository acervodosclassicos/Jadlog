/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TrackingStatus } from './types';

// Simple class name combiner helper
export function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

// Convert YYYY-MM-DD to DD/MM/YYYY
export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// Helper to convert status string to Portuguese display text
export function getStatusLabel(status: TrackingStatus): string {
  switch (status) {
    case 'posted':
      return 'Objeto Postado';
    case 'transit':
      return 'Em Trânsito';
    case 'hub':
      return 'No Centro Logístico';
    case 'regional':
      return 'Unidade Regional';
    case 'delivery':
      return 'Saiu para Entrega';
    case 'delivered':
      return 'Entregue com Sucesso';
    case 'paused':
      return 'Atualização Suspensa';
    case 'canceled':
      return 'Entrega Cancelada';
    default:
      return status;
  }
}

// Helper to get status colors
export function getStatusBadgeClass(status: TrackingStatus): string {
  switch (status) {
    case 'posted':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'transit':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'hub':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'regional':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'delivery':
      return 'bg-teal-50 text-teal-700 border-teal-200';
    case 'delivered':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'paused':
      return 'bg-gray-100 text-gray-700 border-gray-300';
    case 'canceled':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
}
