'use client'

import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { CalendarDayEvent } from '@/types/event'

interface EventDetailProps {
  events: CalendarDayEvent[]
}

export default function EventDetail({ events }: EventDetailProps) {
  if (events.length === 0) {
    return (
      <div className="crayon-border p-4 bg-white">
        <h3 className="text-lg font-bold mb-3">本月事件</h3>
        <p className="text-gray-500 text-center py-8">本月暂无事件安排</p>
      </div>
    )
  }

  return (
    <div className="crayon-border p-4 bg-white">
      <h3 className="text-lg font-bold mb-3">本月事件 ({events.length}个)</h3>
      
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {events.map(({ date, event }) => (
          <div key={date.toISOString()} className="crayon-border-thin p-3">
            <div className="flex items-start justify-between mb-2">
              <div 
                className="px-2 py-1 text-xs rounded crayon-border-thin inline-block"
                style={{ 
                  backgroundColor: event!.color + '20',
                  borderColor: event!.color,
                  color: event!.color 
                }}
              >
                {format(date, 'MM/dd', { locale: zhCN })}
              </div>
              
              {/* 类型标签 */}
              <div className="flex space-x-1">
                {event!.type.map((type, index) => (
                  <span 
                    key={index}
                    className="event-tag text-xs"
                    style={{ borderColor: '#666' }}
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
            
            {/* 事件详情 */}
            <div className="space-y-1">
              <div className="font-medium">{event!.name}</div>
              <div className="text-sm text-gray-600">{event!.place}</div>
              <div className="text-sm text-gray-500">{event!.city}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}