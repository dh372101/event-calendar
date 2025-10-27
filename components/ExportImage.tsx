'use client'

import { useState, useRef } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import html2canvas from 'html2canvas'
import { Download, Eye } from 'lucide-react'
import { EventData } from '@/types/event'

export default function ExportImage() {
  const [startMonth, setStartMonth] = useState('2023-01')
  const [endMonth, setEndMonth] = useState(format(new Date(), 'yyyy-MM'))
  const [previewUrl, setPreviewUrl] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const calendarRef = useRef<HTMLDivElement>(null)

  const generatePreview = async () => {
    if (!calendarRef.current) return
    
    setIsGenerating(true)
    try {
      const canvas = await html2canvas(calendarRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true
      })
      
      setPreviewUrl(canvas.toDataURL('image/png'))
    } catch (error) {
      console.error('生成预览失败:', error)
      alert('生成预览失败，请重试')
    }
    setIsGenerating(false)
  }

  const downloadImage = () => {
    if (!previewUrl) return
    
    const link = document.createElement('a')
    link.download = `演出日历_${startMonth}_${endMonth}.png`
    link.href = previewUrl
    link.click()
  }

  // 生成月份范围选项
  const generateMonthOptions = () => {
    const options = []
    const startDate = new Date(2023, 0, 1) // 2023年1月
    const endDate = new Date(2099, 11, 1) // 2099年12月
    
    let currentDate = startDate
    while (currentDate <= endDate) {
      const value = format(currentDate, 'yyyy-MM')
      options.push(
        <option key={value} value={value}>
          {format(currentDate, 'yyyy年MM月', { locale: zhCN })}
        </option>
      )
      currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    }
    
    return options
  }

  // 模拟事件数据用于预览
  const mockEvents: Record<string, EventData> = {
    '2024-05-15': {
      name: '演唱会A',
      type: ['Live'],
      place: '梅赛德斯奔驰文化中心',
      city: '上海',
      color: '#FF6B6B'
    },
    '2024-05-20': {
      name: '美食节',
      type: ['干饭'],
      place: '静安体育中心',
      city: '上海',
      color: '#4ECDC4'
    }
  }

  return (
    <div className="space-y-6">
      {/* 控制面板 */}
      <div className="crayon-border p-4 bg-white">
        <h2 className="text-xl font-bold mb-4">导出图片</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">开始月份</label>
            <select
              value={startMonth}
              onChange={(e) => setStartMonth(e.target.value)}
              className="w-full crayon-border-thin p-2"
            >
              {generateMonthOptions()}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">结束月份</label>
            <select
              value={endMonth}
              onChange={(e) => setEndMonth(e.target.value)}
              className="w-full crayon-border-thin p-2"
            >
              {generateMonthOptions()}
            </select>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={generatePreview}
            disabled={isGenerating}
            className="crayon-border-thin px-4 py-2 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <Eye size={16} className="inline mr-1" />
            {isGenerating ? '生成中...' : '预览'}
          </button>
          
          <button
            onClick={downloadImage}
            disabled={!previewUrl}
            className="crayon-border px-4 py-2 bg-black text-white hover:bg-gray-800 disabled:opacity-50"
          >
            <Download size={16} className="inline mr-1" />
            下载图片
          </button>
        </div>
      </div>

      {/* 预览区域 */}
      {previewUrl && (
        <div className="crayon-border p-4 bg-white">
          <h3 className="text-lg font-semibold mb-3">预览</h3>
          <div className="flex justify-center">
            <img 
              src={previewUrl} 
              alt="日历预览" 
              className="max-w-full h-auto crayon-border-thin"
            />
          </div>
        </div>
      )}

      {/* 隐藏的日历用于截图 */}
      <div className="hidden">
        <div ref={calendarRef} className="p-4 bg-white">
          <div style={{ 
            fontFamily: 'Crayon, cursive',
            border: '2px solid #000',
            borderRadius: '8px',
            padding: '16px'
          }}>
            <h2 style={{ 
              textAlign: 'center', 
              fontSize: '24px', 
              fontWeight: 'bold',
              marginBottom: '16px'
            }}>
              演出日历 {startMonth} - {endMonth}
            </h2>
            
            {/* 这里可以添加更详细的日历渲染逻辑 */}
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '4px'
            }}>
              {['一', '二', '三', '四', '五', '六', '日'].map(day => (
                <div key={day} style={{
                  textAlign: 'center',
                  fontWeight: 'bold',
                  padding: '8px',
                  border: '1px solid #000',
                  borderRadius: '4px'
                }}>
                  {day}
                </div>
              ))}
            </div>
            
            <div style={{ 
              marginTop: '16px',
              textAlign: 'center',
              color: '#666',
              fontSize: '14px'
            }}>
              使用演出日历系统生成
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}