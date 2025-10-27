'use client'

import { Event } from '@/types'
import { storage } from '@/lib/storage'

interface EventDetailsProps {
  year: number
  month: number
  events: Event[]
}

export default function EventDetails({ year, month, events }: EventDetailsProps) {
  const tags = storage.getTags()

  // 过滤当月事件并按日期排序
  const monthEvents = events
    .filter(event => {
      const eventDate = new Date(event.date)
      return eventDate.getFullYear() === year && eventDate.getMonth() === month
    })
    .sort((a, b) => a.date.localeCompare(b.date))

  const formatEventDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${month}/${day}`
  }

  const renderEventInfo = (event: Event) => {
    const fields = [
      { label: '类型', value: event.types.join(', ') },
      { label: '名称', value: event.name },
      { label: '地点', value: event.location },
      { label: '城市', value: event.city },
    ]

    return fields
      .filter(field => field.value && field.value.trim() !== '')
      .map((field, index) => (
        <div key={index} className="text-sm">
          <span className="font-medium">{field.label}：</span>
          <span>{field.value}</span>
        </div>
      ))
  }

  if (monthEvents.length === 0) {
    return (
      <div className="event-details crayon-border">
        <h3 className="text-lg font-bold mb-4">本月事件详情</h3>
        <p className="text-gray-600 text-center py-8">本月暂无事件安排</p>
      </div>
    )
  }

  return (
    <div className="event-details crayon-border">
      <h3 className="text-lg font-bold mb-4">本月事件详情</h3>

      <div className="space-y-3">
        {monthEvents.map((event) => (
          <div
            key={event.id}
            className="border border-black rounded-lg p-3"
            style={{ backgroundColor: event.color ? `${event.color}10` : '#f5f5f5' }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm">
                {formatEventDate(event.date)}
              </span>

              {/* 类型标签 */}
              <div className="flex gap-1">
                {event.types.map((type, index) => (
                  <span
                    key={index}
                    className="event-type"
                    style={{
                      backgroundColor: tags.types[type] || '#000000',
                      color: '#ffffff',
                    }}
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>

            {/* 事件详情 */}
            <div className="event-info">
              {renderEventInfo(event)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}