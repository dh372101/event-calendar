'use client'

import { useState, useEffect } from 'react'
import { 
  Calendar, 
  Tag, 
  Image, 
  Download, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  Menu as MenuIcon
} from 'lucide-react'

type MenuItem = {
  id: 'calendar' | 'tags' | 'export-image' | 'export-data' | 'settings'
  label: string
  icon: React.ReactNode
}

interface MenuProps {
  activeModule: string
  onModuleChange: (module: string) => void
  collapsed: boolean
  onToggleCollapse: () => void
}

const menuItems: MenuItem[] = [
  { id: 'calendar', label: '日历', icon: <Calendar size={20} /> },
  { id: 'tags', label: '标签编辑', icon: <Tag size={20} /> },
  { id: 'export-image', label: '导出图片', icon: <Image size={20} /> },
  { id: 'export-data', label: '导出数据', icon: <Download size={20} /> },
  { id: 'settings', label: '设置', icon: <Settings size={20} /> },
]

export default function Menu({ activeModule, onModuleChange, collapsed, onToggleCollapse }: MenuProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // 移动端菜单控制
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleMenuItemClick = (itemId: string) => {
    onModuleChange(itemId)
    if (window.innerWidth < 768) {
      setIsMobileMenuOpen(false)
    }
  }

  const menuContent = (
    <div className={`flex flex-col space-y-2 p-4 ${collapsed ? 'w-16' : 'w-64'}`}>
      {/* 菜单头部 */}
      <div className="flex items-center justify-between mb-4">
        {!collapsed && (
          <h1 className="text-xl font-bold crayon-border px-3 py-2">演出日历</h1>
        )}
        <button
          onClick={onToggleCollapse}
          className="crayon-border-thin p-2 hover:bg-gray-50"
          title={collapsed ? '展开菜单' : '折叠菜单'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* 菜单项 */}
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleMenuItemClick(item.id)}
            className={`w-full flex items-center p-3 transition-all duration-200 ${
              activeModule === item.id 
                ? 'menu-item-active' 
                : 'menu-item-inactive'
            } ${collapsed ? 'justify-center' : 'justify-start space-x-3'}`}
            title={collapsed ? item.label : ''}
          >
            {item.icon}
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>
    </div>
  )

  return (
    <>
      {/* 移动端菜单按钮 */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 crayon-border p-2 bg-white"
      >
        <MenuIcon size={20} />
      </button>

      {/* 桌面端菜单 */}
      <aside className="hidden md:block fixed left-0 top-0 h-full bg-white border-r-2 border-black z-40">
        {menuContent}
      </aside>

      {/* 移动端菜单 */}
      <div className={`md:hidden fixed inset-0 z-40 transition-transform duration-300 ${
        isMobileMenuOpen ? 'mobile-menu-visible' : 'mobile-menu-hidden'
      }`}>
        <div 
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        <aside className="absolute left-0 top-0 h-full bg-white border-r-2 border-black w-64">
          {menuContent}
        </aside>
      </div>

      {/* 移动端菜单打开时的遮罩 */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}