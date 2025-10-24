'use client'

import { useState, useEffect } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns'
import { ChevronLeft, ChevronRight, Search, Filter, Calendar as CalendarIcon, MapPin, Tag, Clock, Plus, X } from 'lucide-react'
import { EventData } from '@/types'
import { getStorageData, saveEvent, deleteEvent, searchEvents, getEventsByType, getEventsByCity, getEventsByDateRange } from '@/utils/indexeddb-storage'
import EventDetailModal from './EventDetailModal'

interface SearchFilters {
  query: string
  types: string[]
  cities: string[]
  dateRange: {
    start: string
    end: string
  }
}

export default function EnhancedCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<Record<string, EventData>>({})
  const [tags, setTags] = useState<any>({})
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [searchResults, setSearchResults] = useState<EventData[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Record<string, EventData>>({})
  const [viewMode, setViewMode] = useState<'month' | 'list'>('month')
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null)
  const [showEventDetail, setShowEventDetail] = useState(false)
  
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    types: [],
    cities: [],
    dateRange: {
      start: '',
      end: ''
    }
  })

  // Load initial data
  useEffect(() => {
    loadData()
  }, [])

  // Apply filters when they change
  useEffect(() => {
    applyFilters()
  }, [events, filters])

  const loadData = async () => {
    try {
      const data = await getStorageData()
      setEvents(data.events)
      setTags(data.tags)
    } catch (error) {
      console.error('Error loading data:', error)
      // Fallback to localStorage for compatibility
      const localStorageData = localStorage.getItem('events')
      if (localStorageData) {
        setEvents(JSON.parse(localStorageData))
      }
      const tagsData = localStorage.getItem('tags')
      if (tagsData) {
        setTags(JSON.parse(tagsData))
      }
    }
  }

  const applyFilters = async () => {
    let filtered = { ...events }

    // Apply text search
    if (filters.query) {
      try {
        const searchResults = await searchEvents(filters.query)
        const searchMap: Record<string, EventData> = {}
        searchResults.forEach(event => {
          searchMap[event.date] = event
        })
        filtered = searchMap
      } catch (error) {
        // Fallback to simple text filtering
        const query = filters.query.toLowerCase()
        const filteredMap: Record<string, EventData> = {}
        Object.entries(events).forEach(([date, event]) => {
          if (
            event.name.toLowerCase().includes(query) ||
            event.place.toLowerCase().includes(query) ||
            event.city.toLowerCase().includes(query) ||
            event.type.some(t => t.toLowerCase().includes(query))
          ) {
            filteredMap[date] = event
          }
        })
        filtered = filteredMap
      }
    }

    // Apply type filters
    if (filters.types.length > 0) {
      const filteredByType: Record<string, EventData> = {}
      Object.entries(filtered).forEach(([date, event]) => {
        if (filters.types.some(type => event.type.includes(type))) {
          filteredByType[date] = event
        }
      })
      filtered = filteredByType
    }

    // Apply city filters
    if (filters.cities.length > 0) {
      const filteredByCity: Record<string, EventData> = {}
      Object.entries(filtered).forEach(([date, event]) => {
        if (filters.cities.includes(event.city)) {
          filteredByCity[date] = event
        }
      })
      filtered = filteredByCity
    }

    // Apply date range filter
    if (filters.dateRange.start && filters.dateRange.end) {
      const filteredByDate: Record<string, EventData> = {}
      Object.entries(filtered).forEach(([date, event]) => {
        if (date >= filters.dateRange.start && date <= filters.dateRange.end) {
          filteredByDate[date] = event
        }
      })
      filtered = filteredByDate
    }

    setFilteredEvents(filtered)
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    setFilters({ ...filters, query })
    
    if (query) {
      try {
        const results = await searchEvents(query)
        setSearchResults(results)
      } catch (error) {
        console.error('Search error:', error)
      }
    } else {
      setSearchResults([])
    }
  }

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate })

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setShowEventModal(true)
  }

  const handleEventClick = (event: EventData, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedEvent(event)
    setShowEventDetail(true)
  }

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  const getEventForDate = (date: Date): EventData | null => {
    const dateString = format(date, 'yyyy-MM-dd')
    return filteredEvents[dateString] || null
  }

  const getEventsForMonth = (): EventData[] => {
    return Object.values(filteredEvents).filter(event => {
      const eventDate = new Date(event.date)
      return isSameMonth(eventDate, currentDate)
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  const clearFilters = () => {
    setFilters({
      query: '',
      types: [],
      cities: [],
      dateRange: {
        start: '',
        end: ''
      }
    })
    setSearchQuery('')
    setSearchResults([])
  }

  const toggleTypeFilter = (type: string) => {
    const newTypes = filters.types.includes(type)
      ? filters.types.filter(t => t !== type)
      : [...filters.types, type]
    setFilters({ ...filters, types: newTypes })
  }

  const toggleCityFilter = (city: string) => {
    const newCities = filters.cities.includes(city)
      ? filters.cities.filter(c => c !== city)
      : [...filters.cities, city]
    setFilters({ ...filters, cities: newCities })
  }

  const monthEvents = getEventsForMonth()
  const hasActiveFilters = filters.query || filters.types.length > 0 || filters.cities.length > 0 || filters.dateRange.start

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold">演出日历</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded-md crayon-button ${viewMode === 'month' ? 'bg-gray-200' : ''}`}
            >
              <CalendarIcon size={16} />
              月视图
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-md crayon-button ${viewMode === 'list' ? 'bg-gray-200' : ''}`}
            >
              <Filter size={16} />
              列表
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button onClick={handlePrevMonth} className="crayon-button">
              <ChevronLeft size={20} />
            </button>
            <span className="text-xl font-semibold min-w-[120px] text-center">
              {format(currentDate, 'yyyy年MM月')}
            </span>
            <button onClick={handleNextMonth} className="crayon-button">
              <ChevronRight size={20} />
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className={`crayon-button ${showSearch ? 'bg-gray-200' : ''}`}
            >
              <Search size={20} />
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`crayon-button ${showFilters ? 'bg-gray-200' : ''}`}
            >
              <Filter size={20} />
            </button>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="crayon-button text-red-600"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="crayon-border p-4 bg-gray-50">
          <div className="flex items-center space-x-2">
            <Search size={20} className="text-gray-500" />
            <input
              type="text"
              placeholder="搜索事件名称、地点、类型..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex-1 crayon-input"
              autoFocus
            />
          </div>
          {searchResults.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-600">搜索结果 ({searchResults.length})</p>
              {searchResults.map(event => (
                <div
                  key={event.date}
                  onClick={() => handleEventClick(event, {} as React.MouseEvent)}
                  className="p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{event.name}</div>
                      <div className="text-sm text-gray-600">
                        {format(new Date(event.date), 'yyyy-MM-dd')} · {event.place} · {event.city}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {event.type.slice(0, 2).map((type, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 text-xs rounded-full"
                          style={{ backgroundColor: tags.type?.[type] || '#ccc', color: 'white' }}
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <div className="crayon-border p-4 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Type Filters */}
            <div>
              <h4 className="font-medium mb-2 flex items-center">
                <Tag size={16} className="mr-1" />
                类型筛选
              </h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(tags.type || {}).map(([type, color]) => (
                  <button
                    key={type}
                    onClick={() => toggleTypeFilter(type)}
                    className={`px-3 py-1 rounded-full text-xs transition-all ${
                      filters.types.includes(type) 
                        ? 'text-white' 
                        : 'bg-white border border-gray-300'
                    }`}
                    style={{
                      backgroundColor: filters.types.includes(type) ? (color as string) : undefined
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* City Filters */}
            <div>
              <h4 className="font-medium mb-2 flex items-center">
                <MapPin size={16} className="mr-1" />
                城市筛选
              </h4>
              <div className="flex flex-wrap gap-2">
                {tags.city?.map((city: string) => (
                  <button
                    key={city}
                    onClick={() => toggleCityFilter(city)}
                    className={`px-3 py-1 rounded-full text-xs transition-all ${
                      filters.cities.includes(city) 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white border border-gray-300'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range Filter */}
            <div>
              <h4 className="font-medium mb-2 flex items-center">
                <Clock size={16} className="mr-1" />
                日期范围
              </h4>
              <div className="space-y-2">
                <input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => setFilters({
                    ...filters,
                    dateRange: { ...filters.dateRange, start: e.target.value }
                  })}
                  className="w-full crayon-input text-sm"
                />
                <input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => setFilters({
                    ...filters,
                    dateRange: { ...filters.dateRange, end: e.target.value }
                  })}
                  className="w-full crayon-input text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Month View */}
      {viewMode === 'month' && (
        <div className="crayon-border">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 bg-gray-100">
            {['一', '二', '三', '四', '五', '六', '日'].map(day => (
              <div key={day} className="calendar-day-header">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="calendar-grid">
            {daysInMonth.map((date, index) => {
              const event = getEventForDate(date)
              const isCurrentMonth = isSameMonth(date, currentDate)
              const isToday = isSameDay(date, new Date())
              
              return (
                <div
                  key={index}
                  onClick={() => handleDateClick(date)}
                  className={`calendar-day cursor-pointer transition-all hover:shadow-lg ${
                    !isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
                  } ${isToday ? 'bg-blue-50 ring-2 ring-blue-300' : ''}`}
                >
                  <div className="flex flex-col h-full">
                    {/* Date header */}
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-medium ${
                        isToday ? 'text-blue-600 font-bold' : ''
                      }`}>
                        {format(date, 'd')}
                      </span>
                      
                      {/* Event indicators */}
                      {event && event.type.length > 0 && (
                        <div className="flex space-x-1">
                          {event.type.slice(0, 3).map((type, i) => (
                            <div
                              key={i}
                              className="w-2 h-2 rounded-full flex-shrink-0"
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

                    {/* Event content */}
                    {event && (
                      <div className="flex-1 flex flex-col justify-end">
                        <div 
                          className="text-xs font-medium truncate cursor-pointer hover:text-blue-600"
                          style={{ color: event.color }}
                          onClick={(e) => handleEventClick(event, e)}
                        >
                          {event.name}
                        </div>
                        <div className="text-xs text-gray-600 truncate">
                          {event.place}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {event.city}
                        </div>
                      </div>
                    )}

                    {/* Add event button for empty days */}
                    {!event && isCurrentMonth && (
                      <div className="flex-1 flex items-end justify-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDateClick(date)
                          }}
                          className="opacity-0 hover:opacity-100 text-gray-400 hover:text-blue-500 transition-opacity"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {Object.keys(filteredEvents).length === 0 ? (
            <div className="crayon-border p-8 text-center text-gray-500">
              <CalendarIcon size={48} className="mx-auto mb-4 opacity-50" />
              <p>暂无事件</p>
              <p className="text-sm mt-2">点击日历添加新事件</p>
            </div>
          ) : (
            Object.entries(filteredEvents)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([date, event]) => (
                <div
                  key={date}
                  className="crayon-border p-4 hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => handleEventClick(event, {} as React.MouseEvent)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="text-lg font-semibold text-blue-600">
                          {format(new Date(date), 'MM月dd日')}
                        </div>
                        <div className="flex space-x-2">
                          {event.type.map((type, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 text-xs rounded-full text-white"
                              style={{ backgroundColor: tags.type?.[type] || '#ccc' }}
                            >
                              {type}
                            </span>
                          ))}
                        </div>
                      </div>
                      <h3 className="font-medium text-lg mb-1" style={{ color: event.color }}>
                        {event.name}
                      </h3>
                      <div className="text-gray-600 space-y-1">
                        <div className="flex items-center space-x-2">
                          <MapPin size={14} />
                          <span className="text-sm">{event.place}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Tag size={14} />
                          <span className="text-sm">{event.city}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        // Add edit/delete actions here
                      }}
                      className="ml-4 text-gray-400 hover:text-gray-600"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              ))
          )}
        </div>
      )}

      {/* Month Events Summary */}
      {monthEvents.length > 0 && viewMode === 'month' && (
        <div className="crayon-border p-4">
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <CalendarIcon size={20} className="mr-2" />
            本月事件 ({monthEvents.length})
          </h3>
          <div className="space-y-2">
            {monthEvents.map(event => (
              <div
                key={event.date}
                onClick={() => handleEventClick(event, {} as React.MouseEvent)}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <div 
                  className="w-4 h-4 rounded flex-shrink-0"
                  style={{ backgroundColor: event.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium">
                      {format(new Date(event.date), 'MM/dd')}
                    </span>
                    <div className="flex space-x-1">
                      {event.type.slice(0, 2).map((type, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 text-xs rounded-full text-white"
                          style={{ backgroundColor: tags.type?.[type] || '#ccc' }}
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-sm font-medium truncate">
                    {event.name}
                  </div>
                  <div className="text-xs text-gray-600 truncate">
                    {event.place} · {event.city}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {showEventDetail && selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          tags={tags}
          onClose={() => setShowEventDetail(false)}
          onSave={loadData}
        />
      )}

      {/* Add/Edit Event Modal */}
      {showEventModal && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {format(selectedDate, 'yyyy年MM月dd日')} 的事件
            </h3>
            <p className="text-gray-600">
              点击事件查看详情，或点击日期上的 + 按钮添加新事件
            </p>
            <button
              onClick={() => setShowEventModal(false)}
              className="mt-4 w-full crayon-button"
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
