'use client'

import { useState, useEffect } from 'react'
import CalendarGrid from './CalendarGrid'
import EventDetails from './EventDetails'
import { generateCalendarDays, formatMonthYear, getCurrentMonth } from '@/lib/calendar'
import { storage } from '@/lib/storage'
import EditModal from './EditModal'

interface CalendarPageProps {}

export default function CalendarPage({}: CalendarPageProps) {
  const [currentDate, setCurrentDate] = useState(getCurrentMonth())
  const [calendarDays, setCalendarDays] = useState([])
  const [allEvents, setAllEvents] = useState([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)

  // 加载事件数据
  const loadEvents = () => {
    const events = storage.getEvents()
    setAllEvents(events)
  }

  // 生成日历数据
  const generateCalendar = () => {
    const days = generateCalendarDays(currentDate.year, currentDate.month, allEvents)
    setCalendarDays(days)
  }

  useEffect(() => {
    loadEvents()
  }, [])

  useEffect(() => {
    generateCalendar()
  }, [currentDate, allEvents])

  const handlePrevMonth = () => {
    setCurrentDate(prev => {
      if (prev.month === 0) {
        return { year: prev.year - 1, month: 11 }
      }
      return { year: prev.year, month: prev.month - 1 }
    })
  }

  const handleNextMonth = () => {
    setCurrentDate(prev => {
      if (prev.month === 11) {
        return { year: prev.year + 1, month: 0 }
      }
      return { year: prev.year, month: prev.month + 1 }
    })
  }

  const handleToday = () => {
    setCurrentDate(getCurrentMonth())
  }

  const handleDateClick = (date: string) => {
    setSelectedDate(date)
    setShowModal(true)
  }

  const handleModalClose = () => {
    setShowModal(false)
    setSelectedDate(null)
  }

  const handleEventSaved = () => {
    loadEvents()
    handleModalClose()
  }

  return (
    <div className="space-y-6">
      {/* 月份导航 */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevMonth}
          className="btn"
        >
          上一月
        </button>

        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">
            {formatMonthYear(currentDate.year, currentDate.month)}
          </h1>
          <button
            onClick={handleToday}
            className="btn btn-sm"
          >
            今天
          </button>
        </div>

        <button
          onClick={handleNextMonth}
          className="btn"
        >
          下一月
        </button>
      </div>

      {/* 日历网格 */}
      <CalendarGrid
        days={calendarDays}
        year={currentDate.year}
        month={currentDate.month}
        onDateClick={handleDateClick}
      />

      {/* 事件详情 */}
      <EventDetails
        year={currentDate.year}
        month={currentDate.month}
        events={allEvents}
      />

      {/* 编辑模态框 */}
      {showModal && selectedDate && (
        <EditModal
          date={selectedDate}
          onClose={handleModalClose}
          onSave={handleEventSaved}
        />
      )}
    </div>
  )
}