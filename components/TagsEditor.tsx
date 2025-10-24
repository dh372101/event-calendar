'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Palette } from 'lucide-react'
import { TagConfig } from '@/types'
import { getStorageData, saveTags } from '@/utils/storage'

export default function TagsEditor() {
  const [tags, setTags] = useState<TagConfig>({ type: {}, place: [], city: [] })

  useEffect(() => {
    const { tags: storedTags } = getStorageData()
    setTags(storedTags)
  }, [])

  const handleTypeColorChange = (type: string, color: string) => {
    const newTags = {
      ...tags,
      type: {
        ...tags.type,
        [type]: color
      }
    }
    setTags(newTags)
    saveTags(newTags)
  }

  const handleAddPlace = (place: string) => {
    if (place && !tags.place.includes(place)) {
      const newTags = {
        ...tags,
        place: [...tags.place, place]
      }
      setTags(newTags)
      saveTags(newTags)
    }
  }

  const handleRemovePlace = (place: string) => {
    const newTags = {
      ...tags,
      place: tags.place.filter(p => p !== place)
    }
    setTags(newTags)
    saveTags(newTags)
  }

  const handleAddCity = (city: string) => {
    if (city && !tags.city.includes(city)) {
      const newTags = {
        ...tags,
        city: [...tags.city, city]
      }
      setTags(newTags)
      saveTags(newTags)
    }
  }

  const handleRemoveCity = (city: string) => {
    const newTags = {
      ...tags,
      city: tags.city.filter(c => c !== city)
    }
    setTags(newTags)
    saveTags(newTags)
  }

  const typeOptions = Object.keys(tags.type || {})

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">标签编辑</h2>

      {/* 类型标签编辑 */}
      <div className="crayon-border p-4">
        <h3 className="text-lg font-semibold mb-4">类型标签</h3>
        <p className="text-sm text-gray-600 mb-4">类型标签固定为四种，不可增减，仅可修改颜色</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {typeOptions.map(type => (
            <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: tags.type[type] }}
                />
                <span className="font-medium">{type}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={tags.type[type]}
                  onChange={(e) => handleTypeColorChange(type, e.target.value)}
                  className="w-8 h-8 rounded border-2 border-gray-300 cursor-pointer"
                />
                <span className="text-sm text-gray-600">{tags.type[type]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 地点标签编辑 */}
      <div className="crayon-border p-4">
        <h3 className="text-lg font-semibold mb-4">地点标签</h3>
        
        {/* 添加新地点 */}
        <div className="flex space-x-2 mb-4">
          <input
            type="text"
            placeholder="输入新地点"
            className="crayon-input flex-1"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddPlace((e.target as HTMLInputElement).value)
                ;(e.target as HTMLInputElement).value = ''
              }
            }}
          />
          <button
            onClick={() => {
              const input = document.querySelector('input[placeholder="输入新地点"]') as HTMLInputElement
              if (input) {
                handleAddPlace(input.value)
                input.value = ''
              }
            }}
            className="crayon-button flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>添加</span>
          </button>
        </div>

        {/* 地点列表 */}
        <div className="space-y-2">
          {tags.place.map(place => (
            <div key={place} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span>{place}</span>
              <button
                onClick={() => handleRemovePlace(place)}
                className="crayon-button p-2 text-red-600 border-red-300"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          
          {tags.place.length === 0 && (
            <p className="text-center text-gray-500 py-4">暂无地点标签</p>
          )}
        </div>
      </div>

      {/* 城市标签编辑 */}
      <div className="crayon-border p-4">
        <h3 className="text-lg font-semibold mb-4">城市标签</h3>
        
        {/* 添加新城市 */}
        <div className="flex space-x-2 mb-4">
          <input
            type="text"
            placeholder="输入新城市"
            className="crayon-input flex-1"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddCity((e.target as HTMLInputElement).value)
                ;(e.target as HTMLInputElement).value = ''
              }
            }}
          />
          <button
            onClick={() => {
              const input = document.querySelector('input[placeholder="输入新城市"]') as HTMLInputElement
              if (input) {
                handleAddCity(input.value)
                input.value = ''
              }
            }}
            className="crayon-button flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>添加</span>
          </button>
        </div>

        {/* 城市列表 */}
        <div className="space-y-2">
          {tags.city.map(city => (
            <div key={city} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span>{city}</span>
              <button
                onClick={() => handleRemoveCity(city)}
                className="crayon-button p-2 text-red-600 border-red-300"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          
          {tags.city.length === 0 && (
            <p className="text-center text-gray-500 py-4">暂无城市标签</p>
          )}
        </div>
      </div>

      {/* 颜色说明 */}
      <div className="crayon-border p-4 bg-blue-50">
        <h3 className="text-lg font-semibold mb-2">使用说明</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• 类型标签：用于分类事件，在日历中显示为彩色小点</li>
          <li>• 地点标签：常用地点列表，方便快速选择</li>
          <li>• 城市标签：常用城市列表，方便快速选择</li>
          <li>• 修改会立即生效并保存到本地存储</li>
        </ul>
      </div>
    </div>
  )
}