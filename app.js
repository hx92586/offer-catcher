const sampleResume = `教育背景：伦敦大学学院 商业分析硕士，GPA 3.7/4.0。本科信息管理。
技能：Python、SQL、Tableau、Excel、A/B Testing、用户研究、竞品分析、机器学习基础。
项目经历：
1. 电商用户留存分析：用 Python 清洗 30 万行订单数据，建立 RFM 分层和流失预警模型，将高风险用户召回转化率提升 12%。
2. 校园二手交易产品调研：访谈 18 名学生，输出用户旅程、PRD 和原型，推动小程序收藏与议价功能上线。
3. 咨询课程项目：为新能源品牌做市场进入研究，完成行业规模测算、竞品矩阵和 go-to-market 建议。
实习经历：互联网公司数据运营实习，负责 SQL 取数、周报看板、活动复盘，沉淀 5 个可复用指标模板。
兴趣方向：希望从事数据分析、商业分析或产品策略岗位，偏好上海、杭州或远程。`;

const sampleJd = `岗位：商业分析实习生
公司：星链零售科技
地点：上海
岗位职责：
1. 支持用户增长、商品运营和会员策略分析，完成 SQL 取数、指标看板和活动复盘。
2. 结合用户行为、订单和转化数据，发现业务问题并提出增长策略。
3. 参与 A/B Testing 方案设计，输出实验结论和运营建议。
岗位要求：
1. 熟练使用 SQL、Excel，掌握 Python 或 Tableau 加分。
2. 具备电商、用户增长、CRM 或数据运营项目经验。
3. 能用结构化方式表达分析结论，有良好的业务敏感度和沟通能力。`;

const trackerKey = "offer-catcher-applications";
const statusLabels = ["已投递", "测评中", "一面", "二面", "终面", "Offer", "已挂"];
const defaultApplications = [
  {
    id: "joyce-ba-demo",
    student: "Joyce",
    batch: "27届秋招",
    company: "星链零售科技",
    role: "商业分析实习生",
    status: "已投递",
    note: "优先跟进，岗位匹配度高",
    updatedAt: "2026-06-01"
  },
  {
    id: "joyce-pm-demo",
    student: "Joyce",
    batch: "27届秋招",
    company: "青橙校园服务",
    role: "产品经理校招",
    status: "测评中",
    note: "补充产品项目 STAR 故事",
    updatedAt: "2026-06-01"
  },
  {
    id: "joyce-consulting-demo",
    student: "Joyce",
    batch: "27届秋招",
    company: "启明咨询",
    role: "战略咨询项目助理",
    status: "一面",
    note: "准备市场规模测算案例",
    updatedAt: "2026-06-01"
  }
];

const fallbackAnalysis = {
  matchScore: 0,
  applicationLevel: "等待分析",
  summary: "输入简历文本和岗位 JD 后，AI 会生成真实匹配分析。",
  matchingAdvantages: [],
  skillGaps: [],
  resumeSuggestions: [],
  bulletPoints: [],
  actionPlan: []
};

const elements = {
  resume: document.querySelector("#resumeInput"),
  jd: document.querySelector("#jdInput"),
  sampleBtn: document.querySelector("#sampleBtn"),
  matchBtn: document.querySelector("#matchBtn"),
  role: document.querySelector("#targetRole"),
  city: document.querySelector("#city"),
  degree: document.querySelector("#degree"),
  topScore: document.querySelector("#topScore"),
  summaryTitle: document.querySelector("#summaryTitle"),
  summaryText: document.querySelector("#summaryText"),
  jobCards: document.querySelector("#jobCards"),
  strengths: document.querySelector("#strengthList"),
  gaps: document.querySelector("#gapList"),
  rewrites: document.querySelector("#rewriteList"),
  bullets: document.querySelector("#bulletList"),
  actionPlan: document.querySelector("#actionPlan"),
  applicationForm: document.querySelector("#applicationForm"),
  studentName: document.querySelector("#studentName"),
  studentBatch: document.querySelector("#studentBatch"),
  applicationCompany: document.querySelector("#applicationCompany"),
  applicationRole: document.querySelector("#applicationRole"),
  applicationStatus: document.querySelector("#applicationStatus"),
  applicationNote: document.querySelector("#applicationNote"),
  trackerStats: document.querySelector("#trackerStats"),
  applicationList: document.querySelector("#applicationList"),
  dial: document.querySelector(".score-dial")
};

let applications = loadApplications();

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function setDial(score) {
  const safeScore = Number.isFinite(score) ? Math.max(0, Math.min(100, score)) : 0;
  elements.topScore.textContent = safeScore ? `${safeScore}%` : "--";
  elements.dial.style.setProperty("--score", `${Math.round(safeScore * 3.6)}deg`);
}

function setLoading(isLoading) {
  elements.matchBtn.disabled = isLoading;
  elements.matchBtn.textContent = isLoading ? "AI 分析中..." : "开始匹配";
}

function renderInitialState() {
  setDial(0);
  elements.summaryTitle.textContent = "等待 AI 匹配";
  elements.summaryText.textContent = "系统会把简历与岗位 JD 发送到后端，由 OpenAI API 返回结构化匹配分析。";
  elements.jobCards.innerHTML = `<div class="loading-state">请粘贴岗位 JD 后点击「开始匹配」。分析结果会包含匹配度、推荐投递等级、优势、缺口和可复制简历 bullet points。</div>`;
  elements.strengths.innerHTML = "";
  elements.gaps.innerHTML = "";
  elements.rewrites.innerHTML = "";
  elements.bullets.innerHTML = "";
  elements.actionPlan.innerHTML = "";
}

function renderAnalysis(analysis) {
  const result = { ...fallbackAnalysis, ...analysis };
  const score = Number(result.matchScore) || 0;
  setDial(score);
  elements.summaryTitle.textContent = `${result.applicationLevel} · ${score}%`;
  elements.summaryText.textContent = result.summary || "AI 已完成简历与岗位 JD 的匹配分析。";

  elements.jobCards.innerHTML = `<article class="job-card ai-card">
    <div class="job-head">
      <div>
        <div class="job-title">AI 匹配结论</div>
        <p class="job-meta">${escapeHtml(elements.degree.value)} · ${escapeHtml(elements.city.value)} · ${escapeHtml(elements.role.options[elements.role.selectedIndex].text)}</p>
      </div>
      <span class="level-pill">${escapeHtml(result.applicationLevel)}</span>
    </div>
    <div class="bar" aria-hidden="true"><span style="--width:${score}%"></span></div>
    <p>${escapeHtml(result.summary)}</p>
  </article>`;

  elements.strengths.innerHTML = renderListItems(result.matchingAdvantages);
  elements.gaps.innerHTML = renderListItems(result.skillGaps);
  elements.rewrites.innerHTML = renderRewriteItems(result.resumeSuggestions);
  elements.bullets.innerHTML = renderBulletItems(result.bulletPoints);
  elements.actionPlan.innerHTML = renderActionItems(result.actionPlan);
}

function renderListItems(items) {
  return ensureArray(items).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function renderRewriteItems(items) {
  const list = ensureArray(items);
  if (!list.length) return `<div class="rewrite-item">暂无建议。请补充更完整的简历或岗位 JD 后重试。</div>`;
  return list.map((item) => `<div class="rewrite-item">${escapeHtml(item)}</div>`).join("");
}

function renderBulletItems(items) {
  const list = ensureArray(items);
  if (!list.length) return `<div class="rewrite-item">暂无可复制 bullet。请补充项目经历、实习经历和岗位要求后重试。</div>`;
  return list
    .map((item) => `<div class="bullet-item">
      <span>${escapeHtml(item)}</span>
      <button class="copy-btn" type="button" data-copy="${escapeHtml(item)}">复制</button>
    </div>`)
    .join("");
}

function renderActionItems(items) {
  const list = ensureArray(items);
  if (!list.length) return `<li><strong>下一步</strong><span>根据 AI 建议补齐缺口，再投递该岗位。</span></li>`;
  return list.map((item, index) => `<li><strong>${index + 1}</strong><span>${escapeHtml(item)}</span></li>`).join("");
}

function ensureArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

async function runMatch() {
  const resume = elements.resume.value.trim();
  const jd = elements.jd.value.trim();
  if (!resume || !jd) {
    elements.summaryTitle.textContent = "请补充简历和岗位 JD";
    elements.summaryText.textContent = "真实 AI 匹配需要同时读取学生简历和目标岗位 JD。";
    return;
  }

  setLoading(true);
  elements.jobCards.innerHTML = `<div class="loading-state">OpenAI 正在分析简历与 JD，请稍等。</div>`;

  try {
    const response = await fetch("/api/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resume,
        jobDescription: jd,
        targetRole: elements.role.options[elements.role.selectedIndex].text,
        degree: elements.degree.value,
        city: elements.city.value
      })
    });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || "AI 匹配请求失败");
    }
    renderAnalysis(payload.analysis);
  } catch (error) {
    setDial(0);
    elements.summaryTitle.textContent = "AI 匹配失败";
    elements.summaryText.textContent = error.message;
    elements.jobCards.innerHTML = `<div class="loading-state">${escapeHtml(error.message)}。请确认 Vercel 环境变量 OPENAI_API_KEY 已配置，然后重新部署。</div>`;
  } finally {
    setLoading(false);
  }
}

function loadApplications() {
  try {
    const saved = JSON.parse(localStorage.getItem(trackerKey));
    return Array.isArray(saved) && saved.length ? saved : defaultApplications;
  } catch {
    return defaultApplications;
  }
}

function saveApplications() {
  localStorage.setItem(trackerKey, JSON.stringify(applications));
}

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function renderTracker() {
  const activeCount = applications.filter((item) => !["Offer", "已挂"].includes(item.status)).length;
  const stats = [
    ["总投递", applications.length],
    ["推进中", activeCount],
    ["面试中", applications.filter((item) => ["一面", "二面", "终面"].includes(item.status)).length],
    ["Offer", applications.filter((item) => item.status === "Offer").length]
  ];

  elements.trackerStats.innerHTML = stats
    .map(([label, count]) => `<article class="stat-card"><strong>${count}</strong><span class="muted">${label}</span></article>`)
    .join("");

  if (!applications.length) {
    elements.applicationList.innerHTML = `<div class="empty-state">暂无投递记录。添加学生、届别、公司、岗位和状态后，这里会形成求职进度表。</div>`;
    return;
  }

  elements.applicationList.innerHTML = applications
    .map((item) => {
      const options = statusLabels
        .map((status) => `<option ${status === item.status ? "selected" : ""}>${status}</option>`)
        .join("");
      return `<article class="application-card" data-id="${escapeHtml(item.id)}">
        <div>
          <div class="application-title">${escapeHtml(item.student)} · ${escapeHtml(item.batch)} · ${escapeHtml(item.role)}</div>
          <p class="application-meta">${escapeHtml(item.company)} · 更新于 ${escapeHtml(item.updatedAt)}${item.note ? ` · ${escapeHtml(item.note)}` : ""}</p>
        </div>
        <select class="status-select" aria-label="更新投递状态">${options}</select>
        <button class="delete-btn" type="button">删除</button>
      </article>`;
    })
    .join("");
}

function addApplication(event) {
  event.preventDefault();
  const student = elements.studentName.value.trim();
  const batch = elements.studentBatch.value.trim();
  const company = elements.applicationCompany.value.trim();
  const role = elements.applicationRole.value.trim();

  if (!student || !batch || !company || !role) {
    elements.summaryTitle.textContent = "投递记录缺少关键信息";
    elements.summaryText.textContent = "请至少填写学生、届别 / 批次、公司和岗位，再添加到追踪表。";
    return;
  }

  applications.unshift({
    id: `${Date.now()}`,
    student,
    batch,
    company,
    role,
    status: elements.applicationStatus.value,
    note: elements.applicationNote.value.trim(),
    updatedAt: getToday()
  });
  saveApplications();
  renderTracker();
  elements.applicationCompany.value = "";
  elements.applicationRole.value = "";
  elements.applicationNote.value = "";
  elements.summaryTitle.textContent = `已记录：${student} 的 ${role}`;
  elements.summaryText.textContent = `当前状态为「${elements.applicationStatus.value}」，后续可在投递追踪中直接更新进度。`;
}

function updateApplication(id, status) {
  applications = applications.map((item) => item.id === id ? { ...item, status, updatedAt: getToday() } : item);
  saveApplications();
  renderTracker();
}

function deleteApplication(id) {
  applications = applications.filter((item) => item.id !== id);
  saveApplications();
  renderTracker();
}

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab, .tab-panel").forEach((node) => node.classList.remove("active"));
    tab.classList.add("active");
    document.querySelector(`#${tab.dataset.tab}`).classList.add("active");
  });
});

elements.sampleBtn.addEventListener("click", () => {
  elements.resume.value = sampleResume;
  elements.jd.value = sampleJd;
  elements.role.value = "data";
  elements.city.value = "上海";
  renderInitialState();
});

elements.matchBtn.addEventListener("click", runMatch);
elements.bullets.addEventListener("click", async (event) => {
  if (!event.target.classList.contains("copy-btn")) return;
  await navigator.clipboard.writeText(event.target.dataset.copy);
  event.target.textContent = "已复制";
  window.setTimeout(() => {
    event.target.textContent = "复制";
  }, 1200);
});
elements.applicationForm.addEventListener("submit", addApplication);
elements.applicationList.addEventListener("change", (event) => {
  if (!event.target.classList.contains("status-select")) return;
  updateApplication(event.target.closest(".application-card").dataset.id, event.target.value);
});
elements.applicationList.addEventListener("click", (event) => {
  if (!event.target.classList.contains("delete-btn")) return;
  deleteApplication(event.target.closest(".application-card").dataset.id);
});

elements.resume.value = sampleResume;
elements.jd.value = sampleJd;
renderInitialState();
renderTracker();
