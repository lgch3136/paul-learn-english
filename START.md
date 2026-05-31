# 🚀 快速开始

## 1. 安装依赖

```bash
npm install
```

## 2. 启动开发服务器

```bash
npm run dev
```

## 3. 访问应用

打开浏览器访问：http://localhost:3000

---

## 📱 页面说明

### 学生端
- **首页**: http://localhost:3000
- **今日任务**: http://localhost:3000/lesson
- **单词练习**: http://localhost:3000/practice/vocabulary
- **我的进步**: http://localhost:3000/progress

### 家长端
- **学习报告**: http://localhost:3000/parent

---

## 📝 下一步

### 1. 填写教材数据

按照 `DATA-GUIDE.md` 的说明，填写以下文件：

1. **教材结构** (`data/textbook-structure.json`)
   - 填写 Unit 1-8 的标题、主题、大问题

2. **单词表** (`data/vocabulary/vocabulary-template.json`)
   - 复制 `example` 对象
   - 填写 Unit 1 的 15-20 个核心单词

3. **语法点** (`data/grammar/grammar-template.json`)
   - 复制 `example` 对象
   - 填写 Unit 1 的 2-4 个核心语法点

4. **练习题** (`data/exercises/exercises-template.json`)
   - 复制 `examples` 中对应类型的对象
   - 填写 Unit 1 的 20-30 道练习题

### 2. 测试页面

填写完数据后，刷新浏览器查看效果。

### 3. 开始开发

根据 `DEVELOPMENT.md` 的计划，开始开发核心功能。

---

## ❓ 常见问题

### Q: 如何添加新的单词？
A: 在 `data/vocabulary/vocabulary-template.json` 中复制 `example` 对象，修改内容即可。

### Q: 如何添加新的题型？
A: 在 `data/exercises/exercises-template.json` 中复制 `examples` 中对应类型的对象。

### Q: 数据填写后页面没有变化？
A: 确保 JSON 格式正确，然后刷新浏览器。如果还有问题，检查控制台是否有错误。

### Q: 如何部署到线上？
A: 运行 `npm run build` 生成静态文件，然后部署到任何静态托管服务（如 Vercel、Netlify）。

---

## 📞 获取帮助

如果遇到问题：
1. 查看 `DEVELOPMENT.md` 了解项目结构
2. 查看 `DATA-GUIDE.md` 了解数据填写
3. 联系项目负责人

---

## 🎯 本周目标

**必须完成**：
- [ ] 拿到最新版译林五下教材
- [ ] 填写 Unit 1 完整数据
- [ ] 测试所有页面功能

**建议完成**：
- [ ] 填写 Unit 2 数据
- [ ] 完善错因标签
- [ ] 设计更多题型

---

**加油！每天 10 分钟，让孩子的英语学习更轻松！** 🎉