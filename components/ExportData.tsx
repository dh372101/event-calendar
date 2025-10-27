'use client'

import { useState, useEffect } from 'react'
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Download, Upload, Search } from 'lucide-react'
import { EventData } from '@/types/event'

export default function ExportData() {
  const [startMonth, setStartMonth] = useState('2023-01')
  const [endMonth, setEndMonth] = useState(format(new Date(), 'yyyy-MM'))
  const [events, setEvents] = useState<Record<string, EventData>>({})
  const [filteredEvents, setFilteredEvents] = useState<Array<{date: string, event: EventData}>>([])

  // 从localStorage加载事件数据
  useEffect(() => {
    const savedEvents = localStorage.getItem('events')
    if (savedEvents) {
      try {
        setEvents(JSON.parse(savedEvents))
      } catch (error) {
        console.error('Failed to load events:', error)
      }
    }
  }, [])

  const searchEvents = () => {
    const startDate = parseISO(startMonth + '-01')
    const endDate = endOfMonth(parseISO(endMonth + '-01'))
    
    const filtered = Object.entries(events)
      .filter(([dateString]) => {
        const date = parseISO(dateString)
        return isWithinInterval(date, { start: startDate, end: endDate })
      })
      .map(([date, event]) => ({ date, event }))
      .sort((a, b) => a.date.localeCompare(b.date))
    
    setFilteredEvents(filtered)
  }

  const exportToCSV = () => {
    if (filteredEvents.length === 0) {
      alert('没有数据可导出')
      return
    }

    const headers = ['日期', '事件名称', '类型', '地点', '城市', '颜色']
    const csvContent = [
      headers.join(','),
      ...filteredEvents.map(({ date, event }) => [
        format(parseISO(date), 'yyyy-MM-dd'),
        `"${event.name.replace(/"/g, '""')}"`,
        `"${event.type.join('、')}"`,
        `"${event.place.replace(/"/g, '""')}"`,
        `"${event.city.replace(/"/g, '""')}"`,
        event.color
      ].join(','))
    ].join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `演出日历_${startMonth}_${endMonth}.csv`
    link.click()
  }

  const exportToJSON = () => {
    if (filteredEvents.length === 0) {
      alert('没有数据可导出')
      return
    }

    const exportData = filteredEvents.map(({ date, event }) => ({
      date: format(parseISO(date), 'yyyy-MM-dd'),
      ...event
    }))

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `演出日历_${startMonth}_${endMonth}.json`
    link.click()
  }

  const importFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        let importedEvents: Array<{date: string} & EventData> = []

        if (file.name.endsWith('.csv')) {
          // CSV导入逻辑
          const lines = content.split('\n').filter(line => line.trim())
          if (lines.length < 2) throw new Error('CSV文件格式错误')
          
          const headers = lines[0].split(',').map(h => h.replace(/"/g, ''))
          importedEvents = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.replace(/"/g, ''))
            return {
              date: values[0],
              name: values[1],
              type: values[2].split('、'),
              place: values[3],
              city: values[4],
              color: values[5] || '#666666'
            }
          })
        } else if (file.name.endsWith('.json')) {
          // JSON导入逻辑
          importedEvents = JSON.parse(content)
        } else {
          throw new Error('不支持的文件格式')
        }

        // 合并到现有数据
        const newEvents = { ...events }
        importedEvents.forEach(item => {
          newEvents[item.date] = {
            name: item.name,
            type: item.type,
            place: item.place,
            city: item.city,
            color: item.color
          }
        })

        setEvents(newEvents)
        localStorage.setItem('events', JSON.stringify(newEvents))
        alert(`成功导入 ${importedEvents.length} 条事件`)
        searchEvents() // 刷新显示
      } catch (error) {
        console.error('导入失败:', error)
        alert('导入失败，请检查文件格式')
      }
    }

    if (file.name.endsWith('.csv')) {
      reader.readAsText(file, 'utf-8')
    } else if (file.name.endsWith('.json')) {
      reader.readAsText(file)
    }

    // 清空input以便再次选择同一文件
    event.target.value = ''
  }

  // 生成月份范围选项
  const generateMonthOptions = () => {
    const options = []
    const startDate = new Date(2023, 0, 1)
    const endDate = new Date(2099, 11, 1)
    
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

  return (
    <div className="space-y-6">
      {/* 控制面板 */}
      <div className="crayon-border p-4 bg-white">
        <h2 className="text-xl font-bold mb-4">导出数据</h2>
        
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
        
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={searchEvents}
            className="crayon-border-thin px-4 py-2 bg-white hover:bg-gray-50"
          >
            <Search size={16} className="inline mr-1" />
            查询
          </button>
          
          <button
            onClick={exportToCSV}
            disabled={filteredEvents.length === 0}
            className="crayon-border-thin px-4 py-2 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <Download size={16} className="inline mr-1" />
            下载 CSV
          </button>
          
          <button
            onClick={exportToJSON}
            disabled={filteredEvents.length === 0}
            className="crayon-border-thin px-4 py-2 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <Download size={16} className="inline mr-1" />
            下载 JSON
          </button>
        </div>

        {/* 导入功能 */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold mb-2">导入数据</h3>
          <div className="flex flex-wrap gap-2">
            <label className="crayon-border-thin px-4 py-2 bg-white hover:bg-gray-50 cursor-pointer">
              <Upload size={16} className="inline mr-1" />
              从 CSV 导入
              <input
                type="file"
                accept=".csv"
                onChange={importFromFile}
                className="hidden"
              />
            </label>
            
            <label className="crayon-border-thin px-4 py-2 bg-white hover:bg-gray-50 cursor-pointer">
              <Upload size={16} className="inline mr-1" />
              从 JSON 导入
              <input
                type="file"
                accept=".json"
                onChange={importFromFile}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* 查询结果 */}
      {filteredEvents.length > 0 && (
        <div className="crayon-border p-4 bg-white">
          <h3 className="text-lg font-semibold mb-3">
            查询结果 ({filteredEvents.length} 条事件)
          </h3>
          
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-black">
                  <th className="text-left p-2">日期</th>
                  <th className="text-left p-2">事件名称</th>
                  <th className="text-left p-2">类型</th>
                  <th className="text-left p-2">地点</th>
                  <th className="text-left p-2">城市</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map(({ date, event }) => (
                  <tr key={date} className="border-b">
                    <td className="p-2">{format(parseISO(date), 'yyyy-MM-dd')}</td>
                    <td className="p-2 font-medium">{event.name}</td>
                    <td className="p-2">
                      <div className="flex flex-wrap gap-1">
                        {event.type.map(type => (
                          <span 
                            key={type}
                            className="event-tag text-xs"
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-2">{event.place}</td>
                    <td className="p-2">{event.city}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}