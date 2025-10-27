import './globals.css'
import Layout from '@/components/Layout'

export const metadata = {
  title: '演出日历',
  description: '一个简洁的演出事件管理日历',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  )
}