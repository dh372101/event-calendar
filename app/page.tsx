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
    const savedState = localStorage.getItem('menuCollapsed')
    if (savedState) {
      setMenuCollapsed(JSON.parse(savedState))
    }
  }, [])

  // 保存菜单状态到localStorage
  useEffect(() => {
    localStorage.setItem('menuCollapsed', JSON.stringify(menuCollapsed))
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
    <div className="flex h-screen">
      <Menu 
        activeModule={activeModule}
        onModuleChange={setActiveModule}
        collapsed={menuCollapsed}
        onToggleCollapse={() => setMenuCollapsed(!menuCollapsed)}
      />
      
      <main className={`flex-1 transition-all duration-300 ${
        menuCollapsed ? 'ml-0 md:ml-16' : 'ml-0 md:ml-64'
      }`}>
        <div className="p-4 md:p-6">
          {renderActiveModule()}
        </div>
      </main>
    </div>
  )
}