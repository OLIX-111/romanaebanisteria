"use client";
import { useCallback, useEffect, useReducer } from 'react';
import type { CartAction, CartItem, CartState } from '@/types/cart';
import { generateLineId } from '@/types/cart';

const STORAGE_KEY = 'romana_cart_v1';

function persist(state: CartState) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  try {
    const ev = new CustomEvent('romana-cart-updated', { detail: { count: state.items.reduce((a,c)=>a+c.quantity,0) } });
    window.dispatchEvent(ev);
  } catch {}
}

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'HYDRATE': {
      // Replace without persisting (assumes coming from storage)
      return { items: action.state.items, updatedAt: action.state.updatedAt };
    }
    case 'ADD': {
      const lineId = generateLineId(action.item.productId, action.item.variantId);
      const existing = state.items.find(i => i.id === lineId);
      let newItems: CartItem[];
      if (existing) {
        const cappedQty = Math.min((existing.max ?? Infinity), existing.quantity + 1);
        newItems = state.items.map(i => i.id === lineId ? { ...i, quantity: cappedQty } : i);
      } else {
        newItems = [...state.items, { ...action.item, id: lineId, quantity: action.item.quantity || 1 }];
      }
      const next = { items: newItems, updatedAt: Date.now() };
      persist(next);
      return next;
    }
    case 'REMOVE': {
      const next = { items: state.items.filter(i => i.id !== action.lineId), updatedAt: Date.now() };
      persist(next);
      return next;
    }
    case 'UPDATE_QTY': {
      const newItems = state.items.map(i => {
        if (i.id !== action.lineId) return i;
        const max = i.max ?? Infinity;
        const q = Math.max(1, Math.min(max, action.quantity));
        return { ...i, quantity: q };
      });
      const next = { items: newItems, updatedAt: Date.now() };
      persist(next);
      return next;
    }
    case 'CLEAR': {
      const next = { items: [], updatedAt: Date.now() };
      persist(next);
      return next;
    }
    default:
      return state;
  }
}

export function useCart() {
  const [state, dispatch] = useReducer(reducer, { items: [], updatedAt: 0 });

  // Hydrate once on client mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartState;
        if (parsed && Array.isArray(parsed.items)) {
          dispatch({ type: 'HYDRATE', state: parsed });
        }
      }
    } catch {}
  }, []);

  // Cross-tab sync using storage events
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue) as CartState;
          if (parsed && Array.isArray(parsed.items)) {
            dispatch({ type: 'HYDRATE', state: parsed });
          }
        } catch {}
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const addItem = useCallback((item: Omit<CartItem, 'id'|'quantity'> & { quantity?: number }) => {
    dispatch({ type: 'ADD', item: { ...item, quantity: item.quantity ?? 1 } });
  }, []);
  const removeItem = useCallback((lineId: string) => dispatch({ type: 'REMOVE', lineId }), []);
  const updateQty = useCallback((lineId: string, quantity: number) => dispatch({ type: 'UPDATE_QTY', lineId, quantity }), []);
  const clear = useCallback(() => dispatch({ type: 'CLEAR' }), []);

  const count = state.items.reduce((acc, i) => acc + i.quantity, 0);
  const subtotal = state.items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const compareTotal = state.items.reduce((acc, i) => acc + (i.comparePrice ?? i.price) * i.quantity, 0);
  const savings = compareTotal - subtotal;

  return {
    items: state.items,
    updatedAt: state.updatedAt,
    addItem,
    removeItem,
    updateQty,
    clear,
    count,
    subtotal,
    compareTotal,
    savings,
  };
}
