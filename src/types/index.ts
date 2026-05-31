// 单词类型
export interface Vocabulary {
  word_id: string
  grade: number
  book: string
  unit: string
  section: string
  word: string
  meaning: string
  part_of_speech: 'noun' | 'verb' | 'adjective' | 'adverb' | 'preposition' | 'conjunction' | 'pronoun'
  phrase: string[]
  sentence: string
  phonetic: string
  listen_audio: string
  image_prompt: string
  error_tags: string[]
  review_level: number
  abilities: {
    listen: number
    recognize: number
    speak: number
    spell: number
    use: number
  }
}

// 语法点类型
export interface GrammarPoint {
  grammar_id: string
  unit: string
  grammar_point: string
  category: 'tense' | 'structure' | 'usage' | 'pattern'
  student_explanation: string
  teacher_explanation: string
  correct_examples: {
    sentence: string
    translation: string
    highlight: string
  }[]
  wrong_examples: {
    sentence: string
    correction: string
    error_type: string
  }[]
  error_reason: string
  error_tags: string[]
  practice_types: string[]
  difficulty: number
  related_vocabulary: string[]
}

// 练习题类型
export interface Exercise {
  question_id: string
  unit: string
  type: 'listen_choice' | 'recognize_choice' | 'spell_fill' | 'correct_error' | 'sentence_make' | 'translate'
  skill: 'listening' | 'reading' | 'writing' | 'grammar'
  difficulty: number
  question: string
  options: string[] | null
  answer: string
  explanation: string
  error_tag: string
  related_vocabulary: string[]
  related_grammar: string | null
  next_if_wrong: string
  next_if_right: string
  time_limit: number
}

// 学生答题记录
export interface AnswerLog {
  log_id: string
  student_id: string
  question_id: string
  unit: string
  student_answer: string
  is_correct: boolean
  error_tag: string | null
  time_spent: number
  created_at: string
}

// 学生进度
export interface StudentProgress {
  student_id: string
  unit: string
  vocabulary_mastery: {
    [word_id: string]: {
      listen: number
      recognize: number
      speak: number
      spell: number
      use: number
    }
  }
  grammar_mastery: {
    [grammar_id: string]: number
  }
  error_tags: {
    [tag_name: string]: {
      frequency: number
      last_occurrence: string
      improvement_trend: 'improving' | 'stable' | 'declining'
    }
  }
  daily_streak: number
  total_practice_time: number
  last_practice_date: string
}

// 家长日报
export interface DailyReport {
  report_id: string
  student_id: string
  date: string
  unit: string
  practice_duration: number
  words_mastered: string[]
  words_need_review: string[]
  grammar_errors: {
    tag: string
    count: number
    example: string
  }[]
  suggestions: string[]
  tomorrow_plan: {
    review_words: string[]
    grammar_focus: string
    estimated_time: number
  }
}

// 复习计划
export interface ReviewPlan {
  plan_id: string
  student_id: string
  date: string
  items: {
    type: 'vocabulary' | 'grammar' | 'exercise'
    id: string
    priority: 'high' | 'medium' | 'low'
    reason: string
  }[]
  estimated_time: number
}

// 教材结构
export interface TextbookStructure {
  textbook: {
    name: string
    version: string
    publisher: string
    editor: string
    grade: number
    semester: string
    total_units: number
    total_modules: number
    units_per_module: number
  }
  structure: {
    modules: {
      module_id: number
      module_name: string
      units: number[]
      project: {
        project_id: number
        project_name: string
        description: string
      }
    }[]
    units: {
      unit_id: number
      unit_name: string
      theme: string
      big_question: string
      sections: {
        section_id: string
        section_name: string
        description: string
      }[]
    }[]
  }
}

// 错因标签
export interface ErrorTag {
  tag_id: string
  tag_name: string
  description: string
  student_hint: string
  parent_hint: string
  related_grammar: string[]
  common_mistakes: string[]
  practice_suggestions: string[]
}