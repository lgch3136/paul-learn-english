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

interface GradeGroup {
  id: string
  label: string
  icon: string
  color: string
  borderColor: string
  units: { id: string; label: string; icon?: string }[]
}

const gradeGroups: GradeGroup[] = [
  {
    id: 'grade3',
    label: '三年级',
    icon: '📗',
    color: 'from-lime-400 to-green-500',
    borderColor: 'border-lime-300',
    units: [
      { id: 'grade-3-up', label: '上册', icon: '📖' },
      { id: 'grade-3-down', label: '下册', icon: '📖' },
    ],
  },
  {
    id: 'grade4',
    label: '四年级',
    icon: '📘',
    color: 'from-sky-400 to-blue-500',
    borderColor: 'border-sky-300',
    units: [
      { id: 'grade-4-up', label: '上册', icon: '📖' },
      { id: 'grade-4-down', label: '下册', icon: '📖' },
    ],
  },
  {
    id: 'grade5',
    label: '五年级',
    icon: '📙',
    color: 'from-orange-400 to-amber-500',
    borderColor: 'border-orange-300',
    units: [
      { id: 'Unit 1', label: 'Unit 1' },
      { id: 'Unit 2', label: 'Unit 2' },
      { id: 'Unit 3', label: 'Unit 3' },
      { id: 'Unit 4', label: 'Unit 4' },
      { id: 'Unit 5', label: 'Unit 5' },
      { id: 'Unit 6', label: 'Unit 6' },
      { id: 'Unit 7', label: 'Unit 7' },
      { id: 'Unit 8', label: 'Unit 8' },
    ],
  },
  {
    id: 'grade6',
    label: '六年级',
    icon: '📕',
    color: 'from-rose-400 to-pink-500',
    borderColor: 'border-rose-300',
    units: [
      { id: 'g6up', label: '上册（敬请期待）', icon: '🔜' },
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
  const [expandedGrade, setExpandedGrade] = useState<string | null>(null)
  const [selectedUnits, setSelectedUnits] = useState<string[]>(currentScope?.units || [])
  const [selectedCount, setSelectedCount] = useState(10)
  const [tab, setTab] = useState<'school' | 'adult'>('school')

  const handleSelect = (units: string[], label: string, type: GameScope['type'] = 'single') => {
    sounds.correct()
    onSelect({ type, units, label, questionCount: selectedCount })
  }

  const handleAllHistory = () => {
    handleSelect(['all'], '全部历史单词', 'all')
  }

  const toggleUnit = (unitId: string) => {
    sounds.click()
    setSelectedUnits(prev =>
      prev.includes(unitId) ? prev.filter(id => id !== unitId) : [...prev, unitId]
    )
  }

  const handleCustomConfirm = () => {
    if (selectedUnits.length === 0) return
    const label = selectedUnits.length === 1
      ? selectedUnits[0]
      : `${selectedUnits[0]} 等${selectedUnits.length}个单元`
    handleSelect(selectedUnits, label, selectedUnits.length === 1 ? 'single' : 'multiple')
  }

  const toggleExpand = (gradeId: string) => {
    sounds.click()
    setExpandedGrade(prev => prev === gradeId ? null : gradeId)
    setSelectedUnits([])
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* 顶部标题 */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">📖 选择练习范围</h2>
      </div>

      {/* Tab：小学组 / 成人组 */}
      <div className="flex bg-gray-100 rounded-2xl p-1 mb-5">
        {[
          { key: 'school' as const, label: '🎒 小学组', active: 'bg-white text-blue-600 shadow-lg' },
          { key: 'adult' as const, label: '🧑 成人组', active: 'bg-white text-purple-600 shadow-lg' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => { sounds.click(); setTab(t.key); setExpandedGrade(null); setSelectedUnits([]) }}
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
        <div className="space-y-3 mb-6">
          {/* 全部历史 - 顶部醒目按钮 */}
          <button
            onClick={handleAllHistory}
            className="w-full relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-4 text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🌍</span>
                <div className="text-left">
                  <p className="font-bold text-lg">全部历史单词</p>
                  <p className="text-xs opacity-80">三年级至五年级所有内容</p>
                </div>
              </div>
              <span className="text-2xl opacity-70">→</span>
            </div>
          </button>

          {/* 各年级卡片 */}
          {gradeGroups.map(grade => {
            const isExpanded = expandedGrade === grade.id
            const hasUnits = grade.units[0]?.id !== 'g6up'
            return (
              <div
                key={grade.id}
                className={`rounded-2xl border-2 overflow-hidden transition-all duration-300 ${
                  isExpanded
                    ? `${grade.borderColor} shadow-lg`
                    : 'border-gray-100 hover:border-gray-200 hover:shadow-md'
                }`}
              >
                {/* 年级头部 */}
                <div className="flex items-stretch">
                  {/* 快速选择该年级全部 */}
                  <button
                    onClick={() => {
                      if (!hasUnits) { sounds.wrong(); return }
                      const allUnitIds = grade.units.map(u => u.id)
                      handleSelect(allUnitIds, `${grade.label}全部`, 'semester')
                    }}
                    className={`flex-1 flex items-center gap-3 p-4 transition-all duration-300 ${
                      hasUnits
                        ? 'hover:bg-gray-50 active:bg-gray-100'
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <span className="text-3xl">{grade.icon}</span>
                    <div className="text-left">
                      <p className="font-bold text-gray-800">{grade.label}</p>
                      <p className="text-xs text-gray-500">
                        {hasUnits ? '点击选择全部' : '暂无数据'}
                      </p>
                    </div>
                  </button>

                  {/* 展开/收起按钮 */}
                  {hasUnits && (
                    <button
                      onClick={() => toggleExpand(grade.id)}
                      className={`px-4 flex items-center border-l transition-all duration-300 ${
                        isExpanded ? 'bg-gray-50 border-gray-200' : 'border-gray-100 hover:bg-gray-50'
                      }`}
                    >
                      <svg
                        className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* 展开的单元列表 */}
                {isExpanded && hasUnits && (
                  <div className="border-t border-gray-100 p-3 bg-gray-50/50">
                    <div className={`grid ${grade.units.length > 4 ? 'grid-cols-4' : 'grid-cols-2'} gap-2`}>
                      {grade.units.map(unit => {
                        const selected = selectedUnits.includes(unit.id)
                        return (
                          <button
                            key={unit.id}
                            onClick={() => toggleUnit(unit.id)}
                            className={`py-2.5 px-3 rounded-xl text-center text-sm font-semibold transition-all duration-200 ${
                              selected
                                ? `bg-gradient-to-br ${grade.color} text-white shadow-md scale-105`
                                : 'bg-white text-gray-700 shadow-sm hover:shadow-md hover:scale-105'
                            }`}
                          >
                            {unit.icon && <span className="mr-1">{unit.icon}</span>}
                            {unit.label}
                          </button>
                        )
                      })}
                    </div>

                    {/* 自定义确认 */}
                    {selectedUnits.length > 0 && (
                      <div className="mt-3 text-center">
                        <button
                          onClick={handleCustomConfirm}
                          className={`bg-gradient-to-r ${grade.color} text-white font-bold py-2.5 px-6 rounded-xl text-sm shadow-lg transition-all duration-300 hover:shadow-xl active:scale-95`}
                        >
                          开始练习所选单元 🚀
                        </button>
                      </div>
                    )}
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

      {/* ====== 题量选择 ====== */}
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

      {/* 提示 */}
      <div className="text-center text-xs text-gray-400 mt-4 pb-4">
        <p>💡 小学组：点击年级名称选择该年级全部 · 点击箭头展开选单元</p>
      </div>
    </div>
  )
}
