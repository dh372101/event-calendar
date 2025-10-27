import { Event, TagConfig, Settings, STORAGE_KEYS, DEFAULT_TAGS, DEFAULT_SETTINGS } from '@/types';

// 本地存储工具类
export class StorageUtil {
  // 获取事件数据
  static getEvents(): Record<string, Event> {
    if (typeof window === 'undefined') return {};

    try {
      const data = localStorage.getItem(STORAGE_KEYS.EVENTS);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('获取事件数据失败:', error);
      return {};
    }
  }

  // 保存事件数据
  static saveEvents(events: Record<string, Event>): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    } catch (error) {
      console.error('保存事件数据失败:', error);
    }
  }

  // 获取单个事件
  static getEvent(date: string): Event | null {
    const events = this.getEvents();
    return events[date] || null;
  }

  // 保存单个事件
  static saveEvent(date: string, event: Event): void {
    const events = this.getEvents();
    events[date] = event;
    this.saveEvents(events);
  }

  // 删除事件
  static deleteEvent(date: string): void {
    const events = this.getEvents();
    delete events[date];
    this.saveEvents(events);
  }

  // 获取标签配置
  static getTags(): TagConfig {
    if (typeof window === 'undefined') return DEFAULT_TAGS;

    try {
      const data = localStorage.getItem(STORAGE_KEYS.TAGS);
      return data ? { ...DEFAULT_TAGS, ...JSON.parse(data) } : DEFAULT_TAGS;
    } catch (error) {
      console.error('获取标签配置失败:', error);
      return DEFAULT_TAGS;
    }
  }

  // 保存标签配置
  static saveTags(tags: TagConfig): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(tags));
    } catch (error) {
      console.error('保存标签配置失败:', error);
    }
  }

  // 获取用户设置
  static getSettings(): Settings {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;

    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch (error) {
      console.error('获取用户设置失败:', error);
      return DEFAULT_SETTINGS;
    }
  }

  // 保存用户设置
  static saveSettings(settings: Settings): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('保存用户设置失败:', error);
    }
  }

  // 清除所有数据
  static clearAll(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(STORAGE_KEYS.EVENTS);
      localStorage.removeItem(STORAGE_KEYS.TAGS);
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    } catch (error) {
      console.error('清除数据失败:', error);
    }
  }

  // 导出数据
  static exportData() {
    return {
      events: this.getEvents(),
      tags: this.getTags(),
      settings: this.getSettings(),
      exportDate: new Date().toISOString(),
    };
  }

  // 导入数据
  static importData(data: {
    events?: Record<string, Event>;
    tags?: TagConfig;
    settings?: Settings;
  }): boolean {
    try {
      if (data.events) {
        this.saveEvents(data.events);
      }
      if (data.tags) {
        this.saveTags(data.tags);
      }
      if (data.settings) {
        this.saveSettings(data.settings);
      }
      return true;
    } catch (error) {
      console.error('导入数据失败:', error);
      return false;
    }
  }
}