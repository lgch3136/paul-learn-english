'use client'

import { useState, useEffect } from 'react'
import { dailyChallenges, checkDailyChallenge, PlayerStats, DailyChallenge } from '@/lib/gameification'
import { sounds } from '@/lib/sounds'

interface DailyChallengesProps {
  stats: PlayerStats
  todayWords: number
  todayTime: number
  onClaimReward: (challenge: DailyChallenge) => void
}

export default function DailyChallenges({ 
  stats, 
  todayWords, 
  todayTime, 
  onClaimReward 
}: DailyChallengesProps) {
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([])
  const [claimedChallenges, setClaimedChallenges] = useState<string[]>([])

  // 检查完成情况
  useEffect(() => {
    const completed = dailyChallenges.filter(c => 
      checkDailyChallenge(c, stats, todayWords, todayTime)
    ).map(c => c.id)
    
    setCompletedChallenges(completed)
  }, [stats, todayWords, todayTime])

  const handleClaim = (challenge: DailyChallenge) => {
    if (completedChallenges.includes(challenge.id) && !claimedChallenges.includes(challenge.id)) {
      sounds.correct()
      setClaimedChallenges([...claimedChallenges, challenge.id])
      onClaimReward(challenge)
    }
  }

  const getChallengeStatus = (challenge: DailyChallenge) => {
    if (claimedChallenges.includes(challenge.id)) {
      return 'claimed'
    }
    if (completedChallenges.includes(challenge.id)) {
      return 'completed'
    }
    return 'pending'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'claimed': return 'bg-gray-100 border-gray-300'
      case 'completed': return 'bg-green-50 border-green-300 animate-pulse'
      default: return 'bg-white border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'claimed': return '✅'
      case 'completed': return '🎁'
      default: return '⏳'
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
        📅 今日挑战
      </h3>

      <div className="space-y-3">
        {dailyChallenges.map((challenge) => {
          const status = getChallengeStatus(challenge)
          
          return (
            <div
              key={challenge.id}
              className={`card border-2 transition-all duration-300 ${getStatusColor(status)}`}
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl">{challenge.icon}</span>
                
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">{challenge.title}</h4>
                  <p className="text-sm text-gray-600">{challenge.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    奖励: +{challenge.reward} 积分
                  </p>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <span className="text-2xl">{getStatusIcon(status)}</span>
                  
                  {status === 'completed' && (
                    <button
                      onClick={() => handleClaim(challenge)}
                      className="btn-success text-xs py-1 px-3"
                    >
                      领取
                    </button>
                  )}
                  
                  {status === 'claimed' && (
                    <span className="text-xs text-gray-500">已领取</span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 完成进度 */}
      <div className="mt-4 text-center text-sm text-gray-600">
        今日完成: {claimedChallenges.length} / {dailyChallenges.length}
      </div>
    </div>
  )
}