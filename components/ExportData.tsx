'use client'

import { useState, useEffect } from 'react'
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'
import { ChevronLeft, ChevronRight, Download, Upload, Search } from 'lucide-react'
import { EventData } from '@/types'
import { getStorageData, exportDataAsJSON, exportDataAsCSV, importDataFromJSON, importDataFromCSV } from '@/utils/storage'

export default function ExportData() {
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()))
  const [endDate, setEndDate] = useState<Date>(endOfMonth(new Date()))
  const [filteredEvents, setFilteredEvents] = useState<EventData[]>([])
  const [searchResults, setSearchResults] = useState<EventData[]>([])

  useEffect(() => {
    searchEvents()
  }, [startDate, endDate])

  const searchEvents = () => {
    const { events } = getStorageData()
    const eventsArray = Object.values(events)
    
    const filtered = eventsArray.filter(event => {
      const eventDate = new Date(event.date)
      return isWithinInterval(eventDate, { start: startDate, end: endDate })
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    setFilteredEvents(filtered)
    setSearchResults(filtered)
  }

  const handleStartDateChange = (months: number) => {
    setStartDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(newDate.getMonth() + months)
      return startOfMonth(newDate)
    })
  }

  const handleEndDateChange = (months: number) => {
    setEndDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(newDate.getMonth() + months)
      return endOfMonth(newDate)
    })
  }

  const handleExportJSON = () => {
    const jsonData = exportDataAsJSON()
    const blob = new Blob([jsonData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = `演出日历数据_${format(startDate, 'yyyyMM')}-${format(endDate, 'yyyyMM')}.json`
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleExportCSV = () => {
    const csvData = exportDataAsCSV()
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = `演出日历数据_${format(startDate, 'yyyyMM')}-${format(endDate, 'yyyyMM')}.csv`
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const jsonData = e.target?.result as string
        const success = importDataFromJSON(jsonData)
        
        if (success) {
          alert('数据导入成功！')
          searchEvents() // 刷新显示
        } else {
          alert('数据导入失败，请检查文件格式')
        }
      } catch (error) {
        alert('文件读取失败，请重试')
      }
    }
    reader.readAsText(file)
    event.target.value = '' // 清空输入
  }

  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const csvData = e.target?.result as string
        const success = importDataFromCSV(csvData)
        
        if (success) {
          alert('数据导入成功！')
          searchEvents() // 刷新显示
        } else {
          alert('数据导入失败，请检查文件格式')
        }
      } catch (error) {
        alert('文件读取失败，请重试')
      }
    }
    reader.readAsText(file)
    event.target.value = '' // 清空输入
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">导出数据</h2>

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

        <div className="mt-4">
          <button
            onClick={searchEvents}
            className="crayon-button flex items-center space-x-2 bg-blue-600 text-white border-blue-600"
          >
            <Search size={16} />
            <span>查询</span>
          </button>
        </div>
      </div>

      {/* 导出操作 */}
      <div className="crayon-border p-4">
        <h3 className="text-lg font-semibold mb-4">导出数据</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleExportJSON}
            className="crayon-button flex items-center justify-center space-x-2 bg-green-600 text-white border-green-600"
            disabled={searchResults.length === 0}
          >
            <Download size={16} />
            <span>下载 JSON</span>
          </button>
          
          <button
            onClick={handleExportCSV}
            className="crayon-button flex items-center justify-center space-x-2 bg-blue-600 text-white border-blue-600"
            disabled={searchResults.length === 0}
          >
            <Download size={16} />
            <span>下载 CSV</span>
          </button>
        </div>
        
        {searchResults.length === 0 && (
          <p className="text-sm text-gray-500 mt-2">当前时间段内没有数据可导出</p>
        )}
      </div>

      {/* 导入操作 */}
      <div className="crayon-border p-4">
        <h3 className="text-lg font-semibold mb-4">导入数据</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">从 JSON 导入</label>
            <label className="crayon-button flex items-center justify-center space-x-2 cursor-pointer">
              <Upload size={16} />
              <span>选择 JSON 文件</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
              />
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">从 CSV 导入</label>
            <label className="crayon-button flex items-center justify-center space-x-2 cursor-pointer">
              <Upload size={16} />
              <span>选择 CSV 文件</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleImportCSV}
                className="hidden"
              />
            </label>
          </div>
        </div>
        
        <p className="text-sm text-gray-500 mt-2">
          导入数据将覆盖当前时间段内的现有数据
        </p>
      </div>

      {/* 查询结果 */}
      <div className="crayon-border p-4">
        <h3 className="text-lg font-semibold mb-4">
          查询结果 ({searchResults.length} 条记录)
        </h3>
        
        {searchResults.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {searchResults.map(event => (
              <div
                key={event.date}
                className="p-3 bg-gray-50 rounded-lg border-l-4"
                style={{ borderLeftColor: event.color }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm">
                        {format(new Date(event.date), 'yyyy年MM月dd日')}
                      </span>
                      <span className="text-xs text-gray-500">
                        {event.type.join('、')}
                      </span>
                    </div>
                    <div className="text-sm font-medium">{event.name}</div>
                    <div className="text-xs text-gray-600">
                      {event.place} · {event.city}
                    </div>
                  </div>
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: event.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">
            当前时间段内没有事件数据
          </p>
        )}
      </div>

      {/* 使用说明 */}
      <div className="crayon-border p-4 bg-blue-50">
        <h3 className="text-lg font-semibold mb-2">使用说明</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• 选择时间范围后点击"查询"查看该时间段内的事件</li>
          <li>• 支持导出为 JSON 和 CSV 格式，方便数据备份和迁移</li>
          <li>• 支持从 JSON 或 CSV 文件导入数据</li>
          <li>• 导入数据时会覆盖当前时间段内的现有数据</li>
          <li>• 建议定期导出数据作为备份</li>
        </ul>
      </div>
    </div>
  )
}