'use client'

import { Event } from '@/types'

interface EventTableProps {
  events: Event[]
}

export default function EventTable({ events }: EventTableProps) {
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        <p>该时间段内暂无事件</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className="border border-black px-4 py-2 text-left font-bold">日期</th>
            <th className="border border-black px-4 py-2 text-left font-bold">类型</th>
            <th className="border border-black px-4 py-2 text-left font-bold">名称</th>
            <th className="border border-black px-4 py-2 text-left font-bold">地点</th>
            <th className="border border-black px-4 py-2 text-left font-bold">城市</th>
            <th className="border border-black px-4 py-2 text-left font-bold">颜色</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event, index) => (
            <tr key={event.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="border border-black px-4 py-2">
                {formatDate(event.date)}
              </td>
              <td className="border border-black px-4 py-2">
                <div className="flex flex-wrap gap-1">
                  {event.types.map((type, typeIndex) => (
                    <span
                      key={typeIndex}
                      className="inline-block px-2 py-1 text-xs rounded"
                      style={{
                        backgroundColor: '#000',
                        color: '#fff',
                      }}
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </td>
              <td className="border border-black px-4 py-2">
                {event.name}
              </td>
              <td className="border border-black px-4 py-2">
                {event.location || '-'}
              </td>
              <td className="border border-black px-4 py-2">
                {event.city || '-'}
              </td>
              <td className="border border-black px-4 py-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 border border-black rounded"
                    style={{ backgroundColor: event.color }}
                  />
                  <span className="text-xs">{event.color}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}