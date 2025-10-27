'use client'

import { useState, useEffect } from 'react'
import { storage } from '@/lib/storage'
import { Tags } from '@/types'
import ColorPicker from '@/components/ColorPicker'

export default function TagsPage() {
  const [tags, setTags] = useState<Tags>({
    types: {},
    locations: [],
    cities: []
  })
  const [newLocation, setNewLocation] = useState('')
  const [newCity, setNewCity] = useState('')

  useEffect(() => {
    loadTags()
  }, [])

  const loadTags = () => {
    const loadedTags = storage.getTags()
    setTags(loadedTags)
  }

  const updateTypeColor = (type: string, color: string) => {
    storage.updateTypeColor(type, color)
    loadTags()
  }

  const addLocation = () => {
    if (newLocation.trim() && !tags.locations.includes(newLocation.trim())) {
      storage.addLocation(newLocation.trim())
      setNewLocation('')
      loadTags()
    }
  }

  const removeLocation = (location: string) => {
    storage.removeLocation(location)
    loadTags()
  }

  const addCity = () => {
    if (newCity.trim() && !tags.cities.includes(newCity.trim())) {
      storage.addCity(newCity.trim())
      setNewCity('')
      loadTags()
    }
  }

  const removeCity = (city: string) => {
    storage.removeCity(city)
    loadTags()
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">标签编辑</h1>
        <p className="text-gray-600">管理事件类型、地点和城市的预设配置</p>
      </div>

      {/* 事件类型颜色配置 */}
      <div className="event-details crayon-border">
        <h2 className="text-lg font-bold mb-4">事件类型颜色</h2>
        <div className="space-y-4">
          {Object.entries(tags.types).map(([type, color]) => (
            <div key={type} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 border border-black rounded"
                    style={{ backgroundColor: color }}
                  />
                  <span className="font-medium">{type}</span>
                </div>
                <p className="text-sm text-gray-600">
                  此颜色将用于日历中该类型的事件点标记
                </p>
              </div>
              <div className="w-80">
                <ColorPicker
                  value={color}
                  onChange={(newColor) => updateTypeColor(type, newColor)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 地点管理 */}
      <div className="event-details crayon-border">
        <h2 className="text-lg font-bold mb-4">地点管理</h2>

        <div className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              className="form-input flex-1"
              placeholder="输入新地点名称"
              onKeyPress={(e) => e.key === 'Enter' && addLocation()}
            />
            <button
              onClick={addLocation}
              className="btn btn-primary"
              disabled={!newLocation.trim() || tags.locations.includes(newLocation.trim())}
            >
              添加
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {tags.locations.map(location => (
            <div key={location} className="flex items-center justify-between p-2 border border-black rounded">
              <span>{location}</span>
              <button
                onClick={() => removeLocation(location)}
                className="btn btn-danger btn-sm"
              >
                删除
              </button>
            </div>
          ))}
        </div>

        {tags.locations.length === 0 && (
          <p className="text-center text-gray-500 py-4">
            暂无预设地点，请添加常用地点
          </p>
        )}
      </div>

      {/* 城市管理 */}
      <div className="event-details crayon-border">
        <h2 className="text-lg font-bold mb-4">城市管理</h2>

        <div className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newCity}
              onChange={(e) => setNewCity(e.target.value)}
              className="form-input flex-1"
              placeholder="输入新城市名称"
              onKeyPress={(e) => e.key === 'Enter' && addCity()}
            />
            <button
              onClick={addCity}
              className="btn btn-primary"
              disabled={!newCity.trim() || tags.cities.includes(newCity.trim())}
            >
              添加
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {tags.cities.map(city => (
            <div key={city} className="flex items-center justify-between p-2 border border-black rounded">
              <span>{city}</span>
              <button
                onClick={() => removeCity(city)}
                className="btn btn-danger btn-sm"
              >
                删除
              </button>
            </div>
          ))}
        </div>

        {tags.cities.length === 0 && (
          <p className="text-center text-gray-500 py-4">
            暂无预设城市，请添加常用城市
          </p>
        )}
      </div>

      {/* 说明信息 */}
      <div className="bg-gray-50 border border-black rounded-lg p-4">
        <h3 className="font-bold mb-2">使用说明</h3>
        <ul className="text-sm space-y-1 list-disc list-inside text-gray-700">
          <li>事件类型固定为4种，不能增删，只能修改颜色</li>
          <li>地点和城市可以自由添加和删除</li>
          <li>修改标签后，之前创建的事件不会自动更新</li>
          <li>在编辑事件时，手动输入的新地点和城市会自动添加到预设列表</li>
        </ul>
      </div>
    </div>
  )
}