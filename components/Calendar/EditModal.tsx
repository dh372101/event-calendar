'use client';

import { useState, useEffect } from 'react';
import { DateUtil } from '@/utils/date';
import { StorageUtil } from '@/utils/storage';
import { Event, EventType, DEFAULT_TAGS } from '@/types';

interface EditModalProps {
  date: string;
  onClose: () => void;
}

const EVENT_TYPES: EventType[] = ['Live', '干饭', '旅行', '运动'];

const DEFAULT_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFA07A',
  '#98D8C8', '#6C5CE7', '#FDA7DF', '#F7DC6F', '#82E0AA',
  '#85C1E2', '#F8B739', '#EC7063', '#AF7AC5', '#5DADE2',
  '#48C9B0', '#F5B7B1', '#A9DFBF', '#F9E79F', '#D7BDE2',
];

export default function EditModal({ date, onClose }: EditModalProps) {
  const [event, setEvent] = useState<Event | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    type: [] as EventType[],
    name: '',
    place: '',
    city: '',
    color: '#FF6B6B',
  });
  const [showAdvancedColor, setShowAdvancedColor] = useState(false);

  // 加载现有事件数据
  useEffect(() => {
    const existingEvent = StorageUtil.getEvent(date);
    if (existingEvent) {
      setEvent(existingEvent);
      setFormData({
        type: existingEvent.type,
        name: existingEvent.name,
        place: existingEvent.place,
        city: existingEvent.city,
        color: existingEvent.color,
      });
      setIsEditing(true);
    }
  }, [date]);

  // 处理表单提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('请输入事件名称');
      return;
    }

    const eventData: Event = {
      date,
      type: formData.type,
      name: formData.name.trim(),
      place: formData.place.trim(),
      city: formData.city.trim(),
      color: formData.color,
    };

    StorageUtil.saveEvent(date, eventData);
    onClose();
  };

  // 处理删除
  const handleDelete = () => {
    if (confirm('确定要删除这个事件吗？')) {
      StorageUtil.deleteEvent(date);
      onClose();
    }
  };

  // 处理类型选择
  const handleTypeChange = (type: EventType) => {
    setFormData(prev => ({
      ...prev,
      type: prev.type.includes(type)
        ? prev.type.filter(t => t !== type)
        : [...prev.type, type]
    }));
  };

  // 获取标签选项
  const tags = StorageUtil.getTags();

  // 处理颜色选择
  const handleColorChange = (color: string) => {
    setFormData(prev => ({ ...prev, color }));
  };

  const { year, month, day } = DateUtil.parseDate(date)!;
  const formattedDate = `${year}年${month + 1}月${day}日`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg crayon-border p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">
            {isEditing ? '编辑事件' : '添加事件'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100"
            aria-label="关闭"
          >
            ✕
          </button>
        </div>

        <div className="mb-4 text-sm text-gray-600">
          {formattedDate}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 事件类型 */}
          <div>
            <label className="block text-sm font-medium mb-2">类型</label>
            <div className="flex flex-wrap gap-2">
              {EVENT_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleTypeChange(type)}
                  className={`px-3 py-1 rounded-full border-2 text-sm transition-colors ${
                    formData.type.includes(type)
                      ? 'border-black bg-black text-white'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <span
                    className="inline-block w-2 h-2 rounded-full mr-1"
                    style={{ backgroundColor: tags.type[type] }}
                  />
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* 事件名称 */}
          <div>
            <label className="block text-sm font-medium mb-2">名称</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="input"
              placeholder="演出名称"
              required
            />
          </div>

          {/* 地点 */}
          <div>
            <label className="block text-sm font-medium mb-2">地点</label>
            <input
              type="text"
              value={formData.place}
              onChange={(e) => setFormData(prev => ({ ...prev, place: e.target.value }))}
              className="input"
              placeholder="演出地点"
              list="places"
            />
            <datalist id="places">
              {tags.place.map((place) => (
                <option key={place} value={place} />
              ))}
            </datalist>
          </div>

          {/* 城市 */}
          <div>
            <label className="block text-sm font-medium mb-2">城市</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
              className="input"
              placeholder="城市"
              list="cities"
            />
            <datalist id="cities">
              {tags.city.map((city) => (
                <option key={city} value={city} />
              ))}
            </datalist>
          </div>

          {/* 颜色选择 */}
          <div>
            <label className="block text-sm font-medium mb-2">颜色</label>
            <div className="space-y-2">
              {/* 预设颜色 */}
              <div className="grid grid-cols-5 gap-2">
                {DEFAULT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleColorChange(color)}
                    className={`w-12 h-12 rounded-lg border-2 crayon-texture ${
                      formData.color === color ? 'border-black' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={`选择颜色 ${color}`}
                  />
                ))}
              </div>

              {/* 高级模式 */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="advanced-color"
                  checked={showAdvancedColor}
                  onChange={(e) => setShowAdvancedColor(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="advanced-color" className="text-sm">
                  自定义颜色
                </label>
              </div>

              {showAdvancedColor && (
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="w-full h-10"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="input w-24"
                    placeholder="#000000"
                  />
                </div>
              )}
            </div>
          </div>

          {/* 按钮组 */}
          <div className="flex space-x-2 pt-4">
            <button
              type="submit"
              className="flex-1 btn bg-black text-white hover:bg-gray-800"
            >
              {isEditing ? '更新' : '保存'}
            </button>

            {isEditing && (
              <button
                type="button"
                onClick={handleDelete}
                className="btn bg-red-600 text-white hover:bg-red-700 border-red-600"
              >
                删除
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="btn"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}