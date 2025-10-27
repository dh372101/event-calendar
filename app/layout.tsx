import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './styles/globals.css'
import Menu from '@/components/Menu'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '演出日历系统',
  description: '个人演出活动日历管理系统',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" style={{ fontFamily: `'${inter.style.fontFamily}', system-ui, sans-serif` }}>
      <head />
      <body className={inter.className}>
        <div className="main-layout">
          <Menu />
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-4">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  )
}