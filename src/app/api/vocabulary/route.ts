import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// 成人阶段文件名映射
const adultFileMap: Record<string, string> = {
  'adult1': 'adult-basic-850-vocabulary.json',
  'adult2': 'adult-ielts-vocabulary.json',
  'adult3': 'adult-professional-vocabulary.json',
}

// 五年级下册旧文件名映射
const g5dnUnitMap: Record<string, string> = {
  'g5dn-unit1': 'unit-1-vocabulary.json',
  'g5dn-unit2': 'unit-2-vocabulary.json',
  'g5dn-unit3': 'unit-3-vocabulary.json',
  'g5dn-unit4': 'unit-4-vocabulary.json',
  'g5dn-unit5': 'unit-5-vocabulary.json',
  'g5dn-unit6': 'unit-6-vocabulary.json',
  'g5dn-unit7': 'unit-7-vocabulary.json',
  'g5dn-unit8': 'unit-8-vocabulary.json',
}

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

    // 确定文件名
    let fileName: string
    if (adultFileMap[unit]) {
      fileName = adultFileMap[unit]
    } else if (g5dnUnitMap[unit]) {
      fileName = g5dnUnitMap[unit]
    } else {
      fileName = `${unit.toLowerCase().replace(/ /g, '-')}-vocabulary.json`
    }

    const filePath = path.join(vocabDir, fileName)

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
