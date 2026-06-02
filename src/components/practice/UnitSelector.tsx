'use client'

import { useState } from 'react'
import { sounds } from '@/lib/sounds'

export interface GameScope {
  type: 'single' | 'multiple' | 'semester' | 'all'
  units: string[]
  label: string
  questionCount: number
}

interface UnitSelectorProps {
  onSelect: (scope: GameScope) => void
  currentScope?: GameScope
}

interface GradeData {
  id: string
  label: string
  icon: string
  color: string
  semesters: {
    id: string
    label: string
    units: { id: string; label: string }[]
  }[]
}

const gradeData: GradeData[] = [
  {
    id: 'g3', label: '三年级', icon: '📗', color: 'from-lime-400 to-green-500',
    semesters: [
      { id: 'g3up', label: '上册', units: [
        { id: 'g3up-unit1', label: 'U1 Hello!' },
        { id: 'g3up-unit2', label: "U2 I'm Liu Tao" },
        { id: 'g3up-unit3', label: 'U3 My friends' },
        { id: 'g3up-unit4', label: 'U4 My family' },
        { id: 'g3up-unit5', label: 'U5 Look at me!' },
        { id: 'g3up-unit6', label: 'U6 Colours' },
      ]},
      { id: 'g3dn', label: '下册', units: [
        { id: 'g3dn-unit1', label: 'U1 In class' },
        { id: 'g3dn-unit2', label: 'U2 In the library' },
        { id: 'g3dn-unit3', label: "U3 Is this your pencil?" },
        { id: 'g3dn-unit4', label: "U4 Where's the bird?" },
        { id: 'g3dn-unit5', label: 'U5 How old are you?' },
        { id: 'g3dn-unit6', label: "U6 What time is it?" },
      ]},
    ],
  },
  {
    id: 'g4', label: '四年级', icon: '📘', color: 'from-sky-400 to-blue-500',
    semesters: [
      { id: 'g4up', label: '上册', units: [
        { id: 'g4up-unit1', label: 'U1 I like dogs' },
        { id: 'g4up-unit2', label: 'U2 Fruit salad' },
        { id: 'g4up-unit3', label: 'U3 How many?' },
        { id: 'g4up-unit4', label: 'U4 Basketball' },
        { id: 'g4up-unit5', label: 'U5 Our new home' },
        { id: 'g4up-unit6', label: 'U6 Snack bar' },
      ]},
      { id: 'g4dn', label: '下册', units: [
        { id: 'g4dn-unit1', label: 'U1 My day' },
        { id: 'g4dn-unit2', label: 'U2 After school' },
        { id: 'g4dn-unit3', label: 'U3 My day' },
        { id: 'g4dn-unit4', label: 'U4 Drawing' },
        { id: 'g4dn-unit5', label: 'U5 Seasons' },
        { id: 'g4dn-unit6', label: 'U6 Whose dress?' },
      ]},
    ],
  },
  {
    id: 'g5', label: '五年级', icon: '📙', color: 'from-orange-400 to-amber-500',
    semesters: [
      { id: 'g5up', label: '上册', units: [
        { id: 'g5up-unit1', label: 'U1 Goldilocks' },
        { id: 'g5up-unit2', label: 'U2 A new student' },
        { id: 'g5up-unit3', label: 'U3 Animal friends' },
        { id: 'g5up-unit4', label: 'U4 Hobbies' },
        { id: 'g5up-unit5', label: 'U5 What do they do?' },
        { id: 'g5up-unit6', label: 'U6 My e-friend' },
        { id: 'g5up-unit7', label: 'U7 At weekends' },
        { id: 'g5up-unit8', label: 'U8 At Christmas' },
      ]},
      { id: 'g5dn', label: '下册', units: [
        { id: 'Unit 1', label: 'U1 Cinderella' },
        { id: 'Unit 2', label: 'U2 How do you come?' },
        { id: 'Unit 3', label: 'U3 Asking the way' },
        { id: 'Unit 4', label: 'U4 Seeing the doctor' },
        { id: 'Unit 5', label: 'U5 Helping parents' },
        { id: 'Unit 6', label: 'U6 In the kitchen' },
        { id: 'Unit 7', label: 'U7 Chinese festivals' },
        { id: 'Unit 8', label: 'U8 Birthdays' },
      ]},
    ],
  },
  {
    id: 'g6', label: '六年级', icon: '📕', color: 'from-rose-400 to-pink-500',
    semesters: [
      { id: 'g6up', label: '上册', units: [
        { id: 'g6up-unit1', label: "U1 King's clothes" },
        { id: 'g6up-unit2', label: 'U2 What a day!' },
        { id: 'g6up-unit3', label: 'U3 Holiday fun' },
        { id: 'g6up-unit4', label: 'U4 Then and now' },
        { id: 'g6up-unit5', label: 'U5 Signs' },
        { id: 'g6up-unit6', label: 'U6 Keep city clean' },
        { id: 'g6up-unit7', label: 'U7 Protect Earth' },
        { id: 'g6up-unit8', label: 'U8 Chinese New Year' },
      ]},
      { id: 'g6dn', label: '下册', units: [
        { id: 'g6dn-unit1', label: 'U1 Lion & mouse' },
        { id: 'g6dn-unit2', label: 'U2 Good habits' },
        { id: 'g6dn-unit3', label: 'U3 Healthy diet' },
        { id: 'g6dn-unit4', label: 'U4 Road safety' },
        { id: 'g6dn-unit5', label: 'U5 A party' },
        { id: 'g6dn-unit6', label: 'U6 Interesting country' },
        { id: 'g6dn-unit7', label: 'U7 Holiday plans' },
        { id: 'g6dn-unit8', label: 'U8 Our dreams' },
      ]},
    ],
  },
]

const adultStages = [
  { id: 'adult1', title: '基础850词', subtitle: "Ogden's Basic English · 日常自由表达", icon: '🌍', color: 'from-emerald-400 to-teal-500', count: '230词' },
  { id: 'adult2', title: '雅思6.5词汇', subtitle: '学术核心高频词', icon: '🎓', color: 'from-blue-400 to-indigo-500', count: '100词' },
  { id: 'adult3', title: '专业英语', subtitle: '海外生活与工作必备', icon: '💼', color: 'from-purple-400 to-violet-500', count: '100词' },
]

const questionCounts = [
  { count: 10, label: '10题', icon: '⚡', desc: '快速', color: 'from-green-400 to-emerald-500' },
  { count: 20, label: '20题', icon: '📚', desc: '标准', color: 'from-blue-400 to-indigo-500' },
  { count: 30, label: '30题', icon: '💪', desc: '强化', color: 'from-purple-400 to-pink-500' },
  { count: 50, label: '50题', icon: '🔥', desc: '极限', color: 'from-orange-400 to-red-500' },
]

export default function UnitSelector({ onSelect, currentScope }: UnitSelectorProps) {
  const [tab, setTab] = useState<'school' | 'adult'>('school')
  const [expandedGrade, setExpandedGrade] = useState<string | null>(null)
  const [expandedSemester, setExpandedSemester] = useState<string | null>(null)
  const [checkedUnits, setCheckedUnits] = useState<string[]>([])
  const [selectedCount, setSelectedCount] = useState(10)

  const handleSelect = (units: string[], label: string, type: GameScope['type'] = 'single') => {
    sounds.correct()
    onSelect({ type, units, label, questionCount: selectedCount })
  }

  const handleAllHistory = () => handleSelect(['all'], '全部历史单词', 'all')

  // 获取从三年级到指定位置的所有单元ID
  const getAllUnitsUpTo = (targetGradeId: string, targetSemesterId?: string | null, targetUnitId?: string | null, targetUnitLabel?: string): { units: string[], label: string } => {
    const targetIndex = gradeData.findIndex(g => g.id === targetGradeId)
    if (targetIndex < 0) return { units: ['all'], label: '全部历史单词' }
    const allUnits: string[] = []
    for (let i = 0; i <= targetIndex; i++) {
      const grade = gradeData[i]
      if (i < targetIndex) {
        grade.semesters.forEach(s => s.units.forEach(u => allUnits.push(u.id)))
      } else {
        if (targetSemesterId) {
          const sem = grade.semesters.find(s => s.id === targetSemesterId)
          if (sem) {
            for (const s of grade.semesters) {
              if (s.id === targetSemesterId) break
              s.units.forEach(u => allUnits.push(u.id))
            }
            if (targetUnitId) {
              for (const u of sem.units) {
                allUnits.push(u.id)
                if (u.id === targetUnitId) break
              }
            } else {
              sem.units.forEach(u => allUnits.push(u.id))
            }
          }
        } else {
          grade.semesters.forEach(s => s.units.forEach(u => allUnits.push(u.id)))
        }
      }
    }
    const grade = gradeData[targetIndex]
    let label: string
    if (targetUnitId && targetSemesterId) {
      const sem = grade.semesters.find(s => s.id === targetSemesterId)
      label = `三年级至${grade.label}${sem?.label || ''} ${targetUnitLabel || ''}全部`
    } else if (targetSemesterId) {
      const sem = grade.semesters.find(s => s.id === targetSemesterId)
      label = `三年级至${grade.label}${sem?.label || ''}全部`
    } else {
      label = `三年级至${grade.label}全部`
    }
    return { units: allUnits, label }
  }

  // 从已勾选的单元中，找出在学期原始顺序中最后的那个（作为历史截止点）
  const getHistoryCutoff = (): { unitId: string; unitLabel: string } | null => {
    if (!expandedGrade || !expandedSemester || checkedUnits.length === 0) return null
    const grade = gradeData.find(g => g.id === expandedGrade)
    if (!grade) return null
    const sem = grade.semesters.find(s => s.id === expandedSemester)
    if (!sem) return null
    // 按原始顺序找最后一个被勾选的单元
    let cutoff: { unitId: string; unitLabel: string } | null = null
    for (const u of sem.units) {
      if (checkedUnits.includes(u.id)) {
        cutoff = { unitId: u.id, unitLabel: u.label }
      }
    }
    return cutoff
  }

  const handleHistoryUpToGrade = (targetGradeId: string, targetSemesterId?: string | null, targetUnitId?: string | null, targetUnitLabel?: string) => {
    const { units, label } = getAllUnitsUpTo(targetGradeId, targetSemesterId, targetUnitId, targetUnitLabel)
    handleSelect(units, label, 'all')
  }

  // 当前的"全部历史"范围
  const historyCutoff = getHistoryCutoff()
  const currentHistoryScope = (() => {
    if (historyCutoff && expandedSemester && expandedGrade) {
      return getAllUnitsUpTo(expandedGrade, expandedSemester, historyCutoff.unitId, historyCutoff.unitLabel)
    } else if (expandedSemester && expandedGrade) {
      return getAllUnitsUpTo(expandedGrade, expandedSemester)
    } else if (expandedGrade) {
      return getAllUnitsUpTo(expandedGrade)
    }
    return null
  })()

  const handleGradeClick = (gradeId: string) => {
    sounds.click()
    setExpandedGrade(prev => prev === gradeId ? null : gradeId)
    setExpandedSemester(null)
    setCheckedUnits([])
  }

  const handleSemesterAll = (grade: GradeData, semester: typeof gradeData[0]['semesters'][0]) => {
    const allIds = semester.units.map(u => u.id)
    handleSelect(allIds, `${grade.label}${semester.label}全部`, 'semester')
  }

  const handleSemesterExpand = (semesterId: string) => {
    sounds.click()
    setExpandedSemester(prev => prev === semesterId ? null : semesterId)
    setCheckedUnits([])
  }

  const toggleCheck = (unitId: string) => {
    sounds.click()
    setCheckedUnits(prev =>
      prev.includes(unitId) ? prev.filter(id => id !== unitId) : [...prev, unitId]
    )
  }

  const selectAllUnits = (units: { id: string }[]) => {
    sounds.click()
    const allIds = units.map(u => u.id)
    const isAllChecked = allIds.every(id => checkedUnits.includes(id))
    setCheckedUnits(isAllChecked ? [] : allIds)
  }

  const handleCustomConfirm = () => {
    if (checkedUnits.length === 0) return
    const label = checkedUnits.length === 1
      ? checkedUnits[0]
      : `${checkedUnits.length}个单元`
    handleSelect(checkedUnits, label, checkedUnits.length === 1 ? 'single' : 'multiple')
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-5">
        <h2 className="text-xl font-bold text-gray-800">📖 选择练习范围</h2>
      </div>

      {/* Tab */}
      <div className="flex bg-gray-100 rounded-2xl p-1 mb-5">
        {[
          { key: 'school' as const, label: '🎒 小学组', active: 'bg-white text-blue-600 shadow-lg' },
          { key: 'adult' as const, label: '🧑 成人组', active: 'bg-white text-purple-600 shadow-lg' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => { sounds.click(); setTab(t.key); setExpandedGrade(null); setExpandedSemester(null); setCheckedUnits([]) }}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
              tab === t.key ? t.active : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ====== 小学组 ====== */}
      {tab === 'school' && (
        <div className="space-y-2 mb-6">
          {/* 全部历史（默认：全部年级；展开后根据年级/学期动态变化） */}
          {currentHistoryScope ? (
            <button
              onClick={() => handleHistoryUpToGrade(expandedGrade!, expandedSemester, historyCutoff?.unitId, historyCutoff?.unitLabel)}
              className="w-full relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-4 text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12" />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🌍</span>
                  <div className="text-left">
                    <p className="font-bold text-lg">{currentHistoryScope.label}</p>
                    <p className="text-xs opacity-80">包含已学过的所有单词</p>
                  </div>
                </div>
                <span className="text-2xl opacity-70">→</span>
              </div>
            </button>
          ) : (
            <button
              onClick={handleAllHistory}
              className="w-full relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-4 text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12" />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🌍</span>
                  <div className="text-left">
                    <p className="font-bold text-lg">全部历史单词</p>
                    <p className="text-xs opacity-80">三年级至六年级所有内容</p>
                  </div>
                </div>
                <span className="text-2xl opacity-70">→</span>
              </div>
            </button>
          )}

          {/* 各年级 */}
          {gradeData.map(grade => {
            const isExpanded = expandedGrade === grade.id
            return (
              <div key={grade.id} className={`rounded-2xl border-2 overflow-hidden transition-all duration-300 ${isExpanded ? 'border-gray-300 shadow-lg' : 'border-gray-100 hover:border-gray-200'}`}>
                {/* 年级头部 */}
                <button
                  onClick={() => handleGradeClick(grade.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{grade.icon}</span>
                    <span className="font-bold text-gray-800 text-lg">{grade.label}</span>
                    <span className="text-xs text-gray-400">{grade.semesters.reduce((sum, s) => sum + s.units.length, 0)}个单元</span>
                  </div>
                  <svg className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* 学期列表 */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-4 pb-3 space-y-2">
                    {grade.semesters.map(semester => {
                      const isSemExpanded = expandedSemester === semester.id
                      const allIds = semester.units.map(u => u.id)
                      const allChecked = allIds.every(id => checkedUnits.includes(id))
                      const someChecked = allIds.some(id => checkedUnits.includes(id))
                      return (
                        <div key={semester.id} className="rounded-xl bg-gray-50 overflow-hidden">
                          {/* 学期头部 */}
                          <div className="flex items-center">
                            {/* 整册练习按钮 */}
                            <button
                              onClick={() => handleSemesterAll(grade, semester)}
                              className="flex-1 flex items-center gap-2 px-3 py-2.5 text-left hover:bg-gray-100 transition-colors"
                            >
                              <span className="text-lg">📖</span>
                              <span className="font-semibold text-gray-800 text-sm">{semester.label}</span>
                              <span className="text-xs text-gray-400 ml-1">({semester.units.length}单元)</span>
                              <span className="ml-auto text-xs text-blue-500 font-medium">整册练习→</span>
                            </button>
                            {/* 展开箭头 */}
                            <button
                              onClick={() => handleSemesterExpand(semester.id)}
                              className="px-3 py-2.5 border-l border-gray-200 hover:bg-gray-100 transition-colors"
                            >
                              <svg className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isSemExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          </div>

                          {/* 单元列表（展开后） */}
                          {isSemExpanded && (
                            <div className="px-3 pb-3 space-y-2">
                              {/* 全选/取消全选 */}
                              <div className="flex items-center justify-between pt-1">
                                <button
                                  onClick={() => selectAllUnits(semester.units)}
                                  className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
                                    allChecked
                                      ? 'bg-gray-300 text-gray-600'
                                      : `bg-gradient-to-r ${grade.color} text-white shadow-sm`
                                  }`}
                                >
                                  {allChecked ? '取消全选' : '✓ 全选本册'}
                                </button>
                                {checkedUnits.length > 0 && (
                                  <span className="text-xs text-gray-500">已选 {checkedUnits.filter(id => allIds.includes(id)).length} 个</span>
                                )}
                              </div>

                              {/* 单元网格 */}
                              <div className="grid grid-cols-3 gap-2">
                                {semester.units.map(unit => {
                                  const checked = checkedUnits.includes(unit.id)
                                  return (
                                    <button
                                      key={unit.id}
                                      onClick={() => toggleCheck(unit.id)}
                                      className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                                        checked
                                          ? `bg-gradient-to-r ${grade.color} text-white shadow-md`
                                          : 'bg-white text-gray-700 shadow-sm hover:shadow-md hover:scale-[1.03]'
                                      }`}
                                    >
                                      <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                        checked ? 'border-white bg-white/30' : 'border-gray-300'
                                      }`}>
                                        {checked && <span className="text-[10px] text-white font-bold">✓</span>}
                                      </span>
                                      <span className="truncate">{unit.label}</span>
                                    </button>
                                  )
                                })}
                              </div>

                              {/* 开始按钮 */}
                              {checkedUnits.filter(id => allIds.includes(id)).length > 0 && (
                                <button
                                  onClick={handleCustomConfirm}
                                  className={`w-full bg-gradient-to-r ${grade.color} text-white font-bold py-2.5 rounded-xl text-sm shadow-lg transition-all duration-300 hover:shadow-xl active:scale-[0.98]`}
                                >
                                  开始练习 {checkedUnits.filter(id => allIds.includes(id)).length} 个单元 🚀
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ====== 成人组 ====== */}
      {tab === 'adult' && (
        <div className="space-y-4 mb-6">
          {adultStages.map(stage => (
            <button
              key={stage.id}
              onClick={() => handleSelect([stage.id], stage.title)}
              className={`group relative overflow-hidden w-full rounded-2xl bg-gradient-to-r ${stage.color} p-5 text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]`}
            >
              <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -translate-y-14 translate-x-14 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative flex items-center gap-4">
                <span className="text-4xl flex-shrink-0">{stage.icon}</span>
                <div className="text-left flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg">{stage.title}</h3>
                    <span className="bg-white/20 backdrop-blur-sm text-xs font-semibold px-2 py-0.5 rounded-full">{stage.count}</span>
                  </div>
                  <p className="text-sm opacity-85 mt-0.5">{stage.subtitle}</p>
                </div>
                <span className="text-2xl opacity-60 flex-shrink-0">→</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* 题量选择 */}
      <div className="mb-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">选择题量</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        <div className="grid grid-cols-4 gap-2.5">
          {questionCounts.map(item => (
            <button
              key={item.count}
              onClick={() => { sounds.click(); setSelectedCount(item.count) }}
              className={`py-3 rounded-xl text-center transition-all duration-300 transform hover:scale-105 ${
                selectedCount === item.count
                  ? `bg-gradient-to-br ${item.color} text-white shadow-lg scale-105`
                  : 'bg-white text-gray-700 shadow-md hover:shadow-lg'
              }`}
            >
              <span className="text-xl block">{item.icon}</span>
              <p className="font-bold text-sm mt-0.5">{item.label}</p>
              <p className={`text-[10px] mt-0.5 ${selectedCount === item.count ? 'opacity-80' : 'text-gray-400'}`}>{item.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="text-center text-xs text-gray-400 mt-4 pb-4">
        <p>💡 点击年级展开 → 点「整册练习」或展开选单元 → 勾选后开始</p>
      </div>
    </div>
  )
}
