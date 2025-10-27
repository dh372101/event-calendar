'use client'

import { useState, useEffect } from 'react'
import { storage } from '@/lib/storage'
import { Event, FormData } from '@/types'
import ColorPicker from './ColorPicker'

interface EditModalProps {
  date: string
  onClose: () => void
  onSave: () => void
}

export default function EditModal({ date, onClose, onSave }: EditModalProps) {
  const [formData, setFormData] = useState<FormData>({
    types: [],
    name: '',
    location: '',
    city: '',
    color: '#000000',
  })
  const [existingEvent, setExistingEvent] = useState<Event | null>(null)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)

  const tags = storage.getTags()

  useEffect(() => {
    // 加载该日期的现有事件
    const events = storage.getEventsByDate(date)
    if (events.length > 0) {
      const event = events[0] // 每天最多一个事件
      setExistingEvent(event)
      setFormData({
        types: event.types,
        name: event.name,
        location: event.location,
        city: event.city,
        color: event.color,
      })
    } else {
      // 重置表单
      setFormData({
        types: [],
        name: '',
        location: '',
        city: '',
        color: '#000000',
      })
    }
  }, [date])

  const handleTypeChange = (type: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      types: checked
        ? [...prev.types, type]
        : prev.types.filter(t => t !== type)
    }))
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // 如果手动输入了新的地点或城市，自动添加到标签中
    if (field === 'location') {
      if (value && !tags.locations.includes(value)) {
        storage.addLocation(value)
      }
    } else if (field === 'city') {
      if (value && !tags.cities.includes(value)) {
        storage.addCity(value)
      }
    }
  }

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('请输入事件名称')
      return
    }

    if (formData.types.length === 0) {
      alert('请至少选择一个事件类型')
      return
    }

    const event: Event = {
      id: existingEvent?.id || `${date}-${Date.now()}`,
      date,
      types: formData.types,
      name: formData.name.trim(),
      location: formData.location.trim(),
      city: formData.city.trim(),
      color: formData.color,
    }

    storage.saveEvent(event)
    onSave()
  }

  const handleDelete = () => {
    if (existingEvent) {
      storage.deleteEvent(existingEvent.id)
      onSave()
    }
  }

  const formatDateDisplay = (dateStr: string): string => {
    const date = new Date(dateStr)
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${year}年${month}月${day}日`
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content crayon-border">
        <div className="modal-header">
          <h2 className="modal-title">
            {existingEvent ? '编辑事件' : '添加事件'}
          </h2>
          <button
            className="modal-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              日期: {formatDateDisplay(date)}
            </p>
          </div>

          {/* 事件类型多选 */}
          <div className="form-group">
            <label className="form-label">事件类型 *</label>
            <div className="checkbox-group">
              {Object.keys(tags.types).map(type => (
                <label
                  key={type}
                  className={`checkbox-item ${formData.types.includes(type) ? 'checked' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={formData.types.includes(type)}
                    onChange={(e) => handleTypeChange(type, e.target.checked)}
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 事件名称 */}
          <div className="form-group">
            <label className="form-label">事件名称 *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="form-input"
              placeholder="请输入事件名称"
            />
          </div>

          {/* 地点选择 */}
          <div className="form-group">
            <label className="form-label">地点</label>
            <select
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="form-select"
            >
              <option value="">请选择地点</option>
              {tags.locations.map(location => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="form-input mt-2"
              placeholder="或手动输入新地点"
            />
          </div>

          {/* 城市选择 */}
          <div className="form-group">
            <label className="form-label">城市</label>
            <select
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              className="form-select"
            >
              <option value="">请选择城市</option>
              {tags.cities.map(city => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              className="form-input mt-2"
              placeholder="或手动输入新城市"
            />
          </div>

          {/* 颜色选择 */}
          <ColorPicker
            value={formData.color}
            onChange={(color) => handleInputChange('color', color)}
          />
        </div>

        <div className="modal-footer">
          <button
            className="btn"
            onClick={onClose}
          >
            取消
          </button>

          {existingEvent && (
            <button
              className="btn btn-danger"
              onClick={() => setShowConfirmDelete(true)}
            >
              删除
            </button>
          )}

          <button
            className="btn btn-primary"
            onClick={handleSave}
          >
            保存
          </button>
        </div>

        {/* 删除确认 */}
        {showConfirmDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white border-2 border-black rounded-lg p-6 max-w-sm">
              <h3 className="font-bold mb-4">确认删除</h3>
              <p className="mb-6">确定要删除这个事件吗？此操作不可撤销。</p>
              <div className="flex justify-end gap-2">
                <button
                  className="btn"
                  onClick={() => setShowConfirmDelete(false)}
                >
                  取消
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleDelete}
                >
                  确认删除
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}