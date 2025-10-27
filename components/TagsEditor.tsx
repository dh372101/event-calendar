'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Save } from 'lucide-react'
import { TagData } from '@/types/event'

const defaultTypes = ['Live', '干饭', '旅行', '运动']
const defaultPlaces = ['梅赛德斯奔驰文化中心', '静安体育中心']
const defaultCities = ['上海', '东京', '大阪']

export default function TagsEditor() {
  const [tags, setTags] = useState<TagData>({
    type: {},
    place: [],
    city: []
  })
  
  const [newPlace, setNewPlace] = useState('')
  const [newCity, setNewCity] = useState('')

  // 从localStorage加载标签数据
  useEffect(() => {
    const savedTags = localStorage.getItem('tags')
    if (savedTags) {
      try {
        const tagsData = JSON.parse(savedTags)
        setTags({
          type: tagsData.type || {},
          place: tagsData.place || defaultPlaces,
          city: tagsData.city || defaultCities
        })
      } catch (error) {
        console.error('Failed to load tags:', error)
      }
    } else {
      // 初始化默认标签
      const defaultTypeColors = {
        'Live': '#FF6B6B',
        '干饭': '#4ECDC4', 
        '旅行': '#45B7D1',
        '运动': '#96CEB4'
      }
      
      setTags({
        type: defaultTypeColors,
        place: defaultPlaces,
        city: defaultCities
      })
    }
  }, [])

  // 保存标签数据到localStorage
  useEffect(() => {
    localStorage.setItem('tags', JSON.stringify(tags))
  }, [tags])

  const handleTypeColorChange = (type: string, color: string) => {
    setTags(prev => ({
      ...prev,
      type: {
        ...prev.type,
        [type]: color
      }
    }))
  }

  const handleAddPlace = () => {
    if (newPlace.trim() && !tags.place.includes(newPlace.trim())) {
      setTags(prev => ({
        ...prev,
        place: [...prev.place, newPlace.trim()]
      }))
      setNewPlace('')
    }
  }

  const handleRemovePlace = (place: string) => {
    setTags(prev => ({
      ...prev,
      place: prev.place.filter(p => p !== place)
    }))
  }

  const handleAddCity = () => {
    if (newCity.trim() && !tags.city.includes(newCity.trim())) {
      setTags(prev => ({
        ...prev,
        city: [...prev.city, newCity.trim()]
      }))
      setNewCity('')
    }
  }

  const handleRemoveCity = (city: string) => {
    setTags(prev => ({
      ...prev,
      city: prev.city.filter(c => c !== city)
    }))
  }

  const handleResetToDefault = () => {
    const defaultTypeColors = {
      'Live': '#FF6B6B',
      '干饭': '#4ECDC4', 
      '旅行': '#45B7D1',
      '运动': '#96CEB4'
    }
    
    setTags({
      type: defaultTypeColors,
      place: defaultPlaces,
      city: defaultCities
    })
  }

  return (
    <div className="space-y-6">
      <div className="crayon-border p-4 bg-white">
        <h2 className="text-xl font-bold mb-4">标签编辑</h2>
        
        {/* 类型标签编辑 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">类型标签</h3>
          <p className="text-sm text-gray-600 mb-4">类型标签固定为四种，仅可修改颜色</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {defaultTypes.map(type => (
              <div key={type} className="crayon-border-thin p-3">
                <div className="flex items-center space-x-3 mb-2">
                  <div 
                    className="w-6 h-6 crayon-border-thin"
                    style={{ backgroundColor: tags.type[type] || '#666666' }}
                  />
                  <span className="font-medium">{type}</span>
                </div>
                
                <input
                  type="color"
                  value={tags.type[type] || '#666666'}
                  onChange={(e) => handleTypeColorChange(type, e.target.value)}
                  className="w-full h-8"
                />
                <input
                  type="text"
                  value={tags.type[type] || '#666666'}
                  onChange={(e) => handleTypeColorChange(type, e.target.value)}
                  className="w-full crayon-border-thin p-1 text-xs mt-1"
                  placeholder="颜色值"
                />
              </div>
            ))}
          </div>
        </div>

        {/* 地点标签编辑 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">地点标签</h3>
          
          <div className="flex space-x-2 mb-3">
            <input
              type="text"
              value={newPlace}
              onChange={(e) => setNewPlace(e.target.value)}
              className="flex-1 crayon-border-thin p-2"
              placeholder="输入新地点"
              onKeyPress={(e) => e.key === 'Enter' && handleAddPlace()}
            />
            <button
              onClick={handleAddPlace}
              className="crayon-border-thin px-4 py-2 bg-white hover:bg-gray-50"
            >
              <Plus size={16} />
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {tags.place.map(place => (
              <div key={place} className="flex items-center crayon-border-thin px-3 py-1">
                <span>{place}</span>
                <button
                  onClick={() => handleRemovePlace(place)}
                  className="ml-2 text-red-600 hover:text-red-800"
                  title="删除"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 城市标签编辑 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">城市标签</h3>
          
          <div className="flex space-x-2 mb-3">
            <input
              type="text"
              value={newCity}
              onChange={(e) => setNewCity(e.target.value)}
              className="flex-1 crayon-border-thin p-2"
              placeholder="输入新城市"
              onKeyPress={(e) => e.key === 'Enter' && handleAddCity()}
            />
            <button
              onClick={handleAddCity}
              className="crayon-border-thin px-4 py-2 bg-white hover:bg-gray-50"
            >
              <Plus size={16} />
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {tags.city.map(city => (
              <div key={city} className="flex items-center crayon-border-thin px-3 py-1">
                <span>{city}</span>
                <button
                  onClick={() => handleRemoveCity(city)}
                  className="ml-2 text-red-600 hover:text-red-800"
                  title="删除"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 重置按钮 */}
        <div className="flex justify-end">
          <button
            onClick={handleResetToDefault}
            className="crayon-border-thin px-4 py-2 text-gray-600 hover:bg-gray-50"
          >
            重置为默认值
          </button>
        </div>
      </div>
    </div>
  )
}