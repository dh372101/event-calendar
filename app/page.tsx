'use client'

import { useState, useEffect } from 'react'
import Menu from '@/components/Menu'
import Calendar from '@/components/Calendar'
import TagsEditor from '@/components/TagsEditor'
import ExportImage from '@/components/ExportImage'
import ExportData from '@/components/ExportData'
import Settings from '@/components/Settings'

type ActiveModule = 'calendar' | 'tags' | 'export-image' | 'export-data' | 'settings'

export default function Home() {
  const [activeModule, setActiveModule] = useState<ActiveModule>('calendar')
  const [menuCollapsed, setMenuCollapsed] = useState(false)

  // 从localStorage加载菜单状态
  useEffect(() => {
    const saved = localStorage.getItem('settings')
    if (saved) {
      try {
        const settings = JSON.parse(saved)
        setMenuCollapsed(settings.menuCollapsed || false)
      } catch (error) {
        console.error('Failed to load settings:', error)
      }
    }
  }, [])

  // 保存菜单状态到localStorage
  useEffect(() => {
    const settings = {
      menuCollapsed,
      font: 'system'
    }
    localStorage.setItem('settings', JSON.stringify(settings))
  }, [menuCollapsed])

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'calendar':
        return <Calendar />
      case 'tags':
        return <TagsEditor />
      case 'export-image':
        return <ExportImage />
      case 'export-data':
        return <ExportData />
      case 'settings':
        return <Settings />
      default:
        return <Calendar />
    }
  }

  return (
    <div className="flex h-screen bg-white">
      {/* 菜单导航 */}
      <Menu 
        activeModule={activeModule}
        onModuleChange={setActiveModule}
        collapsed={menuCollapsed}
        onToggleCollapse={() => setMenuCollapsed(!menuCollapsed)}
      />
      
      {/* 主内容区域 */}
      <main className={`flex-1 transition-all duration-300 ${
        menuCollapsed ? 'ml-0 md:ml-16' : 'ml-0 md:ml-64'
      }`}>
        <div className="h-full overflow-auto p-4">
          {renderActiveModule()}
        </div>
      </main>
    </div>
  )
}