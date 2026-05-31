import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const unit = searchParams.get('unit') || 'Unit 1'
    const vocabDir = path.join(process.cwd(), 'data', 'vocabulary')

    // unit=all 时加载所有词汇文件
    if (unit === 'all') {
      let allVocabulary: any[] = []
      const files = fs.readdirSync(vocabDir).filter(f => f.endsWith('-vocabulary.json'))
      for (const file of files) {
        try {
          const data = JSON.parse(fs.readFileSync(path.join(vocabDir, file), 'utf-8'))
          if (data.vocabulary) allVocabulary = allVocabulary.concat(data.vocabulary)
        } catch (e) { /* skip bad files */ }
      }
      return NextResponse.json({ success: true, unit: 'all', total_words: allVocabulary.length, vocabulary: allVocabulary })
    }

    // 读取指定单元的单词数据
    const filePath = path.join(vocabDir, `${unit.toLowerCase().replace(' ', '-')}-vocabulary.json`)

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ success: true, unit, total_words: 0, vocabulary: [] })
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    return NextResponse.json({
      success: true,
      unit,
      total_words: data.vocabulary?.length || 0,
      vocabulary: data.vocabulary || []
    })
  } catch (error) {
    console.error('读取单词数据失败:', error)
    return NextResponse.json({ error: '读取单词数据失败' }, { status: 500 })
  }
}