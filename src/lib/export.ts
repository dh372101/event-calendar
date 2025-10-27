import Papa from 'papaparse'
import { saveAs } from 'file-saver'
import { Event } from '@/types'

export class DataExporter {
  // 导出为CSV格式
  static exportToCSV(events: Event[], filename?: string): void {
    const csvData = events.map(event => ({
      日期: event.date,
      类型: event.types.join(';'),
      名称: event.name,
      地点: event.location || '',
      城市: event.city || '',
      颜色: event.color,
    }))

    const csv = Papa.unparse(csvData, {
      header: true,
      encoding: 'utf-8',
    })

    // 添加BOM以确保中文正确显示
    const BOM = '\uFEFF'
    const csvWithBOM = BOM + csv

    const blob = new Blob([csvWithBOM], {
      type: 'text/csv;charset=utf-8;'
    })

    const defaultFilename = `events-${new Date().toISOString().split('T')[0]}.csv`
    saveAs(blob, filename || defaultFilename)
  }

  // 导出为JSON格式
  static exportToJSON(events: Event[], filename?: string): void {
    const jsonData = {
      exportDate: new Date().toISOString(),
      version: '1.0.0',
      count: events.length,
      events: events,
    }

    const json = JSON.stringify(jsonData, null, 2)
    const blob = new Blob([json], {
      type: 'application/json;charset=utf-8;'
    })

    const defaultFilename = `events-${new Date().toISOString().split('T')[0]}.json`
    saveAs(blob, filename || defaultFilename)
  }

  // 从CSV导入数据
  static async importFromCSV(file: File): Promise<Event[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        encoding: 'UTF-8',
        complete: (results) => {
          try {
            const events: Event[] = results.data
              .filter((row: any) => row.日期 && row.名称) // 过滤空行
              .map((row: any, index: number) => ({
                id: `${new Date().getTime()}-${index}`, // 生成新ID避免冲突
                date: row.日期,
                types: row.类型 ? row.类型.split(';').filter((t: string) => t.trim()) : [],
                name: row.名称,
                location: row.地点 || '',
                city: row.城市 || '',
                color: row.颜色 || '#000000',
              }))
            resolve(events)
          } catch (error) {
            reject(new Error('CSV文件格式错误：' + error))
          }
        },
        error: (error) => {
          reject(new Error('CSV文件解析失败：' + error))
        },
      })
    })
  }

  // 从JSON导入数据
  static async importFromJSON(file: File): Promise<Event[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string
          const data = JSON.parse(content)

          let events: Event[] = []

          // 兼容不同的JSON格式
          if (data.events && Array.isArray(data.events)) {
            // 标准格式（我们导出的格式）
            events = data.events.map((event: any, index: number) => ({
              id: `${new Date().getTime()}-${index}`, // 生成新ID避免冲突
              ...event,
            }))
          } else if (Array.isArray(data)) {
            // 直接是事件数组
            events = data.map((event: any, index: number) => ({
              id: `${new Date().getTime()}-${index}`, // 生成新ID避免冲突
              ...event,
            }))
          } else {
            throw new Error('不支持的JSON格式')
          }

          // 验证必要字段
          events = events.filter(event => {
            return event.date && event.name
          })

          resolve(events)
        } catch (error) {
          reject(new Error('JSON文件格式错误：' + error))
        }
      }
      reader.onerror = () => {
        reject(new Error('文件读取失败'))
      }
      reader.readAsText(file, 'UTF-8')
    })
  }

  // 验证导入的数据格式
  static validateImportData(events: Event[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    events.forEach((event, index) => {
      // 验证日期格式
      if (!event.date || !/^\d{4}-\d{2}-\d{2}$/.test(event.date)) {
        errors.push(`第${index + 1}行：日期格式不正确，应为 YYYY-MM-DD 格式`)
      }

      // 验证必要字段
      if (!event.name || event.name.trim() === '') {
        errors.push(`第${index + 1}行：事件名称不能为空`)
      }

      // 验证颜色格式
      if (event.color && !/^#[0-9A-F]{6}$/i.test(event.color)) {
        errors.push(`第${index + 1}行：颜色格式不正确，应为 #RRGGBB 格式`)
      }

      // 验证类型
      if (event.types && !Array.isArray(event.types)) {
        errors.push(`第${index + 1}行：事件类型应为数组`)
      }
    })

    return {
      isValid: errors.length === 0,
      errors,
    }
  }
}