'use client';

import { useState, useEffect } from 'react';
import { StorageUtil } from '@/utils/storage';
import { TagConfig, EventType, DEFAULT_TAGS } from '@/types';

export default function TagsEditor() {
  const [tags, setTags] = useState<TagConfig>(DEFAULT_TAGS);
  const [newPlace, setNewPlace] = useState('');
  const [newCity, setNewCity] = useState('');

  // 加载标签配置
  useEffect(() => {
    const loadedTags = StorageUtil.getTags();
    setTags(loadedTags);
  }, []);

  // 保存标签配置
  const saveTags = (newTags: TagConfig) => {
    setTags(newTags);
    StorageUtil.saveTags(newTags);
  };

  // 处理类型颜色更改
  const handleTypeColorChange = (type: EventType, color: string) => {
    const newTags = {
      ...tags,
      type: {
        ...tags.type,
        [type]: color,
      },
    };
    saveTags(newTags);
  };

  // 添加地点
  const handleAddPlace = () => {
    if (newPlace.trim() && !tags.place.includes(newPlace.trim())) {
      const newTags = {
        ...tags,
        place: [...tags.place, newPlace.trim()],
      };
      saveTags(newTags);
      setNewPlace('');
    }
  };

  // 删除地点
  const handleDeletePlace = (place: string) => {
    const newTags = {
      ...tags,
      place: tags.place.filter(p => p !== place),
    };
    saveTags(newTags);
  };

  // 添加城市
  const handleAddCity = () => {
    if (newCity.trim() && !tags.city.includes(newCity.trim())) {
      const newTags = {
        ...tags,
        city: [...tags.city, newCity.trim()],
      };
      saveTags(newTags);
      setNewCity('');
    }
  };

  // 删除城市
  const handleDeleteCity = (city: string) => {
    const newTags = {
      ...tags,
      city: tags.city.filter(c => c !== city),
    };
    saveTags(newTags);
  };

  const EVENT_TYPES: EventType[] = ['Live', '干饭', '旅行', '运动'];

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">标签编辑</h1>
        <p className="text-gray-600">
          管理事件类型颜色、地点和城市标签
        </p>
      </div>

      {/* 事件类型颜色 */}
      <div className="bg-white rounded-lg crayon-border p-6">
        <h2 className="text-xl font-bold mb-4">事件类型颜色</h2>
        <p className="text-sm text-gray-600 mb-4">
          类型标签固定为四种，仅可修改颜色
        </p>

        <div className="space-y-4">
          {EVENT_TYPES.map((type) => (
            <div key={type} className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: tags.type[type] }}
                />
                <span className="font-medium">{type}</span>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={tags.type[type]}
                  onChange={(e) => handleTypeColorChange(type, e.target.value)}
                  className="w-12 h-8 border-2 border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={tags.type[type]}
                  onChange={(e) => handleTypeColorChange(type, e.target.value)}
                  className="input w-24 text-sm"
                  placeholder="#000000"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 地点标签 */}
      <div className="bg-white rounded-lg crayon-border p-6">
        <h2 className="text-xl font-bold mb-4">地点标签</h2>

        {/* 添加新地点 */}
        <div className="flex space-x-2 mb-4">
          <input
            type="text"
            value={newPlace}
            onChange={(e) => setNewPlace(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddPlace()}
            className="input flex-1"
            placeholder="输入新地点名称"
          />
          <button
            onClick={handleAddPlace}
            className="btn"
            disabled={!newPlace.trim()}
          >
            添加
          </button>
        </div>

        {/* 地点列表 */}
        <div className="space-y-2">
          {tags.place.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              暂无地点标签，请添加新地点
            </p>
          ) : (
            tags.place.map((place) => (
              <div
                key={place}
                className="flex items-center justify-between p-3 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                <span>📍 {place}</span>
                <button
                  onClick={() => handleDeletePlace(place)}
                  className="text-sm px-3 py-1 border border-red-300 text-red-600 rounded hover:bg-red-50"
                >
                  删除
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 城市标签 */}
      <div className="bg-white rounded-lg crayon-border p-6">
        <h2 className="text-xl font-bold mb-4">城市标签</h2>

        {/* 添加新城市 */}
        <div className="flex space-x-2 mb-4">
          <input
            type="text"
            value={newCity}
            onChange={(e) => setNewCity(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddCity()}
            className="input flex-1"
            placeholder="输入新城市名称"
          />
          <button
            onClick={handleAddCity}
            className="btn"
            disabled={!newCity.trim()}
          >
            添加
          </button>
        </div>

        {/* 城市列表 */}
        <div className="space-y-2">
          {tags.city.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              暂无城市标签，请添加新城市
            </p>
          ) : (
            tags.city.map((city) => (
              <div
                key={city}
                className="flex items-center justify-between p-3 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                <span>🏙️ {city}</span>
                <button
                  onClick={() => handleDeleteCity(city)}
                  className="text-sm px-3 py-1 border border-red-300 text-red-600 rounded hover:bg-red-50"
                >
                  删除
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 重置按钮 */}
      <div className="bg-white rounded-lg crayon-border p-6">
        <h2 className="text-xl font-bold mb-4">重置标签</h2>
        <p className="text-sm text-gray-600 mb-4">
          将所有标签恢复为默认设置
        </p>
        <button
          onClick={() => {
            if (confirm('确定要重置所有标签为默认设置吗？此操作不可撤销。')) {
              saveTags(DEFAULT_TAGS);
            }
          }}
          className="btn bg-red-600 text-white hover:bg-red-700 border-red-600"
        >
          重置为默认设置
        </button>
      </div>
    </div>
  );
}