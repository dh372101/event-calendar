'use client'

import { useState, useEffect } from 'react'
import Menu from './Menu'
import { storage } from '@/lib/storage'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [userFont, setUserFont] = useState('system-ui')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // 从存储中获取字体设置
    const settings = storage.getSettings()
    setUserFont(settings.font)

    // 应用字体到CSS变量
    document.documentElement.style.setProperty('--user-font', settings.font)

    // 检测移动端
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  return (
    <div className="min-h-screen flex" style={{ fontFamily: userFont }}>
      <Menu />

      <main className="main-content flex-1 transition-all duration-300">
        <div className={`${isMobile ? 'max-w-full' : 'max-w-6xl'} mx-auto`}>
          {children}
        </div>
      </main>

      {/* 移动端触摸优化 */}
      {isMobile && (
        <style jsx>{`
          * {
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
          }

          .calendar-cell {
            cursor: pointer;
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            user-select: none;
          }

          .btn, .menu-item {
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            user-select: none;
          }
        `}</style>
      )}
    </div>
  )
}