# 开发文档

## 📅 项目状态

**当前阶段**：第 1 周 - 教材核对 + 数据模板

**完成时间**：2026年5月30日

**下一步**：填写 Unit 1 教材数据

---

## ✅ 已完成工作

### 1. 项目结构搭建
- [x] 创建 Next.js 项目框架
- [x] 配置 TypeScript + Tailwind CSS
- [x] 建立目录结构
- [x] 配置开发环境

### 2. 教材数据模板
- [x] 教材结构模板 (`data/textbook-structure.json`)
- [x] 单词表模板 (`data/vocabulary/vocabulary-template.json`)
- [x] 语法点模板 (`data/grammar/grammar-template.json`)
- [x] 练习题模板 (`data/exercises/exercises-template.json`)
- [x] 错因标签体系 (`data/error-tags.json`)
- [x] 数据填写指南 (`DATA-GUIDE.md`)

### 3. 类型定义
- [x] 单词类型 (`Vocabulary`)
- [x] 语法点类型 (`GrammarPoint`)
- [x] 练习题类型 (`Exercise`)
- [x] 学生进度类型 (`StudentProgress`)
- [x] 家长日报类型 (`DailyReport`)

### 4. 基础页面
- [x] 首页 (`src/app/page.tsx`)
- [x] 今日任务页 (`src/app/lesson/page.tsx`)
- [x] 单词练习页 (`src/app/practice/vocabulary/page.tsx`)
- [x] 进度页 (`src/app/progress/page.tsx`)
- [x] 家长页 (`src/app/parent/page.tsx`)

### 5. 工具函数
- [x] 数据加载函数 (`src/lib/data.ts`)

---

## 📋 待办事项

### 本周（第 1 周）

#### 必须完成
- [ ] 拿到最新版译林五下教材
- [ ] 确认 Unit 1-8 标题、主题、大问题
- [ ] 填写 Unit 1 单词表（15-20 个单词）
- [ ] 填写 Unit 1 语法点（2-4 个）
- [ ] 填写 Unit 1 练习题（20-30 道）

#### 建议完成
- [ ] 填写 Unit 2 单词表（家长试用版需要）
- [ ] 完善错因标签体系
- [ ] 设计更多练习题型

### 下周（第 2 周）

#### 核心功能
- [ ] 完善今日任务页面
- [ ] 实现单词练习流程
- [ ] 实现语法练习流程
- [ ] 添加答题记录功能

#### 数据持久化
- [ ] 设计数据库结构
- [ ] 实现答题记录存储
- [ ] 实现学生进度存储

### 第 3 周

#### 错因诊断
- [ ] 实现错因标签系统
- [ ] 实现错题推荐算法
- [ ] 生成明日复习计划

#### 家长功能
- [ ] 完善家长日报页面
- [ ] 添加薄弱点分析
- [ ] 生成陪学建议

### 第 4 周

#### 测试优化
- [ ] 找 5-10 个五年级孩子试用
- [ ] 收集反馈意见
- [ ] 优化用户体验
- [ ] 修复 bug

---

## 🛠️ 技术栈

### 前端
- **框架**: Next.js 14
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **状态管理**: React Hooks (MVP 阶段)

### 后端（MVP 阶段简化）
- **数据存储**: JSON 文件
- **API**: Next.js API Routes
- **部署**: 静态导出

### 未来扩展
- **数据库**: PostgreSQL / MongoDB
- **认证**: NextAuth.js
- **部署**: Vercel / 阿里云

---

## 📁 目录结构

```
paul-learn-english/
├── data/                          # 教材数据
│   ├── textbook-structure.json    # 教材结构
│   ├── vocabulary/                # 单词数据
│   │   └── vocabulary-template.json
│   ├── grammar/                   # 语法数据
│   │   └── grammar-template.json
│   ├── exercises/                 # 练习题
│   │   └── exercises-template.json
│   └── error-tags.json           # 错因标签
│
├── src/                           # 源代码
│   ├── app/                       # Next.js App Router
│   │   ├── page.tsx              # 首页
│   │   ├── lesson/               # 今日任务
│   │   ├── practice/             # 练习
│   │   │   ├── vocabulary/       # 单词练习
│   │   │   ├── grammar/          # 语法练习
│   │   │   └── review/           # 错题复习
│   │   ├── progress/             # 进度
│   │   └── parent/               # 家长页面
│   ├── components/               # 组件
│   │   ├── ui/                   # 通用组件
│   │   ├── layout/               # 布局组件
│   │   ├── lesson/               # 任务组件
│   │   ├── practice/             # 练习组件
│   │   └── parent/               # 家长组件
│   ├── lib/                      # 工具函数
│   │   └── data.ts              # 数据加载
│   └── types/                    # 类型定义
│       └── index.ts
│
├── public/                        # 静态资源
├── package.json                   # 依赖配置
├── tailwind.config.js             # Tailwind 配置
├── tsconfig.json                  # TypeScript 配置
├── next.config.js                 # Next.js 配置
├── README.md                      # 项目说明
├── DATA-GUIDE.md                  # 数据填写指南
└── DEVELOPMENT.md                 # 开发文档
```

---

## 🎯 MVP 功能清单

### 学生端（5 个页面）

#### 1. 今日任务 (`/lesson`)
- [x] 显示今日任务列表
- [x] 显示预计完成时间
- [x] 显示连续学习天数
- [ ] 一键开始练习
- [ ] 任务进度跟踪

#### 2. 单词闯关 (`/practice/vocabulary`)
- [x] 认读选择题型
- [ ] 听音选择题型
- [ ] 拼写填空题型
- [ ] 句中应用题型
- [ ] 答题记录
- [ ] 错因提示

#### 3. 语法小练 (`/practice/grammar`)
- [ ] 选择题型
- [ ] 填空题型
- [ ] 改错题型
- [ ] 造句题型
- [ ] 答题记录
- [ ] 语法讲解

#### 4. 错题复习 (`/practice/review`)
- [ ] 显示错题列表
- [ ] 按错因分类
- [ ] 智能推荐复习
- [ ] 复习进度跟踪

#### 5. 我的进步 (`/progress`)
- [x] 连续学习天数
- [x] 单词掌握进度
- [x] 语法掌握进度
- [x] 常见错误统计
- [x] 成就系统

### 家长端（3 个页面）

#### 1. 今日报告 (`/parent`)
- [x] 今日概况
- [x] 单词掌握情况
- [x] 语法问题
- [x] 陪学建议
- [x] 明日计划

#### 2. 薄弱点 (`/parent/weaknesses`)
- [ ] 薄弱单词
- [ ] 薄弱语法
- [ ] 常见错误
- [ ] 针对性建议

#### 3. 本周复习建议 (`/parent/weekly`)
- [ ] 本周学习统计
- [ ] 进步趋势
- [ ] 下周计划
- [ ] 家长建议

---

## 📊 数据结构

### 单词数据示例
```json
{
  "word_id": "unit_1_001_play",
  "word": "play",
  "meaning": "玩；播放",
  "part_of_speech": "verb",
  "phrase": ["play football", "play the piano"],
  "sentence": "I often play football after school.",
  "error_tags": ["动词形式错", "拼写错"]
}
```

### 语法点示例
```json
{
  "grammar_id": "grammar_unit_1_001_present_simple",
  "grammar_point": "一般现在时（第三人称单数）",
  "student_explanation": "当主语是 he/she/it 时，动词要加 s 或 es",
  "error_tags": ["动词形式错", "主语判断错"]
}
```

### 练习题示例
```json
{
  "question_id": "exercise_unit_1_001",
  "type": "recognize_choice",
  "question": "选出与图片相符的单词",
  "options": ["play football", "play basketball", "play the piano"],
  "answer": "play football",
  "error_tag": "词义混"
}
```

---

## 🧪 测试计划

### 第 4 周测试

#### 测试对象
- 5-10 个五年级学生
- 5 天连续使用

#### 测试指标
| 指标 | 目标 | 测量方法 |
|------|------|----------|
| 每日完成率 | 70% 以上 | 系统统计 |
| 单次练习时长 | 8-12 分钟 | 系统统计 |
| 重复错题下降 | 3 天内下降 | 对比分析 |
| 家长看日报比例 | 60% 以上 | 系统统计 |
| 孩子是否愿意继续 | 必须重点观察 | 访谈反馈 |

#### 收集反馈
- 学生：喜欢什么？不喜欢什么？哪里难？
- 家长：日报有用吗？孩子进步了吗？
- 教师：内容准确吗？难度合适吗？

---

## 🚀 部署计划

### MVP 阶段
- **方式**: 静态导出 + 本地运行
- **目的**: 内部测试
- **时间**: 第 4 周

### 试用阶段
- **方式**: Vercel 部署
- **目的**: 小范围试用
- **时间**: 第 5-6 周

### 正式发布
- **方式**: 云服务器 + 数据库
- **目的**: 正式运营
- **时间**: 第 7-8 周

---

## 📞 联系方式

**项目负责人**: [待填写]

**技术支持**: [待填写]

**反馈渠道**: [待填写]

---

## 📝 更新日志

### 2026-05-30
- 完成项目结构搭建
- 完成教材数据模板
- 完成基础页面开发
- 创建开发文档