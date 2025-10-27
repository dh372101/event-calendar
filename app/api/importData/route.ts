import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: '没有上传文件' },
        { status: 400 }
      )
    }

    // 检查文件类型
    const fileName = file.name.toLowerCase()
    if (!fileName.endsWith('.csv') && !fileName.endsWith('.json')) {
      return NextResponse.json(
        { error: '只支持CSV和JSON格式的文件' },
        { status: 400 }
      )
    }

    // 读取文件内容
    const fileContent = await file.text()
    let importedEvents: any[] = []

    try {
      if (fileName.endsWith('.csv')) {
        // 解析CSV
        const lines = fileContent.split('\n').filter(line => line.trim())
        if (lines.length < 2) {
          throw new Error('CSV文件格式错误')
        }

        const headers = lines[0].split(',').map((h: string) => h.replace(/"/g, '').trim())
        importedEvents = lines.slice(1).map(line => {
          const values = line.split(',').map((v: string) => v.replace(/"/g, '').trim())
          return {
            date: values[0],
            name: values[1],
            type: values[2] ? values[2].split('、') : [],
            place: values[3],
            city: values[4],
            color: values[5] || '#666666'
          }
        }).filter(event => event.date) // 过滤掉空行
      } else {
        // 解析JSON
        importedEvents = JSON.parse(fileContent)
        
        // 验证JSON格式
        if (!Array.isArray(importedEvents)) {
          throw new Error('JSON文件必须包含事件数组')
        }
      }

      // 验证导入的数据结构
      const validatedEvents = importedEvents.map(event => ({
        date: event.date || '',
        name: event.name || '',
        type: Array.isArray(event.type) ? event.type : [event.type].filter(Boolean),
        place: event.place || '',
        city: event.city || '',
        color: event.color || '#666666'
      })).filter(event => event.date && event.name) // 过滤无效数据

      return NextResponse.json({
        success: true,
        message: `成功导入 ${validatedEvents.length} 条事件`,
        data: {
          importedCount: validatedEvents.length,
          invalidCount: importedEvents.length - validatedEvents.length,
          events: validatedEvents.slice(0, 10) // 返回前10条作为预览
        }
      })

    } catch (parseError) {
      return NextResponse.json(
        { error: `文件解析错误: ${parseError instanceof Error ? parseError.message : '未知错误'}` },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('导入数据API错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// 支持GET请求用于测试
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: '导入数据API服务正常',
    supported_formats: ['csv', 'json'],
    usage: '使用POST方法上传文件，支持multipart/form-data格式'
  })
}