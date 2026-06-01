const sampleResume = `教育背景：伦敦大学学院 商业分析硕士，GPA 3.7/4.0。本科信息管理。
技能：Python、SQL、Tableau、Excel、A/B Testing、用户研究、竞品分析、机器学习基础。
项目经历：
1. 电商用户留存分析：用 Python 清洗 30 万行订单数据，建立 RFM 分层和流失预警模型，将高风险用户召回转化率提升 12%。
2. 校园二手交易产品调研：访谈 18 名学生，输出用户旅程、PRD 和原型，推动小程序收藏与议价功能上线。
3. 咨询课程项目：为新能源品牌做市场进入研究，完成行业规模测算、竞品矩阵和 go-to-market 建议。
实习经历：互联网公司数据运营实习，负责 SQL 取数、周报看板、活动复盘，沉淀 5 个可复用指标模板。
兴趣方向：希望从事数据分析、商业分析或产品策略岗位，偏好上海、杭州或远程。`;

const jobs = [
  {
    title: "商业分析实习生",
    company: "星链零售科技",
    city: "上海",
    type: "data",
    skills: ["SQL", "Python", "Tableau", "Excel", "A/B Testing", "指标体系", "电商"],
    traits: ["数据洞察", "业务复盘", "跨团队沟通"],
    desc: "支持用户增长、商品运营和会员策略分析，负责取数、看板、实验复盘与策略建议。"
  },
  {
    title: "产品经理校招",
    company: "青橙校园服务",
    city: "杭州",
    type: "product",
    skills: ["PRD", "用户研究", "原型", "竞品分析", "数据分析", "小程序"],
    traits: ["需求拆解", "用户同理心", "项目推进"],
    desc: "负责学生生活服务产品的需求调研、功能设计、埋点分析和版本迭代。"
  },
  {
    title: "数据产品运营",
    company: "云帆智能营销",
    city: "深圳",
    type: "data",
    skills: ["SQL", "Tableau", "用户分层", "活动复盘", "CRM", "增长"],
    traits: ["结果导向", "结构化表达", "运营策略"],
    desc: "围绕 CRM 数据资产建设用户标签，输出增长活动策略与可视化经营分析。"
  },
  {
    title: "前端开发实习生",
    company: "北极星 AI Lab",
    city: "北京",
    type: "frontend",
    skills: ["JavaScript", "React", "TypeScript", "CSS", "API", "Git"],
    traits: ["工程实现", "交互细节", "代码质量"],
    desc: "参与 AI 工作台 Web 端开发，维护组件库、数据可视化页面和接口联调。"
  },
  {
    title: "战略咨询项目助理",
    company: "启明咨询",
    city: "上海",
    type: "consulting",
    skills: ["市场研究", "竞品分析", "访谈", "Excel", "行业报告", "PPT"],
    traits: ["逻辑拆解", "商业敏感度", "高质量交付"],
    desc: "支持新能源、消费与科技项目，完成桌面研究、访谈纪要、测算模型和汇报材料。"
  }
];

const roleKeywords = {
  data: ["SQL", "Python", "Tableau", "Excel", "A/B Testing", "机器学习", "指标", "电商", "用户分层"],
  product: ["PRD", "用户研究", "原型", "竞品分析", "小程序", "需求", "用户旅程", "埋点"],
  frontend: ["JavaScript", "React", "TypeScript", "CSS", "API", "Git", "组件", "前端"],
  consulting: ["市场研究", "竞品分析", "访谈", "Excel", "行业", "PPT", "测算", "go-to-market"]
};

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

const elements = {
  resume: document.querySelector("#resumeInput"),
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

function tokenize(text) {
  return text.toLowerCase();
}

function includesTerm(text, term) {
  return tokenize(text).includes(term.toLowerCase());
}

function scoreJob(job, resume, role, city) {
  const matchedSkills = job.skills.filter((skill) => includesTerm(resume, skill));
  const roleHits = roleKeywords[role].filter((skill) => includesTerm(resume, skill));
  const skillScore = matchedSkills.length / job.skills.length;
  const roleScore = job.type === role ? 1 : Math.min(roleHits.length / Math.max(roleKeywords[role].length, 1), 0.75);
  const cityScore = job.city === city || includesTerm(resume, job.city) || includesTerm(resume, "远程") ? 1 : 0.45;
  const projectScore = ["项目", "实习", "提升", "分析", "模型", "调研"].filter((term) => includesTerm(resume, term)).length / 6;
  const finalScore = Math.round((skillScore * 0.42 + roleScore * 0.25 + cityScore * 0.15 + projectScore * 0.18) * 100);
  return { ...job, score: finalScore, matchedSkills, roleHits };
}

function renderJobs(scoredJobs) {
  elements.jobCards.innerHTML = scoredJobs
    .map((job) => {
      const tags = job.skills
        .map((skill) => `<span class="tag ${job.matchedSkills.includes(skill) ? "hit" : ""}">${skill}</span>`)
        .join("");
      return `<article class="job-card">
        <div class="job-head">
          <div>
            <div class="job-title">${job.title}</div>
            <p class="job-meta">${job.company} · ${job.city}</p>
          </div>
          <span class="score-pill">${job.score}%</span>
        </div>
        <div class="bar" aria-hidden="true"><span style="--width:${job.score}%"></span></div>
        <p>${job.desc}</p>
        <div class="tags">${tags}</div>
        <p class="muted">匹配理由：已命中 ${job.matchedSkills.length} 项核心技能，岗位偏好${job.type === elements.role.value ? "高度一致" : "存在相邻迁移空间"}。</p>
      </article>`;
    })
    .join("");
}

function renderInsights(scoredJobs, resume, role) {
  const allHits = [...new Set(scoredJobs.flatMap((job) => job.matchedSkills))];
  const missing = roleKeywords[role].filter((keyword) => !includesTerm(resume, keyword)).slice(0, 5);
  const strengths = [
    allHits.length ? `技能关键词覆盖较好：${allHits.slice(0, 7).join("、")}。` : "当前简历技能信号偏弱，需要补充工具与方法关键词。",
    includesTerm(resume, "提升") || includesTerm(resume, "%") ? "经历中包含结果指标，具备通过量化成果证明价值的基础。" : "项目经历完整，但结果指标仍可进一步量化。",
    includesTerm(resume, "实习") ? "已有实习经历，可作为简历首屏的可信背书。" : "项目经历可用，但建议补充实习、科研或社团中的真实协作场景。"
  ];
  const gaps = [
    missing.length ? `目标方向还缺少：${missing.join("、")}。` : "目标方向核心关键词覆盖较完整，可转向表达质量优化。",
    "岗位语言需要更贴近招聘 JD，避免只写课程名或泛泛职责。",
    "每段经历建议形成“任务 - 方法 - 结果 - 业务影响”的闭环。"
  ];

  elements.strengths.innerHTML = strengths.map((item) => `<li>${item}</li>`).join("");
  elements.gaps.innerHTML = gaps.map((item) => `<li>${item}</li>`).join("");
  elements.rewrites.innerHTML = [
    "把“负责周报看板”改为“使用 SQL 搭建 5 个运营指标模板，支持活动复盘周期从 2 天缩短至 0.5 天”。",
    "把“参与用户调研”改为“访谈 18 名目标用户，抽象 4 类核心痛点，并转化为收藏、议价、消息提醒 3 个版本需求”。",
    "简历顶部增加 2 行求职摘要：目标岗位、可迁移技能、最强项目结果，让筛选者 10 秒内看见匹配度。"
  ].map((item) => `<div class="rewrite-item">${item}</div>`).join("");
}

function renderPlan(topJob, resume) {
  const plan = [
    ["今天", `针对「${topJob.title}」重排简历，把命中技能提前到首屏，并保留 3 个最相关项目。`],
    ["48 小时", "按岗位 JD 补充缺失关键词，给每段经历增加一个可验证指标或业务结果。"],
    ["本周", "准备 2 个 STAR 面试故事：一个数据/产品项目，一个跨团队协作或压力交付场景。"],
    ["投递后", "建立投递追踪表，记录岗位来源、匹配分、跟进日期和面试反馈，持续校准策略。"]
  ];

  if (!includesTerm(resume, "portfolio") && !includesTerm(resume, "作品集")) {
    plan.splice(2, 0, ["加分项", "整理 1 页作品集或项目复盘链接，展示分析过程、原型截图、指标口径和业务结论。"]);
  }

  elements.actionPlan.innerHTML = plan
    .map(([time, task]) => `<li><strong>${time}</strong><span>${task}</span></li>`)
    .join("");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
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

function runMatch() {
  const resume = elements.resume.value.trim();
  if (!resume) {
    elements.summaryTitle.textContent = "请先输入简历文本";
    elements.summaryText.textContent = "可以点击左侧示例快速体验，也可以粘贴自己的简历内容。";
    return;
  }

  const scoredJobs = jobs
    .map((job) => scoreJob(job, resume, elements.role.value, elements.city.value))
    .sort((a, b) => b.score - a.score);
  const topJob = scoredJobs[0];
  const dialDegrees = Math.round(topJob.score * 3.6);

  elements.topScore.textContent = `${topJob.score}%`;
  elements.dial.style.setProperty("--score", `${dialDegrees}deg`);
  elements.summaryTitle.textContent = `最推荐：${topJob.title}`;
  elements.summaryText.textContent = `${topJob.company} 与当前画像匹配最高。建议优先投递，并围绕岗位关键词优化简历首屏和项目表达。`;

  renderJobs(scoredJobs);
  renderInsights(scoredJobs, resume, elements.role.value);
  renderPlan(topJob, resume);
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
  elements.role.value = "data";
  elements.city.value = "上海";
  runMatch();
});

elements.matchBtn.addEventListener("click", runMatch);
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
runMatch();
renderTracker();
