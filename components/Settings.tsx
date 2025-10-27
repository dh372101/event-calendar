'use client'

import { useState, useEffect } from 'react'
import { Trash2, AlertTriangle } from 'lucide-react'
import { SettingsData } from '@/types/event'

const availableFonts = [
  { id: 'system', name: '系统默认字体' },
  { id: 'crayon', name: '手绘蜡笔字体' },
  { id: 'comic', name: '漫画字体' },
  { id: 'handwriting', name: '手写字体' }
]

export default function Settings() {
  const [settings, setSettings] = useState<SettingsData>({
    font: 'system',
    menuCollapsed: false,
    version: '1.0.0'
  })
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  // 从localStorage加载设置
  useEffect(() => {
    const savedSettings = localStorage.getItem('settings')
    if (savedSettings) {
      try {
        const settingsData = JSON.parse(savedSettings)
        setSettings(prev => ({
          ...prev,
          ...settingsData,
          version: '1.0.0' // 保持版本号不变
        }))
      } catch (error) {
        console.error('Failed to load settings:', error)
      }
    }
  }, [])

  // 保存设置到localStorage
  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings))
  }, [settings])

  const handleFontChange = (fontId: string) => {
    setSettings(prev => ({ ...prev, font: fontId }))
    
    // 应用字体到页面
    document.body.style.fontFamily = fontId === 'system' ? '' : fontId
  }

  const handleClearData = () => {
    // 清除所有数据
    localStorage.removeItem('events')
    localStorage.removeItem('tags')
    localStorage.removeItem('settings')
    
    // 重置设置
    setSettings({
      font: 'system',
      menuCollapsed: false,
      version: '1.0.0'
    })
    
    setShowClearConfirm(false)
    
    // 刷新页面以应用更改
    window.location.reload()
  }

  const getFontPreviewStyle = (fontId: string) => {
    switch (fontId) {
      case 'crayon':
        return { fontFamily: 'Crayon, cursive', fontWeight: 'bold' }
      case 'comic':
        return { fontFamily: '"Comic Sans MS", cursive', fontWeight: 'bold' }
      case 'handwriting':
        return { fontFamily: '"Brush Script MT", cursive' }
      default:
        return { fontFamily: 'inherit' }
    }
  }

  return (
    <div className="space-y-6">
      {/* 字体设置 */}
      <div className="crayon-border p-4 bg-white">
        <h2 className="text-xl font-bold mb-4">字体设置</h2>
        
        <div className="space-y-4">
          {availableFonts.map(font => (
            <label key={font.id} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="font"
                value={font.id}
                checked={settings.font === font.id}
                onChange={(e) => handleFontChange(e.target.value)}
                className="w-4 h-4"
              />
              <div className="flex-1">
                <div 
                  className="text-lg"
                  style={getFontPreviewStyle(font.id)}
                >
                  {font.name}
                </div>
                <div 
                  className="text-sm text-gray-600"
                  style={getFontPreviewStyle(font.id)}
                >
                  这是一段预览文字，用于展示字体效果
                </div>
              </div>
            </label>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-yellow-50 crayon-border-thin">
          <p className="text-sm text-yellow-800">
            <strong>注意：</strong> 手绘蜡笔字体需要安装相应的字体文件才能正常显示。
            请确保字体文件已放置在 <code>/fonts</code> 文件夹中。
          </p>
        </div>
      </div>

      {/* 数据管理 */}
      <div className="crayon-border p-4 bg-white">
        <h2 className="text-xl font-bold mb-4">数据管理</h2>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold">清除所有数据</h3>
              <p className="text-sm text-gray-600">
                这将删除所有事件、标签和设置，恢复为初始状态
              </p>
            </div>
            <button
              onClick={() => setShowClearConfirm(true)}
              className="crayon-border-thin px-4 py-2 text-red-600 hover:bg-red-50"
            >
              <Trash2 size={16} className="inline mr-1" />
              清除数据
            </button>
          </div>
        </div>

        {/* 确认对话框 */}
        {showClearConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white crayon-border p-6 max-w-md mx-4">
              <div className="flex items-center space-x-2 mb-4">
                <AlertTriangle className="text-red-600" size={24} />
                <h3 className="text-lg font-bold">确认清除数据</h3>
              </div>
              
              <p className="text-gray-700 mb-4">
                此操作将删除所有事件、标签和设置数据，且无法恢复。
                您确定要继续吗？
              </p>
              
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="crayon-border-thin px-4 py-2 hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={handleClearData}
                  className="crayon-border px-4 py-2 bg-red-600 text-white hover:bg-red-700"
                >
                  确认清除
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 系统信息 */}
      <div className="crayon-border p-4 bg-white">
        <h2 className="text-xl font-bold mb-4">系统信息</h2>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">版本号</span>
            <span className="font-mono">v{settings.version}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">当前字体</span>
            <span>{availableFonts.find(f => f.id === settings.font)?.name}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">事件数量</span>
            <span>
              {(() => {
                try {
                  const events = localStorage.getItem('events')
                  return events ? Object.keys(JSON.parse(events)).length : 0
                } catch {
                  return 0
                }
              })()} 个事件
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">标签数量</span>
            <span>
              {(() => {
                try {
                  const tags = localStorage.getItem('tags')
                  if (!tags) return '0 个标签'
                  const tagsData = JSON.parse(tags)
                  return `${Object.keys(tagsData.type || {}).length} 类型 / ${(tagsData.place || []).length} 地点 / ${(tagsData.city || []).length} 城市`
                } catch {
                  return '0 个标签'
                }
              })()}
            </span>
          </div>
        </div>
      </div>

      {/* 使用说明 */}
      <div className="crayon-border p-4 bg-white">
        <h2 className="text-xl font-bold mb-4">使用说明</h2>
        
        <div className="space-y-3 text-sm text-gray-700">
          <div>
            <strong>日历模块：</strong> 点击日期可以添加或编辑事件。日期右上角显示事件类型的小圆点。
          </div>
          
          <div>
            <strong>标签编辑：</strong> 类型标签固定为四种，可修改颜色。地点和城市标签可自由添加删除。
          </div>
          
          <div>
            <strong>数据导出：</strong> 支持导出为图片(CSV/JSON格式)，也可从文件导入数据。
          </div>
          
          <div>
            <strong>数据存储：</strong> 所有数据存储在浏览器本地，请定期备份重要数据。
          </div>
        </div>
      </div>
    </div>
  )
}