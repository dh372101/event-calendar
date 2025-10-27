'use client'

import { useState, useEffect } from 'react'
import { storage } from '@/lib/storage'
import { Settings } from '@/types'

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({ font: 'system-ui', version: '1.0.0' })
  const [availableFonts, setAvailableFonts] = useState<string[]>([])
  const [customFont, setCustomFont] = useState('')
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [dataStats, setDataStats] = useState({
    events: 0,
    tags: { types: 0, locations: 0, cities: 0 },
  })

  useEffect(() => {
    loadSettings()
    loadAvailableFonts()
    loadDataStats()
  }, [])

  const loadSettings = () => {
    const loadedSettings = storage.getSettings()
    setSettings(loadedSettings)
  }

  const loadAvailableFonts = () => {
    // 模拟检测可用字体（实际项目中可以从fonts文件夹读取）
    const fonts = [
      'system-ui',
      'Arial',
      'Helvetica',
      'Times New Roman',
      'Georgia',
      'Courier New',
      'Verdana',
      'Comic Sans MS',
      'Impact',
      'Trebuchet MS',
    ]
    setAvailableFonts(fonts)
  }

  const loadDataStats = () => {
    const events = storage.getEvents()
    const tags = storage.getTags()

    setDataStats({
      events: events.length,
      tags: {
        types: Object.keys(tags.types).length,
        locations: tags.locations.length,
        cities: tags.cities.length,
      },
    })
  }

  const handleFontChange = (font: string) => {
    storage.updateFont(font)
    setSettings(prev => ({ ...prev, font }))

    // 立即应用字体到页面
    document.documentElement.style.setProperty('--user-font', font)
  }

  const handleCustomFontAdd = () => {
    if (customFont.trim() && !availableFonts.includes(customFont.trim())) {
      const newFont = customFont.trim()
      setAvailableFonts(prev => [...prev, newFont])
      handleFontChange(newFont)
      setCustomFont('')
      alert('字体已添加并应用')
    }
  }

  const handleClearAllData = () => {
    storage.clearAll()
    loadSettings()
    loadDataStats()
    setShowClearConfirm(false)
    alert('所有数据已清除')
  }

  const exportAllData = () => {
    const allData = {
      settings: storage.getSettings(),
      tags: storage.getTags(),
      events: storage.getEvents(),
      exportDate: new Date().toISOString(),
      version: '1.0.0',
    }

    const json = JSON.stringify(allData, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `calendar-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const previewFont = (font: string) => {
    return {
      fontFamily: font,
      padding: '12px',
      border: '2px solid var(--primary-color)',
      borderRadius: '8px',
      backgroundColor: 'var(--background-color)',
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">设置</h1>
        <p className="text-gray-600">字体选择、数据管理和版本信息</p>
      </div>

      {/* 字体设置 */}
      <div className="event-details crayon-border">
        <h2 className="text-lg font-bold mb-4">字体设置</h2>

        <div className="space-y-4">
          <div>
            <label className="form-label">选择字体</label>
            <select
              value={settings.font}
              onChange={(e) => handleFontChange(e.target.value)}
              className="form-select"
            >
              {availableFonts.map(font => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">自定义字体</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customFont}
                onChange={(e) => setCustomFont(e.target.value)}
                placeholder="输入字体名称（如：Microsoft YaHei）"
                className="form-input flex-1"
              />
              <button
                onClick={handleCustomFontAdd}
                disabled={!customFont.trim() || availableFonts.includes(customFont.trim())}
                className="btn btn-primary"
              >
                添加
              </button>
            </div>
          </div>

          {/* 字体预览 */}
          <div>
            <label className="form-label">字体预览</label>
            <div style={previewFont(settings.font)}>
              <p className="text-lg font-bold">演出日历字体预览</p>
              <p className="text-sm">这是使用当前字体的显示效果</p>
              <p className="text-xs">1234567890 ABCDEFGHIJKLMNOPQRSTUVWXYZ</p>
            </div>
          </div>
        </div>
      </div>

      {/* 数据管理 */}
      <div className="event-details crayon-border">
        <h2 className="text-lg font-bold mb-4">数据管理</h2>

        {/* 数据统计 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-50 border border-black rounded">
            <div className="text-2xl font-bold">{dataStats.events}</div>
            <div className="text-sm text-gray-600">事件数量</div>
          </div>
          <div className="text-center p-4 bg-gray-50 border border-black rounded">
            <div className="text-2xl font-bold">{dataStats.tags.types}</div>
            <div className="text-sm text-gray-600">事件类型</div>
          </div>
          <div className="text-center p-4 bg-gray-50 border border-black rounded">
            <div className="text-2xl font-bold">{dataStats.tags.locations}</div>
            <div className="text-sm text-gray-600">预设地点</div>
          </div>
          <div className="text-center p-4 bg-gray-50 border border-black rounded">
            <div className="text-2xl font-bold">{dataStats.tags.cities}</div>
            <div className="text-sm text-gray-600">预设城市</div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={exportAllData}
            className="btn"
          >
            导出全部数据（备份）
          </button>

          <button
            onClick={() => setShowClearConfirm(true)}
            className="btn btn-danger"
          >
            清除所有数据
          </button>
        </div>
      </div>

      {/* 版本信息 */}
      <div className="event-details crayon-border">
        <h2 className="text-lg font-bold mb-4">版本信息</h2>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="font-medium">应用版本：</span>
            <span>{settings.version}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">构建时间：</span>
            <span>{new Date().toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">技术栈：</span>
            <span>Next.js + TypeScript + Tailwind CSS</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">数据存储：</span>
            <span>浏览器本地存储</span>
          </div>
        </div>
      </div>

      {/* 清除数据确认模态框 */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white border-2 border-black rounded-lg p-6 max-w-md">
            <h3 className="font-bold text-lg mb-4">确认清除所有数据</h3>

            <div className="space-y-2 mb-6">
              <p className="text-red-600">⚠️ 此操作将清除以下所有数据：</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>所有事件记录（{dataStats.events} 个）</li>
                <li>标签配置（类型、地点、城市）</li>
                <li>字体设置</li>
                <li>其他用户配置</li>
              </ul>
              <p className="text-sm text-gray-600">此操作不可撤销，请确认后继续。</p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="btn"
              >
                取消
              </button>
              <button
                onClick={handleClearAllData}
                className="btn btn-danger"
              >
                确认清除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 使用说明 */}
      <div className="bg-gray-50 border border-black rounded-lg p-4">
        <h3 className="font-bold mb-2">使用说明</h3>
        <ul className="text-sm space-y-1 list-disc list-inside text-gray-700">
          <li>字体设置会立即应用到整个应用</li>
          <li>建议定期导出数据作为备份</li>
          <li>清除数据前请确保已备份重要信息</li>
          <li>所有数据都存储在浏览器本地，清除浏览器数据会丢失所有信息</li>
        </ul>
      </div>
    </div>
  )
}