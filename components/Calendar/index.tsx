'use client'

import { useState, useEffect } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import CalendarView from './CalendarView'
import EventDetail from './EventDetail'
import EditModal from './EditModal'
import { EventData } from '@/types/event'

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<Record<string, EventData>>({})
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // 从localStorage加载事件数据
  useEffect(() => {
    const savedEvents = localStorage.getItem('events')
    if (savedEvents) {
      try {
        setEvents(JSON.parse(savedEvents))
      } catch (error) {
        console.error('Failed to load events:', error)
      }
    }
  }, [])

  // 保存事件数据到localStorage
  useEffect(() => {
    localStorage.setItem('events', JSON.stringify(events))
  }, [events])

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setIsEditModalOpen(true)
  }

  const handleSaveEvent = (eventData: EventData) => {
    if (selectedDate) {
      const dateKey = format(selectedDate, 'yyyy-MM-dd')
      setEvents(prev => ({
        ...prev,
        [dateKey]: eventData
      }))
    }
    setIsEditModalOpen(false)
  }

  const handleDeleteEvent = () => {
    if (selectedDate) {
      const dateKey = format(selectedDate, 'yyyy-MM-dd')
      setEvents(prev => {
        const newEvents = { ...prev }
        delete newEvents[dateKey]
        return newEvents
      })
    }
    setIsEditModalOpen(false)
  }

  const getEventsForMonth = () => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
    
    return days
      .map(day => {
        const dateKey = format(day, 'yyyy-MM-dd')
        return {
          date: day,
          event: events[dateKey]
        }
      })
      .filter(day => day.event)
  }

  const monthEvents = getEventsForMonth()

  return (
    <div className="h-full flex flex-col">
      {/* 日历视图 */}
      <div className="flex-1">
        <CalendarView
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          events={events}
          onDateClick={handleDateClick}
        />
      </div>
      
      {/* 事件详情汇总 */}
      <div className="mt-4">
        <EventDetail events={monthEvents} />
      </div>

      {/* 编辑弹窗 */}
      {isEditModalOpen && selectedDate && (
        <EditModal
          date={selectedDate}
          event={events[format(selectedDate, 'yyyy-MM-dd')]}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
    </div>
  )
}