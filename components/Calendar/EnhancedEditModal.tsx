'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { X, Save, Trash2, Plus, X as CloseIcon } from 'lucide-react'
import { EventData } from '@/types'
import { saveEvent, getStorageData } from '@/utils/storage'

interface EnhancedEditModalProps {
  event?: EventData
  date?: Date
  tags: any
  onClose: () => void
  onSave: () => void
}

const DEFAULT_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFA07A',
  '#98D8C8', '#FFD93D', '#6C5CE7', '#A8E6CF', '#FFD3B6',
  '#FF8B94', '#A8DADC', '#F4A261', '#E76F51', '#2A9D8F'
]

export default function EnhancedEditModal({ 
  event, 
  date, 
  tags, 
  onClose, 
  onSave 
}: EnhancedEditModalProps) {
  const [formData, setFormData] = useState<Partial<EventData>>({
    name: '',
    type: [],
    place: '',
    city: '',
    color: '#FF6B6B'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [newType, setNewType] = useState('')
  const [newPlace, setNewPlace] = useState('')
  const [newCity, setNewCity] = useState('')
  const [showColorPicker, setShowColorPicker] = useState(false)

  const isEdit = !!event
  const eventDate = event?.date || format(date || new Date(), 'yyyy-MM-dd')

  useEffect(() => {
    if (event) {
      setFormData(event)
    } else if (date) {
      setFormData(prev => ({ ...prev, date: format(date, 'yyyy-MM-dd') }))
    }
  }, [event, date])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const eventData: EventData = {
        date: eventDate,
        name: formData.name || '',
        type: formData.type || [],
        place: formData.place || '',
        city: formData.city || '',
        color: formData.color || '#FF6B6B'
      }

      await saveEvent(eventData)
      onSave()
      onClose()
    } catch (error) {
      console.error('Error saving event:', error)
      alert('保存事件时出错，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const addType = (type: string) => {
    if (type && !formData.type?.includes(type)) {
      setFormData(prev => ({
        ...prev,
        type: [...(prev.type || []), type]
      }))
      setNewType('')
    }
  }

  const removeType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      type: (prev.type || []).filter(t => t !== type)
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent, action: string, value: string) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (action === 'type') addType(value)
      else if (action === 'place' && value) {
        setFormData(prev => ({ ...prev, place: value }))
        setNewPlace('')
      } else if (action === 'city' && value) {
        setFormData(prev => ({ ...prev, city: value }))
        setNewCity('')
      }
    }
  }

  const isValid = formData.name && formData.type && formData.type.length > 0

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {isEdit ? '编辑事件' : '添加事件'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {format(new Date(eventDate), 'yyyy年MM月dd日')}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Event Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              事件名称 *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="输入事件名称"
              className="w-full crayon-input"
              required
            />
          </div>

          {/* Event Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              事件类型 *
            </label>
            <div className="space-y-3">
              {/* Selected types */}
              {formData.type && formData.type.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.type.map((type, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm text-white"
                      style={{ backgroundColor: tags.type?.[type] || '#ccc' }}
                    >
                      {type}
                      <button
                        type="button"
                        onClick={() => removeType(type)}
                        className="ml-2 hover:opacity-75"
                      >
                        <CloseIcon size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Type input */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, 'type', newType)}
                  placeholder="输入或选择类型"
                  className="flex-1 crayon-input"
                />
                <button
                  type="button"
                  onClick={() => addType(newType)}
                  disabled={!newType}
                  className="px-3 py-2 crayon-button disabled:opacity-50"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Preset types */}
              <div className="flex flex-wrap gap-2">
                {Object.entries(tags.type || {}).map(([type, color]) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => addType(type)}
                    disabled={formData.type?.includes(type)}
                    className={`px-3 py-1 rounded-full text-xs transition-all ${
                      formData.type?.includes(type)
                        ? 'text-white'
                        : 'bg-white border border-gray-300 hover:border-gray-400'
                    }`}
                    style={{
                      backgroundColor: formData.type?.includes(type) ? (color as string) : undefined
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Place */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              地点 *
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={formData.place}
                onChange={(e) => setFormData(prev => ({ ...prev, place: e.target.value }))}
                placeholder="输入地点"
                className="w-full crayon-input"
                required
              />
              {/* Preset places */}
              <div className="flex flex-wrap gap-2">
                {tags.place?.map((place: string) => (
                  <button
                    key={place}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, place }))}
                    className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    {place}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              城市 *
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                placeholder="输入城市"
                className="w-full crayon-input"
                required
              />
              {/* Preset cities */}
              <div className="flex flex-wrap gap-2">
                {tags.city?.map((city: string) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, city }))}
                    className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              颜色标识
            </label>
            <div className="space-y-3">
              {/* Current color */}
              <div className="flex items-center space-x-3">
                <div
                  className="w-8 h-8 rounded-lg border-2 border-gray-300 cursor-pointer"
                  style={{ backgroundColor: formData.color }}
                  onClick={() => setShowColorPicker(!showColorPicker)}
                />
                <span className="text-sm text-gray-600">{formData.color}</span>
                <button
                  type="button"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  更改颜色
                </button>
              </div>

              {/* Color picker */}
              {showColorPicker && (
                <div className="p-3 border border-gray-200 rounded-lg">
                  <div className="grid grid-cols-5 gap-2">
                    {DEFAULT_COLORS.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, color }))
                          setShowColorPicker(false)
                        }}
                        className={`w-full h-8 rounded-lg border-2 transition-all ${
                          formData.color === color ? 'border-gray-800' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!isValid || isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Save size={16} />
              <span>{isLoading ? '保存中...' : '保存'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
