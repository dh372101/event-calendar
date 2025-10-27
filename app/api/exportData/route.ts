import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { format, startMonth, endMonth, events } = body

    // 验证输入参数
    if (!format || !startMonth || !endMonth) {
      return NextResponse.json(
        { error: '缺少必要的参数: format, startMonth, endMonth' },
        { status: 400 }
      )
    }

    if (!['csv', 'json'].includes(format)) {
      return NextResponse.json(
        { error: 'format参数必须是 csv 或 json' },
        { status: 400 }
      )
    }

    // 处理事件数据
    let fileContent = ''
    let contentType = ''
    let filename = ''

    if (format === 'csv') {
      // CSV格式导出
      const headers = ['日期', '事件名称', '类型', '地点', '城市', '颜色']
      const rows = events?.map((event: any) => [
        event.date,
        `"${event.name?.replace(/"/g, '""') || ''}"`,
        `"${(event.type || []).join('、')}"`,
        `"${event.place?.replace(/"/g, '""') || ''}"`,
        `"${event.city?.replace(/"/g, '""') || ''}"`,
        event.color || '#666666'
      ]) || []

      fileContent = [headers.join(','), ...rows.map((row: string[]) => row.join(','))].join('\n')
      contentType = 'text/csv; charset=utf-8'
      filename = `演出日历_${startMonth}_${endMonth}.csv`
    } else {
      // JSON格式导出
      fileContent = JSON.stringify(events || [], null, 2)
      contentType = 'application/json'
      filename = `演出日历_${startMonth}_${endMonth}.json`
    }

    // 创建响应
    const response = new NextResponse(fileContent)
    response.headers.set('Content-Type', contentType)
    response.headers.set('Content-Disposition', `attachment; filename="${filename}"`)
    response.headers.set('Cache-Control', 'no-cache')

    return response
  } catch (error) {
    console.error('导出数据API错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// 支持GET请求用于测试
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: '导出数据API服务正常',
    supported_formats: ['csv', 'json'],
    usage: '使用POST方法提交JSON数据，包含format, startMonth, endMonth, events参数'
  })
}