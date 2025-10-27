import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { startMonth, endMonth } = body

    // 验证输入参数
    if (!startMonth || !endMonth) {
      return NextResponse.json(
        { error: '缺少必要的参数: startMonth, endMonth' },
        { status: 400 }
      )
    }

    // 这里应该是实际的图片生成逻辑
    // 由于在前端已经使用html2canvas实现，这里主要提供服务器端渲染的备选方案
    // 实际部署时可以根据需要实现服务器端渲染

    const result = {
      success: true,
      message: '图片生成请求已接收',
      data: {
        startMonth,
        endMonth,
        imageUrl: `/api/generated/calendar_${startMonth}_${endMonth}.png`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24小时后过期
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('导出图片API错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// 支持GET请求用于测试
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const startMonth = searchParams.get('startMonth') || '2024-01'
  const endMonth = searchParams.get('endMonth') || '2024-12'

  return NextResponse.json({
    message: '导出图片API服务正常',
    example: {
      startMonth,
      endMonth,
      usage: '使用POST方法提交JSON数据'
    }
  })
}