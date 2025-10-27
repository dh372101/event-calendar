'use client';

import { useState, useEffect } from 'react';
import { DateUtil } from '@/utils/date';
import { StorageUtil } from '@/utils/storage';
import { Event, EventType } from '@/types';

export default function EventDetail() {
  const [events, setEvents] = useState<Record<string, Event>>({});

  // 加载事件数据
  useEffect(() => {
    const loadedEvents = StorageUtil.getEvents();
    setEvents(loadedEvents);
  }, []);

  // 处理事件删除
  const handleDeleteEvent = (date: string) => {
    if (confirm('确定要删除这个事件吗？')) {
      StorageUtil.deleteEvent(date);
      const updatedEvents = { ...events };
      delete updatedEvents[date];
      setEvents(updatedEvents);
    }
  };

  // 处理事件编辑
  const handleEditEvent = (date: string) => {
    // 触发编辑模态框
    window.dispatchEvent(new CustomEvent('openEditModal', { detail: { date } }));
  };

  // 获取事件类型颜色
  const getEventTypeColor = (eventType: EventType) => {
    const tags = StorageUtil.getTags();
    return tags.type[eventType];
  };

  // 按日期排序事件
  const sortedEvents = Object.entries(events)
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .filter(([_, event]) => event.name); // 只显示有名称的事件

  return (
    <div className="bg-white rounded-lg crayon-border p-6">
      <h3 className="text-lg font-bold mb-4">事件详情</h3>

      {sortedEvents.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          暂无事件，点击日历上的日期添加新事件
        </p>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {sortedEvents.map(([date, event]) => {
            const { year, month, day } = DateUtil.parseDate(date)!;
            const monthDay = `${month + 1}/${day}`;

            return (
              <div
                key={date}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-black transition-colors crayon-texture"
                style={{ borderLeftColor: event.color, borderLeftWidth: '4px' }}
              >
                {/* 日期和类型 */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-600">
                      {monthDay}
                    </span>
                    <div className="flex space-x-1">
                      {event.type.map((eventType) => (
                        <div
                          key={eventType}
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getEventTypeColor(eventType) }}
                          title={eventType}
                        />
                      ))}
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditEvent(date)}
                      className="text-sm px-2 py-1 border border-gray-300 rounded hover:bg-gray-100"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(date)}
                      className="text-sm px-2 py-1 border border-red-300 text-red-600 rounded hover:bg-red-50"
                    >
                      删除
                    </button>
                  </div>
                </div>

                {/* 事件名称 */}
                <div className="font-medium mb-1" style={{ color: event.color }}>
                  {event.name}
                </div>

                {/* 地点和城市 */}
                <div className="text-sm text-gray-600">
                  {event.place && (
                    <div>📍 {event.place}</div>
                  )}
                  {event.city && event.city !== event.place && (
                    <div>🏙️ {event.city}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}