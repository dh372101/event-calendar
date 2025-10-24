import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: '没有上传文件' },
        { status: 400 }
      )
    }
    
    const fileContent = await file.text()
    let importedData: any
    
    if (file.name.endsWith('.csv')) {
      // 解析CSV文件
      // 这里简化处理，实际应该使用CSV解析库
      importedData = { events: {}, tags: {} }
    } else if (file.name.endsWith('.json')) {
      try {
        importedData = JSON.parse(fileContent)
      } catch {
        return NextResponse.json(
          { success: false, error: 'JSON文件格式错误' },
          { status: 400 }
        )
      }
    } else {
      return NextResponse.json(
        { success: false, error: '不支持的文件格式' },
        { status: 400 }
      )
    }
    
    // 验证数据结构
    if (!importedData.events || !importedData.tags) {
      return NextResponse.json(
        { success: false, error: '数据格式不正确' },
        { status: 400 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: '数据导入成功（演示版本，实际数据将保存到浏览器存储）',
      importedCount: Object.keys(importedData.events).length
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '导入数据时发生错误' },
      { status: 500 }
    )
  }
}