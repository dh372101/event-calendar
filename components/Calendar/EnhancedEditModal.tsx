'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { X, Palette, Droplet, Clock, Repeat, Star, AlertCircle } from 'lucide-react'
import { EventData, TagConfig } from '@/types'
import { getEvent, saveEvent, deleteEvent, getStorageData } from '@/utils/storage'

interface EditModalProps {
  date: Date
  onClose: () => void
  onSave: () => void
}

const DEFAULT_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFE66D',
  '#FF9F1C', '#A8E6CF', '#FFAAA5', '#D4A5A5', '#9BDEAC',
  '#FDCB6E', '#E17055', '#00B894', '#00CEC9', '#6C5CE7',
  '#FD79A8', '#FDCB6E', '#E17055', '#00B894', '#00CEC9'
]

interface RecurringEvent {
  enabled: boolean
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval: number // Every N days/weeks/months/years
  endDate?: string
}

export default function EnhancedEditModal({ date, onClose, onSave }: EditModalProps) {
  const [event, setEvent] = useState<EventData>({
    date: format(date, 'yyyy-MM-dd'),
    type: [],
    name: '',
    place: '',
    city: '',
    color: DEFAULT_COLORS[0]
  })
  
  const [tags, setTags] = useState<TagConfig>({ type: {}, place: [], city: [] })
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [customColor, setCustomColor] = useState('')

  // Enhanced fields
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [notes, setNotes] = useState('')
  const [recurring, setRecurring] = useState<RecurringEvent>({
    enabled: false,
    frequency: 'weekly',
    interval: 1
  })

  useEffect(() => {
    const existingEvent = getEvent(format(date, 'yyyy-MM-dd'))
    if (existingEvent) {
      setEvent(existingEvent)
      // Extract time from extended event data if it exists
      if ((existingEvent as any).startTime) setStartTime((existingEvent as any).startTime)
      if ((existingEvent as any).endTime) setEndTime((existingEvent as any).endTime)
      if ((existingEvent as any).priority) setPriority((existingEvent as any).priority)
      if ((existingEvent as any).notes) setNotes((existingEvent as any).notes)
      if ((existingEvent as any).recurring) setRecurring((existingEvent as any).recurring)
    }

    const { tags: storedTags } = getStorageData()
    setTags(storedTags)
  }, [date])

  const handleTypeToggle = (type: string) => {
    setEvent(prev => ({
      ...prev,
      type: prev.type.includes(type)
        ? prev.type.filter(t => t !== type)
        : [...prev.type, type]
    }))
  }

  const handleSave = () => {
    // Enhanced event with additional fields
    const enhancedEvent = {
      ...event,
      startTime,
      endTime,
      priority,
      notes,
      recurring: recurring.enabled ? recurring : undefined
    }
    
    saveEvent(enhancedEvent)
    
    // Handle recurring events
    if (recurring.enabled) {
      saveRecurringEvents(enhancedEvent, recurring)
    }
    
    onSave()
  }

  const saveRecurringEvents = (baseEvent: EventData, recurringConfig: RecurringEvent) => {
    const startDate = new Date(baseEvent.date)
    const endDate = recurringConfig.endDate ? new Date(recurringConfig.endDate) : new Date(startDate.getFullYear() + 1, startDate.getMonth(), startDate.getDate())
    
    let currentDate = new Date(startDate)
    
    while (currentDate <= endDate) {
      currentDate = new Date(currentDate)
      
      switch (recurringConfig.frequency) {
        case 'daily':
          currentDate.setDate(currentDate.getDate() + recurringConfig.interval)
          break
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + (7 * recurringConfig.interval))
          break
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + recurringConfig.interval)
          break
        case 'yearly':
          currentDate.setFullYear(currentDate.getFullYear() + recurringConfig.interval)
          break
      }
      
      if (currentDate <= endDate) {
        const recurringEvent = {
          ...baseEvent,
          date: format(currentDate, 'yyyy-MM-dd'),
          name: `${baseEvent.name} (重复)`
        }
        saveEvent(recurringEvent)
      }
    }
  }

  const handleDelete = () => {
    if (confirm('确定要删除这个事件吗？')) {
      deleteEvent(event.date)
      onSave()
    }
  }

  const handleColorSelect = (color: string) => {
    setEvent(prev => ({ ...prev, color }))
    setShowColorPicker(false)
  }

  const handleCustomColor = () => {
    if (customColor && /^#[0-9A-F]{6}$/i.test(customColor)) {
      handleColorSelect(customColor)
    }
  }

  const typeOptions = Object.keys(tags.type || {})
  const placeOptions = tags.place || []
  const cityOptions = tags.city || []

  const priorityColors = {
    low: '#4ECDC4',
    medium: '#FFE66D', 
    high: '#FF6B6B'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto crayon-border">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">
            {format(date, 'yyyy年MM月dd日')}
          </h3>
          <button onClick={onClose} className="crayon-button p-2">
            <X size={16} />
          </button>
        </div>

        {/* 表单内容 */}
        <div className="p-4 space-y-4">
          {/* 基本信息 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 类型选择 */}
            <div>
              <label className="block text-sm font-medium mb-2">类型</label>
              <div className="flex flex-wrap gap-2">
                {typeOptions.map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleTypeToggle(type)}
                    className={`px-3 py-1 rounded-full text-sm border-2 transition-colors ${
                      event.type.includes(type)
                        ? 'text-white'
                        : 'bg-white text-gray-700'
                    }`}
                    style={{
                      backgroundColor: event.type.includes(type) 
                        ? tags.type[type] 
                        : 'transparent',
                      borderColor: tags.type[type],
                      color: event.type.includes(type) ? 'white' : tags.type[type]
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* 优先级 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <Star size={14} className="inline mr-1" />
                优先级
              </label>
              <div className="flex space-x-2">
                {(['low', 'medium', 'high'] as const).map(level => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setPriority(level)}
                    className={`px-3 py-1 rounded-full text-sm border-2 ${
                      priority === level ? 'text-white' : ''
                    }`}
                    style={{
                      backgroundColor: priority === level ? priorityColors[level] : 'transparent',
                      borderColor: priorityColors[level],
                      color: priority === level ? 'white' : priorityColors[level]
                    }}
                  >
                    {level === 'low' ? '低' : level === 'medium' ? '中' : '高'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 名称 */}
          <div>
            <label className="block text-sm font-medium mb-2">名称</label>
            <input
              type="text"
              value={event.name}
              onChange={e => setEvent(prev => ({ ...prev, name: e.target.value }))}
              className="crayon-input w-full"
              placeholder="输入事件名称"
            />
          </div>

          {/* 时间 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                <Clock size={14} className="inline mr-1" />
                开始时间
              </label>
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="crayon-input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">结束时间</label>
              <input
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="crayon-input w-full"
              />
            </div>
          </div>

          {/* 地点和城市 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">地点</label>
              <div className="flex gap-2">
                <select
                  value={event.place}
                  onChange={e => setEvent(prev => ({ ...prev, place: e.target.value }))}
                  className="crayon-input flex-1"
                >
                  <option value="">选择地点</option>
                  {placeOptions.map(place => (
                    <option key={place} value={place}>{place}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={event.place}
                  onChange={e => setEvent(prev => ({ ...prev, place: e.target.value }))}
                  className="crayon-input flex-1"
                  placeholder="或输入新地点"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">城市</label>
              <div className="flex gap-2">
                <select
                  value={event.city}
                  onChange={e => setEvent(prev => ({ ...prev, city: e.target.value }))}
                  className="crayon-input flex-1"
                >
                  <option value="">选择城市</option>
                  {cityOptions.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={event.city}
                  onChange={e => setEvent(prev => ({ ...prev, city: e.target.value }))}
                  className="crayon-input flex-1"
                  placeholder="或输入新城市"
                />
              </div>
            </div>
          </div>

          {/* 备注 */}
          <div>
            <label className="block text-sm font-medium mb-2">备注</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="crayon-input w-full h-24 resize-none"
              placeholder="添加备注信息..."
            />
          </div>

          {/* 重复事件 */}
          <div className="border-2 border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <input
                type="checkbox"
                id="recurring"
                checked={recurring.enabled}
                onChange={e => setRecurring(prev => ({ ...prev, enabled: e.target.checked }))}
                className="mr-2"
              />
              <label htmlFor="recurring" className="flex items-center cursor-pointer">
                <Repeat size={16} className="mr-1" />
                重复事件
              </label>
            </div>

            {recurring.enabled && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">重复频率</label>
                  <select
                    value={recurring.frequency}
                    onChange={e => setRecurring(prev => ({ ...prev, frequency: e.target.value as any }))}
                    className="crayon-input w-full"
                  >
                    <option value="daily">每日</option>
                    <option value="weekly">每周</option>
                    <option value="monthly">每月</option>
                    <option value="yearly">每年</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">间隔</label>
                  <input
                    type="number"
                    min="1"
                    value={recurring.interval}
                    onChange={e => setRecurring(prev => ({ ...prev, interval: parseInt(e.target.value) || 1 }))}
                    className="crayon-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">结束日期</label>
                  <input
                    type="date"
                    value={recurring.endDate || ''}
                    onChange={e => setRecurring(prev => ({ ...prev, endDate: e.target.value }))}
                    className="crayon-input w-full"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 颜色选择 */}
          <div>
            <label className="block text-sm font-medium mb-2">颜色</label>
            <div className="flex items-center space-x-3">
              <div 
                className="w-8 h-8 rounded border-2 border-gray-300 cursor-pointer"
                style={{ backgroundColor: event.color }}
                onClick={() => setShowColorPicker(!showColorPicker)}
              />
              <button
                type="button"
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="crayon-button flex items-center space-x-2"
              >
                <Palette size={16} />
                <span>选择颜色</span>
              </button>
            </div>

            {showColorPicker && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-5 gap-2 mb-3">
                  {DEFAULT_COLORS.map(color => (
                    <button
                      key={color}
                      className="w-8 h-8 rounded border-2 border-gray-300 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      onClick={() => handleColorSelect(color)}
                      title={color}
                    />
                  ))}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Droplet size={16} />
                  <input
                    type="text"
                    value={customColor}
                    onChange={e => setCustomColor(e.target.value)}
                    placeholder="#RRGGBB"
                    className="crayon-input flex-1"
                  />
                  <button
                    onClick={handleCustomColor}
                    className="crayon-button"
                  >
                    应用
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex justify-between p-4 border-t">
          <button
            onClick={handleDelete}
            className="crayon-button bg-red-50 text-red-600 border-red-300"
          >
            删除
          </button>
          
          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="crayon-button"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="crayon-button bg-black text-white"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
