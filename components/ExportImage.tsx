'use client'

import { useState, useRef } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'
import { ChevronLeft, ChevronRight, Download, Eye } from 'lucide-react'
import html2canvas from 'html2canvas'
import { getStorageData } from '@/utils/storage'

export default function ExportImage() {
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()))
  const [endDate, setEndDate] = useState<Date>(endOfMonth(new Date()))
  const [previewImage, setPreviewImage] = useState<string>('')
  const calendarRef = useRef<HTMLDivElement>(null)

  const handlePreview = async () => {
    if (!calendarRef.current) return

    try {
      const canvas = await html2canvas(calendarRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true
      })
      
      const imageUrl = canvas.toDataURL('image/png')
      setPreviewImage(imageUrl)
    } catch (error) {
      console.error('生成预览图片失败:', error)
      alert('生成预览图片失败，请重试')
    }
  }

  const handleDownload = () => {
    if (!previewImage) return

    const link = document.createElement('a')
    link.download = `演出日历_${format(startDate, 'yyyyMM')}-${format(endDate, 'yyyyMM')}.png`
    link.href = previewImage
    link.click()
  }

  const handleStartDateChange = (months: number) => {
    setStartDate(addMonths(startDate, months))
  }

  const handleEndDateChange = (months: number) => {
    setEndDate(addMonths(endDate, months))
  }

  // 生成预览日历
  const PreviewCalendar = () => {
    const { events, tags } = getStorageData()
    const months = []
    let current = startOfMonth(startDate)
    
    while (current <= endDate) {
      months.push(current)
      current = addMonths(current, 1)
    }

    return (
      <div ref={calendarRef} className="space-y-6 p-4 bg-white">
        {months.map(month => (
          <MonthCalendar key={month.toString()} month={month} events={events} tags={tags} />
        ))}
      </div>
    )
  }

  const MonthCalendar = ({ month, events, tags }: any) => {
    const monthStart = startOfMonth(month)
    const monthEnd = endOfMonth(month)
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

    const startDay = monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1
    const endDay = monthEnd.getDay() === 0 ? 6 : monthEnd.getDay() - 1

    const previousMonthDays = Array.from({ length: startDay }, (_, i) => {
      const date = new Date(monthStart)
      date.setDate(date.getDate() - startDay + i)
      return date
    })

    const nextMonthDays = Array.from({ length: 6 - endDay }, (_, i) => {
      const date = new Date(monthEnd)
      date.setDate(date.getDate() + i + 1)
      return date
    })

    const allDays = [...previousMonthDays, ...daysInMonth, ...nextMonthDays]

    const getEventForDate = (date: Date) => {
      const dateString = format(date, 'yyyy-MM-dd')
      return events[dateString] || null
    }

    return (
      <div className="crayon-border">
        <div className="p-4 bg-gray-100 border-b-2 border-black">
          <h3 className="text-xl font-bold text-center">
            {format(month, 'yyyy年MM月')}
          </h3>
        </div>
        
        <div className="grid grid-cols-7 bg-gray-100">
          {['一', '二', '三', '四', '五', '六', '日'].map(day => (
            <div key={day} className="calendar-day-header font-semibold">
              {day}
            </div>
          ))}
        </div>

        <div className="calendar-grid">
          {allDays.map((date, index) => {
            const event = getEventForDate(date)
            const isCurrentMonth = isSameMonth(date, month)
            const isToday = isSameDay(date, new Date())
            
            return (
              <div
                key={index}
                className={`calendar-day min-h-[80px] ${
                  !isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
                } ${isToday ? 'bg-blue-50' : ''}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-medium ${
                    isToday ? 'text-blue-600' : ''
                  }`}>
                    {format(date, 'd')}
                  </span>
                  
                  {event && event.type.length > 0 && (
                    <div className="flex space-x-1">
                      {event.type.slice(0, 3).map((type: string, i: number) => (
                        <div
                          key={i}
                          className="w-2 h-2 rounded-full"
                          style={{ 
                            backgroundColor: tags.type?.[type] || '#ccc'
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {event && (
                  <div 
                    className="text-xs font-medium truncate"
                    style={{ color: event.color }}
                  >
                    {event.name}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">导出图片</h2>

      {/* 时间范围选择 */}
      <div className="crayon-border p-4">
        <h3 className="text-lg font-semibold mb-4">选择时间范围</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">开始月份</label>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => handleStartDateChange(-1)}
                className="crayon-button"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-lg font-medium">
                {format(startDate, 'yyyy年MM月')}
              </span>
              <button 
                onClick={() => handleStartDateChange(1)}
                className="crayon-button"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">结束月份</label>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => handleEndDateChange(-1)}
                className="crayon-button"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-lg font-medium">
                {format(endDate, 'yyyy年MM月')}
              </span>
              <button 
                onClick={() => handleEndDateChange(1)}
                className="crayon-button"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 flex space-x-4">
          <button
            onClick={handlePreview}
            className="crayon-button flex items-center space-x-2 bg-blue-600 text-white border-blue-600"
          >
            <Eye size={16} />
            <span>预览</span>
          </button>
          
          {previewImage && (
            <button
              onClick={handleDownload}
              className="crayon-button flex items-center space-x-2 bg-green-600 text-white border-green-600"
            >
              <Download size={16} />
              <span>下载图片</span>
            </button>
          )}
        </div>
      </div>

      {/* 预览区域 */}
      {previewImage ? (
        <div className="crayon-border p-4">
          <h3 className="text-lg font-semibold mb-4">预览</h3>
          <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg">
            <img 
              src={previewImage} 
              alt="日历预览" 
              className="max-w-full h-auto mx-auto"
            />
          </div>
        </div>
      ) : (
        <div className="crayon-border p-4">
          <h3 className="text-lg font-semibold mb-4">日历预览</h3>
          <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg">
            <PreviewCalendar />
          </div>
        </div>
      )}

      {/* 使用说明 */}
      <div className="crayon-border p-4 bg-blue-50">
        <h3 className="text-lg font-semibold mb-2">使用说明</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• 选择要导出的时间范围（开始月份和结束月份）</li>
          <li>• 点击"预览"按钮生成日历图片预览</li>
          <li>• 预览满意后点击"下载图片"保存到本地</li>
          <li>• 导出的图片将包含选定范围内的所有事件信息</li>
          <li>• 图片采用手绘蜡笔风格，保持应用整体设计</li>
        </ul>
      </div>
    </div>
  )
}