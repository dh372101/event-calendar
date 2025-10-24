'use client'

import dynamic from 'next/dynamic'

// 动态导入，禁用 SSR
const ExportImage = dynamic(() => import('@/components/ExportImage'), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-gray-50 flex items-center justify-center">加载中...</div>
})

export default function ExportImagePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ExportImage />
    </div>
  )
}