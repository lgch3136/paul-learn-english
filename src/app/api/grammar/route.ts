import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// 映射年级简称到语法文件名
const gradeFileMap: Record<string, string> = {
  'g3up': 'grade-3-grammar.json',
  'g3dn': 'grade-3-grammar.json',
  'g4up': 'grade-4-grammar.json',
  'g4dn': 'grade-4-grammar.json',
  'g5up': 'grade-5-up-grammar.json',
  'g5dn': 'grade-5-down-grammar.json',
  'g6up': 'grade-6-up-grammar.json',
  'g6dn': 'grade-6-down-grammar.json',
}

function getFilePath(unit: string, grammarDir: string): string {
  // 处理新的 unit ID 格式: g3up-unit1, g5dn-unit3 等
  const unitMatch = unit.match(/^(g\d+(?:up|dn))-unit(\d+)$/)
  if (unitMatch) {
    const gradeKey = unitMatch[1]
    const unitNum = parseInt(unitMatch[2])
    const fileName = gradeFileMap[gradeKey]
    if (fileName) {
      const filePath = path.join(grammarDir, fileName)
      return filePath
    }
  }
  // 处理旧格式: "Unit 1", "Grade 3", "all"
  return path.join(grammarDir, `${unit.toLowerCase().replace(/ /g, '-')}-grammar.json`)
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const unit = searchParams.get('unit') || 'Unit 1'
    const grammarDir = path.join(process.cwd(), 'data', 'grammar')

    // unit=all 时加载所有语法文件
    if (unit === 'all') {
      let allPoints: any[] = []
      const files = fs.readdirSync(grammarDir).filter(f => f.endsWith('-grammar.json') && !f.includes('template'))
      for (const file of files) {
        try {
          const data = JSON.parse(fs.readFileSync(path.join(grammarDir, file), 'utf-8'))
          if (data.grammar_points) allPoints = allPoints.concat(data.grammar_points)
        } catch (e) { /* skip */ }
      }
      return NextResponse.json({ success: true, unit: 'all', total_grammar_points: allPoints.length, grammar_points: allPoints })
    }

    // 新格式: g3up-unit1 → 读取年级文件，过滤对应 unit 的语法点
    const unitMatch = unit.match(/^(g\d+(?:up|dn))-unit(\d+)$/)
    if (unitMatch) {
      const gradeKey = unitMatch[1] // e.g. g3up
      const unitId = unit // e.g. g3up-unit1
      const fileName = gradeFileMap[gradeKey]
      if (fileName) {
        const filePath = path.join(grammarDir, fileName)
        if (fs.existsSync(filePath)) {
          const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
          const allPoints = data.grammar_points || []
          // 先尝试精确匹配 unit 字段（新格式的文件）
          let points = allPoints.filter((p: any) => p.unit === unitId)
          // 如果没有匹配，说明是旧格式的年级文件（unit="Grade 3"），返回该年级全部语法点
          if (points.length === 0) {
            points = allPoints
          }
          return NextResponse.json({ success: true, unit, total_grammar_points: points.length, grammar_points: points })
        }
      }
      return NextResponse.json({ success: true, unit, total_grammar_points: 0, grammar_points: [] })
    }

    // 旧格式
    const filePath = path.join(grammarDir, `${unit.toLowerCase().replace(/ /g, '-')}-grammar.json`)
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
