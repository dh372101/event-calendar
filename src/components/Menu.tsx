'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface MenuItem {
  id: string
  label: string
  href: string
}

const menuItems: MenuItem[] = [
  { id: 'calendar', label: '日历', href: '/' },
  { id: 'tags', label: '标签编辑', href: '/tags' },
  { id: 'export-image', label: '导出图片', href: '/export-image' },
  { id: 'export-data', label: '导出数据', href: '/export-data' },
  { id: 'settings', label: '设置', href: '/settings' },
]

export default function Menu() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* SVG滤镜 */}
      <svg className="svg-filters" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="roughPaper" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.04"
              numOctaves="1"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="1"
            />
          </filter>
        </defs>
      </svg>

      {/* 菜单容器 */}
      <div className={`menu-container ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="p-4 border-b border-black">
          <h1 className="text-lg font-bold text-black">演出日历</h1>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={`menu-item ${isActive(item.href) ? 'active' : ''}`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* 切换按钮 */}
      <button
        onClick={toggleCollapse}
        className="menu-toggle"
        title={isCollapsed ? '展开菜单' : '收起菜单'}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {isCollapsed ? (
            <path d="M9 18l6-6-6-6" />
          ) : (
            <path d="M15 18l-6-6 6-6" />
          )}
        </svg>
      </button>
    </>
  )
}