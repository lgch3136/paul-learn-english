import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const unit = searchParams.get('unit') || 'Unit 1'
    const grammarDir = path.join(process.cwd(), 'data', 'grammar')

    // unit=all 时加载所有语法文件
    if (unit === 'all') {
      let allPoints: any[] = []
      const files = fs.readdirSync(grammarDir).filter(f => f.endsWith('-grammar.json'))
      for (const file of files) {
        try {
          const data = JSON.parse(fs.readFileSync(path.join(grammarDir, file), 'utf-8'))
          if (data.grammar_points) allPoints = allPoints.concat(data.grammar_points)
        } catch (e) { /* skip bad files */ }
      }
      return NextResponse.json({ success: true, unit: 'all', total_grammar_points: allPoints.length, grammar_points: allPoints })
    }

    const filePath = path.join(grammarDir, `${unit.toLowerCase().replace(' ', '-')}-grammar.json`)

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ success: true, unit, total_grammar_points: 0, grammar_points: [] })
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    return NextResponse.json({
      success: true,
      unit,
      total_grammar_points: data.grammar_points?.length || 0,
      grammar_points: data.grammar_points || []
    })
  } catch (error) {
    console.error('读取语法数据失败:', error)
    return NextResponse.json({ error: '读取语法数据失败' }, { status: 500 })
  }
}