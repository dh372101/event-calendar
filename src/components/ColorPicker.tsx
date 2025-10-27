'use client'

import { useState } from 'react'

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
}

const DEFAULT_COLORS = [
  '#FFB6C1', // 浅红
  '#FFE4B5', // 浅橙
  '#FFF8DC', // 浅黄
  '#F0FFF0', // 浅绿
  '#E0FFFF', // 浅青
  '#ADD8E6', // 浅蓝
  '#E6E6FA', // 浅紫
  '#FFC0CB', // 粉色
  '#F5DEB3', // 小麦色
  '#FFE4E1', // 桃色
  '#F0E68C', // 卡其色
  '#DDA0DD', // 梅红色
  '#B0E0E6', // 粉蓝色
  '#98FB98', // 浅绿色
  '#F4A460', // 沙棕色
  '#D8BFD8', // 蓟色
  '#FFDEAD', // 纳瓦霍白色
  '#F5F5DC', // 米色
  '#FFEBCD', // 古董白色
  '#FAF0E6', // 亚麻色
]

export default function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customColor, setCustomColor] = useState(value)

  const handleColorSelect = (color: string) => {
    onChange(color)
    setShowCustomInput(false)
  }

  const handleCustomColorSubmit = () => {
    if (/^#[0-9A-F]{6}$/i.test(customColor)) {
      onChange(customColor)
      setShowCustomInput(false)
    }
  }

  const isValidHexColor = (color: string): boolean => {
    return /^#[0-9A-F]{6}$/i.test(color)
  }

  return (
    <div className="form-group">
      <label className="form-label">事件颜色</label>

      {/* 预设颜色网格 */}
      <div className="color-grid">
        {DEFAULT_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            className={`color-option ${value === color ? 'selected' : ''}`}
            style={{ backgroundColor: color }}
            onClick={() => handleColorSelect(color)}
            title={color}
          />
        ))}
      </div>

      {/* 自定义颜色输入 */}
      <div className="mt-4 flex items-center gap-2">
        {!showCustomInput ? (
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => {
              setShowCustomInput(true)
              setCustomColor(value)
            }}
          >
            自定义颜色
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              placeholder="#000000"
              className={`form-input flex-1 ${isValidHexColor(customColor) ? 'border-green-500' : 'border-red-500'}`}
            />
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={handleCustomColorSubmit}
              disabled={!isValidHexColor(customColor)}
            >
              确定
            </button>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => setShowCustomInput(false)}
            >
              取消
            </button>
          </div>
        )}

        {/* 当前颜色预览 */}
        <div className="flex items-center gap-2">
          <span className="text-sm">当前:</span>
          <div
            className="w-6 h-6 border border-black rounded"
            style={{ backgroundColor: value }}
          />
        </div>
      </div>
    </div>
  )
}