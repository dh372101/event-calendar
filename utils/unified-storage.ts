/**
 * Unified Storage Interface
 * Automatically uses IndexedDB when available, falls back to localStorage
 * Provides a consistent API regardless of the underlying storage mechanism
 */

import { EventData, TagConfig, SettingsData, StorageData } from '@/types'

// Storage interface definition
interface IStorage {
  getStorageData(): Promise<StorageData>
  saveEvent(event: EventData): Promise<void>
  getEvent(date: string): Promise<EventData | null>
  deleteEvent(date: string): Promise<void>
  saveTags(tags: TagConfig): Promise<void>
  saveSettings(settings: SettingsData): Promise<void>
  clearAllData(): Promise<void>
  exportData(): Promise<StorageData>
  importData(data: StorageData): Promise<void>
  
  // Advanced features
  searchEvents?(query: string): Promise<EventData[]>
  getEventsByType?(type: string): Promise<EventData[]>
  getEventsByCity?(city: string): Promise<EventData[]>
  getEventsByDateRange?(startDate: string, endDate: string): Promise<EventData[]>
  getDatabaseStats?(): Promise<any>
}

// Default configurations
const DEFAULT_TAGS: TagConfig = {
  type: {
    'Live': '#FF6B6B',
    '干饭': '#4ECDC4', 
    '旅行': '#45B7D1',
    '运动': '#96CEB4'
  },
  place: ['梅赛德斯奔驰文化中心', '静安体育中心'],
  city: ['上海', '东京', '大阪']
}

const DEFAULT_SETTINGS: SettingsData = {
  font: 'system',
  menuCollapsed: false,
  version: '1.0.0'
}

// LocalStorage implementation (fallback)
class LocalStorageStorage implements IStorage {
  private STORAGE_KEYS = {
    EVENTS: 'events',
    TAGS: 'tags',
    SETTINGS: 'settings'
  }

  async getStorageData(): Promise<StorageData> {
    try {
      const events = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.EVENTS) || '{}')
      const tags = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.TAGS) || JSON.stringify(DEFAULT_TAGS))
      const settings = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.SETTINGS) || JSON.stringify(DEFAULT_SETTINGS))
      
      return { events, tags, settings }
    } catch (error) {
      console.error('LocalStorage getStorageData error:', error)
      return {
        events: {},
        tags: DEFAULT_TAGS,
        settings: DEFAULT_SETTINGS
      }
    }
  }

  async saveEvent(event: EventData): Promise<void> {
    try {
      const events = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.EVENTS) || '{}')
      events[event.date] = event
      localStorage.setItem(this.STORAGE_KEYS.EVENTS, JSON.stringify(events))
    } catch (error) {
      console.error('LocalStorage saveEvent error:', error)
      throw new Error('Failed to save event')
    }
  }

  async getEvent(date: string): Promise<EventData | null> {
    try {
      const events = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.EVENTS) || '{}')
      return events[date] || null
    } catch (error) {
      console.error('LocalStorage getEvent error:', error)
      return null
    }
  }

  async deleteEvent(date: string): Promise<void> {
    try {
      const events = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.EVENTS) || '{}')
      delete events[date]
      localStorage.setItem(this.STORAGE_KEYS.EVENTS, JSON.stringify(events))
    } catch (error) {
      console.error('LocalStorage deleteEvent error:', error)
      throw new Error('Failed to delete event')
    }
  }

  async saveTags(tags: TagConfig): Promise<void> {
    try {
      localStorage.setItem(this.STORAGE_KEYS.TAGS, JSON.stringify(tags))
    } catch (error) {
      console.error('LocalStorage saveTags error:', error)
      throw new Error('Failed to save tags')
    }
  }

  async saveSettings(settings: SettingsData): Promise<void> {
    try {
      localStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
    } catch (error) {
      console.error('LocalStorage saveSettings error:', error)
      throw new Error('Failed to save settings')
    }
  }

  async clearAllData(): Promise<void> {
    try {
      localStorage.removeItem(this.STORAGE_KEYS.EVENTS)
      localStorage.removeItem(this.STORAGE_KEYS.TAGS)
      localStorage.removeItem(this.STORAGE_KEYS.SETTINGS)
    } catch (error) {
      console.error('LocalStorage clearAllData error:', error)
      throw new Error('Failed to clear data')
    }
  }

  async exportData(): Promise<StorageData> {
    return this.getStorageData()
  }

  async importData(data: StorageData): Promise<void> {
    try {
      if (data.events) {
        localStorage.setItem(this.STORAGE_KEYS.EVENTS, JSON.stringify(data.events))
      }
      if (data.tags) {
        localStorage.setItem(this.STORAGE_KEYS.TAGS, JSON.stringify(data.tags))
      }
      if (data.settings) {
        localStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings))
      }
    } catch (error) {
      console.error('LocalStorage importData error:', error)
      throw new Error('Failed to import data')
    }
  }

  // Basic search functionality for localStorage fallback
  async searchEvents(query: string): Promise<EventData[]> {
    try {
      const { events } = await this.getStorageData()
      const queryLower = query.toLowerCase()
      
      return Object.values(events).filter(event => 
        event.name.toLowerCase().includes(queryLower) ||
        event.place.toLowerCase().includes(queryLower) ||
        event.city.toLowerCase().includes(queryLower) ||
        event.type.some(type => type.toLowerCase().includes(queryLower))
      )
    } catch (error) {
      console.error('LocalStorage searchEvents error:', error)
      return []
    }
  }

  async getEventsByType(type: string): Promise<EventData[]> {
    try {
      const { events } = await this.getStorageData()
      return Object.values(events).filter(event => 
        event.type.includes(type)
      )
    } catch (error) {
      console.error('LocalStorage getEventsByType error:', error)
      return []
    }
  }

  async getEventsByCity(city: string): Promise<EventData[]> {
    try {
      const { events } = await this.getStorageData()
      return Object.values(events).filter(event => 
        event.city === city
      )
    } catch (error) {
      console.error('LocalStorage getEventsByCity error:', error)
      return []
    }
  }

  async getEventsByDateRange(startDate: string, endDate: string): Promise<EventData[]> {
    try {
      const { events } = await this.getStorageData()
      return Object.values(events).filter(event => 
        event.date >= startDate && event.date <= endDate
      )
    } catch (error) {
      console.error('LocalStorage getEventsByDateRange error:', error)
      return []
    }
  }

  async getDatabaseStats(): Promise<any> {
    try {
      const { events, tags } = await this.getStorageData()
      return {
        events: Object.keys(events).length,
        tags: Object.keys(tags.type).length + tags.place.length + tags.city.length,
        settings: 3, // font, menuCollapsed, version
        storageType: 'localStorage'
      }
    } catch (error) {
      console.error('LocalStorage getDatabaseStats error:', error)
      return {
        events: 0,
        tags: 0,
        settings: 0,
        storageType: 'localStorage'
      }
    }
  }
}

// Unified Storage Manager
class UnifiedStorage {
  private storage: IStorage
  private storageType: 'indexedDB' | 'localStorage'
  private initialized = false

  constructor() {
    this.storageType = 'localStorage'
    this.storage = new LocalStorageStorage()
  }

  async initialize(): Promise<void> {
    if (this.initialized) return

    try {
      // Check if IndexedDB is available
      if (typeof indexedDB !== 'undefined' && indexedDB !== null) {
        // Try to load and use IndexedDB storage
        const { indexedDBStorage } = await import('./indexeddb-storage')
        
        // Test IndexedDB functionality
        await indexedDBStorage.init()
        await indexedDBStorage.getDatabaseStats()
        
        this.storage = indexedDBStorage
        this.storageType = 'indexedDB'
        console.log('Using IndexedDB for storage')
      } else {
        console.log('IndexedDB not available, using localStorage')
      }
    } catch (error) {
      console.warn('IndexedDB initialization failed, falling back to localStorage:', error)
      this.storage = new LocalStorageStorage()
      this.storageType = 'localStorage'
    }

    this.initialized = true
    
    // Try to migrate data from localStorage to IndexedDB if this is the first time using IndexedDB
    if (this.storageType === 'indexedDB') {
      await this.migrateFromLocalStorage()
    }
  }

  private async migrateFromLocalStorage(): Promise<void> {
    try {
      const localStorageStorage = new LocalStorageStorage()
      const localStorageData = await localStorageStorage.getStorageData()
      
      // Check if there's data in localStorage that should be migrated
      const hasEvents = Object.keys(localStorageData.events).length > 0
      const hasCustomTags = JSON.stringify(localStorageData.tags) !== JSON.stringify(DEFAULT_TAGS)
      const hasCustomSettings = JSON.stringify(localStorageData.settings) !== JSON.stringify(DEFAULT_SETTINGS)
      
      if (hasEvents || hasCustomTags || hasCustomSettings) {
        console.log('Migrating data from localStorage to IndexedDB...')
        await this.importData(localStorageData)
        console.log('Data migration completed')
        
        // Clear localStorage after successful migration
        await localStorageStorage.clearAllData()
        console.log('Cleared localStorage after migration')
      }
    } catch (error) {
      console.error('Error during data migration:', error)
      // Don't throw here, just log the error and continue
    }
  }

  // Storage API methods
  async getStorageData(): Promise<StorageData> {
    await this.initialize()
    return this.storage.getStorageData()
  }

  async saveEvent(event: EventData): Promise<void> {
    await this.initialize()
    return this.storage.saveEvent(event)
  }

  async getEvent(date: string): Promise<EventData | null> {
    await this.initialize()
    return this.storage.getEvent(date)
  }

  async deleteEvent(date: string): Promise<void> {
    await this.initialize()
    return this.storage.deleteEvent(date)
  }

  async saveTags(tags: TagConfig): Promise<void> {
    await this.initialize()
    return this.storage.saveTags(tags)
  }

  async saveSettings(settings: SettingsData): Promise<void> {
    await this.initialize()
    return this.storage.saveSettings(settings)
  }

  async clearAllData(): Promise<void> {
    await this.initialize()
    return this.storage.clearAllData()
  }

  async exportData(): Promise<StorageData> {
    await this.initialize()
    return this.storage.exportData()
  }

  async importData(data: StorageData): Promise<void> {
    await this.initialize()
    return this.storage.importData(data)
  }

  // Advanced features (will work regardless of storage type)
  async searchEvents(query: string): Promise<EventData[]> {
    await this.initialize()
    if (this.storage.searchEvents) {
      return this.storage.searchEvents(query)
    }
    // Fallback to basic search
    const localStorageStorage = new LocalStorageStorage()
    return localStorageStorage.searchEvents(query)
  }

  async getEventsByType(type: string): Promise<EventData[]> {
    await this.initialize()
    if (this.storage.getEventsByType) {
      return this.storage.getEventsByType(type)
    }
    const localStorageStorage = new LocalStorageStorage()
    return localStorageStorage.getEventsByType(type)
  }

  async getEventsByCity(city: string): Promise<EventData[]> {
    await this.initialize()
    if (this.storage.getEventsByCity) {
      return this.storage.getEventsByCity(city)
    }
    const localStorageStorage = new LocalStorageStorage()
    return localStorageStorage.getEventsByCity(city)
  }

  async getEventsByDateRange(startDate: string, endDate: string): Promise<EventData[]> {
    await this.initialize()
    if (this.storage.getEventsByDateRange) {
      return this.storage.getEventsByDateRange(startDate, endDate)
    }
    const localStorageStorage = new LocalStorageStorage()
    return localStorageStorage.getEventsByDateRange(startDate, endDate)
  }

  async getDatabaseStats(): Promise<any> {
    await this.initialize()
    if (this.storage.getDatabaseStats) {
      const stats = await this.storage.getDatabaseStats()
      return { ...stats, storageType: this.storageType }
    }
    const localStorageStorage = new LocalStorageStorage()
    const stats = await localStorageStorage.getDatabaseStats()
    return { ...stats, storageType: this.storageType }
  }

  getStorageType(): string {
    return this.storageType
  }

  // Utility methods
  async exportDataAsJSON(): Promise<string> {
    const data = await this.exportData()
    return JSON.stringify(data, null, 2)
  }

  async exportDataAsCSV(): Promise<string> {
    const { events } = await this.getStorageData()
    const headers = ['日期', '类型', '名称', '地点', '城市', '颜色']
    const rows = Object.values(events).map(event => [
      event.date,
      event.type.join(';'),
      event.name,
      event.place,
      event.city,
      event.color
    ])
    
    return [headers, ...rows].map(row => row.join(',')).join('\n')
  }

  async importDataFromJSON(jsonData: string): Promise<boolean> {
    try {
      const data: StorageData = JSON.parse(jsonData)
      await this.importData(data)
      return true
    } catch (error) {
      console.error('导入JSON数据失败:', error)
      return false
    }
  }

  async importDataFromCSV(csvData: string): Promise<boolean> {
    try {
      const lines = csvData.split('\n').filter(line => line.trim())
      if (lines.length < 2) return false
      
      const headers = lines[0].split(',')
      const events: Record<string, EventData> = {}
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',')
        if (values.length !== headers.length) continue
        
        const event: EventData = {
          date: values[0],
          type: values[1].split(';'),
          name: values[2],
          place: values[3],
          city: values[4],
          color: values[5]
        }
        
        events[event.date] = event
      }
      
      await this.importData({ events, tags: DEFAULT_TAGS, settings: DEFAULT_SETTINGS })
      return true
    } catch (error) {
      console.error('导入CSV数据失败:', error)
      return false
    }
  }
}

// Create and export singleton instance
const unifiedStorage = new UnifiedStorage()

// Export functions for backward compatibility
export const getStorageData = () => unifiedStorage.getStorageData()
export const saveEvent = (event: EventData) => unifiedStorage.saveEvent(event)
export const deleteEvent = (date: string) => unifiedStorage.deleteEvent(date)
export const getEvent = (date: string) => unifiedStorage.getEvent(date)
export const saveTags = (tags: TagConfig) => unifiedStorage.saveTags(tags)
export const saveSettings = (settings: SettingsData) => unifiedStorage.saveSettings(settings)
export const clearAllData = () => unifiedStorage.clearAllData()
export const exportData = () => unifiedStorage.exportData()
export const importData = (data: StorageData) => unifiedStorage.importData(data)

// Export advanced functions
export const searchEvents = (query: string) => unifiedStorage.searchEvents(query)
export const getEventsByType = (type: string) => unifiedStorage.getEventsByType(type)
export const getEventsByCity = (city: string) => unifiedStorage.getEventsByCity(city)
export const getEventsByDateRange = (startDate: string, endDate: string) => unifiedStorage.getEventsByDateRange(startDate, endDate)
export const getDatabaseStats = () => unifiedStorage.getDatabaseStats()

// Export utility functions
export const exportDataAsJSON = () => unifiedStorage.exportDataAsJSON()
export const exportDataAsCSV = () => unifiedStorage.exportDataAsCSV()
export const importDataFromJSON = (jsonData: string) => unifiedStorage.importDataFromJSON(jsonData)
export const importDataFromCSV = (csvData: string) => unifiedStorage.importDataFromCSV(csvData)

// Export the unified storage instance
export { unifiedStorage }
export default unifiedStorage
