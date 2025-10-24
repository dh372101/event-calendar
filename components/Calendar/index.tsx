'use client'

import { useState, useEffect } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import EditModal from './EditModal'
import { EventData } from '@/types'
import { getStorageData } from '@/utils/storage'

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<Record<string, EventData>>({})
  const [tags, setTags] = useState<any>({})
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  // 加载数据
  useEffect(() => {
    const { events: storedEvents, tags: storedTags } = getStorageData()
    setEvents(storedEvents)
    setTags(storedTags)
  }, [])

  // 监听localStorage变化
  useEffect(() => {
    const handleStorageChange = () => {
      const { events: storedEvents, tags: storedTags } = getStorageData()
      setEvents(storedEvents)
      setTags(storedTags)
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // 获取星期几的偏移量（周一为第一天）
  const startDay = monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1
  const endDay = monthEnd.getDay() === 0 ? 6 : monthEnd.getDay() - 1

  // 添加上个月的天数
  const previousMonthDays = Array.from({ length: startDay }, (_, i) => {
    const date = new Date(monthStart)
    date.setDate(date.getDate() - startDay + i)
    return date
  })

  // 添加下个月的天数
  const nextMonthDays = Array.from({ length: 6 - endDay }, (_, i) => {
    const date = new Date(monthEnd)
    date.setDate(date.getDate() + i + 1)
    return date
  })

  const allDays = [...previousMonthDays, ...daysInMonth, ...nextMonthDays]

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setShowEditModal(true)
  }

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  const getEventForDate = (date: Date): EventData | null => {
    const dateString = format(date, 'yyyy-MM-dd')
    return events[dateString] || null
  }

  const getEventsForMonth = (): EventData[] => {
    return Object.values(events).filter(event => {
      const eventDate = new Date(event.date)
      return isSameMonth(eventDate, currentDate)
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  const monthEvents = getEventsForMonth()

  return (
    <div className="space-y-6">
      {/* 日历头部 */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">演出日历</h2>
        <div className="flex items-center space-x-4">
          <button onClick={handlePrevMonth} className="crayon-button">
            <ChevronLeft size={20} />
          </button>
          <span className="text-xl font-semibold">
            {format(currentDate, 'yyyy年MM月')}
          </span>
          <button onClick={handleNextMonth} className="crayon-button">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* 日历网格 */}
      <div className="crayon-border">
        {/* 星期头部 */}
        <div className="grid grid-cols-7 bg-gray-100">
          {['一', '二', '三', '四', '五', '六', '日'].map(day => (
            <div key={day} className="calendar-day-header">
              {day}
            </div>
          ))}
        </div>

        {/* 日期网格 */}
        <div className="calendar-grid">
          {allDays.map((date, index) => {
            const event = getEventForDate(date)
            const isCurrentMonth = isSameMonth(date, currentDate)
            const isToday = isSameDay(date, new Date())
            
            return (
              <div
                key={index}
                onClick={() => handleDateClick(date)}
                className={`calendar-day cursor-pointer transition-colors ${
                  !isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
                } ${isToday ? 'bg-blue-50' : ''}`}
              >
                {/* 日期数字 */}
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-medium ${
                    isToday ? 'text-blue-600' : ''
                  }`}>
                    {format(date, 'd')}
                  </span>
                  
                  {/* 类型小点 */}
                  {event && event.type.length > 0 && (
                    <div className="flex space-x-1">
                      {event.type.slice(0, 3).map((type, i) => (
                        <div
                          key={i}
                          className="w-2 h-2 rounded-full"
                          style={{ 
                            backgroundColor: tags.type?.[type] || '#ccc'
                          }}
                        />
                      ))}
                      {event.type.length > 3 && (
                        <div className="text-xs text-gray-500">+{event.type.length - 3}</div>
                      )}
                    </div>
                  )}
                </div>

                {/* 事件名称 */}
                {event && (
                  <div 
                    className="text-xs font-medium truncate"
                    style={{ color: event.color }}
                  >
                    {event.name}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 事件详情汇总 */}
      {monthEvents.length > 0 && (
        <div className="crayon-border p-4">
          <h3 className="text-lg font-semibold mb-3">本月事件</h3>
          <div className="space-y-2">
            {monthEvents.map(event => (
              <div
                key={event.date}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
              >
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: event.color }}
                />
                <div className="flex-1">
                  <div className="text-sm font-medium">
                    {format(new Date(event.date), 'MM/dd')} {event.type.join('、')}
                  </div>
                  <div className="text-sm">{event.name}</div>
                  <div className="text-xs text-gray-600">
                    {event.place} · {event.city}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 编辑弹窗 */}
      {showEditModal && selectedDate && (
        <EditModal
          date={selectedDate}
          onClose={() => setShowEditModal(false)}
          onSave={() => {
            const { events: storedEvents } = getStorageData()
            setEvents(storedEvents)
            setShowEditModal(false)
          }}
        />
      )}
    </div>
  )
}