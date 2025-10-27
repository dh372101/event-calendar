'use client';

import { useState, useEffect } from 'react';
import CalendarView from '@/components/Calendar/CalendarView';
import EventDetail from '@/components/Calendar/EventDetail';
import { StorageUtil } from '@/utils/storage';

export default function CalendarPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // 监听编辑模态框打开事件
    const handleOpenEditModal = (event: CustomEvent) => {
      // 这里可以添加全局编辑模态框的逻辑
      console.log('Open edit modal for date:', event.detail.date);
    };

    window.addEventListener('openEditModal', handleOpenEditModal as EventListener);
    return () => {
      window.removeEventListener('openEditModal', handleOpenEditModal as EventListener);
    };
  }, []);

  // 处理日期点击后的刷新
  const handleDateClick = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">演出日历</h1>
        <p className="text-gray-600">
          点击日期添加演出信息，管理您的活动安排
        </p>
      </div>

      <CalendarView key={refreshKey} onDateClick={handleDateClick} />
      <EventDetail key={`detail-${refreshKey}`} />
    </div>
  );
}