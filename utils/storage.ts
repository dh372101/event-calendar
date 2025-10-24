import { StorageData, EventData, TagConfig, SettingsData } from '@/types'

// 默认标签配置
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

// 默认设置
const DEFAULT_SETTINGS: SettingsData = {
  font: 'system',
  menuCollapsed: false,
  version: '1.0.0'
}

// 存储键名
const STORAGE_KEYS = {
  EVENTS: 'events',
  TAGS: 'tags', 
  SETTINGS: 'settings'
}

// 获取所有数据
export function getStorageData(): StorageData {
  // 检查是否在浏览器环境中
  if (typeof window === 'undefined') {
    return { events: {}, tags: DEFAULT_TAGS, settings: DEFAULT_SETTINGS }
  }
  
  const events = JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS) || '{}')
  const tags = JSON.parse(localStorage.getItem(STORAGE_KEYS.TAGS) || JSON.stringify(DEFAULT_TAGS))
  const settings = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || JSON.stringify(DEFAULT_SETTINGS))
  
  return { events, tags, settings }
}

// 保存事件数据
export function saveEvent(event: EventData): void {
  if (typeof window === 'undefined') return
  
  const events = JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS) || '{}')
  events[event.date] = event
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events))
}

// 删除事件数据
export function deleteEvent(date: string): void {
  if (typeof window === 'undefined') return
  
  const events = JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS) || '{}')
  delete events[date]
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events))
}

// 获取特定日期的事件
export function getEvent(date: string): EventData | null {
  const events = JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS) || '{}')
  return events[date] || null
}

// 保存标签配置
export function saveTags(tags: TagConfig): void {
  if (typeof window === 'undefined') return
  
  localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(tags))
}

// 保存设置
export function saveSettings(settings: SettingsData): void {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
}

// 清除所有数据
export function clearAllData(): void {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem(STORAGE_KEYS.EVENTS)
  localStorage.removeItem(STORAGE_KEYS.TAGS)
  localStorage.removeItem(STORAGE_KEYS.SETTINGS)
}

// 导出数据为JSON
export function exportDataAsJSON(): string {
  const data = getStorageData()
  return JSON.stringify(data, null, 2)
}

// 导出数据为CSV
export function exportDataAsCSV(): string {
  const { events } = getStorageData()
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

// 导入JSON数据
export function importDataFromJSON(jsonData: string): boolean {
  try {
    const data: StorageData = JSON.parse(jsonData)
    
    if (data.events) {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(data.events))
    }
    if (data.tags) {
      localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(data.tags))
    }
    if (data.settings) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings))
    }
    
    return true
  } catch (error) {
    console.error('导入数据失败:', error)
    return false
  }
}

// 导入CSV数据
export function importDataFromCSV(csvData: string): boolean {
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
    
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events))
    return true
  } catch (error) {
    console.error('导入CSV数据失败:', error)
    return false
  }
}