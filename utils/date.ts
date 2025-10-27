// 日期工具函数
export class DateUtil {
  // 获取月份第一天
  static getFirstDayOfMonth(year: number, month: number): number {
    return new Date(year, month, 1).getDay();
  }

  // 获取月份天数
  static getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
  }

  // 获取上个月信息
  static getPreviousMonth(year: number, month: number): { year: number; month: number } {
    if (month === 0) {
      return { year: year - 1, month: 11 };
    }
    return { year, month: month - 1 };
  }

  // 获取下个月信息
  static getNextMonth(year: number, month: number): { year: number; month: number } {
    if (month === 11) {
      return { year: year + 1, month: 0 };
    }
    return { year, month: month + 1 };
  }

  // 格式化日期为 YYYY-MM-DD
  static formatDate(year: number, month: number, day: number): string {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  }

  // 解析日期字符串
  static parseDate(dateStr: string): { year: number; month: number; day: number } | null {
    const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return null;

    return {
      year: parseInt(match[1]),
      month: parseInt(match[2]) - 1,
      day: parseInt(match[3]),
    };
  }

  // 获取当前月份
  static getCurrentMonth(): { year: number; month: number } {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth(),
    };
  }

  // 格式化月份显示
  static formatMonth(year: number, month: number): string {
    const months = [
      '1月', '2月', '3月', '4月', '5月', '6月',
      '7月', '8月', '9月', '10月', '11月', '12月'
    ];
    return `${year}年${months[month]}`;
  }

  // 获取星期名称
  static getWeekDayName(dayIndex: number): string {
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    return days[dayIndex];
  }

  // 检查日期是否为今天
  static isToday(year: number, month: number, day: number): boolean {
    const today = new Date();
    return (
      year === today.getFullYear() &&
      month === today.getMonth() &&
      day === today.getDate()
    );
  }

  // 获取日期范围内的所有月份
  static getMonthsInRange(startMonth: string, endMonth: string): string[] {
    const [startYear, startMonthNum] = startMonth.split('-').map(Number);
    const [endYear, endMonthNum] = endMonth.split('-').map(Number);

    const months: string[] = [];
    let currentYear = startYear;
    let currentMonth = startMonthNum;

    while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonthNum)) {
      months.push(`${currentYear}-${String(currentMonth).padStart(2, '0')}`);

      if (currentMonth === 12) {
        currentYear++;
        currentMonth = 1;
      } else {
        currentMonth++;
      }
    }

    return months;
  }

  // 获取当前月份字符串
  static getCurrentMonthString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    return `${year}-${String(month).padStart(2, '0')}`;
  }
}