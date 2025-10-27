// 事件数据结构
export interface Event {
  date: string; // YYYY-MM-DD
  type: EventType[];
  name: string;
  place: string;
  city: string;
  color: string;
}

// 事件类型枚举
export type EventType = 'Live' | '干饭' | '旅行' | '运动';

// 标签配置
export interface TagConfig {
  type: Record<EventType, string>; // 类型对应的颜色
  place: string[]; // 地点列表
  city: string[]; // 城市列表
}

// 用户设置
export interface Settings {
  font: string; // 字体路径或 'system'
  menuCollapsed: boolean; // 菜单折叠状态
  version: string; // 版本号
}

// 存储键名
export const STORAGE_KEYS = {
  EVENTS: 'ec-cc-events',
  TAGS: 'ec-cc-tags',
  SETTINGS: 'ec-cc-settings',
} as const;

// 默认标签配置
export const DEFAULT_TAGS: TagConfig = {
  type: {
    Live: '#FF6B6B',
    '干饭': '#4ECDC4',
    '旅行': '#45B7D1',
    '运动': '#96CEB4',
  },
  place: ['梅赛德斯奔驰文化中心', '静安体育中心'],
  city: ['上海', '东京', '大阪'],
};

// 默认设置
export const DEFAULT_SETTINGS: Settings = {
  font: 'system',
  menuCollapsed: false,
  version: '1.0.0',
};

// 导出格式
export type ExportFormat = 'csv' | 'json';

// 月份范围
export interface MonthRange {
  startMonth: string; // YYYY-MM
  endMonth: string; // YYYY-MM
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// 日历视图状态
export interface CalendarState {
  currentYear: number;
  currentMonth: number;
  selectedDate: string | null;
  showEditModal: boolean;
}

// 颜色选择器配置
export interface ColorPalette {
  colors: string[]; // 预设颜色数组
  advancedMode: boolean; // 高级模式开关
}