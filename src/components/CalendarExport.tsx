'use client'

import { useState, useEffect, useRef } from 'react'
import { generateCalendarDays, formatMonthYear } from '@/lib/calendar'
import { storage } from '@/lib/storage'
import html2canvas from 'html2canvas'

interface CalendarExportProps {
  year: number
  month: number
}

export default function CalendarExport({ year, month }: CalendarExportProps) {
  const calendarRef = useRef<HTMLDivElement>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [allEvents, setAllEvents] = useState([])

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = () => {
    const events = storage.getEvents()
    setAllEvents(events)
  }

  const calendarDays = generateCalendarDays(year, month, allEvents)
  const tags = storage.getTags()

  const generateImage = async () => {
    if (!calendarRef.current) return

    setIsGenerating(true)
    try {
      const canvas = await html2canvas(calendarRef.current, {
        backgroundColor: '#ffffff',
        scale: 2, // 提高清晰度
        logging: false,
        useCORS: true,
      })

      // 转换为图片并下载
      const link = document.createElement('a')
      link.download = `calendar-${year}-${month + 1}.png`
      link.href = canvas.toDataURL()
      link.click()
    } catch (error) {
      console.error('生成图片失败:', error)
      alert('生成图片失败，请重试')
    } finally {
      setIsGenerating(false)
    }
  }

  const renderEventDots = (events: any[]) => {
    const allTypes = events.flatMap((event: any) => event.types)
    const uniqueTypes = Array.from(new Set(allTypes))

    return uniqueTypes.slice(0, 4).map((type, index) => (
      <div
        key={index}
        className="event-dot"
        style={{
          width: '3px',
          height: '3px',
          borderRadius: '50%',
          backgroundColor: tags.types[type] || '#000000',
        }}
        title={type as string}
      />
    ))
  }

  const renderEventName = (events: any[]) => {
    if (events.length === 0) return null

    const firstEvent = events[0]
    return (
      <div
        style={{
          fontSize: '8px',
          textAlign: 'center',
          lineHeight: 1.2,
          marginTop: '2px',
          color: firstEvent.color || '#000000',
        }}
      >
        {firstEvent.name}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <button
          onClick={generateImage}
          disabled={isGenerating}
          className="btn btn-primary"
        >
          {isGenerating ? '生成中...' : '下载图片'}
        </button>
      </div>

      {/* 预览区域 */}
      <div className="flex justify-center">
        <div className="border-2 border-black rounded-lg p-4 bg-white">
          <h3 className="text-center font-bold mb-2">
            {formatMonthYear(year, month)}
          </h3>

          {/* 隐藏的导出组件 */}
          <div
            ref={calendarRef}
            className="bg-white p-4"
            style={{
              width: '800px',
              height: '600px',
              position: 'fixed',
              left: '-9999px',
              top: '-9999px',
            }}
          >
            <h2 className="text-center font-bold mb-4 text-xl">
              {formatMonthYear(year, month)} - 演出日历
            </h2>

            {/* 星期标题 */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                marginBottom: '4px',
              }}
            >
              {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map(day => (
                <div
                  key={day}
                  style={{
                    textAlign: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    paddingBottom: '4px',
                    borderBottom: '1px solid #000',
                  }}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* 日历网格 */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '1px',
                border: '1px solid #000',
                borderRadius: '4px',
                overflow: 'hidden',
              }}
            >
              {calendarDays.map((day, index) => {
                const isCurrentMonth = day.month === month && day.year === year

                return (
                  <div
                    key={index}
                    style={{
                      aspectRatio: '1',
                      border: '1px solid #000',
                      padding: '4px 2px',
                      position: 'relative',
                      backgroundColor: isCurrentMonth ? '#fff' : '#f5f5f5',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      fontSize: '10px',
                    }}
                  >
                    {/* 事件点 */}
                    {day.events.length > 0 && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '2px',
                          right: '2px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '1px',
                        }}
                      >
                        {renderEventDots(day.events)}
                      </div>
                    )}

                    {/* 日期数字 */}
                    <div
                      style={{
                        fontSize: '11px',
                        fontWeight: '600',
                        color: '#000',
                        marginBottom: '1px',
                      }}
                    >
                      {day.date}
                    </div>

                    {/* 事件名称 */}
                    {renderEventName(day.events)}
                  </div>
                )
              })}
            </div>

            {/* 底部信息 */}
            <div
              style={{
                marginTop: '8px',
                textAlign: 'center',
                fontSize: '10px',
                color: '#666',
              }}
            >
              由演出日历生成 - {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}