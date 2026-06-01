# Offer 捕手 Vercel 部署步骤

当前项目是纯静态网页，入口文件为 `index.html`，不需要构建产物目录。
项目同时包含一个 Vercel Serverless API：`api/match.js`，用于在服务端安全调用 OpenAI API。

## 已完成

1. Git 仓库已初始化，当前分支为 `main`。
2. 已创建 `package.json`。
3. 已创建 `vercel.json`。
4. 已创建 `.gitignore`，忽略 `node_modules/`、`.vercel/`、`docx_render/` 等本地文件。
5. 已创建初始提交：`Initial Offer Catcher demo`。

## 部署方式 A：使用 Vercel CLI

这些命令需要你在本机终端手动执行，因为它们需要联网、登录 Vercel，并配置 OpenAI API Key。

```bash
cd /Users/hx/Documents/offer捕手
vercel env add OPENAI_API_KEY production
vercel --prod
```

如果本机还没有安装或登录 Vercel CLI，再执行：

```bash
npm install -g vercel
vercel login
```

可选：如果你想覆盖默认模型，可以添加：

```bash
vercel env add OPENAI_MODEL production
```

默认模型为 `gpt-4o-mini`。

首次执行 `vercel --prod` 时，建议按以下方式回答：

```text
Set up and deploy? y
Which scope? 选择你的 Vercel 账号或团队
Link to existing project? n
Project name? offer-catcher
In which directory is your code located? ./
Want to modify these settings? n
```

部署成功后，终端会输出类似：

```text
Production: https://offer-catcher-xxxx.vercel.app
```

这个 `Production` 地址就是公网访问链接。

## 部署方式 B：GitHub + Vercel 导入

如果你更喜欢网页操作，可以先推送到 GitHub，再在 Vercel 控制台导入仓库。

需要你手动执行：

```bash
cd /Users/hx/Documents/offer捕手
git remote add origin https://github.com/<你的用户名>/offer-catcher.git
git push -u origin main
```

然后在 Vercel 网页执行：

1. 打开 Vercel Dashboard。
2. New Project。
3. Import Git Repository。
4. 选择 `offer-catcher` 仓库。
5. Framework Preset 选择 `Other`。
6. Build Command 可以留空，或使用 `npm run build`。
7. Output Directory 留空。
8. 点击 Deploy。

## 部署配置检查

- `index.html` 在项目根目录，Vercel 可直接作为静态入口。
- `package.json` 存在，脚本包含 `dev`、`build`、`deploy`。
- `vercel.json` 已明确设置 `outputDirectory` 为 `.`，让 Vercel 从项目根目录发布静态网页。
- `vercel.json` 仅设置静态站点基础响应头和 URL 风格，不依赖服务端函数。
- `api/match.js` 通过 `process.env.OPENAI_API_KEY` 读取密钥，前端不会暴露 API Key。
- 项目不依赖外部构建工具，不需要 `npm install` 即可运行页面；AI 分析需要 Vercel Serverless 环境。

## 如果出现 public 目录错误

如果 Vercel 报错：

```text
No Output Directory named "public" found after the Build completed.
```

说明 Vercel 项目设置里仍把 Output Directory 指向了 `public`。本项目没有 `public/`，静态文件位于根目录。请在 Vercel Dashboard 中进入：

```text
Project Settings -> Build & Development Settings -> Output Directory
```

将 Output Directory 改成：

```text
.
```

或清空该字段，然后重新部署。当前仓库里的 `vercel.json` 已写入：

```json
{
  "outputDirectory": "."
}
```

## 部署后验证

拿到 `https://xxx.vercel.app` 后，检查：

1. 首页能打开并显示「Offer 捕手」。
2. 点击「投递追踪」，能看到 Joyce 27届秋招样例。
3. 在首页输入简历和岗位 JD，点击「开始匹配」，能看到 AI 匹配评分和简历建议。
4. 新增一条投递记录后刷新页面，记录仍保留。
5. 切换「岗位匹配 / 简历优化 / 行动清单」均正常。

## OpenAI API 失败排查

如果页面提示 `Missing OPENAI_API_KEY environment variable`，执行：

```bash
vercel env add OPENAI_API_KEY production
vercel --prod
```

如果提示模型不可用，执行：

```bash
vercel env add OPENAI_MODEL production
```

填入你账号可用的模型，例如 `gpt-4o-mini`，然后重新部署。
