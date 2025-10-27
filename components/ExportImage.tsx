'use client';

import { useState, useRef, useEffect } from 'react';
import { DateUtil } from '@/utils/date';
import { StorageUtil } from '@/utils/storage';
import { Event } from '@/types';
import html2canvas from 'html2canvas';

export default function ExportImage() {
  const [startMonth, setStartMonth] = useState('2024-01');
  const [endMonth, setEndMonth] = useState(DateUtil.getCurrentMonthString());
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  // 生成月份选项
  const generateMonthOptions = () => {
    const options = [];
    const currentYear = new Date().getFullYear();

    for (let year = 2023; year <= currentYear; year++) {
      for (let month = 1; month <= 12; month++) {
        const value = `${year}-${String(month).padStart(2, '0')}`;
        const label = `${year}年${month}月`;

        // 限制结束月份不超过当前月份
        if (year > currentYear || (year === currentYear && month > new Date().getMonth() + 1)) {
          break;
        }

        options.push({ value, label });
      }
    }

    return options;
  };

  const monthOptions = generateMonthOptions();

  // 渲染月历组件
  const renderMonthCalendar = (year: number, month: number) => {
    const events = StorageUtil.getEvents();
    const firstDay = DateUtil.getFirstDayOfMonth(year, month);
    const daysInMonth = DateUtil.getDaysInMonth(year, month);
    const weekDays = ['一', '二', '三', '四', '五', '六', '日'];

    const days = [];
    const prevMonthStart = firstDay === 0 ? 6 : firstDay - 1;

    // 上月日期
    const { year: prevYear, month: prevMonth } = DateUtil.getPreviousMonth(year, month);
    const daysInPrevMonth = DateUtil.getDaysInMonth(prevYear, prevMonth);
    for (let i = prevMonthStart; i > 0; i--) {
      days.push({
        day: daysInPrevMonth - i + 1,
        isCurrentMonth: false,
        date: DateUtil.formatDate(prevYear, prevMonth, daysInPrevMonth - i + 1),
      });
    }

    // 当月日期
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        isCurrentMonth: true,
        date: DateUtil.formatDate(year, month, day),
      });
    }

    // 下月日期
    const { year: nextYear, month: nextMonth } = DateUtil.getNextMonth(year, month);
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        date: DateUtil.formatDate(nextYear, nextMonth, day),
      });
    }

    const tags = StorageUtil.getTags();

    return (
      <div key={`${year}-${month}`} className="bg-white rounded-lg crayon-border p-4 mb-4">
        <h3 className="text-center font-bold mb-3">
          {DateUtil.formatMonth(year, month)}
        </h3>

        {/* 星期标题 */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-xs font-bold p-1">
              {day}
            </div>
          ))}
        </div>

        {/* 日期网格 */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((dayInfo, index) => {
            const event = events[dayInfo.date];
            const isToday = DateUtil.isToday(
              dayInfo.date.includes('-')
                ? parseInt(dayInfo.date.split('-')[0])
                : year,
              dayInfo.date.includes('-')
                ? parseInt(dayInfo.date.split('-')[1]) - 1
                : month,
              dayInfo.day
            );

            return (
              <div
                key={index}
                className={`min-h-[40px] p-1 border-2 rounded text-xs relative ${
                  dayInfo.isCurrentMonth
                    ? 'border-gray-300'
                    : 'border-gray-100 text-gray-400 bg-gray-50'
                } ${isToday ? 'ring-1 ring-black' : ''}`}
              >
                <div className="text-xs font-medium">
                  {dayInfo.day}
                </div>

                {/* 事件类型点 */}
                {event?.type?.map((eventType) => (
                  <div
                    key={eventType}
                    className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: tags.type[eventType] }}
                  />
                ))}

                {/* 事件名称 */}
                {event?.name && (
                  <div
                    className="text-xs truncate mt-0.5"
                    style={{ color: event.color }}
                  >
                    {event.name}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // 生成预览
  const generatePreview = async () => {
    setIsGenerating(true);
    setPreviewImage(null);

    // 等待组件渲染完成
    setTimeout(async () => {
      if (calendarRef.current) {
        try {
          const canvas = await html2canvas(calendarRef.current, {
            backgroundColor: '#ffffff',
            scale: 2, // 高清导出
            logging: false,
            useCORS: true,
          });

          const image = canvas.toDataURL('image/png');
          setPreviewImage(image);
        } catch (error) {
          console.error('生成预览失败:', error);
          alert('生成预览失败，请重试');
        }
      }
      setIsGenerating(false);
    }, 100);
  };

  // 下载图片
  const downloadImage = () => {
    if (!previewImage) return;

    const link = document.createElement('a');
    link.href = previewImage;
    link.download = `演出日历_${startMonth}_${endMonth}.png`;
    link.click();
  };

  const monthsInRange = DateUtil.getMonthsInRange(startMonth, endMonth);

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">导出图片</h1>
        <p className="text-gray-600">
          将指定时间范围的演出日历导出为图片
        </p>
      </div>

      {/* 时间范围选择 */}
      <div className="bg-white rounded-lg crayon-border p-6">
        <h2 className="text-xl font-bold mb-4">选择时间范围</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">开始月份</label>
            <select
              value={startMonth}
              onChange={(e) => setStartMonth(e.target.value)}
              className="input"
            >
              {monthOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">结束月份</label>
            <select
              value={endMonth}
              onChange={(e) => setEndMonth(e.target.value)}
              className="input"
            >
              {monthOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={generatePreview}
          disabled={isGenerating}
          className="btn disabled:opacity-50"
        >
          {isGenerating ? '生成中...' : '预览'}
        </button>
      </div>

      {/* 预览区域 */}
      {previewImage && (
        <div className="bg-white rounded-lg crayon-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">预览图片</h2>
            <button
              onClick={downloadImage}
              className="btn"
            >
              下载图片
            </button>
          </div>

          <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
            <img
              src={previewImage}
              alt="日历预览"
              className="w-full"
            />
          </div>
        </div>
      )}

      {/* 隐藏的日历渲染区域 */}
      <div
        ref={calendarRef}
        className="fixed -top-[9999px] -left-[9999px] w-[800px] bg-white p-6"
        style={{ fontFamily: 'var(--font-family)' }}
      >
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold mb-2">演出日历</h1>
          <p className="text-sm text-gray-600">
            {startMonth} 至 {endMonth}
          </p>
        </div>

        <div className="space-y-4">
          {monthsInRange.map(monthStr => {
            const [year, month] = monthStr.split('-').map(Number);
            return renderMonthCalendar(year, month - 1);
          })}
        </div>
      </div>
    </div>
  );
}