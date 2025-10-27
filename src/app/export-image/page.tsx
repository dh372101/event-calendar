'use client'

import { useState } from 'react'
import { storage } from '@/lib/storage'
import CalendarExport from '@/components/CalendarExport'
import MonthPicker from '@/components/MonthPicker'

export default function ExportImagePage() {
  const [startYear, setStartYear] = useState(new Date().getFullYear())
  const [startMonth, setStartMonth] = useState(1)
  const [endYear, setEndYear] = useState(new Date().getFullYear())
  const [endMonth, setEndMonth] = useState(new Date().getMonth() + 1)
  const [selectedMonth, setSelectedMonth] = useState<{ year: number; month: number } | null>(null)

  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1

  // 验证月份范围
  const validateMonthRange = () => {
    if (startYear < 2023) {
      alert('起始年份不能早于2023年')
      return false
    }

    if (startYear > currentYear || (startYear === currentYear && startMonth > currentMonth)) {
      alert('起始时间不能晚于当前时间')
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

  const handlePreview = () => {
    if (!validateMonthRange()) {
      return
    }

    // 选择中间的月份进行预览
    const startDate = new Date(startYear, startMonth - 1)
    const endDate = new Date(endYear, endMonth - 1)
    const middleDate = new Date(startDate.getTime() + (endDate.getTime() - startDate.getTime()) / 2)

    setSelectedMonth({
      year: middleDate.getFullYear(),
      month: middleDate.getMonth() + 1,
    })
  }

  const handleExportAll = async () => {
    if (!validateMonthRange()) {
      return
    }

    // 实现批量导出逻辑（这里简化处理）
    const months = []
    let currentDate = new Date(startYear, startMonth - 1)
    const endDate = new Date(endYear, endMonth - 1)

    while (currentDate <= endDate) {
      months.push({
        year: currentDate.getFullYear(),
        month: currentDate.getMonth() + 1,
      })
      currentDate.setMonth(currentDate.getMonth() + 1)
    }

    if (months.length > 6) {
      const confirmExport = confirm(`您选择了${months.length}个月，这将生成${months.length}张图片，确定要继续吗？`)
      if (!confirmExport) {
        return
      }
    }

    alert(`将依次导出${months.length}个月的日历图片。\n注意：实际导出功能需要在实现中集成html2canvas库。`)
    // 这里可以实现实际的批量导出逻辑
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">导出图片</h1>
        <p className="text-gray-600">将日历导出为PNG图片，支持月份范围选择</p>
      </div>

      {/* 月份范围选择 */}
      <div className="event-details crayon-border">
        <h2 className="text-lg font-bold mb-4">选择月份范围</h2>

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

        <div className="flex gap-3 mt-4">
          <button
            onClick={handlePreview}
            className="btn btn-primary"
          >
            预览选中月份
          </button>

          <button
            onClick={handleExportAll}
            className="btn"
          >
            导出全部月份
          </button>
        </div>
      </div>

      {/* 预览区域 */}
      {selectedMonth && (
        <div className="event-details crayon-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">
              预览：{selectedMonth.year}年{selectedMonth.month}月
            </h2>
            <button
              onClick={() => setSelectedMonth(null)}
              className="btn btn-sm"
            >
              关闭预览
            </button>
          </div>

          <CalendarExport
            year={selectedMonth.year}
            month={selectedMonth.month - 1}
          />
        </div>
      )}

      {/* 使用说明 */}
      <div className="bg-gray-50 border border-black rounded-lg p-4">
        <h3 className="font-bold mb-2">使用说明</h3>
        <ul className="text-sm space-y-1 list-disc list-inside text-gray-700">
          <li>选择您要导出的月份范围（支持2023年1月至2099年12月）</li>
          <li>点击"预览选中月份"可以查看效果</li>
          <li>点击"下载图片"保存单个月份的日历图片</li>
          <li>图片包含该月的所有事件信息，采用黑白手绘风格</li>
          <li>导出的图片为PNG格式，高分辨率，适合打印或分享</li>
          <li>建议导出前在日历页面确认事件信息正确</li>
        </ul>
      </div>
    </div>
  )
}