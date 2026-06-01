const GEMINI_API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_MODEL = "gemini-2.5-flash";

const analysisSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    jobs: {
      type: "array",
      minItems: 1,
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: {
            type: "string",
            description: "Job title inferred from the JD."
          },
          matchScore: {
            type: "number",
            minimum: 0,
            maximum: 100,
            description: "Resume-to-JD match score from 0 to 100."
          },
          applicationLevel: {
            type: "string",
            enum: ["强烈推荐投递", "推荐投递", "谨慎投递", "暂不建议"],
            description: "Recommended application level."
          },
          summary: {
            type: "string",
            description: "Concise overall conclusion in Chinese."
          },
          matchingAdvantages: {
            type: "array",
            minItems: 3,
            maxItems: 6,
            items: { type: "string" }
          },
          skillGaps: {
            type: "array",
            minItems: 3,
            maxItems: 6,
            items: { type: "string" }
          }
        },
        required: [
          "title",
          "matchScore",
          "applicationLevel",
          "summary",
          "matchingAdvantages",
          "skillGaps"
        ]
      }
    },
    resumeSuggestions: {
      type: "array",
      minItems: 3,
      maxItems: 6,
      items: { type: "string" }
    },
    actionPlan: {
      type: "array",
      minItems: 3,
      maxItems: 5,
      items: { type: "string" }
    }
  },
  required: [
    "jobs",
    "resumeSuggestions",
    "actionPlan"
  ]
};

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Only POST requests are supported." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return response.status(500).json({ error: "Missing GEMINI_API_KEY environment variable." });
  }

  let body;
  try {
    body = typeof request.body === "string" ? JSON.parse(request.body || "{}") : (request.body || {});
  } catch {
    return response.status(400).json({ error: "Invalid JSON request body." });
  }
  const { resume, jobDescription, targetRole, degree, city } = body;
  if (!resume || !jobDescription) {
    return response.status(400).json({ error: "Resume text and job description are required." });
  }

  try {
    const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
    const geminiResponse = await fetch(`${GEMINI_API_BASE_URL}/${model}:generateContent`, {
      method: "POST",
      headers: {
        "x-goog-api-key": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: [
                  "你是一个严谨的中文学生求职匹配顾问。",
                  "请比较学生简历和目标岗位 JD，输出可执行、可验证、避免空话的匹配分析。",
                  "评分必须基于 JD 要求与简历证据，不要编造简历中不存在的经历。",
                  "所有输出使用中文。",
                  "必须返回标准 JSON 结构：jobs、resumeSuggestions、actionPlan。",
                  "resumeSuggestions 要尽量可直接复制到简历里，包含动作、工具、规模、结果或业务影响。",
                  "",
                  `目标方向：${targetRole || "未填写"}`,
                  `学历阶段：${degree || "未填写"}`,
                  `求职城市：${city || "未填写"}`,
                  "",
                  "【学生简历】",
                  resume,
                  "",
                  "【岗位 JD】",
                  jobDescription
                ].join("\n")
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          responseMimeType: "application/json",
          responseSchema: analysisSchema
        }
      })
    });

    const payload = await geminiResponse.json();
    if (!geminiResponse.ok) {
      return response.status(geminiResponse.status).json({
        error: payload.error?.message || "Gemini API request failed."
      });
    }

    const outputText = extractOutputText(payload);
    if (!outputText) {
      return response.status(502).json({ error: "Gemini response did not include output text." });
    }

    const analysis = normalizeAnalysis(JSON.parse(outputText));
    return response.status(200).json(analysis);
  } catch (error) {
    return response.status(500).json({ error: error.message || "Unexpected server error." });
  }
};

function extractOutputText(payload) {
  return payload.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("") || "";
}

function normalizeAnalysis(analysis) {
  return {
    jobs: Array.isArray(analysis.jobs) ? analysis.jobs : [],
    resumeSuggestions: Array.isArray(analysis.resumeSuggestions) ? analysis.resumeSuggestions : [],
    actionPlan: Array.isArray(analysis.actionPlan) ? analysis.actionPlan : []
  };
}
