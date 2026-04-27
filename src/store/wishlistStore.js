import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],

      // Basculer un produit en favoris
      toggleWishlist: (product) => {
        set((state) => {
          const exists = state.items.find((item) => item.id === product.id)
          if (exists) {
            return { items: state.items.filter((item) => item.id !== product.id) }
          }
          return { items: [...state.items, product] }
        })
      },

      // Ajouter aux favoris
      addWishlist: (product) => {
        set((state) => {
          const exists = state.items.find((item) => item.id === product.id)
          if (!exists) {
            return { items: [...state.items, product] }
          }
          return state
        })
      },

      // Supprimer des favoris
      removeWishlist: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        }))
      },

      // Vérifier si un produit est en favoris
      isInWishlist: (productId) => {
        return get().items.some((item) => item.id === productId)
      },
    }),
    {
      name: 'gco-wishlist',
    }
  )
)
