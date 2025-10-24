'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, X, Calendar, Tag, MapPin } from 'lucide-react'
import { EventData } from '@/types'
import { getStorageData } from '@/utils/storage'

interface SearchFilterProps {
  onFilterChange: (filters: SearchFilters) => void
  onSearchChange: (searchTerm: string) => void
}

export interface SearchFilters {
  typeFilters: string[]
  placeFilter: string
  cityFilter: string
  priorityFilter: string[]
  dateRange: {
    start: string
    end: string
  }
  hasTimeOnly: boolean
}

export default function SearchFilter({ onFilterChange, onSearchChange }: SearchFilterProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [tags, setTags] = useState<any>({})
  const [filters, setFilters] = useState<SearchFilters>({
    typeFilters: [],
    placeFilter: '',
    cityFilter: '',
    priorityFilter: [],
    dateRange: {
      start: '',
      end: ''
    },
    hasTimeOnly: false
  })

  useEffect(() => {
    const { tags: storedTags } = getStorageData()
    setTags(storedTags)
  }, [])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      onSearchChange(searchTerm)
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchTerm, onSearchChange])

  useEffect(() => {
    onFilterChange(filters)
  }, [filters, onFilterChange])

  const handleTypeFilterToggle = (type: string) => {
    setFilters(prev => ({
      ...prev,
      typeFilters: prev.typeFilters.includes(type)
        ? prev.typeFilters.filter(t => t !== type)
        : [...prev.typeFilters, type]
    }))
  }

  const handlePriorityFilterToggle = (priority: string) => {
    setFilters(prev => ({
      ...prev,
      priorityFilter: prev.priorityFilter.includes(priority)
        ? prev.priorityFilter.filter(p => p !== priority)
        : [...prev.priorityFilter, priority]
    }))
  }

  const clearAllFilters = () => {
    setFilters({
      typeFilters: [],
      placeFilter: '',
      cityFilter: '',
      priorityFilter: [],
      dateRange: { start: '', end: '' },
      hasTimeOnly: false
    })
    setSearchTerm('')
  }

  const hasActiveFilters = searchTerm || 
    filters.typeFilters.length > 0 || 
    filters.placeFilter || 
    filters.cityFilter || 
    filters.priorityFilter.length > 0 ||
    filters.dateRange.start ||
    filters.dateRange.end ||
    filters.hasTimeOnly

  const typeOptions = Object.keys(tags.type || {})
  const placeOptions = tags.place || []
  const cityOptions = tags.city || []

  return (
    <div className="space-y-4">
      {/* 搜索栏 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="搜索事件名称、地点、城市..."
          className="crayon-input w-full pl-10 pr-12"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* 过滤器按钮和状态 */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`crayon-button flex items-center space-x-2 ${
            hasActiveFilters ? 'bg-black text-white' : ''
          }`}
        >
          <Filter size={16} />
          <span>筛选</span>
          {hasActiveFilters && (
            <span className="bg-white text-black rounded-full px-2 py-0.5 text-xs font-bold">
              {[
                searchTerm ? 1 : 0,
                filters.typeFilters.length,
                filters.placeFilter ? 1 : 0,
                filters.cityFilter ? 1 : 0,
                filters.priorityFilter.length,
                (filters.dateRange.start || filters.dateRange.end) ? 1 : 0,
                filters.hasTimeOnly ? 1 : 0
              ].reduce((a, b) => a + b, 0)}
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-red-600 hover:text-red-800"
          >
            清除所有筛选
          </button>
        )}
      </div>

      {/* 过滤器面板 */}
      {showFilters && (
        <div className="crayon-border p-4 bg-gray-50">
          <div className="space-y-4">
            {/* 类型筛选 */}
            {typeOptions.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center">
                  <Tag size={14} className="mr-1" />
                  事件类型
                </label>
                <div className="flex flex-wrap gap-2">
                  {typeOptions.map(type => (
                    <button
                      key={type}
                      onClick={() => handleTypeFilterToggle(type)}
                      className={`px-3 py-1 rounded-full text-sm border-2 transition-colors ${
                        filters.typeFilters.includes(type)
                          ? 'text-white'
                          : 'bg-white text-gray-700'
                      }`}
                      style={{
                        backgroundColor: filters.typeFilters.includes(type) 
                          ? tags.type[type] 
                          : 'transparent',
                        borderColor: tags.type[type],
                        color: filters.typeFilters.includes(type) ? 'white' : tags.type[type]
                      }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 优先级筛选 */}
            <div>
              <label className="block text-sm font-medium mb-2">优先级</label>
              <div className="flex space-x-2">
                {['low', 'medium', 'high'].map(priority => (
                  <button
                    key={priority}
                    onClick={() => handlePriorityFilterToggle(priority)}
                    className={`px-3 py-1 rounded-full text-sm border-2 ${
                      filters.priorityFilter.includes(priority) ? 'text-white' : ''
                    }`}
                    style={{
                      backgroundColor: filters.priorityFilter.includes(priority) 
                        ? priority === 'low' ? '#4ECDC4' : priority === 'medium' ? '#FFE66D' : '#FF6B6B'
                        : 'transparent',
                      borderColor: priority === 'low' ? '#4ECDC4' : priority === 'medium' ? '#FFE66D' : '#FF6B6B',
                      color: filters.priorityFilter.includes(priority) ? 'white' : 
                             priority === 'low' ? '#4ECDC4' : priority === 'medium' ? '#FFE66D' : '#FF6B6B'
                    }}
                  >
                    {priority === 'low' ? '低' : priority === 'medium' ? '中' : '高'}
                  </button>
                ))}
              </div>
            </div>

            {/* 地点和城市筛选 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center">
                  <MapPin size={14} className="mr-1" />
                  地点
                </label>
                <select
                  value={filters.placeFilter}
                  onChange={e => setFilters(prev => ({ ...prev, placeFilter: e.target.value }))}
                  className="crayon-input w-full"
                >
                  <option value="">所有地点</option>
                  {placeOptions.map((place: string) => (
                    <option key={place} value={place}>{place}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">城市</label>
                <select
                  value={filters.cityFilter}
                  onChange={e => setFilters(prev => ({ ...prev, cityFilter: e.target.value }))}
                  className="crayon-input w-full"
                >
                  <option value="">所有城市</option>
                  {cityOptions.map((city: string) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 日期范围筛选 */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center">
                <Calendar size={14} className="mr-1" />
                日期范围
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={e => setFilters(prev => ({ 
                    ...prev, 
                    dateRange: { ...prev.dateRange, start: e.target.value }
                  }))}
                  className="crayon-input flex-1"
                />
                <span className="text-gray-500">至</span>
                <input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={e => setFilters(prev => ({ 
                    ...prev, 
                    dateRange: { ...prev.dateRange, end: e.target.value }
                  }))}
                  className="crayon-input flex-1"
                />
              </div>
            </div>

            {/* 其他筛选 */}
            <div>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.hasTimeOnly}
                  onChange={e => setFilters(prev => ({ ...prev, hasTimeOnly: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm font-medium">仅显示有时间的事件</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* 活跃筛选标签 */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {searchTerm && (
            <span className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              <Search size={12} />
              <span>{searchTerm}</span>
              <button
                onClick={() => setSearchTerm('')}
                className="ml-1 hover:text-blue-600"
              >
                <X size={12} />
              </button>
            </span>
          )}
          
          {filters.typeFilters.map(type => (
            <span
              key={type}
              className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm text-white"
              style={{ backgroundColor: tags.type?.[type] || '#ccc' }}
            >
              <span>{type}</span>
              <button
                onClick={() => handleTypeFilterToggle(type)}
                className="ml-1 hover:opacity-80"
              >
                <X size={12} />
              </button>
            </span>
          ))}

          {filters.placeFilter && (
            <span className="inline-flex items-center space-x-1 px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-sm">
              <MapPin size={12} />
              <span>{filters.placeFilter}</span>
              <button
                onClick={() => setFilters(prev => ({ ...prev, placeFilter: '' }))}
                className="ml-1 hover:text-gray-600"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {filters.cityFilter && (
            <span className="inline-flex items-center space-x-1 px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-sm">
              <span>{filters.cityFilter}</span>
              <button
                onClick={() => setFilters(prev => ({ ...prev, cityFilter: '' }))}
                className="ml-1 hover:text-gray-600"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {filters.priorityFilter.map(priority => (
            <span
              key={priority}
              className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm text-white"
              style={{ 
                backgroundColor: priority === 'low' ? '#4ECDC4' : priority === 'medium' ? '#FFE66D' : '#FF6B6B'
              }}
            >
              <span>{priority === 'low' ? '低优先级' : priority === 'medium' ? '中优先级' : '高优先级'}</span>
              <button
                onClick={() => handlePriorityFilterToggle(priority)}
                className="ml-1 hover:opacity-80"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
