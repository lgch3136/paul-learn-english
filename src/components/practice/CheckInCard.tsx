'use client'

import { useState, useEffect } from 'react'
import { sounds } from '@/lib/sounds'
import { vibrate, createConfetti } from '@/lib/animations'
import {
  CheckInData,
  loadCheckIn,
  doCheckIn,
  hasCheckedInToday,
  getRecentCalendar,
  getNewMilestones,
  claimMilestone,
  getNextMilestone,
  CheckInMilestone,
  getWeekDayLabel,
} from '@/lib/checkin-tracker'
import { addPoints } from '@/lib/achievement-tracker'

export default function CheckInCard() {
  const [data, setData] = useState<CheckInData | null>(null)
  const [checkedToday, setCheckedToday] = useState(false)
  const [showReward, setShowReward] = useState(false)
  const [rewardInfo, setRewardInfo] = useState<{ title: string; icon: string; points: number } | null>(null)
  const [calendar, setCalendar] = useState<ReturnType<typeof getRecentCalendar>>([])
  const [animating, setAnimating] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)

  useEffect(() => {
    const d = loadCheckIn()
    setData(d)
    setCheckedToday(d.history.includes(new Date().toISOString().split('T')[0]))
    setCalendar(getRecentCalendar())
  }, [])

  const handleCheckIn = () => {
    if (checkedToday || animating) return
    setAnimating(true)
    sounds.correct()
    vibrate(100)

    // 执行签到
    const newData = doCheckIn()
    setData(newData)
    setCheckedToday(true)
    setCalendar(getRecentCalendar())

    // 检查里程碑
    const milestones = getNewMilestones(newData)
    if (milestones.length > 0) {
      const milestone = milestones[0]
      claimMilestone(newData, milestone.days)
      addPoints(milestone.reward)

      setTimeout(() => {
        setRewardInfo({ title: milestone.title, icon: milestone.icon, points: milestone.reward })
        setShowReward(true)
        sounds.streak()
        vibrate(200)
      }, 600)
    }

    // 签到本身也给积分
    addPoints(5)

    setTimeout(() => setAnimating(false), 1000)
  }

  if (!data) return null

  const nextMilestone = getNextMilestone(data)
  const weekCheckIns = calendar.filter(c => {
    const d = new Date(c.date)
    const now = new Date()
    const monday = new Date(now)
    monday.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1))
    monday.setHours(0, 0, 0, 0)
    return d >= monday && d <= now
  })
  const weekCount = weekCheckIns.filter(c => c.checked).length

  // 按周分组日历
  const weeks: typeof calendar[] = []
  for (let i = 0; i < calendar.length; i += 7) {
    weeks.push(calendar.slice(i, i + 7))
  }

  return (
    <section className="max-w-md mx-auto mb-6">
      {/* 里程碑奖励弹窗 */}
      {showReward && rewardInfo && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowReward(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-xs w-full animate-bounce-in overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 p-6 text-center">
              <span className="text-6xl block mb-2">{rewardInfo.icon}</span>
              <h2 className="text-2xl font-black text-white drop-shadow-lg">🎉 里程碑达成！</h2>
            </div>
            <div className="p-6 text-center">
              <p className="text-xl font-bold text-gray-800 mb-2">{rewardInfo.title}</p>
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 mb-4">
                <p className="text-3xl font-black text-orange-500">+{rewardInfo.points} 积分</p>
              </div>
              <button
                onClick={() => setShowReward(false)}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold py-3 px-6 rounded-xl transition-all hover:shadow-lg active:scale-95"
              >
                太棒了！
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 主卡片 */}
      <div className={`relative overflow-hidden rounded-2xl shadow-xl transition-all duration-500 ${
        checkedToday
          ? 'bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500'
          : 'bg-gradient-to-br from-orange-400 via-red-500 to-pink-500'
      }`}>
        {/* 背景装饰 */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12" />

        <div className="relative p-5 text-white">
          {/* 头部：签到状态 + 连续天数 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className={`text-4xl ${checkedToday ? '' : 'animate-bounce'}`}>
                {checkedToday ? '✅' : '📅'}
              </span>
              <div>
                <h3 className="font-bold text-lg">
                  {checkedToday ? '今日已签到' : '每日签到'}
                </h3>
                <p className="text-sm opacity-80">
                  {checkedToday
                    ? `本周已签 ${weekCount} 天 · 积分 +5`
                    : '签到可获得积分奖励'
                  }
                </p>
              </div>
            </div>

            {/* 连续天数大数字 */}
            <div className="text-center">
              <div className="relative">
                {data.currentStreak > 0 && (
                  <span className="text-3xl absolute -top-1 -left-5">🔥</span>
                )}
                <span className="text-4xl font-black drop-shadow-lg">
                  {data.currentStreak}
                </span>
              </div>
              <p className="text-xs opacity-75 mt-0.5">连续天数</p>
            </div>
          </div>

          {/* 签到按钮 */}
          {!checkedToday && (
            <button
              onClick={handleCheckIn}
              disabled={animating}
              className={`w-full py-3.5 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg ${
                animating
                  ? 'bg-white/50 text-white/50 scale-95'
                  : 'bg-white text-orange-500 hover:scale-[1.02] active:scale-95 hover:shadow-xl'
              }`}
            >
              {animating ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">✨</span> 签到中...
                </span>
              ) : (
                '✨ 点击签到 +5 积分'
              )}
            </button>
          )}

          {/* 迷你周日历（签到后显示） */}
          {checkedToday && (
            <div className="mt-1">
              <div className="grid grid-cols-7 gap-1.5">
                {['一', '二', '三', '四', '五', '六', '日'].map(day => (
                  <div key={day} className="text-center text-xs opacity-60 font-medium py-1">
                    {day}
                  </div>
                ))}
                {weeks[weeks.length - 1]?.map((day, i) => (
                  <div
                    key={day.date}
                    className={`text-center py-1.5 rounded-lg text-xs font-bold transition-all ${
                      day.isFuture
                        ? 'opacity-30'
                        : day.checked
                          ? 'bg-white/30 backdrop-blur-sm'
                          : 'bg-white/10'
                    }`}
                  >
                    {day.checked ? '✓' : new Date(day.date).getDate()}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 下一里程碑提示 */}
      {nextMilestone && (
        <div className="mt-3 bg-white rounded-xl shadow-md p-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{nextMilestone.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-800 truncate">
                下一个里程碑：{nextMilestone.title}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min((data.currentStreak / nextMilestone.days) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {data.currentStreak}/{nextMilestone.days} 天
                </span>
              </div>
            </div>
            <span className="text-orange-500 font-bold text-sm">+{nextMilestone.reward}</span>
          </div>
        </div>
      )}

      {/* 展开的完整日历 */}
      <button
        onClick={() => {
          sounds.click()
          setShowCalendar(!showCalendar)
        }}
        className="w-full mt-2 text-center text-sm text-gray-500 hover:text-gray-700 transition-colors py-1"
      >
        {showCalendar ? '收起日历 ▲' : '查看签到日历 ▼'}
      </button>

      {showCalendar && (
        <div className="mt-2 bg-white rounded-xl shadow-md p-4 animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-gray-700 text-sm">📅 签到记录</h4>
            <div className="flex gap-3 text-xs text-gray-500">
              <span>累计 <b className="text-orange-500">{data.totalCheckIns}</b> 天</span>
              <span>最长 <b className="text-green-500">{data.longestStreak}</b> 天</span>
            </div>
          </div>

          {/* 星期标头 */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {['一', '二', '三', '四', '五', '六', '日'].map(day => (
              <div key={day} className="text-center text-xs text-gray-400 font-medium py-1">
                {day}
              </div>
            ))}
          </div>

          {/* 4 周日历 */}
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 gap-1 mb-1">
              {week.map((day) => (
                <div
                  key={day.date}
                  className={`text-center py-1.5 rounded-lg text-xs transition-all ${
                    day.isFuture
                      ? 'text-gray-300'
                      : day.isToday
                        ? day.checked
                          ? 'bg-green-500 text-white font-bold shadow-md'
                          : 'bg-orange-100 text-orange-600 font-bold ring-2 ring-orange-300'
                        : day.checked
                          ? 'bg-green-100 text-green-700 font-medium'
                          : 'text-gray-400'
                  }`}
                >
                  {day.isToday ? '今' : new Date(day.date).getDate()}
                </div>
              ))}
            </div>
          ))}

          {/* 图例 */}
          <div className="flex justify-center gap-4 mt-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-green-500 inline-block" /> 已签到
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-orange-100 ring-1 ring-orange-300 inline-block" /> 今天
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-gray-100 inline-block" /> 未签到
            </span>
          </div>
        </div>
      )}
    </section>
  )
}
