import fs from 'fs'
import path from 'path'
import { Vocabulary, GrammarPoint, Exercise, TextbookStructure } from '@/types'

const dataDirectory = path.join(process.cwd(), 'data')

// 读取教材结构
export async function getTextbookStructure(): Promise<TextbookStructure> {
  const filePath = path.join(dataDirectory, 'textbook-structure.json')
  const fileContents = fs.readFileSync(filePath, 'utf8')
  return JSON.parse(fileContents)
}

// 读取单词表
export async function getVocabulary(unit?: string): Promise<Vocabulary[]> {
  try {
    // 尝试读取特定单元的单词文件
    if (unit) {
      const unitFile = path.join(dataDirectory, 'vocabulary', `${unit.toLowerCase().replace(' ', '-')}-vocabulary.json`)
      if (fs.existsSync(unitFile)) {
        const fileContents = fs.readFileSync(unitFile, 'utf8')
        const data = JSON.parse(fileContents)
        return data.vocabulary || []
      }
    }

    // 如果没有找到特定单元文件，读取模板文件
    const filePath = path.join(dataDirectory, 'vocabulary', 'vocabulary-template.json')
    const fileContents = fs.readFileSync(filePath, 'utf8')
    const data = JSON.parse(fileContents)

    if (unit) {
      return data.vocabulary.filter((v: Vocabulary) => v.unit === unit)
    }
    return data.vocabulary || []
  } catch (error) {
    console.error('读取单词数据失败:', error)
    return []
  }
}

// 读取语法点
export async function getGrammarPoints(unit?: string): Promise<GrammarPoint[]> {
  try {
    // 尝试读取特定单元的语法文件
    if (unit) {
      const unitFile = path.join(dataDirectory, 'grammar', `${unit.toLowerCase().replace(' ', '-')}-grammar.json`)
      if (fs.existsSync(unitFile)) {
        const fileContents = fs.readFileSync(unitFile, 'utf8')
        const data = JSON.parse(fileContents)
        return data.grammar_points || []
      }
    }

    // 如果没有找到特定单元文件，读取模板文件
    const filePath = path.join(dataDirectory, 'grammar', 'grammar-template.json')
    const fileContents = fs.readFileSync(filePath, 'utf8')
    const data = JSON.parse(fileContents)

    if (unit) {
      return data.grammar_points.filter((g: GrammarPoint) => g.unit === unit)
    }
    return data.grammar_points || []
  } catch (error) {
    console.error('读取语法数据失败:', error)
    return []
  }
}

// 读取练习题
export async function getExercises(unit?: string, type?: string): Promise<Exercise[]> {
  try {
    // 尝试读取特定单元的练习题文件
    if (unit) {
      const unitFile = path.join(dataDirectory, 'exercises', `${unit.toLowerCase().replace(' ', '-')}-exercises.json`)
      if (fs.existsSync(unitFile)) {
        const fileContents = fs.readFileSync(unitFile, 'utf8')
        const data = JSON.parse(fileContents)
        let exercises = data.exercises || []

        if (type) {
          exercises = exercises.filter((e: Exercise) => e.type === type)
        }
        return exercises
      }
    }

    // 如果没有找到特定单元文件，读取模板文件
    const filePath = path.join(dataDirectory, 'exercises', 'exercises-template.json')
    const fileContents = fs.readFileSync(filePath, 'utf8')
    const data = JSON.parse(fileContents)

    let exercises = data.exercises || []

    if (unit) {
      exercises = exercises.filter((e: Exercise) => e.unit === unit)
    }

    if (type) {
      exercises = exercises.filter((e: Exercise) => e.type === type)
    }

    return exercises
  } catch (error) {
    console.error('读取练习题数据失败:', error)
    return []
  }
}

// 读取错因标签
export async function getErrorTags() {
  const filePath = path.join(dataDirectory, 'error-tags.json')
  const fileContents = fs.readFileSync(filePath, 'utf8')
  return JSON.parse(fileContents)
}

// 获取今日任务（模拟）
export async function getTodayTask(studentId: string) {
  // 这里应该从数据库读取，MVP 阶段先返回模拟数据
  return {
    student_id: studentId,
    date: new Date().toISOString().split('T')[0],
    unit: 'Unit 1',
    tasks: [
      {
        type: 'review',
        title: '复习昨天错词',
        description: '复习 3 个昨天拼写错误的单词',
        duration: 2,
        items: ['play', 'football', 'every']
      },
      {
        type: 'learn',
        title: '学习今天新词',
        description: '学习 5 个新单词',
        duration: 3,
        items: ['always', 'usually', 'often', 'sometimes', 'never']
      },
      {
        type: 'practice',
        title: '语法小练',
        description: '完成 5 道一般现在时练习',
        duration: 3,
        items: ['exercise_unit_1_001', 'exercise_unit_1_002', 'exercise_unit_1_003', 'exercise_unit_1_004', 'exercise_unit_1_005']
      },
      {
        type: 'output',
        title: '跟读/造句',
        description: '用今天学的词造 3 个句子',
        duration: 2,
        items: []
      }
    ],
    total_duration: 10,
    status: 'pending'
  }
}

// 获取学生进度（模拟）
export async function getStudentProgress(studentId: string) {
  // 这里应该从数据库读取，MVP 阶段先返回模拟数据
  return {
    student_id: studentId,
    unit: 'Unit 1',
    total_words: 20,
    mastered_words: 12,
    weak_words: ['because', 'usually', 'never'],
    grammar_mastery: {
      '一般现在时': 75,
      'be动词': 90,
      '疑问词': 60
    },
    error_tags: {
      '动词形式错': { frequency: 5, trend: 'improving' },
      '句序错': { frequency: 3, trend: 'stable' },
      '拼写错': { frequency: 2, trend: 'improving' }
    },
    streak: 3,
    total_time: 45
  }
}

// 保存答题记录（模拟）
export async function saveAnswerLog(answerLog: any) {
  // 这里应该保存到数据库，MVP 阶段先打印日志
  console.log('保存答题记录:', answerLog)
  return { success: true, log_id: `log_${Date.now()}` }
}

// 获取家长日报（模拟）
export async function getDailyReport(studentId: string, date?: string) {
  // 这里应该从数据库生成，MVP 阶段先返回模拟数据
  return {
    report_id: `report_${Date.now()}`,
    student_id: studentId,
    date: date || new Date().toISOString().split('T')[0],
    unit: 'Unit 1',
    practice_duration: 12,
    words_mastered: ['play', 'football', 'every', 'day'],
    words_need_review: ['because', 'usually'],
    grammar_errors: [
      {
        tag: '动词形式错',
        count: 3,
        example: 'He play football. (应为 plays)'
      }
    ],
    suggestions: [
      '让孩子口头说 3 句含有第三人称单数的句子',
      '复习 because 的用法，造 2 个句子'
    ],
    tomorrow_plan: {
      review_words: ['because', 'usually'],
      grammar_focus: '一般现在时第三人称单数',
      estimated_time: 10
    }
  }
}