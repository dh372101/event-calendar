'use client'

import { useState, useEffect } from 'react'
import { Trash2, Download } from 'lucide-react'
import { clearAllData, getStorageData } from '@/utils/storage'

export default function Settings() {
  const [font, setFont] = useState('system')
  const [fonts, setFonts] = useState<string[]>([])
  const [version] = useState('v1.0.0')

  useEffect(() => {
    // 加载字体列表（模拟从/fonts文件夹读取）
    const availableFonts = [
      'system',
      'Arial',
      'Helvetica',
      'Georgia',
      'Times New Roman',
      'Comic Sans MS',
      'Courier New'
    ]
    setFonts(availableFonts)
    
    // 从localStorage加载用户设置的字体
    const { settings } = getStorageData()
    if (settings.font) {
      setFont(settings.font)
    }
  }, [])

  const handleFontChange = (selectedFont: string) => {
    setFont(selectedFont)
    
    // 保存到localStorage
    const { settings } = getStorageData()
    const newSettings = { ...settings, font: selectedFont }
    localStorage.setItem('settings', JSON.stringify(newSettings))
    
    // 触发storage事件以便其他组件更新
    window.dispatchEvent(new Event('storage'))
    
    // 应用字体到整个页面
    document.documentElement.style.fontFamily = selectedFont === 'system' ? '' : selectedFont
  }

  const handleClearData = () => {
    if (confirm('确定要清除所有数据吗？此操作不可撤销！')) {
      clearAllData()
      window.dispatchEvent(new Event('storage'))
      alert('数据已清除')
    }
  }

  const handleExportBackup = () => {
    const data = getStorageData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `event-calendar-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 border-b-2 border-black pb-2">设置</h1>
      
      <div className="space-y-6">
        {/* 字体设置 */}
        <div className="border-2 border-black rounded-lg p-4 bg-white">
          <h2 className="text-lg font-semibold mb-3">字体设置</h2>
          <div className="flex flex-wrap gap-2">
            {fonts.map((fontOption) => (
              <button
                key={fontOption}
                onClick={() => handleFontChange(fontOption)}
                className={`px-3 py-1 border-2 rounded-lg transition-colors ${
                  font === fontOption
                    ? 'border-black bg-black text-white'
                    : 'border-gray-300 hover:border-gray-500'
                }`}
                style={{ fontFamily: fontOption === 'system' ? '' : fontOption }}
              >
                {fontOption === 'system' ? '系统默认' : fontOption}
              </button>
            ))}
          </div>
        </div>

        {/* 数据管理 */}
        <div className="border-2 border-black rounded-lg p-4 bg-white">
          <h2 className="text-lg font-semibold mb-3">数据管理</h2>
          <div className="space-y-3">
            <button
              onClick={handleExportBackup}
              className="flex items-center gap-2 px-4 py-2 border-2 border-black rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Download size={16} />
              导出数据备份
            </button>
            <button
              onClick={handleClearData}
              className="flex items-center gap-2 px-4 py-2 border-2 border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 size={16} />
              清除所有数据
            </button>
          </div>
        </div>

        {/* 系统信息 */}
        <div className="border-2 border-black rounded-lg p-4 bg-white">
          <h2 className="text-lg font-semibold mb-3">系统信息</h2>
          <div className="text-sm text-gray-600">
            <p>版本: {version}</p>
            <p>存储方式: 浏览器本地存储</p>
            <p>数据位置: LocalStorage</p>
          </div>
        </div>
      </div>
    </div>
  )
}