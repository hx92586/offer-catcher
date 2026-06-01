const OPENAI_API_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = "gpt-4o-mini";

const analysisSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
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
    },
    resumeSuggestions: {
      type: "array",
      minItems: 3,
      maxItems: 6,
      items: { type: "string" }
    },
    bulletPoints: {
      type: "array",
      minItems: 3,
      maxItems: 6,
      items: { type: "string" },
      description: "Copy-ready Chinese resume bullet points customized to the JD."
    },
    actionPlan: {
      type: "array",
      minItems: 3,
      maxItems: 5,
      items: { type: "string" }
    }
  },
  required: [
    "matchScore",
    "applicationLevel",
    "summary",
    "matchingAdvantages",
    "skillGaps",
    "resumeSuggestions",
    "bulletPoints",
    "actionPlan"
  ]
};

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Only POST requests are supported." });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return response.status(500).json({ error: "Missing OPENAI_API_KEY environment variable." });
  }

  const body = typeof request.body === "string" ? JSON.parse(request.body || "{}") : (request.body || {});
  const { resume, jobDescription, targetRole, degree, city } = body;
  if (!resume || !jobDescription) {
    return response.status(400).json({ error: "Resume text and job description are required." });
  }

  try {
    const openAIResponse = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || DEFAULT_MODEL,
        input: [
          {
            role: "system",
            content: [
              {
                type: "input_text",
                text: [
                  "你是一个严谨的中文学生求职匹配顾问。",
                  "你的任务是比较学生简历和目标岗位 JD，输出可执行、可验证、避免空话的匹配分析。",
                  "评分必须基于 JD 要求与简历证据，不要编造简历中不存在的经历。",
                  "所有输出使用中文。简历 bullet points 要可直接复制到简历里，尽量包含动作、工具、规模、结果或业务影响。"
                ].join("\n")
              }
            ]
          },
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: [
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
        text: {
          format: {
            type: "json_schema",
            name: "offer_match_analysis",
            strict: true,
            schema: analysisSchema
          }
        }
      })
    });

    const payload = await openAIResponse.json();
    if (!openAIResponse.ok) {
      return response.status(openAIResponse.status).json({
        error: payload.error?.message || "OpenAI API request failed."
      });
    }

    const outputText = payload.output_text || extractOutputText(payload);
    if (!outputText) {
      return response.status(502).json({ error: "OpenAI response did not include output text." });
    }

    const analysis = JSON.parse(outputText);
    return response.status(200).json({ analysis });
  } catch (error) {
    return response.status(500).json({ error: error.message || "Unexpected server error." });
  }
};

function extractOutputText(payload) {
  const content = payload.output?.flatMap((item) => item.content || []) || [];
  const textItem = content.find((item) => item.type === "output_text" && item.text);
  return textItem?.text || "";
}
