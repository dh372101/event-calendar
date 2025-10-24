'use client'

import { useState, useEffect } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, eachDayOfInterval as eachDayOfIntervalOriginal, addWeeks, subWeeks, addDays, subDays } from 'date-fns'
import { ChevronLeft, ChevronRight, Calendar, Clock, Grid3X3 } from 'lucide-react'
import EditModal from './EditModal'
import { EventData } from '@/types'
import { getStorageData } from '@/utils/storage'

type ViewMode = 'month' | 'week' | 'day'

export default function EnhancedCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<Record<string, EventData>>({})
  const [tags, setTags] = useState<any>({})
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('month')

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

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setShowEditModal(true)
  }

  const handlePrev = () => {
    switch (viewMode) {
      case 'month':
        setCurrentDate(subMonths(currentDate, 1))
        break
      case 'week':
        setCurrentDate(subWeeks(currentDate, 1))
        break
      case 'day':
        setCurrentDate(subDays(currentDate, 1))
        break
    }
  }

  const handleNext = () => {
    switch (viewMode) {
      case 'month':
        setCurrentDate(addMonths(currentDate, 1))
        break
      case 'week':
        setCurrentDate(addWeeks(currentDate, 1))
        break
      case 'day':
        setCurrentDate(addDays(currentDate, 1))
        break
    }
  }

  const getEventForDate = (date: Date): EventData | null => {
    const dateString = format(date, 'yyyy-MM-dd')
    return events[dateString] || null
  }

  const getEventsForDateRange = (start: Date, end: Date): EventData[] => {
    return Object.values(events).filter(event => {
      const eventDate = new Date(event.date)
      return eventDate >= start && eventDate <= end
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  const getEventsForView = (): EventData[] => {
    switch (viewMode) {
      case 'month':
        const monthStart = startOfMonth(currentDate)
        const monthEnd = endOfMonth(currentDate)
        return getEventsForDateRange(monthStart, monthEnd)
      case 'week':
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
        return getEventsForDateRange(weekStart, weekEnd)
      case 'day':
        return getEventsForDateRange(currentDate, currentDate)
      default:
        return []
    }
  }

  // Month view rendering
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

    const startDay = monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1
    const endDay = monthEnd.getDay() === 0 ? 6 : monthEnd.getDay() - 1

    const previousMonthDays = Array.from({ length: startDay }, (_, i) => {
      const date = new Date(monthStart)
      date.setDate(date.getDate() - startDay + i)
      return date
    })

    const nextMonthDays = Array.from({ length: 6 - endDay }, (_, i) => {
      const date = new Date(monthEnd)
      date.setDate(date.getDate() + i + 1)
      return date
    })

    const allDays = [...previousMonthDays, ...daysInMonth, ...nextMonthDays]

    return (
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
    )
  }

  // Week view rendering
  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

    return (
      <div className="crayon-border">
        {/* 星期头部 */}
        <div className="grid grid-cols-7 bg-gray-100">
          {weekDays.map(date => (
            <div key={date.toISOString()} className="calendar-day-header">
              <div>{format(date, 'EEE')}</div>
              <div className={`text-xs ${isSameDay(date, new Date()) ? 'text-blue-600 font-bold' : ''}`}>
                {format(date, 'd')}
              </div>
            </div>
          ))}
        </div>

        {/* 日期网格 */}
        <div className="calendar-grid">
          {weekDays.map(date => {
            const event = getEventForDate(date)
            const isToday = isSameDay(date, new Date())
            
            return (
              <div
                key={date.toISOString()}
                onClick={() => handleDateClick(date)}
                className={`calendar-day cursor-pointer transition-colors min-h-[120px] ${
                  isToday ? 'bg-blue-50' : ''
                }`}
              >
                {/* 类型小点 */}
                {event && event.type.length > 0 && (
                  <div className="flex space-x-1 mb-2">
                    {event.type.map((type, i) => (
                      <div
                        key={i}
                        className="w-2 h-2 rounded-full"
                        style={{ 
                          backgroundColor: tags.type?.[type] || '#ccc'
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* 事件名称 */}
                {event && (
                  <div className="space-y-1">
                    <div 
                      className="text-xs font-medium"
                      style={{ color: event.color }}
                    >
                      {event.name}
                    </div>
                    {event.place && (
                      <div className="text-xs text-gray-600">{event.place}</div>
                    )}
                    {event.city && (
                      <div className="text-xs text-gray-500">{event.city}</div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Day view rendering
  const renderDayView = () => {
    const event = getEventForDate(currentDate)
    const isToday = isSameDay(currentDate, new Date())

    return (
      <div className="space-y-4">
        <div className={`crayon-border p-6 ${isToday ? 'bg-blue-50' : ''}`}>
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">
              {format(currentDate, 'd')}
            </div>
            <div className="text-lg text-gray-600">
              {format(currentDate, 'yyyy年MM月 EEEE')}
            </div>
            {isToday && (
              <div className="inline-block mt-2 px-3 py-1 bg-blue-500 text-white rounded-full text-sm">
                今天
              </div>
            )}
          </div>
        </div>

        <div className="crayon-border p-6">
          <h3 className="text-lg font-semibold mb-4">
            当日事件
          </h3>
          
          {event ? (
            <div className="space-y-4">
              {/* 类型标签 */}
              {event.type.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {event.type.map((type, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full text-sm border-2"
                      style={{
                        backgroundColor: tags.type?.[type],
                        borderColor: tags.type?.[type],
                        color: 'white'
                      }}
                    >
                      {type}
                    </span>
                  ))}
                </div>
              )}

              {/* 事件信息 */}
              <div 
                className="p-4 rounded-lg border-2"
                style={{ borderColor: event.color }}
              >
                <h4 
                  className="text-xl font-bold mb-2"
                  style={{ color: event.color }}
                >
                  {event.name}
                </h4>
                
                {event.place && (
                  <div className="mb-2">
                    <strong>地点:</strong> {event.place}
                  </div>
                )}
                
                {event.city && (
                  <div className="mb-2">
                    <strong>城市:</strong> {event.city}
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleDateClick(currentDate)}
                  className="crayon-button"
                >
                  编辑事件
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="mb-4">当日没有事件</div>
              <button
                onClick={() => handleDateClick(currentDate)}
                className="crayon-button"
              >
                添加事件
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  const currentEvents = getEventsForView()

  return (
    <div className="space-y-6">
      {/* 日历头部 */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">演出日历</h2>
        
        <div className="flex items-center space-x-4">
          {/* 视图模式切换 */}
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('month')}
              className={`crayon-button flex items-center space-x-1 ${
                viewMode === 'month' ? 'bg-black text-white' : ''
              }`}
            >
              <Grid3X3 size={16} />
              <span className="hidden sm:inline">月</span>
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`crayon-button flex items-center space-x-1 ${
                viewMode === 'week' ? 'bg-black text-white' : ''
              }`}
            >
              <Calendar size={16} />
              <span className="hidden sm:inline">周</span>
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`crayon-button flex items-center space-x-1 ${
                viewMode === 'day' ? 'bg-black text-white' : ''
              }`}
            >
              <Clock size={16} />
              <span className="hidden sm:inline">日</span>
            </button>
          </div>

          {/* 日期导航 */}
          <div className="flex items-center space-x-2">
            <button onClick={handlePrev} className="crayon-button">
              <ChevronLeft size={20} />
            </button>
            <span className="text-xl font-semibold min-w-[120px] text-center">
              {viewMode === 'month' && format(currentDate, 'yyyy年MM月')}
              {viewMode === 'week' && `${format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'MM/dd')} - ${format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'MM/dd')}`}
              {viewMode === 'day' && format(currentDate, 'yyyy年MM月dd日')}
            </span>
            <button onClick={handleNext} className="crayon-button">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* 日历视图 */}
      {viewMode === 'month' && renderMonthView()}
      {viewMode === 'week' && renderWeekView()}
      {viewMode === 'day' && renderDayView()}

      {/* 事件详情汇总 - 仅在月视图和周视图中显示 */}
      {(viewMode === 'month' || viewMode === 'week') && currentEvents.length > 0 && (
        <div className="crayon-border p-4">
          <h3 className="text-lg font-semibold mb-3">
            {viewMode === 'month' ? '本月事件' : '本周事件'}
          </h3>
          <div className="space-y-2">
            {currentEvents.map(event => (
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
