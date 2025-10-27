'use client'

import { CalendarDay, getWeekDays } from '@/lib/calendar'
import { storage } from '@/lib/storage'
import { Event } from '@/types'

interface CalendarGridProps {
  days: CalendarDay[]
  year: number
  month: number
  onDateClick: (date: string) => void
}

export default function CalendarGrid({ days, year, month, onDateClick }: CalendarGridProps) {
  const weekDays = getWeekDays()
  const tags = storage.getTags()

  const handleDateClick = (day: CalendarDay) => {
    if (!day.isCurrentMonth) return

    const dateStr = `${day.year}-${String(day.month + 1).padStart(2, '0')}-${String(day.date).padStart(2, '0')}`
    onDateClick(dateStr)
  }

  const getTypeColors = (types: string[]): string[] => {
    return types.map(type => tags.types[type] || '#000000')
  }

  const renderEventDots = (events: Event[]) => {
    const allTypes = events.flatMap(event => event.types)
    const uniqueTypes = Array.from(new Set(allTypes))

    return uniqueTypes.slice(0, 4).map((type, index) => (
      <div
        key={index}
        className="event-dot"
        style={{ backgroundColor: tags.types[type] || '#000000' }}
        title={type}
      />
    ))
  }

  const renderEventName = (events: Event[]) => {
    if (events.length === 0) return null

    const firstEvent = events[0]
    return (
      <div
        className="event-name"
        style={{ color: firstEvent.color || '#000000' }}
      >
        {firstEvent.name}
      </div>
    )
  }

  return (
    <div className="calendar-grid crayon-border">
      {/* 星期标题 */}
      {weekDays.map(day => (
        <div
          key={day}
          className="text-center text-sm font-bold py-2 border-b border-black"
        >
          {day}
        </div>
      ))}

      {/* 日期格子 */}
      {days.map((day, index) => {
        const isCurrentMonth = day.month === month && day.year === year

        return (
          <div
            key={index}
            className={`calendar-cell ${!isCurrentMonth ? 'opacity-40' : ''}`}
            onClick={() => handleDateClick(day)}
          >
            {/* 事件点 */}
            {day.events.length > 0 && (
              <div className="event-dots">
                {renderEventDots(day.events)}
              </div>
            )}

            {/* 日期数字 */}
            <div className="day-number">{day.date}</div>

            {/* 事件名称 */}
            {renderEventName(day.events)}
          </div>
        )
      })}
    </div>
  )
}