'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'
import { ChevronLeft, ChevronRight, Search, Filter, Menu } from 'lucide-react'
import EditModal from './EditModal'
import { EventData } from '@/types'
import { getStorageData, saveEvent, deleteEvent, searchEvents } from '@/utils/unified-storage'

// Touch gesture types
type TouchState = {
  startX: number
  startY: number
  startTime: number
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<Record<string, EventData>>({})
  const [tags, setTags] = useState<any>({})
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [filteredEvents, setFilteredEvents] = useState<EventData[]>([])
  const [isMobile, setIsMobile] = useState(false)
  
  // Touch gesture handling
  const touchState = useRef<TouchState | null>(null)
  const calendarRef = useRef<HTMLDivElement>(null)

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Load data with enhanced error handling
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      const { events: storedEvents, tags: storedTags } = await getStorageData()
      setEvents(storedEvents)
      setTags(storedTags)
    } catch (error) {
      console.error('Failed to load calendar data:', error)
      // Set default data on error
      setEvents({})
      setTags({})
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial data load
  useEffect(() => {
    loadData()
  }, [loadData])

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim()) {
      searchEvents(searchQuery).then(results => {
        setFilteredEvents(results)
      }).catch(error => {
        console.error('Search failed:', error)
        setFilteredEvents([])
      })
    } else {
      setFilteredEvents([])
    }
  }, [searchQuery])

  // Touch gesture handlers for mobile swipe navigation
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!isMobile) return
    
    const touch = e.touches[0]
    touchState.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now()
    }
  }, [isMobile])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!isMobile || !touchState.current) return
    
    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - touchState.current.startX
    const deltaY = touch.clientY - touchState.current.startY
    const deltaTime = Date.now() - touchState.current.startTime
    
    // Check if it's a horizontal swipe (more horizontal than vertical movement)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50 && deltaTime < 300) {
      if (deltaX > 0) {
        // Swipe right - previous month
        handlePrevMonth()
      } else {
        // Swipe left - next month
        handleNextMonth()
      }
    }
    
    touchState.current = null
  }, [isMobile])

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Calculate day offsets (Monday as first day)
  const startDay = monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1
  const endDay = monthEnd.getDay() === 0 ? 6 : monthEnd.getDay() - 1

  // Previous month days
  const previousMonthDays = Array.from({ length: startDay }, (_, i) => {
    const date = new Date(monthStart)
    date.setDate(date.getDate() - startDay + i)
    return date
  })

  // Next month days
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

  const handleToday = () => {
    setCurrentDate(new Date())
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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return // Ignore keyboard events when typing
      }

      switch (e.key) {
        case 'ArrowLeft':
          handlePrevMonth()
          break
        case 'ArrowRight':
          handleNextMonth()
          break
        case 't':
        case 'T':
          handleToday()
          break
        case 'f':
        case 'F':
          if (!showSearch) {
            e.preventDefault()
            setShowSearch(true)
            // Focus search input after render
            setTimeout(() => {
              const searchInput = document.getElementById('calendar-search')
              searchInput?.focus()
            }, 0)
          }
          break
        case 'Escape':
          if (showSearch) {
            setShowSearch(false)
            setSearchQuery('')
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showSearch])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="skeleton h-8 w-32 mx-auto mb-4 rounded"></div>
          <div className="skeleton h-64 w-full max-w-4xl rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="calendar-container" ref={calendarRef}>
      {/* Enhanced Calendar Header */}
      <header className="calendar-header">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-4">
            {isMobile && (
              <button className="text-white p-2" aria-label="Menu">
                <Menu size={20} />
              </button>
            )}
            <h1 className="calendar-title">
              {format(currentDate, 'yyyy年MM月')}
            </h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleToday}
              className="calendar-nav-button"
              title="今天 (T)"
            >
              今天
            </button>
            <button
              onClick={handlePrevMonth}
              className="calendar-nav-button"
              title="上个月 (←)"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={handleNextMonth}
              className="calendar-nav-button"
              title="下个月 (→)"
            >
              <ChevronRight size={18} />
            </button>
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="calendar-nav-button"
              title="搜索 (F)"
            >
              <Search size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      {showSearch && (
        <div className="p-4 bg-gray-50 border-b">
          <div className="relative">
            <input
              id="calendar-search"
              type="text"
              placeholder="搜索事件名称、地点、城市或类型..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="crayon-input pl-10"
              aria-label="搜索事件"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          </div>
          
          {/* Search Results */}
          {filteredEvents.length > 0 && (
            <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
              {filteredEvents.map(event => (
                <div
                  key={event.date}
                  className="crayon-border p-3 cursor-pointer hover:bg-gray-50"
                  onClick={() => {
                    setSelectedDate(new Date(event.date))
                    setShowEditModal(true)
                    setShowSearch(false)
                    setSearchQuery('')
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{event.name}</div>
                      <div className="text-sm text-gray-600">
                        {format(new Date(event.date), 'yyyy-MM-dd')} · {event.place} · {event.city}
                      </div>
                      <div className="flex gap-2 mt-1">
                        {event.type.map(type => (
                          <span
                            key={type}
                            className="px-2 py-1 text-xs rounded"
                            style={{ 
                              backgroundColor: tags.type?.[type] || '#ccc',
                              color: 'white'
                            }}
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: event.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Calendar Grid */}
      <div
        className="calendar-grid"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        role="grid"
        aria-label="日历"
      >
        {/* Weekday Headers */}
        {['一', '二', '三', '四', '五', '六', '日'].map((day, index) => (
          <div
            key={day}
            className="calendar-day-header"
            role="columnheader"
            aria-label={day === '日' || day === '六' ? `${day} (周末)` : day}
          >
            {day}
          </div>
        ))}

        {/* Calendar Days */}
        {allDays.map((date, index) => {
          const event = getEventForDate(date)
          const isCurrentMonth = isSameMonth(date, currentDate)
          const isToday = isSameDay(date, new Date())
          const dateString = format(date, 'yyyy-MM-dd')
          
          return (
            <div
              key={index}
              onClick={() => handleDateClick(date)}
              className={`calendar-day ${
                !isCurrentMonth ? 'other-month' : ''
              } ${isToday ? 'today' : ''} ${
                selectedDate && isSameDay(date, selectedDate) ? 'selected' : ''
              }`}
              role="gridcell"
              aria-label={`${format(date, 'yyyy年MM月dd日')}${isToday ? ' (今天)' : ''}${event ? ` - ${event.name}` : ''}`}
              aria-selected={selectedDate && isSameDay(date, selectedDate) ? true : undefined}
              tabIndex={isCurrentMonth ? 0 : -1}
            >
              <div className="calendar-day-number">
                {format(date, 'd')}
              </div>

              {event && (
                <div className="calendar-day-events">
                  <div
                    className="calendar-event"
                    style={{ 
                      borderColor: event.color,
                      backgroundColor: event.color + '20',
                      color: event.color
                    }}
                  >
                    {event.name}
                  </div>
                  
                  {/* Type indicators */}
                  {event.type.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {event.type.slice(0, 2).map((type, i) => (
                        <div
                          key={i}
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ 
                            backgroundColor: tags.type?.[type] || '#ccc'
                          }}
                          title={type}
                        />
                      ))}
                      {event.type.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{event.type.length - 2}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Monthly Events Summary */}
      {monthEvents.length > 0 && (
        <div className="p-4 md:p-6">
          <h3 className="text-lg font-semibold mb-4">本月事件 ({monthEvents.length})</h3>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {monthEvents.map(event => (
              <div
                key={event.date}
                className="crayon-border p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => {
                  setSelectedDate(new Date(event.date))
                  setShowEditModal(true)
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setSelectedDate(new Date(event.date))
                    setShowEditModal(true)
                  }
                }}
              >
                <div className="flex items-start space-x-3">
                  <div 
                    className="w-4 h-4 rounded mt-1 flex-shrink-0"
                    style={{ backgroundColor: event.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {event.name}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {format(new Date(event.date), 'MM/dd dddd')}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {event.place} · {event.city}
                    </div>
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {event.type.map(type => (
                        <span
                          key={type}
                          className="px-2 py-1 text-xs rounded-full text-white"
                          style={{ 
                            backgroundColor: tags.type?.[type] || '#ccc'
                          }}
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedDate && (
        <EditModal
          date={selectedDate}
          onClose={() => {
            setShowEditModal(false)
            setSelectedDate(null)
          }}
          onSave={async () => {
            await loadData()
            setShowEditModal(false)
            setSelectedDate(null)
          }}
        />
      )}

      {/* Keyboard Shortcuts Help */}
      {!isMobile && (
        <div className="fixed bottom-4 right-4 text-xs text-gray-500 bg-white p-2 rounded shadow">
          <div>快捷键: ← → 切换月份 | T 今天 | F 搜索 | ESC 关闭</div>
        </div>
      )}
    </div>
  )
}
