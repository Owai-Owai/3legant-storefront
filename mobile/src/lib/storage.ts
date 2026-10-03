import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'

const memoryFallback: Record<string, string> = {}

export const safeStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') {
          return localStorage.getItem(key)
        }
        return memoryFallback[key] ?? null
      }
      const val = await SecureStore.getItemAsync(key)
      if (val !== null) return val
      return memoryFallback[key] ?? null
    } catch {
      return memoryFallback[key] ?? null
    }
  },

  setItem: async (key: string, value: string): Promise<void> => {
    memoryFallback[key] = value
    try {
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(key, value)
        }
        return
      }
      await SecureStore.setItemAsync(key, value)
    } catch {
      // Memory fallback preserves session in memory
    }
  },

  removeItem: async (key: string): Promise<void> => {
    delete memoryFallback[key]
    try {
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(key)
        }
        return
      }
      await SecureStore.deleteItemAsync(key)
    } catch {
      // Memory fallback
    }
  },
}
