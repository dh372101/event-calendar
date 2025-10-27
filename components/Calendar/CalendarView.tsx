'use client';

import { useState, useEffect } from 'react';
import { DateUtil } from '@/utils/date';
import { StorageUtil } from '@/utils/storage';
import { Event, EventType } from '@/types';
import EditModal from './EditModal';

interface CalendarViewProps {
  onDateClick?: (date: string) => void;
}

export default function CalendarView({ onDateClick }: CalendarViewProps) {
  const [currentYear, setCurrentYear] = useState(2024);
  const [currentMonth, setCurrentMonth] = useState(0);
  const [events, setEvents] = useState<Record<string, Event>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // 加载事件数据
  useEffect(() => {
    const loadedEvents = StorageUtil.getEvents();
    setEvents(loadedEvents);
  }, []);

  // 初始化当前日期
  useEffect(() => {
    const today = DateUtil.getCurrentMonth();
    setCurrentYear(today.year);
    setCurrentMonth(today.month);
  }, []);

  // 获取月份日历数据
  const getCalendarDays = () => {
    const firstDay = DateUtil.getFirstDayOfMonth(currentYear, currentMonth);
    const daysInMonth = DateUtil.getDaysInMonth(currentYear, currentMonth);
    const daysInPrevMonth = DateUtil.getDaysInMonth(
      ...Object.values(DateUtil.getPreviousMonth(currentYear, currentMonth))
    );

    const days = [];

    // 上月日期
    const prevMonthStart = firstDay === 0 ? 6 : firstDay - 1; // 周一开始
    for (let i = prevMonthStart; i > 0; i--) {
      const { year: prevYear, month: prevMonth } = DateUtil.getPreviousMonth(currentYear, currentMonth);
      days.push({
        day: daysInPrevMonth - i + 1,
        isCurrentMonth: false,
        year: prevYear,
        month: prevMonth,
        date: DateUtil.formatDate(prevYear, prevMonth, daysInPrevMonth - i + 1),
      });
    }

    // 当月日期
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        isCurrentMonth: true,
        year: currentYear,
        month: currentMonth,
        date: DateUtil.formatDate(currentYear, currentMonth, day),
      });
    }

    // 下月日期
    const remainingDays = 42 - days.length; // 6行 x 7列
    for (let day = 1; day <= remainingDays; day++) {
      const { year: nextYear, month: nextMonth } = DateUtil.getNextMonth(currentYear, currentMonth);
      days.push({
        day,
        isCurrentMonth: false,
        year: nextYear,
        month: nextMonth,
        date: DateUtil.formatDate(nextYear, nextMonth, day),
      });
    }

    return days;
  };

  // 处理日期点击
  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    setShowEditModal(true);
    onDateClick?.(date);
  };

  // 处理编辑模态框关闭
  const handleEditModalClose = () => {
    setShowEditModal(false);
    setSelectedDate(null);
    // 重新加载事件数据
    setEvents(StorageUtil.getEvents());
  };

  // 切换到上个月
  const goToPreviousMonth = () => {
    const { year, month } = DateUtil.getPreviousMonth(currentYear, currentMonth);
    setCurrentYear(year);
    setCurrentMonth(month);
  };

  // 切换到下个月
  const goToNextMonth = () => {
    const { year, month } = DateUtil.getNextMonth(currentYear, currentMonth);
    setCurrentYear(year);
    setCurrentMonth(month);
  };

  // 获取事件类型颜色
  const getEventTypeColor = (eventType: EventType) => {
    const tags = StorageUtil.getTags();
    return tags.type[eventType];
  };

  const calendarDays = getCalendarDays();
  const weekDays = ['一', '二', '三', '四', '五', '六', '日'];

  return (
    <>
      <div className="bg-white rounded-lg crayon-border p-6 mb-6">
        {/* 月份导航 */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={goToPreviousMonth}
            className="p-2 rounded-lg border-2 border-black hover:bg-black hover:text-white transition-colors"
            aria-label="上个月"
          >
            ←
          </button>

          <h2 className="text-2xl font-bold">
            {DateUtil.formatMonth(currentYear, currentMonth)}
          </h2>

          <button
            onClick={goToNextMonth}
            className="p-2 rounded-lg border-2 border-black hover:bg-black hover:text-white transition-colors"
            aria-label="下个月"
          >
            →
          </button>
        </div>

        {/* 星期标题 */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center font-bold p-2 text-sm"
            >
              {day}
            </div>
          ))}
        </div>

        {/* 日期网格 */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((dayInfo, index) => {
            const event = events[dayInfo.date];
            const isToday = DateUtil.isToday(dayInfo.year, dayInfo.month, dayInfo.day);

            return (
              <div
                key={index}
                onClick={() => handleDateClick(dayInfo.date)}
                className={`min-h-[80px] p-2 border-2 rounded-lg cursor-pointer transition-all relative crayon-texture ${
                  dayInfo.isCurrentMonth
                    ? 'border-gray-300 hover:border-black hover:bg-gray-50'
                    : 'border-gray-100 text-gray-400 bg-gray-50'
                } ${isToday ? 'ring-2 ring-black' : ''}`}
              >
                {/* 日期数字 */}
                <div className="text-sm font-medium mb-1">
                  {dayInfo.day}
                </div>

                {/* 事件类型点 */}
                {event?.type?.map((eventType) => (
                  <div
                    key={eventType}
                    className="absolute top-1 right-1 w-2 h-2 rounded-full"
                    style={{ backgroundColor: getEventTypeColor(eventType) }}
                    title={eventType}
                  />
                ))}

                {/* 事件名称 */}
                {event?.name && (
                  <div className="text-xs truncate mt-1" style={{ color: event.color }}>
                    {event.name}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 编辑模态框 */}
      {showEditModal && selectedDate && (
        <EditModal
          date={selectedDate}
          onClose={handleEditModalClose}
        />
      )}
    </>
  );
}