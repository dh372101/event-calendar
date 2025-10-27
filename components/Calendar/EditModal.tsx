'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { X, Save, Trash2 } from 'lucide-react'
import { EventData } from '@/types/event'

interface EditModalProps {
  date: Date
  event?: EventData
  onSave: (event: EventData) => void
  onDelete: () => void
  onClose: () => void
}

const defaultColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
  '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
  '#A3CB38', '#C4E538', '#FDA7DF', '#ED4C67', '#B53471',
  '#EE5A24', '#009432', '#0652DD', '#9980FA', '#833471'
]

const defaultTypes = ['Live', '干饭', '旅行', '运动']

export default function EditModal({ date, event, onSave, onDelete, onClose }: EditModalProps) {
  const [formData, setFormData] = useState<EventData>({
    name: '',
    type: [],
    place: '',
    city: '',
    color: defaultColors[0]
  })
  
  const [tags, setTags] = useState({
    place: [] as string[],
    city: [] as string[]
  })
  const [customColor, setCustomColor] = useState('')
  const [showColorPicker, setShowColorPicker] = useState(false)

  // 从localStorage加载标签数据
  useEffect(() => {
    const savedTags = localStorage.getItem('tags')
    if (savedTags) {
      try {
        const tagsData = JSON.parse(savedTags)
        setTags({
          place: tagsData.place || [],
          city: tagsData.city || []
        })
      } catch (error) {
        console.error('Failed to load tags:', error)
      }
    }
  }, [])

  // 初始化表单数据
  useEffect(() => {
    if (event) {
      setFormData(event)
    } else {
      setFormData({
        name: '',
        type: [],
        place: '',
        city: '',
        color: defaultColors[0]
      })
    }
  }, [event])

  const handleTypeToggle = (type: string) => {
    setFormData(prev => ({
      ...prev,
      type: prev.type.includes(type)
        ? prev.type.filter(t => t !== type)
        : [...prev.type, type]
    }))
  }

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('请输入事件名称')
      return
    }
    onSave(formData)
  }

  const handleColorSelect = (color: string) => {
    setFormData(prev => ({ ...prev, color }))
    setShowColorPicker(false)
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">
            {format(date, 'yyyy年MM月dd日', { locale: zhCN })} 事件
          </h3>
          <button
            onClick={onClose}
            className="crayon-border-thin p-1 hover:bg-gray-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* 表单内容 */}
        <div className="space-y-4">
          {/* 事件名称 */}
          <div>
            <label className="block text-sm font-medium mb-1">事件名称</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full crayon-border-thin p-2"
              placeholder="输入事件名称"
            />
          </div>

          {/* 类型选择 */}
          <div>
            <label className="block text-sm font-medium mb-2">类型</label>
            <div className="flex flex-wrap gap-2">
              {defaultTypes.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleTypeToggle(type)}
                  className={`px-3 py-1 text-sm crayon-border-thin ${
                    formData.type.includes(type)
                      ? 'bg-black text-white'
                      : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* 地点选择 */}
          <div>
            <label className="block text-sm font-medium mb-1">地点</label>
            <select
              value={formData.place}
              onChange={(e) => setFormData(prev => ({ ...prev, place: e.target.value }))}
              className="w-full crayon-border-thin p-2"
            >
              <option value="">选择地点</option>
              {tags.place.map(place => (
                <option key={place} value={place}>{place}</option>
              ))}
            </select>
            <input
              type="text"
              value={formData.place}
              onChange={(e) => setFormData(prev => ({ ...prev, place: e.target.value }))}
              className="w-full crayon-border-thin p-2 mt-1"
              placeholder="或输入新地点"
            />
          </div>

          {/* 城市选择 */}
          <div>
            <label className="block text-sm font-medium mb-1">城市</label>
            <select
              value={formData.city}
              onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
              className="w-full crayon-border-thin p-2"
            >
              <option value="">选择城市</option>
              {tags.city.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
              className="w-full crayon-border-thin p-2 mt-1"
              placeholder="或输入新城市"
            />
          </div>

          {/* 颜色选择 */}
          <div>
            <label className="block text-sm font-medium mb-2">颜色</label>
            <div className="flex items-center space-x-3">
              <div 
                className="w-8 h-8 crayon-border-thin cursor-pointer"
                style={{ backgroundColor: formData.color }}
                onClick={() => setShowColorPicker(!showColorPicker)}
              />
              <span className="text-sm">{formData.color}</span>
            </div>
            
            {showColorPicker && (
              <div className="mt-2 p-3 crayon-border-thin">
                <div className="grid grid-cols-5 gap-2 mb-3">
                  {defaultColors.map(color => (
                    <button
                      key={color}
                      className="w-6 h-6 crayon-border-thin"
                      style={{ backgroundColor: color }}
                      onClick={() => handleColorSelect(color)}
                      title={color}
                    />
                  ))}
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-8 h-8"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="flex-1 crayon-border-thin p-1 text-sm"
                    placeholder="输入RGB颜色值"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-between mt-6">
          {event && (
            <button
              onClick={onDelete}
              className="crayon-border-thin px-4 py-2 text-red-600 hover:bg-red-50"
            >
              <Trash2 size={16} className="inline mr-1" />
              删除
            </button>
          )}
          
          <div className="flex space-x-2 ml-auto">
            <button
              onClick={onClose}
              className="crayon-border-thin px-4 py-2 hover:bg-gray-50"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="crayon-border px-4 py-2 bg-black text-white hover:bg-gray-800"
            >
              <Save size={16} className="inline mr-1" />
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}