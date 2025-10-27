// 事件数据类型定义
export interface EventData {
  name: string
  type: string[]
  place: string
  city: string
  color: string
}

// 标签数据类型定义
export interface TagData {
  type: Record<string, string> // 类型名称 -> 颜色
  place: string[] // 地点列表
  city: string[] // 城市列表
}

// 设置数据类型定义
export interface SettingsData {
  font: string
  menuCollapsed: boolean
  version: string
}

// 日历日期事件
export interface CalendarDayEvent {
  date: Date
  event?: EventData
}