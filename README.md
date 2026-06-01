# Offer 捕手

「Offer 捕手」是一个学生求职匹配智能体 Demo。它通过简历文本、岗位 JD、求职方向和城市偏好，调用 OpenAI API 完成真实岗位匹配评分、匹配原因解释、简历缺口诊断、改写建议、可复制 bullet points、投递行动清单和 offer 投递进度追踪。

## 本地运行

这是一个纯静态 Demo，可直接打开：

```bash
open index.html
```

也可以用任意静态服务器托管当前目录，例如：

```bash
python3 -m http.server 8080
```

访问 `http://localhost:8080`。

如果要在本地测试 OpenAI API 路由，请使用 Vercel CLI：

```bash
OPENAI_API_KEY=你的_key vercel dev
```

## 公网部署

当前项目不依赖构建步骤，适合部署到 Vercel、Netlify、GitHub Pages 或 Cloudflare Pages。部署入口选择本目录，构建命令留空，输出目录填写 `.`。

## 交付物

- `index.html` / `styles.css` / `app.js`：可运行 Demo。
- `方案说明.md`：1000 字以内方案说明。
- `方案说明.docx`：Word 版本方案说明。

## 主要功能

- AI 匹配：基于学生简历和岗位 JD 调用 `/api/match` 返回真实分析。
- 简历优化：展示优势信号、缺口提醒、可直接使用的改写建议和 bullet points。
- 投递追踪：记录学生姓名、届别/批次、公司、岗位、状态和备注，支持状态更新与删除，数据保存在浏览器本地。
