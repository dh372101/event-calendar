import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { format, startMonth, endMonth } = await request.json()
    
    // 这里应该实现数据导出逻辑
    // 由于数据存储在浏览器端，这个API主要用于处理文件格式转换
    
    if (format === 'csv') {
      // 生成CSV格式数据
      const csvData = '日期,类型,名称,地点,城市,颜色\n2024-05-22,Live,演出名A,梅赛德斯奔驰文化中心,上海,#FF6666'
      
      return NextResponse.json({
        success: true,
        data: csvData,
        filename: `events-${startMonth}-${endMonth}.csv`
      })
    } else if (format === 'json') {
      // 生成JSON格式数据
      const jsonData = {
        events: {
          "2024-05-22": {
            type: ["Live"],
            name: "演出名A",
            place: "梅赛德斯奔驰文化中心",
            city: "上海",
            color: "#FF6666"
          }
        },
        tags: {
          type: {
            'Live': '#000000',
            '干饭': '#FF6B6B',
            '旅行': '#4ECDC4',
            '运动': '#45B7D1'
          },
          place: ["梅赛德斯奔驰文化中心", "静安体育中心"],
          city: ["上海", "东京", "大阪"]
        }
      }
      
      return NextResponse.json({
        success: true,
        data: JSON.stringify(jsonData, null, 2),
        filename: `events-${startMonth}-${endMonth}.json`
      })
    }
    
    return NextResponse.json(
      { success: false, error: '不支持的格式' },
      { status: 400 }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '导出数据时发生错误' },
      { status: 500 }
    )
  }
}