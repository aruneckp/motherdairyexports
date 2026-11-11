import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { SEED_ACTIVITIES, SEED_BUYERS, SEED_DEALS, SEED_SHIPMENTS, SEED_SUPPLIERS } from '../data/crm'
import type { Activity, Buyer, Deal, DealStage, Shipment, ShipmentStatus, Supplier } from '../data/types'
import type { BasketItem } from '../lib/pricing'

interface Toast {
  id: number
  message: string
}

interface State {
  buyers: Buyer[]
  suppliers: Supplier[]
  deals: Deal[]
  activities: Activity[]
  shipments: Shipment[]
  toasts: Toast[]
  /** Shared enquiry basket used by the Buyer Showcase, Opportunity Spotter and Pitch Studio */
  basket: BasketItem[]
  basketCountry: string
  basketBuyerId: string | null
  addToBasket: (productId: string, qty: number) => void
  setBasketQty: (productId: string, qty: number) => void
  removeFromBasket: (productId: string) => void
  clearBasket: () => void
  setBasketTarget: (country: string, buyerId: string | null) => void
  upsertBuyer: (b: Buyer) => void
  removeBuyer: (id: string) => void
  upsertSupplier: (s: Supplier) => void
  removeSupplier: (id: string) => void
  upsertDeal: (d: Deal) => void
  moveDeal: (id: string, stage: DealStage) => void
  removeDeal: (id: string) => void
  addActivity: (a: Activity) => void
  toggleActivity: (id: string) => void
  setShipmentStatus: (id: string, status: ShipmentStatus) => void
  toggleShipmentDoc: (id: string, doc: string) => void
  toast: (message: string) => void
  dismissToast: (id: number) => void
  resetDemo: () => void
}

const upsert = <T extends { id: string }>(list: T[], item: T) =>
  list.some((x) => x.id === item.id) ? list.map((x) => (x.id === item.id ? item : x)) : [item, ...list]

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      buyers: SEED_BUYERS,
      suppliers: SEED_SUPPLIERS,
      deals: SEED_DEALS,
      activities: SEED_ACTIVITIES,
      shipments: SEED_SHIPMENTS,
      toasts: [],
      basket: [],
      basketCountry: 'UAE',
      basketBuyerId: null,
      addToBasket: (productId, qty) =>
        set((s) => ({
          basket: s.basket.some((b) => b.productId === productId)
            ? s.basket.map((b) => (b.productId === productId ? { ...b, qty: b.qty + qty } : b))
            : [...s.basket, { productId, qty }],
        })),
      setBasketQty: (productId, qty) => set((s) => ({ basket: s.basket.map((b) => (b.productId === productId ? { ...b, qty: Math.max(0, qty) } : b)) })),
      removeFromBasket: (productId) => set((s) => ({ basket: s.basket.filter((b) => b.productId !== productId) })),
      clearBasket: () => set({ basket: [], basketBuyerId: null }),
      setBasketTarget: (country, buyerId) => set({ basketCountry: country, basketBuyerId: buyerId }),
      upsertBuyer: (b) => set((s) => ({ buyers: upsert(s.buyers, b) })),
      removeBuyer: (id) => set((s) => ({ buyers: s.buyers.filter((b) => b.id !== id) })),
      upsertSupplier: (sup) => set((s) => ({ suppliers: upsert(s.suppliers, sup) })),
      removeSupplier: (id) => set((s) => ({ suppliers: s.suppliers.filter((x) => x.id !== id) })),
      upsertDeal: (d) => set((s) => ({ deals: upsert(s.deals, d) })),
      moveDeal: (id, stage) => set((s) => ({ deals: s.deals.map((d) => (d.id === id ? { ...d, stage } : d)) })),
      removeDeal: (id) => set((s) => ({ deals: s.deals.filter((d) => d.id !== id) })),
      addActivity: (a) => set((s) => ({ activities: [a, ...s.activities] })),
      toggleActivity: (id) => set((s) => ({ activities: s.activities.map((a) => (a.id === id ? { ...a, done: !a.done } : a)) })),
      setShipmentStatus: (id, status) => set((s) => ({ shipments: s.shipments.map((x) => (x.id === id ? { ...x, status } : x)) })),
      toggleShipmentDoc: (id, doc) =>
        set((s) => ({
          shipments: s.shipments.map((x) =>
            x.id === id ? { ...x, docs: x.docs.map((d) => (d.name === doc ? { ...d, done: !d.done } : d)) } : x,
          ),
        })),
      toast: (message) => {
        const id = Date.now() + Math.random()
        set((s) => ({ toasts: [...s.toasts, { id, message }] }))
        setTimeout(() => get().dismissToast(id), 3200)
      },
      dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
      resetDemo: () =>
        set({ buyers: SEED_BUYERS, suppliers: SEED_SUPPLIERS, deals: SEED_DEALS, activities: SEED_ACTIVITIES, shipments: SEED_SHIPMENTS }),
    }),
    {
      name: 'md-export-crm-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: ({ buyers, suppliers, deals, activities, shipments, basket, basketCountry, basketBuyerId }) => ({
        buyers,
        suppliers,
        deals,
        activities,
        shipments,
        basket,
        basketCountry,
        basketBuyerId,
      }),
    },
  ),
)
