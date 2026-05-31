import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const unit = searchParams.get('unit') || 'Unit 1'
    const type = searchParams.get('type') || null
    
    // 读取练习题数据
    const filePath = path.join(process.cwd(), 'data', 'exercises', `${unit.toLowerCase().replace(' ', '-')}-exercises.json`)
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: `未找到 ${unit} 的练习题数据` },
        { status: 404 }
      )
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const data = JSON.parse(fileContent)
    
    let exercises = data.exercises
    
    // 如果指定了题型，进行过滤
    if (type) {
      exercises = exercises.filter((ex: any) => ex.type === type)
    }
    
    return NextResponse.json({
      success: true,
      unit: unit,
      total_exercises: exercises.length,
      exercises: exercises
    })
  } catch (error) {
    console.error('读取练习题数据失败:', error)
    return NextResponse.json(
      { error: '读取练习题数据失败' },
      { status: 500 }
    )
  }
}