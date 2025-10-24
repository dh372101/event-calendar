/**
 * Enhanced IndexedDB Storage for Calendar Application
 * A comprehensive replacement for localStorage with proper indexing and search capabilities
 */

import { EventData, TagConfig, SettingsData, StorageData } from '@/types'

// Database configuration
const DB_NAME = 'CalendarDatabase'
const DB_VERSION = 1
const STORES = {
  events: 'events',
  tags: 'tags', 
  settings: 'settings'
}

class IndexedDBStorage {
  private db: IDBDatabase | null = null
  private initialized = false

  /**
   * Initialize the database connection
   */
  async init(): Promise<void> {
    if (this.initialized) return

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        this.initialized = true
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create events store with indexes
        if (!db.objectStoreNames.contains(STORES.events)) {
          const eventsStore = db.createObjectStore(STORES.events, { keyPath: 'date' })
          eventsStore.createIndex('title', 'title', { unique: false })
          eventsStore.createIndex('type', 'type', { unique: false, multiEntry: true })
          eventsStore.createIndex('place', 'place', { unique: false })
          eventsStore.createIndex('city', 'city', { unique: false })
          eventsStore.createIndex('created', 'created', { unique: false })
          eventsStore.createIndex('search', 'searchTerms', { unique: false, multiEntry: true })
        }

        // Create tags store
        if (!db.objectStoreNames.contains(STORES.tags)) {
          const tagsStore = db.createObjectStore(STORES.tags, { keyPath: 'key' })
          tagsStore.createIndex('type', 'type', { unique: false })
          tagsStore.createIndex('created', 'created', { unique: false })
        }

        // Create settings store
        if (!db.objectStoreNames.contains(STORES.settings)) {
          const settingsStore = db.createObjectStore(STORES.settings, { keyPath: 'key' })
          settingsStore.createIndex('category', 'category', { unique: false })
          settingsStore.createIndex('updated', 'updated', { unique: false })
        }
      }
    })
  }

  /**
   * Generate search terms for an event
   */
  private generateSearchTerms(event: EventData): string[] {
    const terms = new Set<string>()
    
    // Add title words
    event.name.toLowerCase().split(/\s+/).forEach(word => {
      if (word.length > 2) terms.add(word)
    })
    
    // Add place words
    event.place.toLowerCase().split(/\s+/).forEach(word => {
      if (word.length > 2) terms.add(word)
    })
    
    // Add city
    terms.add(event.city.toLowerCase())
    
    // Add types
    event.type.forEach(type => {
      terms.add(type.toLowerCase())
    })
    
    return Array.from(terms)
  }

  /**
   * Get a transaction for specific stores
   */
  private getTransaction(storeNames: string[], mode: IDBTransactionMode = 'readonly'): IDBTransaction {
    if (!this.db || !this.initialized) {
      throw new Error('Database not initialized')
    }
    return this.db.transaction(storeNames, mode)
  }

  /**
   * Events CRUD operations
   */
  async saveEvent(event: EventData): Promise<void> {
    await this.init()
    
    const eventData = {
      ...event,
      searchTerms: this.generateSearchTerms(event),
      created: Date.now()
    }

    return new Promise((resolve, reject) => {
      const transaction = this.getTransaction([STORES.events], 'readwrite')
      const store = transaction.objectStore(STORES.events)
      const request = store.put(eventData)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getEvent(date: string): Promise<EventData | null> {
    await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.getTransaction([STORES.events], 'readonly')
      const store = transaction.objectStore(STORES.events)
      const request = store.get(date)

      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  }

  async getAllEvents(): Promise<Record<string, EventData>> {
    await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.getTransaction([STORES.events], 'readonly')
      const store = transaction.objectStore(STORES.events)
      const request = store.getAll()

      request.onsuccess = () => {
        const events: Record<string, EventData> = {}
        request.result.forEach(event => {
          events[event.date] = event
        })
        resolve(events)
      }
      request.onerror = () => reject(request.error)
    })
  }

  async deleteEvent(date: string): Promise<void> {
    await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.getTransaction([STORES.events], 'readwrite')
      const store = transaction.objectStore(STORES.events)
      const request = store.delete(date)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async searchEvents(query: string): Promise<EventData[]> {
    await this.init()
    
    const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2)
    if (terms.length === 0) return []

    const allResults = new Map<string, EventData & { score: number }>()

    // Search for each term
    for (const term of terms) {
      const results = await this.searchByIndex(STORES.events, 'search', term)
      results.forEach(event => {
        const existing = allResults.get(event.date)
        if (existing) {
          existing.score += 1
        } else {
          allResults.set(event.date, { ...event, score: 1 })
        }
      })
    }

    // Sort by relevance score and return
    return Array.from(allResults.values())
      .sort((a, b) => b.score - a.score)
      .map(({ score, ...event }) => event)
  }

  async getEventsByType(type: string): Promise<EventData[]> {
    await this.init()
    return this.searchByIndex(STORES.events, 'type', type)
  }

  async getEventsByCity(city: string): Promise<EventData[]> {
    await this.init()
    return this.searchByIndex(STORES.events, 'city', city)
  }

  async getEventsByDateRange(startDate: string, endDate: string): Promise<EventData[]> {
    await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.getTransaction([STORES.events], 'readonly')
      const store = transaction.objectStore(STORES.events)
      const request = store.openCursor(IDBKeyRange.bound(startDate, endDate))

      const results: EventData[] = []
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor) {
          results.push(cursor.value)
          cursor.continue()
        } else {
          resolve(results)
        }
      }
      
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Tags CRUD operations
   */
  async saveTags(tags: TagConfig): Promise<void> {
    await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.getTransaction([STORES.tags], 'readwrite')
      const store = transaction.objectStore(STORES.tags)

      // Save type colors
      Object.entries(tags.type).forEach(([key, value]) => {
        store.put({ key: `type:${key}`, value, type: 'type', created: Date.now() })
      })

      // Save places
      tags.place.forEach((place, index) => {
        store.put({ key: `place:${index}`, value: place, type: 'place', created: Date.now() })
      })

      // Save cities
      tags.city.forEach((city, index) => {
        store.put({ key: `city:${index}`, value: city, type: 'city', created: Date.now() })
      })

      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  }

  async getTags(): Promise<TagConfig> {
    await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.getTransaction([STORES.tags], 'readonly')
      const store = transaction.objectStore(STORES.tags)
      const request = store.getAll()

      request.onsuccess = () => {
        const tags: TagConfig = {
          type: {},
          place: [],
          city: []
        }

        request.result.forEach(item => {
          if (item.type === 'type') {
            const key = item.key.replace('type:', '')
            tags.type[key] = item.value
          } else if (item.type === 'place') {
            tags.place.push(item.value)
          } else if (item.type === 'city') {
            tags.city.push(item.value)
          }
        })

        resolve(tags)
      }
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Settings CRUD operations
   */
  async saveSetting(key: string, value: any, category: string = 'general'): Promise<void> {
    await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.getTransaction([STORES.settings], 'readwrite')
      const store = transaction.objectStore(STORES.settings)
      const request = store.put({ key, value, category, updated: Date.now() })

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getSetting(key: string): Promise<any> {
    await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.getTransaction([STORES.settings], 'readonly')
      const store = transaction.objectStore(STORES.settings)
      const request = store.get(key)

      request.onsuccess = () => resolve(request.result?.value || null)
      request.onerror = () => reject(request.error)
    })
  }

  async getAllSettings(): Promise<Record<string, any>> {
    await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.getTransaction([STORES.settings], 'readonly')
      const store = transaction.objectStore(STORES.settings)
      const request = store.getAll()

      request.onsuccess = () => {
        const settings: Record<string, any> = {}
        request.result.forEach(item => {
          settings[item.key] = item.value
        })
        resolve(settings)
      }
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Generic search by index
   */
  private async searchByIndex(storeName: string, indexName: string, query: string): Promise<EventData[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.getTransaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const index = store.index(indexName)
      const request = index.openCursor(IDBKeyRange.only(query))

      const results: EventData[] = []
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor) {
          results.push(cursor.value)
          cursor.continue()
        } else {
          resolve(results)
        }
      }
      
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Export all data
   */
  async exportData(): Promise<StorageData> {
    await this.init()

    const events = await this.getAllEvents()
    const tags = await this.getTags()
    const settingsData = await this.getAllSettings()
    
    return {
      events,
      tags,
      settings: {
        font: settingsData.font || 'system',
        menuCollapsed: settingsData.menuCollapsed || false,
        version: settingsData.version || '1.0.0'
      }
    }
  }

  /**
   * Import data
   */
  async importData(data: StorageData): Promise<void> {
    await this.init()

    // Import events
    const eventPromises = Object.values(data.events).map(event => this.saveEvent(event))
    await Promise.all(eventPromises)

    // Import tags
    if (data.tags) {
      await this.saveTags(data.tags)
    }

    // Import settings
    if (data.settings) {
      const settingPromises = Object.entries(data.settings).map(([key, value]) => 
        this.saveSetting(key, value, 'general')
      )
      await Promise.all(settingPromises)
    }
  }

  /**
   * Clear all data
   */
  async clearAllData(): Promise<void> {
    await this.init()

    const transaction = this.getTransaction([STORES.events, STORES.tags, STORES.settings], 'readwrite')
    
    transaction.objectStore(STORES.events).clear()
    transaction.objectStore(STORES.tags).clear()
    transaction.objectStore(STORES.settings).clear()

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<any> {
    await this.init()

    const stats: any = {
      events: 0,
      tags: 0,
      settings: 0
    }

    // Count events
    stats.events = await new Promise<number>((resolve) => {
      const transaction = this.getTransaction([STORES.events], 'readonly')
      const store = transaction.objectStore(STORES.events)
      const request = store.count()
      request.onsuccess = () => resolve(request.result)
    })

    // Count tags
    stats.tags = await new Promise<number>((resolve) => {
      const transaction = this.getTransaction([STORES.tags], 'readonly')
      const store = transaction.objectStore(STORES.tags)
      const request = store.count()
      request.onsuccess = () => resolve(request.result)
    })

    // Count settings
    stats.settings = await new Promise<number>((resolve) => {
      const transaction = this.getTransaction([STORES.settings], 'readonly')
      const store = transaction.objectStore(STORES.settings)
      const request = store.count()
      request.onsuccess = () => resolve(request.result)
    })

    return stats
  }
}

// Create and export singleton instance
const indexedDBStorage = new IndexedDBStorage()

// Export functions for backward compatibility with existing storage API
export const getStorageData = async (): Promise<StorageData> => {
  return await indexedDBStorage.exportData()
}

export const saveEvent = async (event: EventData): Promise<void> => {
  return await indexedDBStorage.saveEvent(event)
}

export const deleteEvent = async (date: string): Promise<void> => {
  return await indexedDBStorage.deleteEvent(date)
}

export const getEvent = async (date: string): Promise<EventData | null> => {
  return await indexedDBStorage.getEvent(date)
}

export const saveTags = async (tags: TagConfig): Promise<void> => {
  return await indexedDBStorage.saveTags(tags)
}

export const saveSettings = async (settings: SettingsData): Promise<void> => {
  const promises = Object.entries(settings).map(([key, value]) => 
    indexedDBStorage.saveSetting(key, value, 'general')
  )
  await Promise.all(promises)
}

export const clearAllData = async (): Promise<void> => {
  return await indexedDBStorage.clearAllData()
}

// Export additional search and advanced functions
export const searchEvents = async (query: string): Promise<EventData[]> => {
  return await indexedDBStorage.searchEvents(query)
}

export const getEventsByType = async (type: string): Promise<EventData[]> => {
  return await indexedDBStorage.getEventsByType(type)
}

export const getEventsByCity = async (city: string): Promise<EventData[]> => {
  return await indexedDBStorage.getEventsByCity(city)
}

export const getEventsByDateRange = async (startDate: string, endDate: string): Promise<EventData[]> => {
  return await indexedDBStorage.getEventsByDateRange(startDate, endDate)
}

export const getDatabaseStats = async (): Promise<any> => {
  return await indexedDBStorage.getStats()
}

// Export the storage instance for advanced usage
export { indexedDBStorage }
export default indexedDBStorage
