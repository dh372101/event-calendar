'use client'

import { useState, useEffect } from 'react'
import { 
  Calendar, 
  Tag, 
  Image, 
  Download, 
  Settings, 
  Menu as MenuIcon,
  ChevronLeft
} from 'lucide-react'
import { ActiveModule } from '@/types'

interface MenuProps {
  activeModule: ActiveModule
  onModuleChange: (module: ActiveModule) => void
  collapsed: boolean
  onToggleCollapse: () => void
}

const menuItems = [
  { id: 'calendar' as ActiveModule, label: '日历', icon: Calendar },
  { id: 'tags' as ActiveModule, label: '标签编辑', icon: Tag },
  { id: 'export-image' as ActiveModule, label: '导出图片', icon: Image },
  { id: 'export-data' as ActiveModule, label: '导出数据', icon: Download },
  { id: 'settings' as ActiveModule, label: '设置', icon: Settings },
]

export default function Menu({ activeModule, onModuleChange, collapsed, onToggleCollapse }: MenuProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleMenuClick = (moduleId: ActiveModule) => {
    onModuleChange(moduleId)
    if (isMobile) {
      setMobileMenuOpen(false)
    }
  }

  // 移动端菜单按钮
  if (isMobile) {
    return (
      <>
        {/* 移动端菜单按钮 */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="fixed top-4 left-4 z-50 crayon-button"
        >
          <MenuIcon size={20} />
        </button>

        {/* 移动端菜单遮罩 */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* 移动端菜单内容 */}
        <div className={`fixed top-0 left-0 h-full w-64 bg-white z-40 transform transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } crayon-border`}>
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">演出日历</h2>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="crayon-button p-2"
              >
                <ChevronLeft size={16} />
              </button>
            </div>
          </div>
          
          <nav className="p-4">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className={`w-full flex items-center space-x-3 p-3 mb-2 rounded-lg transition-colors ${
                    activeModule === item.id 
                      ? 'bg-black text-white' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>
        </div>
      </>
    )
  }

  // 桌面端菜单
  return (
    <div className={`fixed top-0 left-0 h-full bg-white transition-all duration-300 z-30 crayon-border ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      {/* 菜单头部 */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          {!collapsed && <h2 className="text-lg font-bold">演出日历</h2>}
          <button 
            onClick={onToggleCollapse}
            className="crayon-button p-2"
            title={collapsed ? '展开菜单' : '折叠菜单'}
          >
            <ChevronLeft 
              size={16} 
              className={`transition-transform ${collapsed ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      </div>
      
      {/* 菜单项 */}
      <nav className="p-4">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className={`w-full flex items-center space-x-3 p-3 mb-2 rounded-lg transition-colors ${
                activeModule === item.id 
                  ? 'bg-black text-white' 
                  : 'hover:bg-gray-100'
              } ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? item.label : ''}
            >
              <Icon size={20} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          )
        })}
      </nav>
    </div>
  )
}