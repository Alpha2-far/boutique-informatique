import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      // Ajouter un produit au panier
      addItem: (product, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.id === product.id)
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            }
          }
          return {
            items: [...state.items, { ...product, quantity }],
          }
        })
      },

      // Supprimer un produit du panier
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        }))
      },

      // Mettre à jour la quantité
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.id === productId ? { ...item, quantity } : item
          ),
        }))
      },

      // Vider le panier
      clearCart: () => {
        set({ items: [] })
      },

      // Nombre total d'articles
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      // Prix total
      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.prix * item.quantity, 0)
      },
    }),
    {
      name: 'gco-cart',
    }
  )
)
