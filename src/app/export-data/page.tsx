'use client'

import { useState, useEffect } from 'react'
import { storage } from '@/lib/storage'
import { Event } from '@/types'
import { DataExporter } from '@/lib/export'
import MonthPicker from '@/components/MonthPicker'
import EventTable from '@/components/EventTable'

export default function ExportDataPage() {
  const [startYear, setStartYear] = useState(new Date().getFullYear())
  const [startMonth, setStartMonth] = useState(1)
  const [endYear, setEndYear] = useState(new Date().getFullYear())
  const [endMonth, setEndMonth] = useState(new Date().getMonth() + 1)
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [importFile, setImportFile] = useState<File | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<{
    success: boolean
    message: string
    imported: number
  } | null>(null)

  useEffect(() => {
    filterEvents()
  }, [startYear, startMonth, endYear, endMonth])

  const filterEvents = () => {
    const allEvents = storage.getEvents()

    const filtered = allEvents.filter(event => {
      const eventDate = new Date(event.date)
      const eventYear = eventDate.getFullYear()
      const eventMonth = eventDate.getMonth() + 1

      // 检查是否在范围内
      const startDate = new Date(startYear, startMonth - 1)
      const endDate = new Date(endYear, endMonth - 1)

      return eventDate >= startDate && eventDate <= endDate
    })

    // 按日期排序
    filtered.sort((a, b) => a.date.localeCompare(b.date))
    setFilteredEvents(filtered)
  }

  const validateDateRange = (): boolean => {
    if (startYear < 2023) {
      alert('起始年份不能早于2023年')
      return false
    }

    if (startYear > new Date().getFullYear() + 50) {
      alert('起始年份超出合理范围')
      return false
    }

    if (endYear > 2099) {
      alert('截止年份不能晚于2099年')
      return false
    }

    // 检查开始时间是否早于结束时间
    const startDate = new Date(startYear, startMonth - 1)
    const endDate = new Date(endYear, endMonth - 1)

    if (startDate > endDate) {
      alert('起始时间不能晚于截止时间')
      return false
    }

    return true
  }

  const handleExportCSV = () => {
    if (!validateDateRange() || filteredEvents.length === 0) {
      alert('没有可导出的数据')
      return
    }

    const filename = `events-${startYear}-${String(startMonth).padStart(2, '0')}-to-${endYear}-${String(endMonth).padStart(2, '0')}.csv`
    DataExporter.exportToCSV(filteredEvents, filename)
  }

  const handleExportJSON = () => {
    if (!validateDateRange() || filteredEvents.length === 0) {
      alert('没有可导出的数据')
      return
    }

    const filename = `events-${startYear}-${String(startMonth).padStart(2, '0')}-to-${endYear}-${String(endMonth).padStart(2, '0')}.json`
    DataExporter.exportToJSON(filteredEvents, filename)
  }

  const handleExportAllData = () => {
    const allEvents = storage.getEvents()
    if (allEvents.length === 0) {
      alert('没有可导出的数据')
      return
    }

    DataExporter.exportToJSON(allEvents, `events-all-${new Date().toISOString().split('T')[0]}.json`)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const validTypes = ['text/csv', 'application/json', 'text/plain']
      if (!validTypes.includes(file.type) && !file.name.endsWith('.csv') && !file.name.endsWith('.json')) {
        alert('请选择CSV或JSON格式的文件')
        return
      }
      setImportFile(file)
    }
  }

  const handleImport = async () => {
    if (!importFile) {
      alert('请先选择要导入的文件')
      return
    }

    setIsImporting(true)
    setImportResult(null)

    try {
      let importedEvents: Event[] = []

      if (importFile.name.endsWith('.csv')) {
        importedEvents = await DataExporter.importFromCSV(importFile)
      } else if (importFile.name.endsWith('.json')) {
        importedEvents = await DataExporter.importFromJSON(importFile)
      } else {
        throw new Error('不支持的文件格式')
      }

      // 验证导入数据
      const validation = DataExporter.validateImportData(importedEvents)
      if (!validation.isValid) {
        alert('数据验证失败：\n' + validation.errors.join('\n'))
        return
      }

      if (importedEvents.length === 0) {
        alert('文件中没有有效的事件数据')
        return
      }

      // 询问导入方式
      const overwrite = confirm(
        `检测到${importedEvents.length}个事件。\n\n点击"确定"将覆盖现有数据，点击"取消"将合并到现有数据中。`
      )

      if (overwrite) {
        // 覆盖模式：清空现有数据
        storage.saveEvents(importedEvents)
      } else {
        // 合并模式：添加到现有数据
        const existingEvents = storage.getEvents()
        const allEvents = [...existingEvents, ...importedEvents]

        // 按日期排序并去重
        allEvents.sort((a, b) => a.date.localeCompare(b.date))
        storage.saveEvents(allEvents)
      }

      setImportResult({
        success: true,
        message: '数据导入成功！',
        imported: importedEvents.length,
      })

      // 重新过滤显示
      filterEvents()

    } catch (error) {
      setImportResult({
        success: false,
        message: '导入失败：' + (error as Error).message,
        imported: 0,
      })
    } finally {
      setIsImporting(false)
      setImportFile(null)
      // 清空文件输入
      const fileInput = document.getElementById('import-file') as HTMLInputElement
      if (fileInput) {
        fileInput.value = ''
      }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">导出数据</h1>
        <p className="text-gray-600">查询、导出和导入事件数据，支持CSV和JSON格式</p>
      </div>

      {/* 数据查询 */}
      <div className="event-details crayon-border">
        <h2 className="text-lg font-bold mb-4">数据查询</h2>

        <MonthPicker
          startYear={startYear}
          startMonth={startMonth}
          endYear={endYear}
          endMonth={endMonth}
          onStartYearChange={setStartYear}
          onStartMonthChange={setStartMonth}
          onEndYearChange={setEndYear}
          onEndMonthChange={setEndMonth}
        />

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            共找到 <span className="font-bold">{filteredEvents.length}</span> 个事件
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              disabled={filteredEvents.length === 0}
              className="btn btn-primary"
            >
              导出CSV
            </button>
            <button
              onClick={handleExportJSON}
              disabled={filteredEvents.length === 0}
              className="btn"
            >
              导出JSON
            </button>
          </div>
        </div>
      </div>

      {/* 数据表格 */}
      {filteredEvents.length > 0 && (
        <div className="event-details crayon-border">
          <h2 className="text-lg font-bold mb-4">事件列表</h2>
          <EventTable events={filteredEvents} />
        </div>
      )}

      {/* 数据导入 */}
      <div className="event-details crayon-border">
        <h2 className="text-lg font-bold mb-4">数据导入</h2>

        <div className="space-y-4">
          <div>
            <label className="form-label">选择文件（支持CSV和JSON格式）</label>
            <input
              id="import-file"
              type="file"
              accept=".csv,.json"
              onChange={handleFileSelect}
              className="form-input"
            />
          </div>

          {importFile && (
            <div className="flex items-center justify-between bg-gray-50 p-3 border border-black rounded">
              <span className="text-sm">{importFile.name} ({(importFile.size / 1024).toFixed(1)}KB)</span>
              <button
                onClick={handleImport}
                disabled={isImporting}
                className="btn btn-primary"
              >
                {isImporting ? '导入中...' : '导入数据'}
              </button>
            </div>
          )}

          {importResult && (
            <div className={`p-3 border border-black rounded ${
              importResult.success ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <div className={`font-bold ${importResult.success ? 'text-green-700' : 'text-red-700'}`}>
                {importResult.success ? '✓' : '✗'} {importResult.message}
              </div>
              {importResult.success && (
                <div className="text-sm text-gray-600 mt-1">
                  成功导入 {importResult.imported} 个事件
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleExportAllData}
            className="btn"
          >
            导出全部数据（JSON格式）
          </button>
        </div>
      </div>

      {/* 使用说明 */}
      <div className="bg-gray-50 border border-black rounded-lg p-4">
        <h3 className="font-bold mb-2">使用说明</h3>
        <div className="text-sm space-y-2 text-gray-700">
          <div>
            <strong>导出功能：</strong>
            <ul className="ml-4 list-disc list-inside">
              <li>CSV格式：适合在Excel等表格软件中查看和编辑</li>
              <li>JSON格式：完整保存所有数据结构，适合备份和恢复</li>
              <li>支持按月份范围筛选导出</li>
            </ul>
          </div>
          <div>
            <strong>导入功能：</strong>
            <ul className="ml-4 list-disc list-inside">
              <li>支持CSV和JSON两种格式</li>
              <li>导入时会验证数据格式的正确性</li>
              <li>可选择覆盖现有数据或合并导入</li>
              <li>建议导入前先备份现有数据</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}