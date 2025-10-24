// 事件数据类型
export interface EventData {
  date: string // YYYY-MM-DD
  type: string[]
  name: string
  place: string
  city: string
  color: string
}

// 标签配置类型
export interface TagConfig {
  type: Record<string, string> // 类型名称 -> 颜色
  place: string[] // 地点列表
  city: string[] // 城市列表
}

// 设置类型
export interface SettingsData {
  font: string
  menuCollapsed: boolean
  version: string
}

// 存储数据类型
export interface StorageData {
  events: Record<string, EventData>
  tags: TagConfig
  settings: SettingsData
}

// 菜单模块类型
export type ActiveModule = 'calendar' | 'tags' | 'export-image' | 'export-data' | 'settings'