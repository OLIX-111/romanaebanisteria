// Centralized order status mapping and helpers
// Canonical internal codes we expect from backend / existing data may still use older ones.
// New required statuses (Spanish labels):
//  - pending_approval: "Pendiente aprobación"
//  - created: "Orden creada"
//  - processing: "En proceso"
//  - in_transit: "En tránsito"
//  - delivered: "Entregado"
// Keep legacy / other terminal states for robustness: cancelled, refunded.

export type OrderStatusCode =
  | 'pending_approval'
  | 'created'
  | 'processing'
  | 'in_transit'
  | 'delivered'
  | 'cancelled'
  | 'refunded'
  | string // allow forward compatibility

export interface OrderStatusInfo {
  code: OrderStatusCode
  label: string
  color: string // base color used for text and derived background (20 alpha) in some components
  group?: 'active' | 'terminal'
  legacyAliases?: string[] // accepted incoming values mapped to this code
}

// Master map
export const ORDER_STATUS_MAP: Record<string, OrderStatusInfo> = {
  pending_approval: {
    code: 'pending_approval',
    label: 'Pendiente aprobación',
    color: '#F59E0B',
    group: 'active',
    legacyAliases: ['pending', 'pendiente']
  },
  created: {
    code: 'created',
    label: 'Orden creada',
    color: '#6366F1',
    group: 'active',
    legacyAliases: ['creada']
  },
  processing: {
    code: 'processing',
    label: 'En proceso',
    color: '#2563EB',
    group: 'active',
    legacyAliases: ['processed', 'en_proceso', 'procesando']
  },
  in_transit: {
    code: 'in_transit',
    label: 'En tránsito',
    color: '#0EA5E9',
    group: 'active',
    legacyAliases: ['shipped', 'en_transito', 'enviado']
  },
  delivered: {
    code: 'delivered',
    label: 'Entregado',
    color: '#16A34A',
    group: 'terminal',
    legacyAliases: ['completed', 'entregado']
  },
  cancelled: {
    code: 'cancelled',
    label: 'Cancelado',
    color: '#F43F5E',
    group: 'terminal',
    legacyAliases: ['canceled', 'cancelado']
  },
  refunded: {
    code: 'refunded',
    label: 'Reembolsado',
    color: '#0891B2',
    group: 'terminal',
    legacyAliases: ['reembolsado']
  }
}

// Build reverse alias index
const aliasIndex: Record<string, OrderStatusInfo> = {}
Object.values(ORDER_STATUS_MAP).forEach(info => {
  aliasIndex[info.code] = info
  info.legacyAliases?.forEach(a => { aliasIndex[a] = info })
})

export function normalizeOrderStatus(raw?: string | null): OrderStatusInfo | undefined {
  if (!raw) return undefined
  const key = raw.trim().toLowerCase()
  return aliasIndex[key]
}

export function getOrderStatusInfo(raw?: string | null): OrderStatusInfo {
  const normalized = normalizeOrderStatus(raw)
  if (normalized) return normalized
  // Fallback unknown code styling
  return {
    code: raw || 'unknown',
    label: raw || 'Desconocido',
    color: '#6B7280'
  }
}

export const PRIMARY_FLOW_STATUSES: OrderStatusCode[] = [
  'pending_approval',
  'created',
  'processing',
  'in_transit',
  'delivered'
]

export const ORDER_STATUS_FILTERS = PRIMARY_FLOW_STATUSES.map(code => {
  const { label } = ORDER_STATUS_MAP[code]
  return { code, label }
})

export function renderStatusBadge(code?: string) {
  const info = getOrderStatusInfo(code)
  const bg = info.color + '20'
  return `<span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium" style="background:${bg};color:${info.color}">${info.label}</span>`
}
