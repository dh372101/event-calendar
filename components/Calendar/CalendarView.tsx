'use client'

import { useState, useEffect } from 'react'
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday,
  addMonths,
  subMonths 
} from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { EventData } from '@/types/event'

interface CalendarViewProps {
  currentDate: Date
  onDateChange: (date: Date) => void
  events: Record<string, EventData>
  onDateClick: (date: Date) => void
}

export default function CalendarView({ currentDate, onDateChange, events, onDateClick }: CalendarViewProps) {
  const [tags, setTags] = useState<Record<string, string>>({})

  // 从localStorage加载标签数据
  useEffect(() => {
    const savedTags = localStorage.getItem('tags')
    if (savedTags) {
      try {
        const tagsData = JSON.parse(savedTags)
        setTags(tagsData.type || {})
      } catch (error) {
        console.error('Failed to load tags:', error)
      }
    }
  }, [])

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }) // 从周一开始
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  })

  const weekDays = ['一', '二', '三', '四', '五', '六', '日']

  const handlePreviousMonth = () => {
    onDateChange(subMonths(currentDate, 1))
  }

  const handleNextMonth = () => {
    onDateChange(addMonths(currentDate, 1))
  }

  const getEventForDate = (date: Date): EventData | undefined => {
    const dateKey = format(date, 'yyyy-MM-dd')
    return events[dateKey]
  }

  const getTypeColor = (type: string): string => {
    return tags[type] || '#666666'
  }

  return (
    <div className="crayon-border p-4 bg-white">
      {/* 日历头部 - 月份导航 */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePreviousMonth}
          className="crayon-border-thin p-2 hover:bg-gray-50"
        >
          <ChevronLeft size={20} />
        </button>
        
        <h2 className="text-xl font-bold">
          {format(currentDate, 'yyyy年MM月', { locale: zhCN })}
        </h2>
        
        <button
          onClick={handleNextMonth}
          className="crayon-border-thin p-2 hover:bg-gray-50"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* 星期标题 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center font-bold py-2 crayon-border-thin">
            {day}
          </div>
        ))}
      </div>

      {/* 日历网格 */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day) => {
          const event = getEventForDate(day)
          const isCurrentMonth = isSameMonth(day, currentDate)
          const isTodayDate = isToday(day)
          
          return (
            <div
              key={day.toISOString()}
              onClick={() => onDateClick(day)}
              className={`calendar-date ${isTodayDate ? 'calendar-date-today' : ''} ${
                !isCurrentMonth ? 'opacity-30' : ''
              }`}
            >
              {/* 日期数字和类型圆点 */}
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-medium ${isTodayDate ? 'font-bold' : ''}`}>
                  {format(day, 'd')}
                </span>
                
                {/* 类型圆点 */}
                {event && event.type && (
                  <div className="flex space-x-1">
                    {event.type.slice(0, 3).map((type, index) => (
                      <div
                        key={index}
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getTypeColor(type) }}
                        title={type}
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
                  className="text-xs truncate px-1 py-0.5 rounded crayon-border-thin"
                  style={{ 
                    backgroundColor: event.color + '20',
                    borderColor: event.color,
                    color: event.color 
                  }}
                >
                  {event.name}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}