# 数据填写指南

## 📋 概述

本指南帮助你填写译林版五年级下册英语教材的数据。这些数据是整个系统的核心，决定了练习的质量和效果。

## ⚠️ 重要提醒

**必须使用最新版教材（2024修订版）**

- ❌ 不要使用网上搜到的旧版目录（如 Unit 1 Cinderella、Unit 8 Birthdays）
- ✅ 使用学校发的最新版教材或官方电子教材
- ✅ 参考译林教育网官方资源

## 📁 数据文件结构

```
data/
├── textbook-structure.json    # 教材结构（Unit 1-8 框架）
├── vocabulary/
│   └── vocabulary-template.json  # 单词表模板
├── grammar/
│   └── grammar-template.json     # 语法点模板
├── exercises/
│   └── exercises-template.json   # 练习题模板
└── error-tags.json              # 错因标签体系
```

## 🔤 第一步：填写教材结构

打开 `data/textbook-structure.json`

需要填写的内容：
1. **Unit 标题**：如 "Unit 1 What do you do?"
2. **单元主题**：如 "日常生活"
3. **单元大问题**：如 "What do you usually do after school?"

示例：
```json
{
  "unit_id": 1,
  "unit_name": "Unit 1 What do you do?",
  "theme": "日常生活",
  "big_question": "What do you usually do after school?"
}
```

## 📝 第二步：填写单词表

打开 `data/vocabulary/vocabulary-template.json`

每个 Unit 建议填写 15-20 个核心单词。

### 必填字段

| 字段 | 说明 | 示例 |
|------|------|------|
| word_id | 单词唯一标识 | unit_1_001_play |
| word | 英文单词 | play |
| meaning | 中文释义 | 玩；播放 |
| part_of_speech | 词性 | verb |
| sentence | 教材例句 | I often play football after school. |

### 选填字段（建议填写）

| 字段 | 说明 | 示例 |
|------|------|------|
| phrase | 常见短语 | ["play football", "play the piano"] |
| phonetic | 音标 | /pleɪ/ |
| image_prompt | 配图描述 | 一个男孩在操场上踢足球 |
| error_tags | 常见错误 | ["动词形式错", "拼写错"] |

### 填写步骤

1. 复制 `example` 对象
2. 修改 `word_id` 为 `unit_X_序号_单词`（如 unit_1_001_play）
3. 填写单词、释义、词性
4. 填写教材中的例句
5. 添加常见短语搭配
6. 标注学生容易犯的错误

## 📚 第三步：填写语法点

打开 `data/grammar/grammar-template.json`

每个 Unit 建议填写 2-4 个核心语法点。

### 必填字段

| 字段 | 说明 | 示例 |
|------|------|------|
| grammar_id | 语法点ID | grammar_unit_1_001_present_simple |
| unit | 所属单元 | Unit 1 |
| grammar_point | 语法点名称 | 一般现在时（第三人称单数） |
| student_explanation | 学生解释 | 当主语是 he/she/it 时，动词要加 s |
| correct_examples | 正确例句 | [{"sentence": "He plays football.", "translation": "他踢足球。"}] |
| wrong_examples | 错误例句 | [{"sentence": "He play football.", "correction": "He plays football."}] |
| error_reason | 错误原因 | 学生忘记主语是第三人称单数 |

### 填写技巧

**student_explanation 要简单易懂**
- ❌ "第三人称单数主语后，谓语动词需进行形态变化"
- ✅ "当句子说的是 he、she、it 或一个人名时，动词要加 s 或 es"

**wrong_examples 要典型**
- 选择学生最常犯的错误
- 每个语法点 2-3 个典型错误

## ✍️ 第四步：填写练习题

打开 `data/exercises/exercises-template.json`

每个 Unit 建议填写 20-30 道题。

### 题目类型

| 类型 | 说明 | 数量建议 |
|------|------|----------|
| listen_choice | 听音选择 | 5-8 题 |
| recognize_choice | 认读选择 | 5-8 题 |
| spell_fill | 拼写填空 | 4-6 题 |
| correct_error | 改错 | 3-5 题 |
| sentence_make | 造句 | 2-4 题 |
| translate | 翻译 | 2-4 题 |

### 难度分布

| 难度 | 说明 | 数量建议 |
|------|------|----------|
| 1 | 基础 - 直接认读 | 8-10 题 |
| 2 | 初级 - 简单应用 | 6-8 题 |
| 3 | 中级 - 语法运用 | 4-6 题 |
| 4 | 高级 - 综合运用 | 2-4 题 |
| 5 | 挑战 - 拓展延伸 | 1-2 题 |

### 填写示例

**选择题**
```json
{
  "question_id": "exercise_unit_1_001",
  "unit": "Unit 1",
  "type": "recognize_choice",
  "skill": "reading",
  "difficulty": 1,
  "question": "选出与图片相符的单词",
  "options": ["play football", "play basketball", "play the piano", "play games"],
  "answer": "play football",
  "explanation": "图片显示的是踢足球的场景",
  "error_tag": "词义混",
  "related_vocabulary": ["football", "basketball", "piano"],
  "time_limit": 25
}
```

**改错题**
```json
{
  "question_id": "exercise_unit_1_010",
  "unit": "Unit 1",
  "type": "correct_error",
  "skill": "grammar",
  "difficulty": 3,
  "question": "找出句子中的错误并改正：He play football every day.",
  "options": null,
  "answer": "play → plays",
  "explanation": "主语是 He（第三人称单数），动词要加 s",
  "error_tag": "动词形式错",
  "related_vocabulary": ["play", "he"],
  "related_grammar": "grammar_unit_1_example_present_simple",
  "time_limit": 60
}
```

## 🏷️ 第五步：关联错因标签

每道题都要关联一个 `error_tag`。

### 常用错因标签

| 标签 | 说明 | 适用题型 |
|------|------|----------|
| 主语判断错 | I/you/he/she/they 分不清 | 选择、填空、改错 |
| be 动词错 | am/is/are 乱用 | 填空、改错 |
| 动词形式错 | 原形、三单、现在分词混淆 | 选择、填空、改错 |
| 疑问词错 | what/where/when/why/how 混淆 | 选择、填空 |
| because 用法错 | why 问句回答错误 | 造句、改错 |
| 介词错 | in/on/at/under 混淆 | 选择、填空 |
| 时间表达错 | 月份、日期、序数词 | 填空、翻译 |
| 句序错 | 中文顺序直译 | 排序、造句 |
| 拼写错 | 漏字母、多字母、顺序错 | 拼写填空、听写 |
| 读题错 | 题目要求没看清 | 所有题型 |

## 📊 数据质量检查清单

填写完一个 Unit 后，检查以下内容：

### 单词表
- [ ] 单词数量：15-20 个
- [ ] 每个单词都有释义和例句
- [ ] 词性标注正确
- [ ] 常见短语已填写
- [ ] 错因标签已标注

### 语法点
- [ ] 语法点数量：2-4 个
- [ ] 学生解释简单易懂
- [ ] 正确例句和错误例句都有
- [ ] 错误原因分析清晰

### 练习题
- [ ] 题目数量：20-30 道
- [ ] 题型分布合理
- [ ] 难度分布合理（1-2级占60%，3级占30%，4-5级占10%）
- [ ] 每道题都有解释和错因标签
- [ ] 相关单词和语法点已关联

## 💡 填写技巧

### 1. 从教材出发
- 先通读教材，理解单元主题和目标
- 找出核心单词和句型
- 识别重点语法点

### 2. 换位思考
- 想象自己是五年级学生
- 这个单词/语法点哪里容易错？
- 怎么解释才能让学生听懂？

### 3. 难度递进
- 先填基础题（认读、选择）
- 再填应用题（填空、改错）
- 最后填综合题（造句、翻译）

### 4. 多样化
- 同一个知识点，用不同题型考察
- 同一个错因，用不同场景练习

## 📞 遇到问题？

如果在填写过程中遇到问题：
1. 参考模板中的 `example` 对象
2. 查看 `error-tags.json` 了解错因标签
3. 联系项目负责人

## 🎯 下一步

填写完 Unit 1 的数据后：
1. 进行数据质量检查
2. 测试练习题是否合理
3. 开始开发学生端界面
