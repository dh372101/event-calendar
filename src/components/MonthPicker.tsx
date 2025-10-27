'use client'

interface MonthPickerProps {
  startYear: number
  startMonth: number
  endYear: number
  endMonth: number
  onStartYearChange: (year: number) => void
  onStartMonthChange: (month: number) => void
  onEndYearChange: (year: number) => void
  onEndMonthChange: (month: number) => void
}

const months = [
  '1月', '2月', '3月', '4月', '5月', '6月',
  '7月', '8月', '9月', '10月', '11月', '12月'
]

export default function MonthPicker({
  startYear,
  startMonth,
  endYear,
  endMonth,
  onStartYearChange,
  onStartMonthChange,
  onEndYearChange,
  onEndMonthChange,
}: MonthPickerProps) {
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1

  // 生成年份选项（2023年到2099年）
  const currentYearForDisplay = new Date().getFullYear()
  const generateYearOptions = () => {
    const years = []
    for (let year = 2023; year <= Math.min(2099, currentYearForDisplay); year++) {
      years.push(year)
    }
    return years
  }

  const yearOptions = generateYearOptions()

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-6">
        {/* 开始月份选择 */}
        <div className="space-y-2">
          <label className="form-label">起始月份</label>
          <div className="grid grid-cols-2 gap-2">
            <select
              value={startYear}
              onChange={(e) => onStartYearChange(Number(e.target.value))}
              className="form-select"
            >
              {yearOptions.map(year => (
                <option key={year} value={year}>
                  {year}年
                </option>
              ))}
            </select>
            <select
              value={startMonth}
              onChange={(e) => onStartMonthChange(Number(e.target.value))}
              className="form-select"
            >
              {months.map((month, index) => (
                <option key={index} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 结束月份选择 */}
        <div className="space-y-2">
          <label className="form-label">截止月份</label>
          <div className="grid grid-cols-2 gap-2">
            <select
              value={endYear}
              onChange={(e) => onEndYearChange(Number(e.target.value))}
              className="form-select"
            >
              {yearOptions.map(year => (
                <option key={year} value={year}>
                  {year}年
                </option>
              ))}
            </select>
            <select
              value={endMonth}
              onChange={(e) => onEndMonthChange(Number(e.target.value))}
              className="form-select"
            >
              {months.map((month, index) => (
                <option key={index} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 范围说明 */}
      <div className="text-sm text-gray-600 bg-gray-50 border border-black rounded p-3">
        <p className="font-medium mb-1">选择范围：</p>
        <p>从 {startYear}年{startMonth}月 到 {endYear}年{endMonth}月</p>
        <p className="text-xs mt-1">
          起始时间不早于2023年1月，截止时间不超过当前月份或2099年12月
        </p>
      </div>
    </div>
  )
}