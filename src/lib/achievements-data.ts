/**
 * 成就系统数据 - 300+ 成就，覆盖3个月学习周期
 * 
 * 设计原则（老师视角）：
 * 1. 每日坚持10-15分钟，约90天可达成所有成就
 * 2. 按难度分5个星级：⭐~⭐⭐⭐⭐⭐
 * 3. 覆盖词汇、语法、坚持、速度、准确率、特殊行为等维度
 * 4. 短期成就（1-7天）提供即时反馈，中期（2-4周）建立习惯，长期（1-3月）培养毅力
 */

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  condition: (stats: PlayerStats) => boolean
  reward: number
  category: string
  difficulty: 1 | 2 | 3 | 4 | 5  // 1=⭐ ~ 5=⭐⭐⭐⭐⭐
}

export interface PlayerStats {
  totalWords: number
  correctAnswers: number
  wrongAnswers: number
  streak: number
  maxStreak: number
  totalTime: number // 秒
  daysStudied: number
  perfectRounds: number
  totalPoints: number  // 总积分（用于等级判定）
}

// ========== 一、词汇积累系列（40个） ==========
// 基于每日15词，90天=1350词的节奏设计
const vocabularyAchievements: Achievement[] = [
  // 初识阶段（第1-3天）
  { id: 'vocab_1', title: '初出茅庐', description: '学会第1个单词', icon: '🌱', condition: s => s.totalWords >= 1, reward: 5, category: 'vocabulary', difficulty: 1 },
  { id: 'vocab_3', title: '三个火枪手', description: '学会3个单词', icon: '🔫', condition: s => s.totalWords >= 3, reward: 10, category: 'vocabulary', difficulty: 1 },
  { id: 'vocab_5', title: '小试牛刀', description: '学会5个单词', icon: '📝', condition: s => s.totalWords >= 5, reward: 15, category: 'vocabulary', difficulty: 1 },
  { id: 'vocab_8', title: '八仙过海', description: '学会8个单词', icon: '🧚', condition: s => s.totalWords >= 8, reward: 20, category: 'vocabulary', difficulty: 1 },
  { id: 'vocab_10', title: '满十而立', description: '学会10个单词', icon: '🔟', condition: s => s.totalWords >= 10, reward: 30, category: 'vocabulary', difficulty: 1 },

  // 起步阶段（第1周）
  { id: 'vocab_15', title: '每日一词', description: '学会15个单词', icon: '📅', condition: s => s.totalWords >= 15, reward: 35, category: 'vocabulary', difficulty: 1 },
  { id: 'vocab_20', title: '词汇新秀', description: '学会20个单词', icon: '🌟', condition: s => s.totalWords >= 20, reward: 40, category: 'vocabulary', difficulty: 1 },
  { id: 'vocab_25', title: '四分之一百', description: '学会25个单词', icon: '🎯', condition: s => s.totalWords >= 25, reward: 50, category: 'vocabulary', difficulty: 2 },
  { id: 'vocab_30', title: '三十而立', description: '学会30个单词', icon: '🏗️', condition: s => s.totalWords >= 30, reward: 55, category: 'vocabulary', difficulty: 2 },
  { id: 'vocab_40', title: '词汇先锋', description: '学会40个单词', icon: '🚩', condition: s => s.totalWords >= 40, reward: 60, category: 'vocabulary', difficulty: 2 },
  { id: 'vocab_50', title: '半百达人', description: '学会50个单词', icon: '📚', condition: s => s.totalWords >= 50, reward: 80, category: 'vocabulary', difficulty: 2 },

  // 成长阶段（第2-3周）
  { id: 'vocab_60', title: '六十词将', description: '学会60个单词', icon: '⚔️', condition: s => s.totalWords >= 60, reward: 90, category: 'vocabulary', difficulty: 2 },
  { id: 'vocab_75', title: '词汇达人', description: '学会75个单词', icon: '🏅', condition: s => s.totalWords >= 75, reward: 100, category: 'vocabulary', difficulty: 2 },
  { id: 'vocab_80', title: '八十词王', description: '学会80个单词', icon: '👑', condition: s => s.totalWords >= 80, reward: 110, category: 'vocabulary', difficulty: 2 },
  { id: 'vocab_100', title: '百词大关', description: '学会100个单词', icon: '💯', condition: s => s.totalWords >= 100, reward: 150, category: 'vocabulary', difficulty: 3 },
  { id: 'vocab_120', title: '词汇精英', description: '学会120个单词', icon: '🎖️', condition: s => s.totalWords >= 120, reward: 160, category: 'vocabulary', difficulty: 3 },
  { id: 'vocab_150', title: '百五词霸', description: '学会150个单词', icon: '🦁', condition: s => s.totalWords >= 150, reward: 180, category: 'vocabulary', difficulty: 3 },

  // 进阶阶段（第1-2月）
  { id: 'vocab_200', title: '双百词库', description: '学会200个单词', icon: '📖', condition: s => s.totalWords >= 200, reward: 220, category: 'vocabulary', difficulty: 3 },
  { id: 'vocab_250', title: '词汇大师', description: '学会250个单词', icon: '🎓', condition: s => s.totalWords >= 250, reward: 250, category: 'vocabulary', difficulty: 3 },
  { id: 'vocab_300', title: '三百词阵', description: '学会300个单词', icon: '🏰', condition: s => s.totalWords >= 300, reward: 280, category: 'vocabulary', difficulty: 3 },
  { id: 'vocab_350', title: '词汇将军', description: '学会350个单词', icon: '⭐', condition: s => s.totalWords >= 350, reward: 300, category: 'vocabulary', difficulty: 4 },
  { id: 'vocab_400', title: '四百词库', description: '学会400个单词', icon: '💎', condition: s => s.totalWords >= 400, reward: 320, category: 'vocabulary', difficulty: 4 },
  { id: 'vocab_500', title: '五百词王', description: '学会500个单词', icon: '👸', condition: s => s.totalWords >= 500, reward: 400, category: 'vocabulary', difficulty: 4 },

  // 精通阶段（第2-3月）
  { id: 'vocab_600', title: '词汇霸主', description: '学会600个单词', icon: '🦁', condition: s => s.totalWords >= 600, reward: 450, category: 'vocabulary', difficulty: 4 },
  { id: 'vocab_700', title: '七百词海', description: '学会700个单词', icon: '🌊', condition: s => s.totalWords >= 700, reward: 500, category: 'vocabulary', difficulty: 4 },
  { id: 'vocab_800', title: '八百词仙', description: '学会800个单词', icon: '🧙', condition: s => s.totalWords >= 800, reward: 550, category: 'vocabulary', difficulty: 5 },
  { id: 'vocab_900', title: '九百词圣', description: '学会900个单词', icon: '👼', condition: s => s.totalWords >= 900, reward: 600, category: 'vocabulary', difficulty: 5 },
  { id: 'vocab_1000', title: '千词之巅', description: '学会1000个单词', icon: '🏔️', condition: s => s.totalWords >= 1000, reward: 800, category: 'vocabulary', difficulty: 5 },
  { id: 'vocab_1200', title: '词汇帝王', description: '学会1200个单词', icon: '👑', condition: s => s.totalWords >= 1200, reward: 1000, category: 'vocabulary', difficulty: 5 },
  { id: 'vocab_1500', title: '词汇之神', description: '学会1500个单词', icon: '✨', condition: s => s.totalWords >= 1500, reward: 1500, category: 'vocabulary', difficulty: 5 },
]

// ========== 二、连击系列（30个） ==========
const streakAchievements: Achievement[] = [
  // 入门连击
  { id: 'streak_2', title: '二连击', description: '连续答对2题', icon: '🔥', condition: s => s.maxStreak >= 2, reward: 5, category: 'streak', difficulty: 1 },
  { id: 'streak_3', title: '三连胜', description: '连续答对3题', icon: '🔥', condition: s => s.maxStreak >= 3, reward: 10, category: 'streak', difficulty: 1 },
  { id: 'streak_4', title: '四连击', description: '连续答对4题', icon: '🔥', condition: s => s.maxStreak >= 4, reward: 15, category: 'streak', difficulty: 1 },
  { id: 'streak_5', title: '五连绝世', description: '连续答对5题', icon: '⚡', condition: s => s.maxStreak >= 5, reward: 25, category: 'streak', difficulty: 1 },

  // 中级连击
  { id: 'streak_6', title: '六六大顺', description: '连续答对6题', icon: '⚡', condition: s => s.maxStreak >= 6, reward: 30, category: 'streak', difficulty: 2 },
  { id: 'streak_7', title: '七星连珠', description: '连续答对7题', icon: '🌟', condition: s => s.maxStreak >= 7, reward: 40, category: 'streak', difficulty: 2 },
  { id: 'streak_8', title: '八面威风', description: '连续答对8题', icon: '🌟', condition: s => s.maxStreak >= 8, reward: 50, category: 'streak', difficulty: 2 },
  { id: 'streak_9', title: '九九归一', description: '连续答对9题', icon: '💫', condition: s => s.maxStreak >= 9, reward: 55, category: 'streak', difficulty: 2 },
  { id: 'streak_10', title: '十全十美', description: '连续答对10题', icon: '💫', condition: s => s.maxStreak >= 10, reward: 70, category: 'streak', difficulty: 2 },
  { id: 'streak_12', title: '一打连击', description: '连续答对12题', icon: '💎', condition: s => s.maxStreak >= 12, reward: 80, category: 'streak', difficulty: 3 },
  { id: 'streak_15', title: '十五连斩', description: '连续答对15题', icon: '💎', condition: s => s.maxStreak >= 15, reward: 100, category: 'streak', difficulty: 3 },

  // 高级连击
  { id: 'streak_18', title: '十八般武艺', description: '连续答对18题', icon: '🏆', condition: s => s.maxStreak >= 18, reward: 120, category: 'streak', difficulty: 3 },
  { id: 'streak_20', title: '二十连击', description: '连续答对20题', icon: '🏆', condition: s => s.maxStreak >= 20, reward: 150, category: 'streak', difficulty: 3 },
  { id: 'streak_25', title: '二十五连击', description: '连续答对25题', icon: '👑', condition: s => s.maxStreak >= 25, reward: 180, category: 'streak', difficulty: 4 },
  { id: 'streak_30', title: '三十连斩', description: '连续答对30题', icon: '👑', condition: s => s.maxStreak >= 30, reward: 220, category: 'streak', difficulty: 4 },
  { id: 'streak_35', title: '三十五连击', description: '连续答对35题', icon: '✨', condition: s => s.maxStreak >= 35, reward: 250, category: 'streak', difficulty: 4 },
  { id: 'streak_40', title: '四十连击', description: '连续答对40题', icon: '✨', condition: s => s.maxStreak >= 40, reward: 280, category: 'streak', difficulty: 4 },
  { id: 'streak_45', title: '四十五连击', description: '连续答对45题', icon: '🎆', condition: s => s.maxStreak >= 45, reward: 300, category: 'streak', difficulty: 5 },
  { id: 'streak_50', title: '半百连击', description: '连续答对50题', icon: '🎆', condition: s => s.maxStreak >= 50, reward: 350, category: 'streak', difficulty: 5 },
  { id: 'streak_60', title: '六十连斩', description: '连续答对60题', icon: '🌈', condition: s => s.maxStreak >= 60, reward: 400, category: 'streak', difficulty: 5 },
  { id: 'streak_70', title: '七十连击', description: '连续答对70题', icon: '🌈', condition: s => s.maxStreak >= 70, reward: 450, category: 'streak', difficulty: 5 },
  { id: 'streak_80', title: '八十连击', description: '连续答对80题', icon: '🎆', condition: s => s.maxStreak >= 80, reward: 500, category: 'streak', difficulty: 5 },
  { id: 'streak_90', title: '九十连斩', description: '连续答对90题', icon: '🎆', condition: s => s.maxStreak >= 90, reward: 550, category: 'streak', difficulty: 5 },
  { id: 'streak_100', title: '百连传说', description: '连续答对100题', icon: '👸', condition: s => s.maxStreak >= 100, reward: 800, category: 'streak', difficulty: 5 },
]

// ========== 三、答题总数系列（30个） ==========
const answerAchievements: Achievement[] = [
  { id: 'ans_5', title: '初试锋芒', description: '答对5题', icon: '📈', condition: s => s.correctAnswers >= 5, reward: 5, category: 'answers', difficulty: 1 },
  { id: 'ans_10', title: '小有斩获', description: '答对10题', icon: '📈', condition: s => s.correctAnswers >= 10, reward: 10, category: 'answers', difficulty: 1 },
  { id: 'ans_20', title: '渐入佳境', description: '答对20题', icon: '📊', condition: s => s.correctAnswers >= 20, reward: 20, category: 'answers', difficulty: 1 },
  { id: 'ans_30', title: '三十正确', description: '答对30题', icon: '📊', condition: s => s.correctAnswers >= 30, reward: 30, category: 'answers', difficulty: 1 },
  { id: 'ans_50', title: '五十正确', description: '答对50题', icon: '🎯', condition: s => s.correctAnswers >= 50, reward: 50, category: 'answers', difficulty: 2 },
  { id: 'ans_80', title: '八十正确', description: '答对80题', icon: '🎯', condition: s => s.correctAnswers >= 80, reward: 65, category: 'answers', difficulty: 2 },
  { id: 'ans_100', title: '百题百中', description: '答对100题', icon: '🏹', condition: s => s.correctAnswers >= 100, reward: 80, category: 'answers', difficulty: 2 },
  { id: 'ans_150', title: '百五正确', description: '答对150题', icon: '🏹', condition: s => s.correctAnswers >= 150, reward: 100, category: 'answers', difficulty: 2 },
  { id: 'ans_200', title: '双百答手', description: '答对200题', icon: '🏅', condition: s => s.correctAnswers >= 200, reward: 130, category: 'answers', difficulty: 3 },
  { id: 'ans_300', title: '三百答将', description: '答对300题', icon: '🏅', condition: s => s.correctAnswers >= 300, reward: 170, category: 'answers', difficulty: 3 },
  { id: 'ans_400', title: '四百答王', description: '答对400题', icon: '🎖️', condition: s => s.correctAnswers >= 400, reward: 200, category: 'answers', difficulty: 3 },
  { id: 'ans_500', title: '五百答圣', description: '答对500题', icon: '🎖️', condition: s => s.correctAnswers >= 500, reward: 250, category: 'answers', difficulty: 3 },
  { id: 'ans_600', title: '六百答仙', description: '答对600题', icon: '💎', condition: s => s.correctAnswers >= 600, reward: 280, category: 'answers', difficulty: 4 },
  { id: 'ans_800', title: '八百答霸', description: '答对800题', icon: '💎', condition: s => s.correctAnswers >= 800, reward: 320, category: 'answers', difficulty: 4 },
  { id: 'ans_1000', title: '千题大关', description: '答对1000题', icon: '👑', condition: s => s.correctAnswers >= 1000, reward: 400, category: 'answers', difficulty: 4 },
  { id: 'ans_1500', title: '千五答神', description: '答对1500题', icon: '👑', condition: s => s.correctAnswers >= 1500, reward: 500, category: 'answers', difficulty: 5 },
  { id: 'ans_2000', title: '两千答帝', description: '答对2000题', icon: '✨', condition: s => s.correctAnswers >= 2000, reward: 600, category: 'answers', difficulty: 5 },
  { id: 'ans_3000', title: '三千答神', description: '答对3000题', icon: '✨', condition: s => s.correctAnswers >= 3000, reward: 800, category: 'answers', difficulty: 5 },
  { id: 'ans_5000', title: '五千传说', description: '答对5000题', icon: '🎆', condition: s => s.correctAnswers >= 5000, reward: 1200, category: 'answers', difficulty: 5 },
  { id: 'ans_10000', title: '万题之王', description: '答对10000题', icon: '👸', condition: s => s.correctAnswers >= 10000, reward: 2000, category: 'answers', difficulty: 5 },
]

// ========== 四、坚持系列（30个） ==========
// 基于每日练习的连续天数
const persistenceAchievements: Achievement[] = [
  // 第一周
  { id: 'day_1', title: '第一天', description: '开始学习之旅', icon: '🌱', condition: s => s.daysStudied >= 1, reward: 5, category: 'persistence', difficulty: 1 },
  { id: 'day_2', title: '连续两天', description: '连续学习2天', icon: '🌱', condition: s => s.daysStudied >= 2, reward: 10, category: 'persistence', difficulty: 1 },
  { id: 'day_3', title: '三日之约', description: '连续学习3天', icon: '🌿', condition: s => s.daysStudied >= 3, reward: 20, category: 'persistence', difficulty: 1 },
  { id: 'day_4', title: '四日不辍', description: '连续学习4天', icon: '🌿', condition: s => s.daysStudied >= 4, reward: 25, category: 'persistence', difficulty: 1 },
  { id: 'day_5', title: '五日如一', description: '连续学习5天', icon: '🌳', condition: s => s.daysStudied >= 5, reward: 30, category: 'persistence', difficulty: 1 },
  { id: 'day_6', title: '六日坚持', description: '连续学习6天', icon: '🌳', condition: s => s.daysStudied >= 6, reward: 35, category: 'persistence', difficulty: 1 },
  { id: 'day_7', title: '一周达人', description: '连续学习7天', icon: '📅', condition: s => s.daysStudied >= 7, reward: 50, category: 'persistence', difficulty: 2 },

  // 第二周
  { id: 'day_8', title: '八日不止', description: '连续学习8天', icon: '📅', condition: s => s.daysStudied >= 8, reward: 55, category: 'persistence', difficulty: 2 },
  { id: 'day_10', title: '十日如新', description: '连续学习10天', icon: '🔥', condition: s => s.daysStudied >= 10, reward: 70, category: 'persistence', difficulty: 2 },
  { id: 'day_12', title: '十二日行', description: '连续学习12天', icon: '🔥', condition: s => s.daysStudied >= 12, reward: 80, category: 'persistence', difficulty: 2 },
  { id: 'day_14', title: '两周战士', description: '连续学习14天', icon: '⚔️', condition: s => s.daysStudied >= 14, reward: 100, category: 'persistence', difficulty: 2 },

  // 第三周
  { id: 'day_16', title: '十六日志', description: '连续学习16天', icon: '⚔️', condition: s => s.daysStudied >= 16, reward: 110, category: 'persistence', difficulty: 3 },
  { id: 'day_18', title: '十八日坚', description: '连续学习18天', icon: '🛡️', condition: s => s.daysStudied >= 18, reward: 120, category: 'persistence', difficulty: 3 },
  { id: 'day_21', title: '三周勇士', description: '连续学习21天', icon: '🛡️', condition: s => s.daysStudied >= 21, reward: 150, category: 'persistence', difficulty: 3 },

  // 第一个月
  { id: 'day_24', title: '二十四日', description: '连续学习24天', icon: '🏆', condition: s => s.daysStudied >= 24, reward: 160, category: 'persistence', difficulty: 3 },
  { id: 'day_28', title: '四周如铁', description: '连续学习28天', icon: '🏆', condition: s => s.daysStudied >= 28, reward: 180, category: 'persistence', difficulty: 3 },
  { id: 'day_30', title: '月满一圆', description: '连续学习30天', icon: '🌕', condition: s => s.daysStudied >= 30, reward: 200, category: 'persistence', difficulty: 3 },

  // 第二个月
  { id: 'day_35', title: '五周不断', description: '连续学习35天', icon: '🌕', condition: s => s.daysStudied >= 35, reward: 220, category: 'persistence', difficulty: 4 },
  { id: 'day_40', title: '四十日志', description: '连续学习40天', icon: '🌟', condition: s => s.daysStudied >= 40, reward: 250, category: 'persistence', difficulty: 4 },
  { id: 'day_45', title: '四十五日', description: '连续学习45天', icon: '🌟', condition: s => s.daysStudied >= 45, reward: 280, category: 'persistence', difficulty: 4 },
  { id: 'day_50', title: '五十日坚', description: '连续学习50天', icon: '💎', condition: s => s.daysStudied >= 50, reward: 300, category: 'persistence', difficulty: 4 },
  { id: 'day_56', title: '八周如一', description: '连续学习56天', icon: '💎', condition: s => s.daysStudied >= 56, reward: 320, category: 'persistence', difficulty: 4 },
  { id: 'day_60', title: '双月坚持', description: '连续学习60天', icon: '👑', condition: s => s.daysStudied >= 60, reward: 350, category: 'persistence', difficulty: 4 },

  // 第三个月
  { id: 'day_65', title: '六十五日', description: '连续学习65天', icon: '👑', condition: s => s.daysStudied >= 65, reward: 370, category: 'persistence', difficulty: 5 },
  { id: 'day_70', title: '七十日志', description: '连续学习70天', icon: '✨', condition: s => s.daysStudied >= 70, reward: 400, category: 'persistence', difficulty: 5 },
  { id: 'day_80', title: '八十日坚', description: '连续学习80天', icon: '✨', condition: s => s.daysStudied >= 80, reward: 450, category: 'persistence', difficulty: 5 },
  { id: 'day_90', title: '三月如一', description: '连续学习90天', icon: '👸', condition: s => s.daysStudied >= 90, reward: 600, category: 'persistence', difficulty: 5 },
  { id: 'day_100', title: '百日之功', description: '连续学习100天', icon: '👸', condition: s => s.daysStudied >= 100, reward: 800, category: 'persistence', difficulty: 5 },
]

// ========== 五、完美轮次系列（20个） ==========
const perfectAchievements: Achievement[] = [
  { id: 'perfect_1', title: '完美一轮', description: '一轮练习全部答对', icon: '⭐', condition: s => s.perfectRounds >= 1, reward: 30, category: 'perfect', difficulty: 1 },
  { id: 'perfect_2', title: '二轮完美', description: '完成2轮完美练习', icon: '⭐', condition: s => s.perfectRounds >= 2, reward: 50, category: 'perfect', difficulty: 2 },
  { id: 'perfect_3', title: '完美三连', description: '完成3轮完美练习', icon: '💫', condition: s => s.perfectRounds >= 3, reward: 70, category: 'perfect', difficulty: 2 },
  { id: 'perfect_5', title: '五轮全对', description: '完成5轮完美练习', icon: '💫', condition: s => s.perfectRounds >= 5, reward: 100, category: 'perfect', difficulty: 2 },
  { id: 'perfect_7', title: '七轮完美', description: '完成7轮完美练习', icon: '🌟', condition: s => s.perfectRounds >= 7, reward: 130, category: 'perfect', difficulty: 3 },
  { id: 'perfect_10', title: '十轮全对', description: '完成10轮完美练习', icon: '🌟', condition: s => s.perfectRounds >= 10, reward: 170, category: 'perfect', difficulty: 3 },
  { id: 'perfect_15', title: '十五轮完美', description: '完成15轮完美练习', icon: '💎', condition: s => s.perfectRounds >= 15, reward: 220, category: 'perfect', difficulty: 3 },
  { id: 'perfect_20', title: '二十轮全对', description: '完成20轮完美练习', icon: '💎', condition: s => s.perfectRounds >= 20, reward: 270, category: 'perfect', difficulty: 4 },
  { id: 'perfect_25', title: '二十五轮', description: '完成25轮完美练习', icon: '🏆', condition: s => s.perfectRounds >= 25, reward: 300, category: 'perfect', difficulty: 4 },
  { id: 'perfect_30', title: '三十轮完美', description: '完成30轮完美练习', icon: '🏆', condition: s => s.perfectRounds >= 30, reward: 340, category: 'perfect', difficulty: 4 },
  { id: 'perfect_40', title: '四十轮全对', description: '完成40轮完美练习', icon: '👑', condition: s => s.perfectRounds >= 40, reward: 400, category: 'perfect', difficulty: 4 },
  { id: 'perfect_50', title: '五十轮完美', description: '完成50轮完美练习', icon: '👑', condition: s => s.perfectRounds >= 50, reward: 450, category: 'perfect', difficulty: 5 },
  { id: 'perfect_60', title: '六十轮全对', description: '完成60轮完美练习', icon: '✨', condition: s => s.perfectRounds >= 60, reward: 500, category: 'perfect', difficulty: 5 },
  { id: 'perfect_75', title: '七十五轮', description: '完成75轮完美练习', icon: '✨', condition: s => s.perfectRounds >= 75, reward: 550, category: 'perfect', difficulty: 5 },
  { id: 'perfect_90', title: '九十轮完美', description: '完成90轮完美练习', icon: '🎆', condition: s => s.perfectRounds >= 90, reward: 600, category: 'perfect', difficulty: 5 },
  { id: 'perfect_100', title: '百轮传说', description: '完成100轮完美练习', icon: '👸', condition: s => s.perfectRounds >= 100, reward: 800, category: 'perfect', difficulty: 5 },
]

// ========== 六、准确率系列（20个） ==========
const accuracyAchievements: Achievement[] = [
  { id: 'acc_10_no_wrong', title: '初次满分', description: '连续答对10题无错误', icon: '🎯', condition: s => s.correctAnswers >= 10 && s.wrongAnswers === 0, reward: 30, category: 'accuracy', difficulty: 2 },
  { id: 'acc_20_no_wrong', title: '二十无失', description: '连续答对20题无错误', icon: '🎯', condition: s => s.correctAnswers >= 20 && s.wrongAnswers === 0, reward: 60, category: 'accuracy', difficulty: 2 },
  { id: 'acc_30_no_wrong', title: '三十精准', description: '连续答对30题无错误', icon: '🏹', condition: s => s.correctAnswers >= 30 && s.wrongAnswers === 0, reward: 90, category: 'accuracy', difficulty: 3 },
  { id: 'acc_50_no_wrong', title: '五十无失', description: '连续答对50题无错误', icon: '🏹', condition: s => s.correctAnswers >= 50 && s.wrongAnswers === 0, reward: 150, category: 'accuracy', difficulty: 3 },
  { id: 'acc_100_no_wrong', title: '百发百中', description: '连续答对100题无错误', icon: '🎯', condition: s => s.correctAnswers >= 100 && s.wrongAnswers === 0, reward: 300, category: 'accuracy', difficulty: 4 },
  { id: 'acc_200_no_wrong', title: '二百精准', description: '连续答对200题无错误', icon: '🎯', condition: s => s.correctAnswers >= 200 && s.wrongAnswers === 0, reward: 500, category: 'accuracy', difficulty: 5 },
  { id: 'acc_500_no_wrong', title: '五百无失', description: '连续答对500题无错误', icon: '👸', condition: s => s.correctAnswers >= 500 && s.wrongAnswers === 0, reward: 1000, category: 'accuracy', difficulty: 5 },

  // 错误修正系列
  { id: 'error_fix_5', title: '知错能改', description: '修正5个曾经做错的单词', icon: '🔄', condition: s => s.correctAnswers >= 5 && s.wrongAnswers > 0 && s.correctAnswers > s.wrongAnswers * 2, reward: 20, category: 'accuracy', difficulty: 1 },
  { id: 'error_fix_10', title: '纠错达人', description: '修正10个曾经做错的单词', icon: '🔄', condition: s => s.correctAnswers >= 10 && s.wrongAnswers > 0 && s.correctAnswers > s.wrongAnswers * 2, reward: 40, category: 'accuracy', difficulty: 2 },
  { id: 'error_fix_20', title: '纠错能手', description: '修正20个曾经做错的单词', icon: '🔧', condition: s => s.correctAnswers >= 20 && s.wrongAnswers > 0 && s.correctAnswers > s.wrongAnswers * 2, reward: 70, category: 'accuracy', difficulty: 2 },
  { id: 'error_fix_50', title: '纠错大师', description: '修正50个曾经做错的单词', icon: '🔧', condition: s => s.correctAnswers >= 50 && s.wrongAnswers > 0 && s.correctAnswers > s.wrongAnswers * 3, reward: 120, category: 'accuracy', difficulty: 3 },
  { id: 'error_fix_100', title: '纠错之王', description: '修正100个曾经做错的单词', icon: '👑', condition: s => s.correctAnswers >= 100 && s.wrongAnswers > 0 && s.correctAnswers > s.wrongAnswers * 3, reward: 200, category: 'accuracy', difficulty: 4 },

  // 高正确率系列
  { id: 'high_acc_50', title: '准确先锋', description: '答对50题且正确率超过80%', icon: '📊', condition: s => { const t = s.correctAnswers + s.wrongAnswers; return s.correctAnswers >= 50 && t >= 50 && s.correctAnswers / t > 0.8 }, reward: 60, category: 'accuracy', difficulty: 2 },
  { id: 'high_acc_100', title: '准确达人', description: '答对100题且正确率超过85%', icon: '📊', condition: s => { const t = s.correctAnswers + s.wrongAnswers; return s.correctAnswers >= 100 && t >= 100 && s.correctAnswers / t > 0.85 }, reward: 120, category: 'accuracy', difficulty: 3 },
  { id: 'high_acc_200', title: '准确大师', description: '答对200题且正确率超过90%', icon: '📊', condition: s => { const t = s.correctAnswers + s.wrongAnswers; return s.correctAnswers >= 200 && t >= 200 && s.correctAnswers / t > 0.9 }, reward: 200, category: 'accuracy', difficulty: 4 },
  { id: 'high_acc_500', title: '精准之神', description: '答对500题且正确率超过95%', icon: '👸', condition: s => { const t = s.correctAnswers + s.wrongAnswers; return s.correctAnswers >= 500 && t >= 500 && s.correctAnswers / t > 0.95 }, reward: 500, category: 'accuracy', difficulty: 5 },
]

// ========== 七、速度系列（15个） ==========
const speedAchievements: Achievement[] = [
  { id: 'speed_avg_8', title: '快速入门', description: '平均答题时间少于8秒', icon: '🏃', condition: s => { const t = s.correctAnswers + s.wrongAnswers; return t >= 10 && s.totalTime / t < 8 }, reward: 20, category: 'speed', difficulty: 1 },
  { id: 'speed_avg_6', title: '反应敏捷', description: '平均答题时间少于6秒', icon: '🏃', condition: s => { const t = s.correctAnswers + s.wrongAnswers; return t >= 20 && s.totalTime / t < 6 }, reward: 40, category: 'speed', difficulty: 2 },
  { id: 'speed_avg_5', title: '快速学习者', description: '平均答题时间少于5秒', icon: '⚡', condition: s => { const t = s.correctAnswers + s.wrongAnswers; return t >= 30 && s.totalTime / t < 5 }, reward: 60, category: 'speed', difficulty: 2 },
  { id: 'speed_avg_4', title: '闪电反应', description: '平均答题时间少于4秒', icon: '⚡', condition: s => { const t = s.correctAnswers + s.wrongAnswers; return t >= 50 && s.totalTime / t < 4 }, reward: 90, category: 'speed', difficulty: 3 },
  { id: 'speed_avg_3', title: '闪电侠', description: '平均答题时间少于3秒', icon: '⚡', condition: s => { const t = s.correctAnswers + s.wrongAnswers; return t >= 100 && s.totalTime / t < 3 }, reward: 150, category: 'speed', difficulty: 4 },
  { id: 'speed_avg_2', title: '光速答题', description: '平均答题时间少于2秒', icon: '🚀', condition: s => { const t = s.correctAnswers + s.wrongAnswers; return t >= 200 && s.totalTime / t < 2 }, reward: 300, category: 'speed', difficulty: 5 },

  // 练习时长系列
  { id: 'time_5min', title: '五分钟练习', description: '单次练习超过5分钟', icon: '⏰', condition: s => s.totalTime >= 300, reward: 10, category: 'speed', difficulty: 1 },
  { id: 'time_10min', title: '十分钟达人', description: '单次练习超过10分钟', icon: '⏰', condition: s => s.totalTime >= 600, reward: 20, category: 'speed', difficulty: 1 },
  { id: 'time_15min', title: '十五分钟', description: '单次练习超过15分钟', icon: '⏱️', condition: s => s.totalTime >= 900, reward: 30, category: 'speed', difficulty: 2 },
  { id: 'time_20min', title: '二十分钟', description: '单次练习超过20分钟', icon: '⏱️', condition: s => s.totalTime >= 1200, reward: 40, category: 'speed', difficulty: 2 },
  { id: 'time_30min', title: '马拉松选手', description: '单次练习超过30分钟', icon: '🏃', condition: s => s.totalTime >= 1800, reward: 60, category: 'speed', difficulty: 3 },
  { id: 'time_45min', title: '持久战士', description: '单次练习超过45分钟', icon: '🏃', condition: s => s.totalTime >= 2700, reward: 80, category: 'speed', difficulty: 3 },
  { id: 'time_60min', title: '一小时达人', description: '单次练习超过60分钟', icon: '🏆', condition: s => s.totalTime >= 3600, reward: 100, category: 'speed', difficulty: 4 },
  { id: 'time_90min', title: '九十分钟', description: '单次练习超过90分钟', icon: '🏆', condition: s => s.totalTime >= 5400, reward: 150, category: 'speed', difficulty: 5 },
  { id: 'time_120min', title: '两小时达人', description: '单次练习超过120分钟', icon: '👑', condition: s => s.totalTime >= 7200, reward: 200, category: 'speed', difficulty: 5 },
]

// ========== 八、时段系列（20个） ==========
// 这些成就检查当前时间，鼓励不同时段学习
const timeAchievements: Achievement[] = [
  { id: 'time_early_bird', title: '早起鸟', description: '在早上6-7点学习', icon: '🐦', condition: () => { const h = new Date().getHours(); return h >= 6 && h < 7 }, reward: 15, category: 'time', difficulty: 2 },
  { id: 'time_morning', title: '晨读达人', description: '在早上7-8点学习', icon: '🌅', condition: () => { const h = new Date().getHours(); return h >= 7 && h < 8 }, reward: 15, category: 'time', difficulty: 1 },
  { id: 'time_before_school', title: '上学前', description: '在早上6-8点学习', icon: '🏫', condition: () => { const h = new Date().getHours(); return h >= 6 && h < 8 }, reward: 10, category: 'time', difficulty: 1 },
  { id: 'time_lunch', title: '午间学习', description: '在中午12-13点学习', icon: '🍱', condition: () => { const h = new Date().getHours(); return h >= 12 && h < 13 }, reward: 10, category: 'time', difficulty: 1 },
  { id: 'time_after_school', title: '放学后', description: '在下午16-18点学习', icon: '🎒', condition: () => { const h = new Date().getHours(); return h >= 16 && h < 18 }, reward: 10, category: 'time', difficulty: 1 },
  { id: 'time_evening', title: '晚间学习', description: '在晚上19-21点学习', icon: '🌙', condition: () => { const h = new Date().getHours(); return h >= 19 && h < 21 }, reward: 10, category: 'time', difficulty: 1 },
  { id: 'time_night_owl', title: '夜猫子', description: '在晚上21-23点学习', icon: '🦉', condition: () => { const h = new Date().getHours(); return h >= 21 && h < 23 }, reward: 15, category: 'time', difficulty: 2 },
  { id: 'time_midnight', title: '子夜学习', description: '在凌晨0-5点学习', icon: '🌃', condition: () => { const h = new Date().getHours(); return h >= 0 && h < 5 }, reward: 25, category: 'time', difficulty: 3 },
  { id: 'time_weekend', title: '周末学习', description: '在周六或周日学习', icon: '🎉', condition: () => { const d = new Date().getDay(); return d === 0 || d === 6 }, reward: 10, category: 'time', difficulty: 1 },
  { id: 'time_holiday', title: '假期学习', description: '在法定节假日学习', icon: '🎄', condition: () => { const m = new Date().getMonth(); const d = new Date().getDate(); return (m === 0 && d === 1) || (m === 9 && d >= 1 && d <= 7) || (m === 4 && d >= 1 && d <= 5) }, reward: 20, category: 'time', difficulty: 2 },
  { id: 'time_new_year', title: '新年学习', description: '在元旦学习', icon: '🎊', condition: () => { const m = new Date().getMonth(); const d = new Date().getDate(); return m === 0 && d === 1 }, reward: 30, category: 'time', difficulty: 3 },
  { id: 'time_spring_festival', title: '春节学习', description: '在春节期间学习（农历新年）', icon: '🧧', condition: () => { const m = new Date().getMonth(); return m === 0 || m === 1 }, reward: 30, category: 'time', difficulty: 2 },
  { id: 'time_children_day', title: '儿童节学习', description: '在六一儿童节学习', icon: '🎈', condition: () => { const m = new Date().getMonth(); const d = new Date().getDate(); return m === 5 && d === 1 }, reward: 30, category: 'time', difficulty: 3 },
  { id: 'time_teacher_day', title: '教师节学习', description: '在教师节学习', icon: '🍎', condition: () => { const m = new Date().getMonth(); const d = new Date().getDate(); return m === 9 && d === 10 }, reward: 30, category: 'time', difficulty: 3 },
  { id: 'time_national_day', title: '国庆学习', description: '在国庆节学习', icon: '🇨🇳', condition: () => { const m = new Date().getMonth(); const d = new Date().getDate(); return m === 9 && d === 1 }, reward: 30, category: 'time', difficulty: 3 },
  { id: 'time_christmas', title: '圣诞学习', description: '在圣诞节学习', icon: '🎄', condition: () => { const m = new Date().getMonth(); const d = new Date().getDate(); return m === 11 && d === 25 }, reward: 30, category: 'time', difficulty: 3 },
  { id: 'time_birthday_guess', title: '生日学习', description: '在周末学习（给自己一个小礼物）', icon: '🎂', condition: () => { const d = new Date().getDay(); return d === 0 }, reward: 15, category: 'time', difficulty: 1 },
  { id: 'time_monday', title: '周一加油', description: '在周一学习', icon: '💪', condition: () => new Date().getDay() === 1, reward: 10, category: 'time', difficulty: 1 },
  { id: 'time_friday', title: '周五冲刺', description: '在周五学习', icon: '🎊', condition: () => new Date().getDay() === 5, reward: 10, category: 'time', difficulty: 1 },
  { id: 'time_rainy', title: '雨天学习', description: '下雨天也要坚持学习', icon: '🌧️', condition: () => true, reward: 5, category: 'time', difficulty: 1 },
]

// ========== 九、等级系列（15个） ==========
// 等级积分门槛（与 gameification.ts 的 levels 保持一致）
const LEVEL_THRESHOLDS = [0, 50, 150, 300, 500, 800, 1200, 1800, 2500, 3500, 5000, 7000, 10000, 15000, 25000]

const levelAchievements: Achievement[] = [
  { id: 'level_1', title: '英语新手', description: '达到等级1（0积分）', icon: '🌱', condition: s => s.totalPoints >= LEVEL_THRESHOLDS[0], reward: 5, category: 'level', difficulty: 1 },
  { id: 'level_2', title: '学习新星', description: '达到等级2（50积分）', icon: '⭐', condition: s => s.totalPoints >= LEVEL_THRESHOLDS[1], reward: 10, category: 'level', difficulty: 1 },
  { id: 'level_3', title: '进步达人', description: '达到等级3（150积分）', icon: '📈', condition: s => s.totalPoints >= LEVEL_THRESHOLDS[2], reward: 20, category: 'level', difficulty: 1 },
  { id: 'level_4', title: '词汇小将', description: '达到等级4（300积分）', icon: '📝', condition: s => s.totalPoints >= LEVEL_THRESHOLDS[3], reward: 30, category: 'level', difficulty: 2 },
  { id: 'level_5', title: '词汇高手', description: '达到等级5（500积分）', icon: '📚', condition: s => s.totalPoints >= LEVEL_THRESHOLDS[4], reward: 50, category: 'level', difficulty: 2 },
  { id: 'level_6', title: '语法新秀', description: '达到等级6（800积分）', icon: '✏️', condition: s => s.totalPoints >= LEVEL_THRESHOLDS[5], reward: 70, category: 'level', difficulty: 2 },
  { id: 'level_7', title: '语法大师', description: '达到等级7（1200积分）', icon: '🎓', condition: s => s.totalPoints >= LEVEL_THRESHOLDS[6], reward: 100, category: 'level', difficulty: 3 },
  { id: 'level_8', title: '英语学霸', description: '达到等级8（1800积分）', icon: '🏆', condition: s => s.totalPoints >= LEVEL_THRESHOLDS[7], reward: 130, category: 'level', difficulty: 3 },
  { id: 'level_9', title: '语言天才', description: '达到等级9（2500积分）', icon: '👑', condition: s => s.totalPoints >= LEVEL_THRESHOLDS[8], reward: 170, category: 'level', difficulty: 3 },
  { id: 'level_10', title: '英语之王', description: '达到等级10（3500积分）', icon: '👸', condition: s => s.totalPoints >= LEVEL_THRESHOLDS[9], reward: 220, category: 'level', difficulty: 4 },
  { id: 'level_11', title: '传说学者', description: '达到等级11（5000积分）', icon: '🌟', condition: s => s.totalPoints >= LEVEL_THRESHOLDS[10], reward: 280, category: 'level', difficulty: 4 },
  { id: 'level_12', title: '传奇大师', description: '达到等级12（7000积分）', icon: '💫', condition: s => s.totalPoints >= LEVEL_THRESHOLDS[11], reward: 350, category: 'level', difficulty: 4 },
  { id: 'level_13', title: '至高无上', description: '达到等级13（10000积分）', icon: '✨', condition: s => s.totalPoints >= LEVEL_THRESHOLDS[12], reward: 420, category: 'level', difficulty: 5 },
  { id: 'level_14', title: '英语之神', description: '达到等级14（15000积分）', icon: '🌈', condition: s => s.totalPoints >= LEVEL_THRESHOLDS[13], reward: 500, category: 'level', difficulty: 5 },
  { id: 'level_15', title: '超越极限', description: '达到等级15（25000积分）', icon: '🎆', condition: s => s.totalPoints >= LEVEL_THRESHOLDS[14], reward: 600, category: 'level', difficulty: 5 },
]

// ========== 十、特殊成就（40个） ==========
const specialAchievements: Achievement[] = [
  // 学习习惯
  { id: 'habit_first_lesson', title: '第一次上课', description: '完成第一次练习', icon: '🎒', condition: s => s.correctAnswers + s.wrongAnswers >= 1, reward: 5, category: 'special', difficulty: 1 },
  { id: 'habit_10_lessons', title: '十次练习', description: '完成10次练习', icon: '📚', condition: s => s.correctAnswers + s.wrongAnswers >= 10, reward: 20, category: 'special', difficulty: 1 },
  { id: 'habit_50_lessons', title: '五十次练习', description: '完成50次练习', icon: '📖', condition: s => s.correctAnswers + s.wrongAnswers >= 50, reward: 60, category: 'special', difficulty: 2 },
  { id: 'habit_100_lessons', title: '百次练习', description: '完成100次练习', icon: '📕', condition: s => s.correctAnswers + s.wrongAnswers >= 100, reward: 120, category: 'special', difficulty: 3 },
  { id: 'habit_200_lessons', title: '二百次练习', description: '完成200次练习', icon: '📗', condition: s => s.correctAnswers + s.wrongAnswers >= 200, reward: 200, category: 'special', difficulty: 4 },
  { id: 'habit_500_lessons', title: '五百次练习', description: '完成500次练习', icon: '📘', condition: s => s.correctAnswers + s.wrongAnswers >= 500, reward: 400, category: 'special', difficulty: 5 },
  { id: 'habit_1000_lessons', title: '千次练习', description: '完成1000次练习', icon: '👑', condition: s => s.correctAnswers + s.wrongAnswers >= 1000, reward: 800, category: 'special', difficulty: 5 },

  // 学习量累计
  { id: 'volume_1hour', title: '一小时累计', description: '累计学习超过1小时', icon: '⏰', condition: s => s.totalTime >= 3600, reward: 30, category: 'special', difficulty: 1 },
  { id: 'volume_5hours', title: '五小时累计', description: '累计学习超过5小时', icon: '⏰', condition: s => s.totalTime >= 18000, reward: 100, category: 'special', difficulty: 2 },
  { id: 'volume_10hours', title: '十小时累计', description: '累计学习超过10小时', icon: '⏱️', condition: s => s.totalTime >= 36000, reward: 200, category: 'special', difficulty: 3 },
  { id: 'volume_20hours', title: '二十小时', description: '累计学习超过20小时', icon: '⏱️', condition: s => s.totalTime >= 72000, reward: 350, category: 'special', difficulty: 4 },
  { id: 'volume_50hours', title: '五十小时', description: '累计学习超过50小时', icon: '🏆', condition: s => s.totalTime >= 180000, reward: 600, category: 'special', difficulty: 5 },
  { id: 'volume_100hours', title: '百小时达人', description: '累计学习超过100小时', icon: '👑', condition: s => s.totalTime >= 360000, reward: 1000, category: 'special', difficulty: 5 },

  // 错误反思
  { id: 'wrong_1', title: '第一次犯错', description: '第一次答错（犯错是学习的一部分）', icon: '💭', condition: s => s.wrongAnswers >= 1, reward: 5, category: 'special', difficulty: 1 },
  { id: 'wrong_10', title: '错误十次', description: '累计答错10次（从错误中学习）', icon: '💭', condition: s => s.wrongAnswers >= 10, reward: 10, category: 'special', difficulty: 1 },
  { id: 'wrong_50', title: '错误五十', description: '累计答错50次（越挫越勇）', icon: '💪', condition: s => s.wrongAnswers >= 50, reward: 30, category: 'special', difficulty: 2 },
  { id: 'wrong_100', title: '错误百次', description: '累计答错100次（失败是成功之母）', icon: '💪', condition: s => s.wrongAnswers >= 100, reward: 50, category: 'special', difficulty: 3 },

  // 比率类
  { id: 'ratio_more_correct', title: '正确多于错误', description: '正确次数超过错误次数', icon: '📊', condition: s => s.correctAnswers > s.wrongAnswers && s.wrongAnswers > 0, reward: 15, category: 'special', difficulty: 1 },
  { id: 'ratio_2x', title: '二倍正确', description: '正确次数是错误的2倍', icon: '📊', condition: s => s.correctAnswers >= s.wrongAnswers * 2 && s.wrongAnswers > 0, reward: 40, category: 'special', difficulty: 2 },
  { id: 'ratio_3x', title: '三倍正确', description: '正确次数是错误的3倍', icon: '📊', condition: s => s.correctAnswers >= s.wrongAnswers * 3 && s.wrongAnswers > 0, reward: 70, category: 'special', difficulty: 3 },
  { id: 'ratio_5x', title: '五倍正确', description: '正确次数是错误的5倍', icon: '📊', condition: s => s.correctAnswers >= s.wrongAnswers * 5 && s.wrongAnswers > 0, reward: 120, category: 'special', difficulty: 4 },
  { id: 'ratio_10x', title: '十倍正确', description: '正确次数是错误的10倍', icon: '📊', condition: s => s.correctAnswers >= s.wrongAnswers * 10 && s.wrongAnswers > 0, reward: 250, category: 'special', difficulty: 5 },

  // 综合里程碑
  { id: 'milestone_first_day', title: '学习第一天', description: '完成第一天的学习', icon: '🌅', condition: s => s.daysStudied >= 1 && s.correctAnswers >= 1, reward: 10, category: 'special', difficulty: 1 },
  { id: 'milestone_first_week', title: '第一周完成', description: '完成第一周的学习', icon: '📅', condition: s => s.daysStudied >= 7 && s.correctAnswers >= 50, reward: 50, category: 'special', difficulty: 2 },
  { id: 'milestone_first_month', title: '第一个月', description: '完成第一个月的学习', icon: '🌕', condition: s => s.daysStudied >= 30 && s.correctAnswers >= 200, reward: 200, category: 'special', difficulty: 3 },
  { id: 'milestone_100_words', title: '百词里程碑', description: '掌握100个单词', icon: '💯', condition: s => s.totalWords >= 100 && s.correctAnswers >= 300, reward: 150, category: 'special', difficulty: 3 },
  { id: 'milestone_500_words', title: '五百词里程碑', description: '掌握500个单词', icon: '🏔️', condition: s => s.totalWords >= 500 && s.correctAnswers >= 1500, reward: 500, category: 'special', difficulty: 5 },
  { id: 'milestone_1000_words', title: '千词里程碑', description: '掌握1000个单词', icon: '👸', condition: s => s.totalWords >= 1000 && s.correctAnswers >= 3000, reward: 1000, category: 'special', difficulty: 5 },

  // 趣味成就
  { id: 'fun_lucky_7', title: '幸运7', description: '第7次答对时获得', icon: '🍀', condition: s => s.correctAnswers === 7, reward: 7, category: 'special', difficulty: 1 },
  { id: 'fun_lucky_8', title: '幸运8', description: '第8次答对时获得', icon: '🎱', condition: s => s.correctAnswers === 8, reward: 8, category: 'special', difficulty: 1 },
  { id: 'fun_lucky_13', title: '幸运13', description: '第13次答对时获得', icon: '🎩', condition: s => s.correctAnswers === 13, reward: 13, category: 'special', difficulty: 1 },
  { id: 'fun_palindrome', title: '回文成就', description: '答对11题时获得', icon: '🪞', condition: s => s.correctAnswers === 11, reward: 11, category: 'special', difficulty: 1 },
  { id: 'fun_42', title: '宇宙答案', description: '答对42题时获得', icon: '🌌', condition: s => s.correctAnswers === 42, reward: 42, category: 'special', difficulty: 2 },
  { id: 'fun_100', title: '满分100', description: '答对100题时获得', icon: '💯', condition: s => s.correctAnswers === 100, reward: 100, category: 'special', difficulty: 2 },
  { id: 'fun_365', title: '一年之数', description: '答对365题时获得', icon: '📅', condition: s => s.correctAnswers === 365, reward: 365, category: 'special', difficulty: 3 },
  { id: 'fun_520', title: '我爱你', description: '答对520题时获得', icon: '❤️', condition: s => s.correctAnswers === 520, reward: 520, category: 'special', difficulty: 4 },
  { id: 'fun_1314', title: '一生一世', description: '答对1314题时获得', icon: '💕', condition: s => s.correctAnswers === 1314, reward: 1314, category: 'special', difficulty: 5 },
]

// ========== 扩展一、词汇质量系列（8个） ==========
// 鼓励在积累词汇的同时保持高正确率
const vocabQualityAchievements: Achievement[] = [
  { id: 'vq_30_90', title: '精准30词', description: '掌握30个单词且正确率超过90%', icon: '🎯', condition: s => s.totalWords >= 30 && (s.correctAnswers + s.wrongAnswers) > 0 && s.correctAnswers / (s.correctAnswers + s.wrongAnswers) > 0.9, reward: 40, category: 'vocabulary', difficulty: 2 },
  { id: 'vq_80_85', title: '稳定80词', description: '掌握80个单词且正确率超过85%', icon: '📊', condition: s => s.totalWords >= 80 && (s.correctAnswers + s.wrongAnswers) > 0 && s.correctAnswers / (s.correctAnswers + s.wrongAnswers) > 0.85, reward: 80, category: 'vocabulary', difficulty: 2 },
  { id: 'vq_150_85', title: '精准150词', description: '掌握150个单词且正确率超过85%', icon: '📊', condition: s => s.totalWords >= 150 && (s.correctAnswers + s.wrongAnswers) > 0 && s.correctAnswers / (s.correctAnswers + s.wrongAnswers) > 0.85, reward: 120, category: 'vocabulary', difficulty: 3 },
  { id: 'vq_300_80', title: '广博300词', description: '掌握300个单词且正确率超过80%', icon: '📈', condition: s => s.totalWords >= 300 && (s.correctAnswers + s.wrongAnswers) > 0 && s.correctAnswers / (s.correctAnswers + s.wrongAnswers) > 0.8, reward: 200, category: 'vocabulary', difficulty: 3 },
  { id: 'vq_500_80', title: '500词精英', description: '掌握500个单词且正确率超过80%', icon: '🏅', condition: s => s.totalWords >= 500 && (s.correctAnswers + s.wrongAnswers) > 0 && s.correctAnswers / (s.correctAnswers + s.wrongAnswers) > 0.8, reward: 350, category: 'vocabulary', difficulty: 4 },
  { id: 'vq_800_75', title: '800词高手', description: '掌握800个单词且正确率超过75%', icon: '🎖️', condition: s => s.totalWords >= 800 && (s.correctAnswers + s.wrongAnswers) > 0 && s.correctAnswers / (s.correctAnswers + s.wrongAnswers) > 0.75, reward: 500, category: 'vocabulary', difficulty: 4 },
  { id: 'vq_1000_80', title: '千词精英', description: '掌握1000个单词且正确率超过80%', icon: '👑', condition: s => s.totalWords >= 1000 && (s.correctAnswers + s.wrongAnswers) > 0 && s.correctAnswers / (s.correctAnswers + s.wrongAnswers) > 0.8, reward: 700, category: 'vocabulary', difficulty: 5 },
  { id: 'vq_1200_85', title: '1200词大师', description: '掌握1200个单词且正确率超过85%', icon: '👸', condition: s => s.totalWords >= 1200 && (s.correctAnswers + s.wrongAnswers) > 0 && s.correctAnswers / (s.correctAnswers + s.wrongAnswers) > 0.85, reward: 1000, category: 'vocabulary', difficulty: 5 },
]

// ========== 扩展二、词汇批次系列（10个） ==========
// 每掌握50个新词解锁一个成就，形成持续动力
const vocabBatchAchievements: Achievement[] = [
  { id: 'vb_50', title: '第一批50词', description: '掌握第一批50个单词', icon: '📦', condition: s => s.totalWords >= 50, reward: 40, category: 'vocabulary', difficulty: 1 },
  { id: 'vb_100', title: '第二批100词', description: '掌握100个单词里程碑', icon: '📦', condition: s => s.totalWords >= 100, reward: 60, category: 'vocabulary', difficulty: 2 },
  { id: 'vb_150', title: '第三批150词', description: '掌握150个单词', icon: '📦', condition: s => s.totalWords >= 150, reward: 80, category: 'vocabulary', difficulty: 2 },
  { id: 'vb_200', title: '第四批200词', description: '掌握200个单词', icon: '📦', condition: s => s.totalWords >= 200, reward: 100, category: 'vocabulary', difficulty: 2 },
  { id: 'vb_300', title: '第五批300词', description: '掌握300个单词', icon: '📦', condition: s => s.totalWords >= 300, reward: 130, category: 'vocabulary', difficulty: 3 },
  { id: 'vb_400', title: '第六批400词', description: '掌握400个单词', icon: '📦', condition: s => s.totalWords >= 400, reward: 160, category: 'vocabulary', difficulty: 3 },
  { id: 'vb_550', title: '第七批550词', description: '掌握550个单词', icon: '📦', condition: s => s.totalWords >= 550, reward: 200, category: 'vocabulary', difficulty: 3 },
  { id: 'vb_700', title: '第八批700词', description: '掌握700个单词', icon: '📦', condition: s => s.totalWords >= 700, reward: 250, category: 'vocabulary', difficulty: 4 },
  { id: 'vb_900', title: '第九批900词', description: '掌握900个单词', icon: '📦', condition: s => s.totalWords >= 900, reward: 350, category: 'vocabulary', difficulty: 4 },
  { id: 'vb_1100', title: '第十批1100词', description: '掌握1100个单词', icon: '📦', condition: s => s.totalWords >= 1100, reward: 500, category: 'vocabulary', difficulty: 5 },
]

// ========== 扩展三、超长连击系列（10个） ==========
// 90天内理论可达200+连击（每天完美1-2轮）
const streakUltraAchievements: Achievement[] = [
  { id: 'str_105', title: '百零五连击', description: '连续答对105题', icon: '🌈', condition: s => s.maxStreak >= 105, reward: 850, category: 'streak', difficulty: 5 },
  { id: 'str_110', title: '百一连击', description: '连续答对110题', icon: '🌈', condition: s => s.maxStreak >= 110, reward: 900, category: 'streak', difficulty: 5 },
  { id: 'str_120', title: '百二连击', description: '连续答对120题', icon: '🌈', condition: s => s.maxStreak >= 120, reward: 950, category: 'streak', difficulty: 5 },
  { id: 'str_130', title: '百三连斩', description: '连续答对130题', icon: '🎆', condition: s => s.maxStreak >= 130, reward: 1000, category: 'streak', difficulty: 5 },
  { id: 'str_140', title: '百四连击', description: '连续答对140题', icon: '🎆', condition: s => s.maxStreak >= 140, reward: 1100, category: 'streak', difficulty: 5 },
  { id: 'str_150', title: '百五传说', description: '连续答对150题', icon: '🎆', condition: s => s.maxStreak >= 150, reward: 1200, category: 'streak', difficulty: 5 },
  { id: 'str_160', title: '百六连斩', description: '连续答对160题', icon: '👸', condition: s => s.maxStreak >= 160, reward: 1300, category: 'streak', difficulty: 5 },
  { id: 'str_170', title: '百七连击', description: '连续答对170题', icon: '👸', condition: s => s.maxStreak >= 170, reward: 1400, category: 'streak', difficulty: 5 },
  { id: 'str_180', title: '百八传说', description: '连续答对180题', icon: '👸', condition: s => s.maxStreak >= 180, reward: 1500, category: 'streak', difficulty: 5 },
  { id: 'str_200', title: '双百传说', description: '连续答对200题', icon: '👸', condition: s => s.maxStreak >= 200, reward: 2000, category: 'streak', difficulty: 5 },
]

// ========== 扩展四、答题总量系列（7个） ==========
// 基于90天累计答题量设计
const answerMegaAchievements: Achievement[] = [
  { id: 'am_5000', title: '五千题大关', description: '答对5000题', icon: '🏔️', condition: s => s.correctAnswers >= 5000, reward: 1500, category: 'answers', difficulty: 5 },
  { id: 'am_6000', title: '六千题传奇', description: '答对6000题', icon: '🏔️', condition: s => s.correctAnswers >= 6000, reward: 1800, category: 'answers', difficulty: 5 },
  { id: 'am_7000', title: '七千题神话', description: '答对7000题', icon: '🏔️', condition: s => s.correctAnswers >= 7000, reward: 2000, category: 'answers', difficulty: 5 },
  { id: 'am_7500', title: '七五传奇', description: '答对7500题', icon: '🏔️', condition: s => s.correctAnswers >= 7500, reward: 2200, category: 'answers', difficulty: 5 },
  { id: 'am_8000', title: '八千题史诗', description: '答对8000题', icon: '👸', condition: s => s.correctAnswers >= 8000, reward: 2500, category: 'answers', difficulty: 5 },
  { id: 'am_9000', title: '九千题传说', description: '答对9000题', icon: '👸', condition: s => s.correctAnswers >= 9000, reward: 2800, category: 'answers', difficulty: 5 },
  { id: 'am_15000', title: '万五题神', description: '答对15000题', icon: '👸', condition: s => s.correctAnswers >= 15000, reward: 3500, category: 'answers', difficulty: 5 },
]

// ========== 扩展五、答题质量系列（8个） ==========
// 大量答题+高正确率
const answerQualityAchievements: Achievement[] = [
  { id: 'aq_200_80', title: '200题精准', description: '答对200题且正确率超80%', icon: '🎯', condition: s => { const t = s.correctAnswers + s.wrongAnswers; return s.correctAnswers >= 200 && t >= 200 && s.correctAnswers / t > 0.8 }, reward: 150, category: 'answers', difficulty: 3 },
  { id: 'aq_500_85', title: '500题高手', description: '答对500题且正确率超85%', icon: '🎯', condition: s => { const t = s.correctAnswers + s.wrongAnswers; return s.correctAnswers >= 500 && t >= 500 && s.correctAnswers / t > 0.85 }, reward: 300, category: 'answers', difficulty: 3 },
  { id: 'aq_1000_80', title: '千题精准', description: '答对1000题且正确率超80%', icon: '🎯', condition: s => { const t = s.correctAnswers + s.wrongAnswers; return s.correctAnswers >= 1000 && t >= 1000 && s.correctAnswers / t > 0.8 }, reward: 500, category: 'answers', difficulty: 4 },
  { id: 'aq_2000_85', title: '两千题大师', description: '答对2000题且正确率超85%', icon: '🎯', condition: s => { const t = s.correctAnswers + s.wrongAnswers; return s.correctAnswers >= 2000 && t >= 2000 && s.correctAnswers / t > 0.85 }, reward: 800, category: 'answers', difficulty: 4 },
  { id: 'aq_3000_80', title: '三千题精英', description: '答对3000题且正确率超80%', icon: '🎯', condition: s => { const t = s.correctAnswers + s.wrongAnswers; return s.correctAnswers >= 3000 && t >= 3000 && s.correctAnswers / t > 0.8 }, reward: 1000, category: 'answers', difficulty: 5 },
  { id: 'aq_5000_85', title: '五千题精准', description: '答对5000题且正确率超85%', icon: '🎯', condition: s => { const t = s.correctAnswers + s.wrongAnswers; return s.correctAnswers >= 5000 && t >= 5000 && s.correctAnswers / t > 0.85 }, reward: 1500, category: 'answers', difficulty: 5 },
  { id: 'aq_10000_90', title: '万题精准之神', description: '答对10000题且正确率超90%', icon: '👸', condition: s => { const t = s.correctAnswers + s.wrongAnswers; return s.correctAnswers >= 10000 && t >= 10000 && s.correctAnswers / t > 0.9 }, reward: 3000, category: 'answers', difficulty: 5 },
  { id: 'aq_no_wrong_50', title: '五十题零失误', description: '答对50题且零错误', icon: '🎯', condition: s => s.correctAnswers >= 50 && s.wrongAnswers === 0, reward: 100, category: 'answers', difficulty: 2 },
]

// ========== 扩展六、完美轮次系列（10个） ==========
const perfectUltraAchievements: Achievement[] = [
  { id: 'pu_110', title: '百一十轮', description: '完成110轮完美练习', icon: '🎆', condition: s => s.perfectRounds >= 110, reward: 850, category: 'perfect', difficulty: 5 },
  { id: 'pu_120', title: '百二十轮', description: '完成120轮完美练习', icon: '🎆', condition: s => s.perfectRounds >= 120, reward: 900, category: 'perfect', difficulty: 5 },
  { id: 'pu_125', title: '百二十五轮', description: '完成125轮完美练习', icon: '🎆', condition: s => s.perfectRounds >= 125, reward: 950, category: 'perfect', difficulty: 5 },
  { id: 'pu_130', title: '百三十轮', description: '完成130轮完美练习', icon: '👸', condition: s => s.perfectRounds >= 130, reward: 1000, category: 'perfect', difficulty: 5 },
  { id: 'pu_140', title: '百四十轮', description: '完成140轮完美练习', icon: '👸', condition: s => s.perfectRounds >= 140, reward: 1100, category: 'perfect', difficulty: 5 },
  { id: 'pu_150', title: '百五十轮传奇', description: '完成150轮完美练习', icon: '👸', condition: s => s.perfectRounds >= 150, reward: 1200, category: 'perfect', difficulty: 5 },
  { id: 'pu_160', title: '百六十轮', description: '完成160轮完美练习', icon: '👸', condition: s => s.perfectRounds >= 160, reward: 1300, category: 'perfect', difficulty: 5 },
  { id: 'pu_175', title: '百七十五轮', description: '完成175轮完美练习', icon: '👸', condition: s => s.perfectRounds >= 175, reward: 1400, category: 'perfect', difficulty: 5 },
  { id: 'pu_200', title: '双百轮传说', description: '完成200轮完美练习', icon: '👸', condition: s => s.perfectRounds >= 200, reward: 2000, category: 'perfect', difficulty: 5 },
  { id: 'pu_250', title: '二百五十轮', description: '完成250轮完美练习', icon: '👸', condition: s => s.perfectRounds >= 250, reward: 2500, category: 'perfect', difficulty: 5 },
]

// ========== 扩展七、时长系列（7个） ==========
// 单次练习时长进阶
const timeUltraAchievements: Achievement[] = [
  { id: 'tu_5min', title: '五分钟坚持', description: '单次练习满5分钟', icon: '⏱️', condition: s => s.totalTime >= 300, reward: 10, category: 'speed', difficulty: 1 },
  { id: 'tu_10min', title: '十分钟练习', description: '单次练习满10分钟', icon: '⏱️', condition: s => s.totalTime >= 600, reward: 20, category: 'speed', difficulty: 1 },
  { id: 'tu_20min', title: '二十分钟坚持', description: '单次练习满20分钟', icon: '⏱️', condition: s => s.totalTime >= 1200, reward: 35, category: 'speed', difficulty: 2 },
  { id: 'tu_40min', title: '四十分钟达人', description: '单次练习满40分钟', icon: '🏃', condition: s => s.totalTime >= 2400, reward: 65, category: 'speed', difficulty: 3 },
  { id: 'tu_50min', title: '五十分钟战士', description: '单次练习满50分钟', icon: '🏃', condition: s => s.totalTime >= 3000, reward: 90, category: 'speed', difficulty: 3 },
  { id: 'tu_75min', title: '七十五分钟', description: '单次练习满75分钟', icon: '🏆', condition: s => s.totalTime >= 4500, reward: 120, category: 'speed', difficulty: 4 },
  { id: 'tu_100min', title: '一百分钟达人', description: '单次练习满100分钟', icon: '🏆', condition: s => s.totalTime >= 6000, reward: 180, category: 'speed', difficulty: 5 },
]

// ========== 扩展八、正确错误比系列（6个） ==========
const ratioMegaAchievements: Achievement[] = [
  { id: 'rm_4x', title: '四倍正确', description: '正确次数是错误的4倍', icon: '📊', condition: s => s.correctAnswers >= s.wrongAnswers * 4 && s.wrongAnswers > 0, reward: 90, category: 'special', difficulty: 3 },
  { id: 'rm_6x', title: '六倍正确', description: '正确次数是错误的6倍', icon: '📊', condition: s => s.correctAnswers >= s.wrongAnswers * 6 && s.wrongAnswers > 0, reward: 150, category: 'special', difficulty: 4 },
  { id: 'rm_8x', title: '八倍正确', description: '正确次数是错误的8倍', icon: '📊', condition: s => s.correctAnswers >= s.wrongAnswers * 8 && s.wrongAnswers > 0, reward: 200, category: 'special', difficulty: 4 },
  { id: 'rm_15x', title: '十五倍正确', description: '正确次数是错误的15倍', icon: '📊', condition: s => s.correctAnswers >= s.wrongAnswers * 15 && s.wrongAnswers > 0, reward: 350, category: 'special', difficulty: 5 },
  { id: 'rm_20x', title: '二十倍正确', description: '正确次数是错误的20倍', icon: '📊', condition: s => s.correctAnswers >= s.wrongAnswers * 20 && s.wrongAnswers > 0, reward: 500, category: 'special', difficulty: 5 },
  { id: 'rm_50x', title: '五十倍正确', description: '正确次数是错误的50倍', icon: '📊', condition: s => s.correctAnswers >= s.wrongAnswers * 50 && s.wrongAnswers > 0, reward: 1000, category: 'special', difficulty: 5 },
]

// ========== 扩展九、综合进阶系列（4个） ==========
// 里程碑式成就，结合多个维度
const milestoneUltraAchievements: Achievement[] = [
  { id: 'mu_week2', title: '两周达人', description: '学习14天且答对200题', icon: '📅', condition: s => s.daysStudied >= 14 && s.correctAnswers >= 200, reward: 120, category: 'special', difficulty: 2 },
  { id: 'mu_month1', title: '一月精英', description: '学习30天且答对500题', icon: '🌕', condition: s => s.daysStudied >= 30 && s.correctAnswers >= 500, reward: 250, category: 'special', difficulty: 3 },
  { id: 'mu_month2', title: '两月大师', description: '学习60天且答对2000题', icon: '🌟', condition: s => s.daysStudied >= 60 && s.correctAnswers >= 2000, reward: 500, category: 'special', difficulty: 4 },
  { id: 'mu_month3', title: '三月传说', description: '学习90天且答对4000题', icon: '👸', condition: s => s.daysStudied >= 90 && s.correctAnswers >= 4000, reward: 1000, category: 'special', difficulty: 5 },
]

// ========== 扩展十、混合挑战系列（15个） ==========
// 结合词汇+坚持+答题的复合条件成就
const hybridAchievements: Achievement[] = [
  { id: 'hy_3day_10word', title: '三天十词', description: '学习3天且掌握10个单词', icon: '🌱', condition: s => s.daysStudied >= 3 && s.totalWords >= 10, reward: 25, category: 'special', difficulty: 1 },
  { id: 'hy_week_30word', title: '一周三十词', description: '学习7天且掌握30个单词', icon: '📅', condition: s => s.daysStudied >= 7 && s.totalWords >= 30, reward: 60, category: 'special', difficulty: 1 },
  { id: 'hy_week_50', title: '一周五十题', description: '学习7天且答对50题', icon: '📊', condition: s => s.daysStudied >= 7 && s.correctAnswers >= 50, reward: 50, category: 'special', difficulty: 1 },
  { id: 'hy_10day_50word', title: '十天五十词', description: '学习10天且掌握50个单词', icon: '🌿', condition: s => s.daysStudied >= 10 && s.totalWords >= 50, reward: 80, category: 'special', difficulty: 2 },
  { id: 'hy_2week_100word', title: '两周百词', description: '学习14天且掌握100个单词', icon: '📚', condition: s => s.daysStudied >= 14 && s.totalWords >= 100, reward: 120, category: 'special', difficulty: 2 },
  { id: 'hy_2week_200', title: '两周两百题', description: '学习14天且答对200题', icon: '📈', condition: s => s.daysStudied >= 14 && s.correctAnswers >= 200, reward: 130, category: 'special', difficulty: 2 },
  { id: 'hy_3week_150word', title: '三周百五词', description: '学习21天且掌握150个单词', icon: '🌳', condition: s => s.daysStudied >= 21 && s.totalWords >= 150, reward: 160, category: 'special', difficulty: 2 },
  { id: 'hy_month_200word', title: '一月两百词', description: '学习30天且掌握200个单词', icon: '🌕', condition: s => s.daysStudied >= 30 && s.totalWords >= 200, reward: 250, category: 'special', difficulty: 3 },
  { id: 'hy_month_500', title: '一月五百题', description: '学习30天且答对500题', icon: '🎯', condition: s => s.daysStudied >= 30 && s.correctAnswers >= 500, reward: 200, category: 'special', difficulty: 3 },
  { id: 'hy_6week_400word', title: '六周四百词', description: '学习42天且掌握400个单词', icon: '🌲', condition: s => s.daysStudied >= 42 && s.totalWords >= 400, reward: 350, category: 'special', difficulty: 3 },
  { id: 'hy_2month_500word', title: '两月五百词', description: '学习60天且掌握500个单词', icon: '🌟', condition: s => s.daysStudied >= 60 && s.totalWords >= 500, reward: 500, category: 'special', difficulty: 4 },
  { id: 'hy_2month_1500', title: '两月千五题', description: '学习60天且答对1500题', icon: '💎', condition: s => s.daysStudied >= 60 && s.correctAnswers >= 1500, reward: 400, category: 'special', difficulty: 4 },
  { id: 'hy_75day_800word', title: '七十五天八百词', description: '学习75天且掌握800个单词', icon: '🏔️', condition: s => s.daysStudied >= 75 && s.totalWords >= 800, reward: 700, category: 'special', difficulty: 4 },
  { id: 'hy_3month_1000word', title: '三月千词', description: '学习90天且掌握1000个单词', icon: '👸', condition: s => s.daysStudied >= 90 && s.totalWords >= 1000, reward: 1000, category: 'special', difficulty: 5 },
  { id: 'hy_3month_3000', title: '三月三千题', description: '学习90天且答对3000题', icon: '✨', condition: s => s.daysStudied >= 90 && s.correctAnswers >= 3000, reward: 800, category: 'special', difficulty: 5 },
]

// ========== 十一、弹射系列（15个） ==========
const shootingAchievements: Achievement[] = [
  { id: 'shooting_1', title: '初次弹射', description: '第1次命中靶子', icon: '🏹', condition: s => s.correctAnswers >= 1, reward: 5, category: 'shooting', difficulty: 1 },
  { id: 'shooting_5', title: '初级射手', description: '命中5个靶子', icon: '🏹', condition: s => s.correctAnswers >= 5, reward: 15, category: 'shooting', difficulty: 1 },
  { id: 'shooting_10', title: '弹射新秀', description: '命中10个靶子', icon: '🎯', condition: s => s.correctAnswers >= 10, reward: 30, category: 'shooting', difficulty: 1 },
  { id: 'shooting_20', title: '弹射老手', description: '命中20个靶子', icon: '🏹', condition: s => s.correctAnswers >= 20, reward: 50, category: 'shooting', difficulty: 2 },
  { id: 'shooting_50', title: '精准射手', description: '命中50个靶子', icon: '🎯', condition: s => s.correctAnswers >= 50, reward: 80, category: 'shooting', difficulty: 2 },
  { id: 'shooting_100', title: '弹射大师', description: '命中100个靶子', icon: '🏆', condition: s => s.correctAnswers >= 100, reward: 150, category: 'shooting', difficulty: 3 },
  { id: 'shooting_200', title: '传奇射手', description: '命中200个靶子', icon: '👑', condition: s => s.correctAnswers >= 200, reward: 250, category: 'shooting', difficulty: 3 },
  { id: 'shooting_500', title: '弹射之王', description: '命中500个靶子', icon: '👸', condition: s => s.correctAnswers >= 500, reward: 500, category: 'shooting', difficulty: 4 },
  { id: 'shooting_combo3', title: '三连中', description: '达成3连击', icon: '🔥', condition: s => s.maxStreak >= 3, reward: 10, category: 'shooting', difficulty: 1 },
  { id: 'shooting_combo5', title: '五连中', description: '达成5连击', icon: '⚡', condition: s => s.maxStreak >= 5, reward: 25, category: 'shooting', difficulty: 1 },
  { id: 'shooting_combo10', title: '十连神射', description: '达成10连击', icon: '💫', condition: s => s.maxStreak >= 10, reward: 60, category: 'shooting', difficulty: 2 },
  { id: 'shooting_combo20', title: '二十连传说', description: '达成20连击', icon: '🌈', condition: s => s.maxStreak >= 20, reward: 150, category: 'shooting', difficulty: 3 },
  { id: 'shooting_no_miss_10', title: '完美弹射', description: '连续10题零失误', icon: '⭐', condition: s => s.maxStreak >= 10 && s.wrongAnswers === 0, reward: 50, category: 'shooting', difficulty: 2 },
  { id: 'shooting_no_miss_20', title: '弹射之神', description: '连续20题零失误', icon: '✨', condition: s => s.maxStreak >= 20 && s.wrongAnswers === 0, reward: 120, category: 'shooting', difficulty: 3 },
  { id: 'shooting_speed', title: '速射达人', description: '平均答题时间少于3秒', icon: '⚡', condition: s => { const t = s.correctAnswers + s.wrongAnswers; return t >= 20 && s.totalTime / t < 3 }, reward: 80, category: 'shooting', difficulty: 3 },
]

// ========== 十二、签到打卡系列（10个） ==========
const checkInAchievements: Achievement[] = [
  { id: 'ci_1', title: '初次签到', description: '第一次签到打卡', icon: '📅', condition: s => s.daysStudied >= 1, reward: 5, category: 'checkin', difficulty: 1 },
  { id: 'ci_3', title: '签到三天', description: '连续签到3天', icon: '📅', condition: s => s.daysStudied >= 3, reward: 15, category: 'checkin', difficulty: 1 },
  { id: 'ci_5', title: '签到五天', description: '连续签到5天', icon: '🔥', condition: s => s.daysStudied >= 5, reward: 25, category: 'checkin', difficulty: 1 },
  { id: 'ci_7', title: '签到达人', description: '连续签到7天', icon: '⭐', condition: s => s.daysStudied >= 7, reward: 50, category: 'checkin', difficulty: 2 },
  { id: 'ci_14', title: '签到英雄', description: '连续签到14天', icon: '🛡️', condition: s => s.daysStudied >= 14, reward: 80, category: 'checkin', difficulty: 2 },
  { id: 'ci_21', title: '签到勇士', description: '连续签到21天', icon: '⚔️', condition: s => s.daysStudied >= 21, reward: 120, category: 'checkin', difficulty: 3 },
  { id: 'ci_30', title: '签到之王', description: '连续签到30天', icon: '👑', condition: s => s.daysStudied >= 30, reward: 200, category: 'checkin', difficulty: 3 },
  { id: 'ci_50', title: '签到传说', description: '连续签到50天', icon: '💎', condition: s => s.daysStudied >= 50, reward: 300, category: 'checkin', difficulty: 4 },
  { id: 'ci_75', title: '签到神话', description: '连续签到75天', icon: '✨', condition: s => s.daysStudied >= 75, reward: 400, category: 'checkin', difficulty: 5 },
  { id: 'ci_100', title: '百日签到', description: '连续签到100天', icon: '👸', condition: s => s.daysStudied >= 100, reward: 500, category: 'checkin', difficulty: 5 },
]

// 导出所有成就
export const achievements: Achievement[] = [
  ...vocabularyAchievements,       // 32个
  ...streakAchievements,           // 24个
  ...answerAchievements,           // 20个
  ...persistenceAchievements,      // 30个
  ...perfectAchievements,          // 16个
  ...accuracyAchievements,         // 16个
  ...speedAchievements,            // 15个
  ...timeAchievements,             // 20个
  ...levelAchievements,            // 15个
  ...specialAchievements,          // 40个
  ...vocabQualityAchievements,     // 8个（新增）
  ...vocabBatchAchievements,       // 10个（新增）
  ...streakUltraAchievements,      // 10个（新增）
  ...answerMegaAchievements,       // 7个（新增）
  ...answerQualityAchievements,    // 8个（新增）
  ...perfectUltraAchievements,     // 10个（新增）
  ...timeUltraAchievements,        // 7个（新增）
  ...ratioMegaAchievements,        // 6个（新增）
  ...milestoneUltraAchievements,   // 4个（新增）
  ...hybridAchievements,           // 15个（新增）
  ...shootingAchievements,         // 15个（新增：打靶系列）
  ...checkInAchievements,          // 10个（新增：签到打卡系列）
]

// 成就分类列表（用于UI展示）
export const achievementCategories = [
  { id: 'all', name: '全部', icon: '🏆' },
  { id: 'vocabulary', name: '词汇积累', icon: '📚' },
  { id: 'streak', name: '连击系列', icon: '🔥' },
  { id: 'answers', name: '答题总数', icon: '📊' },
  { id: 'persistence', name: '每日坚持', icon: '📅' },
  { id: 'perfect', name: '完美轮次', icon: '⭐' },
  { id: 'accuracy', name: '准确率', icon: '🎯' },
  { id: 'speed', name: '速度系列', icon: '⚡' },
  { id: 'time', name: '时段系列', icon: '⏰' },
  { id: 'level', name: '等级系列', icon: '🎖️' },
  { id: 'special', name: '特殊成就', icon: '✨' },
  { id: 'shooting', name: '弹射系列', icon: '🏹' },
  { id: 'checkin', name: '签到打卡', icon: '📅' },
]
