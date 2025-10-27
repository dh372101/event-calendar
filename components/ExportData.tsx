'use client';

import { useState, useEffect } from 'react';
import { DateUtil } from '@/utils/date';
import { StorageUtil } from '@/utils/storage';
import { Event, ExportFormat, MonthRange } from '@/types';
import Papa from 'papaparse';

export default function ExportData() {
  const [events, setEvents] = useState<Record<string, Event>>({});
  const [startMonth, setStartMonth] = useState('2024-01');
  const [endMonth, setEndMonth] = useState(DateUtil.getCurrentMonthString());
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  // 加载事件数据
  useEffect(() => {
    const loadedEvents = StorageUtil.getEvents();
    setEvents(loadedEvents);
  }, []);

  // 生成月份选项
  const generateMonthOptions = () => {
    const options = [];
    const currentYear = new Date().getFullYear();

    for (let year = 2023; year <= 2099; year++) {
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

  // 过滤事件
  const filterEvents = () => {
    const monthsInRange = DateUtil.getMonthsInRange(startMonth, endMonth);
    const filtered: Event[] = [];

    monthsInRange.forEach(month => {
      Object.entries(events).forEach(([date, event]) => {
        if (date.startsWith(month) && event.name) {
          filtered.push(event);
        }
      });
    });

    filtered.sort((a, b) => a.date.localeCompare(b.date));
    setFilteredEvents(filtered);
  };

  // 监听月份变化
  useEffect(() => {
    filterEvents();
  }, [startMonth, endMonth, events]);

  // 导出为CSV
  const exportCSV = async () => {
    if (filteredEvents.length === 0) {
      alert('选定时间范围内没有事件数据');
      return;
    }

    setIsExporting(true);
    try {
      const csvData = filteredEvents.map(event => ({
        '日期': event.date,
        '类型': event.type.join('、'),
        '名称': event.name,
        '地点': event.place,
        '城市': event.city,
        '颜色': event.color,
      }));

      const csv = Papa.unparse(csvData);
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `演出日历_${startMonth}_${endMonth}.csv`);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('导出CSV失败:', error);
      alert('导出CSV失败，请重试');
    } finally {
      setIsExporting(false);
    }
  };

  // 导出为JSON
  const exportJSON = async () => {
    if (filteredEvents.length === 0) {
      alert('选定时间范围内没有事件数据');
      return;
    }

    setIsExporting(true);
    try {
      const exportData = {
        events: filteredEvents,
        dateRange: {
          startMonth,
          endMonth,
        },
        exportDate: new Date().toISOString(),
        version: '1.0.0',
      };

      const json = JSON.stringify(exportData, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `演出日历_${startMonth}_${endMonth}.json`);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('导出JSON失败:', error);
      alert('导出JSON失败，请重试');
    } finally {
      setIsExporting(false);
    }
  };

  // 导入数据
  const importData = async (file: File, format: ExportFormat) => {
    setIsExporting(true);
    try {
      const text = await file.text();

      if (format === 'json') {
        const data = JSON.parse(text);
        if (data.events && Array.isArray(data.events)) {
          const eventsToImport: Record<string, Event> = {};
          data.events.forEach((event: Event) => {
            eventsToImport[event.date] = event;
          });

          StorageUtil.saveEvents({ ...StorageUtil.getEvents(), ...eventsToImport });
          setEvents(StorageUtil.getEvents());
          alert(`成功导入 ${data.events.length} 条事件数据`);
        }
      } else if (format === 'csv') {
        const result = Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
        });

        if (result.data && Array.isArray(result.data)) {
          const eventsToImport: Record<string, Event> = {};
          let importCount = 0;

          result.data.forEach((row: any) => {
            if (row['日期'] && row['名称']) {
              const event: Event = {
                date: row['日期'],
                type: row['类型'] ? row['类型'].split('、').filter(Boolean) as any[] : [],
                name: row['名称'],
                place: row['地点'] || '',
                city: row['城市'] || '',
                color: row['颜色'] || '#FF6B6B',
              };

              eventsToImport[event.date] = event;
              importCount++;
            }
          });

          StorageUtil.saveEvents({ ...StorageUtil.getEvents(), ...eventsToImport });
          setEvents(StorageUtil.getEvents());
          alert(`成功导入 ${importCount} 条事件数据`);
        }
      }
    } catch (error) {
      console.error('导入数据失败:', error);
      alert('导入数据失败，请检查文件格式');
    } finally {
      setIsExporting(false);
    }
  };

  // 处理文件选择
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, format: ExportFormat) => {
    const file = event.target.files?.[0];
    if (file) {
      importData(file, format);
    }
    // 清空文件输入
    event.target.value = '';
  };

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">导出数据</h1>
        <p className="text-gray-600">
          导出或导入演出事件数据，支持CSV和JSON格式
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
          onClick={filterEvents}
          className="btn"
        >
          查询事件
        </button>
      </div>

      {/* 事件列表 */}
      <div className="bg-white rounded-lg crayon-border p-6">
        <h2 className="text-xl font-bold mb-4">
          事件列表 ({filteredEvents.length} 个)
        </h2>

        {filteredEvents.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            选定时间范围内没有事件数据
          </p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredEvents.map((event, index) => (
              <div
                key={`${event.date}-${index}`}
                className="p-3 border-2 border-gray-200 rounded-lg hover:border-gray-300"
                style={{ borderLeftColor: event.color, borderLeftWidth: '4px' }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium">{event.name}</div>
                    <div className="text-sm text-gray-600">
                      {event.date} | {event.type.join('、')}
                    </div>
                    {event.place && (
                      <div className="text-sm text-gray-600">📍 {event.place}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 导出功能 */}
      <div className="bg-white rounded-lg crayon-border p-6">
        <h2 className="text-xl font-bold mb-4">导出数据</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={exportCSV}
            disabled={filteredEvents.length === 0 || isExporting}
            className="btn disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? '导出中...' : '下载 CSV'}
          </button>

          <button
            onClick={exportJSON}
            disabled={filteredEvents.length === 0 || isExporting}
            className="btn disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? '导出中...' : '下载 JSON'}
          </button>
        </div>
      </div>

      {/* 导入功能 */}
      <div className="bg-white rounded-lg crayon-border p-6">
        <h2 className="text-xl font-bold mb-4">导入数据</h2>
        <p className="text-sm text-gray-600 mb-4">
          支持从CSV或JSON文件导入事件数据，导入的数据会与现有数据合并
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="btn text-center cursor-pointer">
              从 CSV 导入
              <input
                type="file"
                accept=".csv"
                onChange={(e) => handleFileChange(e, 'csv')}
                className="hidden"
                disabled={isExporting}
              />
            </label>
          </div>

          <div>
            <label className="btn text-center cursor-pointer">
              从 JSON 导入
              <input
                type="file"
                accept=".json"
                onChange={(e) => handleFileChange(e, 'json')}
                className="hidden"
                disabled={isExporting}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}