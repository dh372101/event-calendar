import { Event, Tags, Settings } from '@/types'

const STORAGE_KEYS = {
  EVENTS: 'app.events',
  TAGS: 'app.tags',
  SETTINGS: 'app.settings',
} as const

const DEFAULT_TAGS: Tags = {
  types: {
    'Live': '#000000',
    '干饭': '#000000',
    '旅行': '#000000',
    '运动': '#000000',
  },
  locations: ['梅赛德斯奔驰文化中心', '国家体育场', '上海体育馆'],
  cities: ['上海', '北京', '广州', '深圳'],
}

const DEFAULT_SETTINGS: Settings = {
  font: 'system-ui',
  version: '1.0.0',
}

export const storage = {
  // 事件相关
  getEvents(): Event[] {
    if (typeof window === 'undefined') return []
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.EVENTS)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Failed to get events:', error)
      return []
    }
  },

  saveEvents(events: Event[]): void {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events))
    } catch (error) {
      console.error('Failed to save events:', error)
    }
  },

  getEventById(id: string): Event | undefined {
    return this.getEvents().find(event => event.id === id)
  },

  getEventsByDate(date: string): Event[] {
    return this.getEvents().filter(event => event.date === date)
  },

  getEventsByMonth(year: number, month: number): Event[] {
    const monthStr = month.toString().padStart(2, '0')
    return this.getEvents().filter(event => {
      const eventDate = new Date(event.date)
      return eventDate.getFullYear() === year && eventDate.getMonth() + 1 === month
    })
  },

  saveEvent(event: Event): void {
    const events = this.getEvents()
    const existingIndex = events.findIndex(e => e.id === event.id)

    if (existingIndex >= 0) {
      events[existingIndex] = event
    } else {
      events.push(event)
    }

    this.saveEvents(events)
  },

  deleteEvent(id: string): void {
    const events = this.getEvents().filter(event => event.id !== id)
    this.saveEvents(events)
  },

  // 标签相关
  getTags(): Tags {
    if (typeof window === 'undefined') return DEFAULT_TAGS
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TAGS)
      return stored ? { ...DEFAULT_TAGS, ...JSON.parse(stored) } : DEFAULT_TAGS
    } catch (error) {
      console.error('Failed to get tags:', error)
      return DEFAULT_TAGS
    }
  },

  saveTags(tags: Tags): void {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(tags))
    } catch (error) {
      console.error('Failed to save tags:', error)
    }
  },

  addLocation(location: string): void {
    const tags = this.getTags()
    if (!tags.locations.includes(location)) {
      tags.locations.push(location)
      this.saveTags(tags)
    }
  },

  removeLocation(location: string): void {
    const tags = this.getTags()
    tags.locations = tags.locations.filter(loc => loc !== location)
    this.saveTags(tags)
  },

  addCity(city: string): void {
    const tags = this.getTags()
    if (!tags.cities.includes(city)) {
      tags.cities.push(city)
      this.saveTags(tags)
    }
  },

  removeCity(city: string): void {
    const tags = this.getTags()
    tags.cities = tags.cities.filter(c => c !== city)
    this.saveTags(tags)
  },

  updateTypeColor(type: string, color: string): void {
    const tags = this.getTags()
    if (tags.types[type]) {
      tags.types[type] = color
      this.saveTags(tags)
    }
  },

  // 设置相关
  getSettings(): Settings {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS)
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS
    } catch (error) {
      console.error('Failed to get settings:', error)
      return DEFAULT_SETTINGS
    }
  },

  saveSettings(settings: Settings): void {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  },

  updateFont(font: string): void {
    const settings = this.getSettings()
    settings.font = font
    this.saveSettings(settings)
  },

  // 清除所有数据
  clearAll(): void {
    if (typeof window === 'undefined') return
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
  },
}