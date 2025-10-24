'use client'

import dynamic from 'next/dynamic'

// 动态导入，禁用 SSR
const Settings = dynamic(() => import('@/components/Settings'), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-gray-50 flex items-center justify-center">加载中...</div>
})

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Settings />
    </div>
  )
}