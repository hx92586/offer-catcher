# Offer 捕手 Vercel 部署步骤

当前项目是纯静态网页，入口文件为 `index.html`，不需要构建产物目录。

## 已完成

1. Git 仓库已初始化，当前分支为 `main`。
2. 已创建 `package.json`。
3. 已创建 `vercel.json`。
4. 已创建 `.gitignore`，忽略 `node_modules/`、`.vercel/`、`docx_render/` 等本地文件。
5. 已创建初始提交：`Initial Offer Catcher demo`。

## 部署方式 A：使用 Vercel CLI

这些命令需要你在本机终端手动执行，因为它们需要联网、安装 CLI、登录 Vercel，并把项目文件上传到 Vercel。

```bash
cd /Users/hx/Documents/offer捕手
npm install -g vercel
vercel login
vercel --prod
```

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
- `vercel.json` 仅设置静态站点基础响应头和 URL 风格，不依赖服务端函数。
- 项目不依赖外部构建工具，不需要 `npm install` 即可运行页面。

## 部署后验证

拿到 `https://xxx.vercel.app` 后，检查：

1. 首页能打开并显示「Offer 捕手」。
2. 点击「投递追踪」，能看到 Joyce 27届秋招样例。
3. 新增一条投递记录后刷新页面，记录仍保留。
4. 切换「岗位匹配 / 简历优化 / 行动清单」均正常。
