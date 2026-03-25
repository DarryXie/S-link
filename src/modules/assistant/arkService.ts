import {
  assistantText,
  type AssistantAttachment,
  type AssistantAttachmentTag,
  type AssistantCollisionAnalysis,
  type AssistantCollisionMessage,
  type AssistantEpcItem,
  type AssistantEpcMessage,
  type AssistantFlow,
  type AssistantLocaleText,
  type AssistantPartsItem,
  type AssistantPartsMessage,
  type AssistantReplacementItem,
  type AssistantReportMessage,
  type AssistantVehicle,
} from "./assistantData";

type PartsRecognitionPayload = {
  summary?: string;
  items?: Array<{
    part_name?: string;
    quantity?: number;
    part_number?: string;
    note?: string;
  }>;
};

type EpcRecognitionPayload = {
  summary?: string;
  items?: Array<{
    part_name?: string;
    part_number?: string;
    diagram_code?: string;
    diagram_name?: string;
    location?: string;
    quantity?: number;
    price?: number;
  }>;
};

type CollisionRecognitionPayload = {
  summary?: string;
  accident_position?: string;
  visible_damage_parts?: string[];
  possible_internal_damage?: string[];
  inspection_items?: string[];
  risk_level?: "low" | "medium" | "high";
  risk_estimate_cny?: number;
  confidence?: number;
  safety_notes?: string[];
};

type ReportPayload = {
  title?: string;
  summary?: string;
  accident_overview?: string;
  damage_conclusion?: string;
  visible_damage?: string[];
  possible_damage?: string[];
  inspection_items?: string[];
  repair_advice?: string[];
  caution_notes?: string[];
};

type AttachmentRecognitionPayload = {
  vin?: string;
  attachments?: Array<{
    index?: number;
    tag?: AssistantAttachmentTag;
    summary?: string;
    extracted_text?: string;
    vin_candidate?: string;
  }>;
};

const defaultArkBaseUrl = "https://ark.cn-beijing.volces.com/api/v3";
const defaultArkModel = "doubao-seed-2-0-lite-260215";
const vinRegex = /\b[A-HJ-NPR-Z0-9]{17}\b/i;

function createId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function makeLocaleText(value?: string, fallback = ""): AssistantLocaleText {
  const normalized = (value ?? fallback).trim() || fallback;
  return assistantText(normalized, normalized);
}

function normalizeList(values: string[] | undefined, fallback: string[]) {
  const normalized = (values ?? [])
    .map((item) => item.trim())
    .filter(Boolean);

  return normalized.length > 0 ? normalized : fallback;
}

function clampConfidence(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0.72;
  }

  return Math.min(0.98, Math.max(0.2, value));
}

function normalizeRiskEstimate(
  value: number | undefined,
  level: CollisionRecognitionPayload["risk_level"],
) {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.round(value);
  }

  if (level === "high") {
    return 15000;
  }

  if (level === "low") {
    return 5000;
  }

  return 9000;
}

function normalizeSku(partNumber: string | undefined, prefix: string, index: number) {
  const cleaned = (partNumber ?? "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^A-Za-z0-9\-_.]/g, "")
    .toUpperCase();

  return cleaned || `${prefix}-${String(index + 1).padStart(3, "0")}`;
}

function mergePartsItems(current: AssistantPartsItem[], incoming: AssistantPartsItem[]) {
  const merged = new Map<string, AssistantPartsItem>();

  current.forEach((item) => {
    merged.set(`${item.sku}:${item.name["zh-CN"]}`.toLowerCase(), item);
  });

  incoming.forEach((item) => {
    const key = `${item.sku}:${item.name["zh-CN"]}`.toLowerCase();
    const existing = merged.get(key);

    if (!existing) {
      merged.set(key, item);
      return;
    }

    merged.set(key, {
      ...existing,
      quantity: existing.quantity + item.quantity,
      note:
        existing.note["zh-CN"] === item.note["zh-CN"]
          ? existing.note
          : assistantText(
              `${existing.note["zh-CN"]}；${item.note["zh-CN"]}`,
              `${existing.note["en-US"]}; ${item.note["en-US"]}`,
            ),
    });
  });

  return Array.from(merged.values()).map((item, index) => ({
    ...item,
    index: index + 1,
  }));
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildHtmlList(items: string[]) {
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function normalizeAttachmentTag(
  value: AssistantAttachmentTag | string | undefined,
  fallback: AssistantAttachmentTag,
): AssistantAttachmentTag {
  return value === "vin" || value === "parts" || value === "accident" || value === "generic"
    ? value
    : fallback;
}

function fallbackRecognizeAttachments(attachments: AssistantAttachment[]) {
  return attachments.map((attachment) => {
    const recognizedVin =
      attachment.recognizedVin?.toUpperCase().match(vinRegex)?.[0] ??
      attachment.textContent?.toUpperCase().match(vinRegex)?.[0] ??
      "";

    let tag = attachment.tag;
    const haystack = `${attachment.name}\n${attachment.textContent ?? ""}`.toLowerCase();

    if (recognizedVin || /vin|车架号|车辆识别代号/.test(haystack)) {
      tag = "vin";
    } else if (/清单|配件|零件|报价|part|parts|quote|qty|quantity|list/.test(haystack)) {
      tag = "parts";
    } else if (/事故|碰撞|剐蹭|受损|定损|crash|collision|damage|dent|impact/.test(haystack)) {
      tag = "accident";
    }

    return {
      ...attachment,
      tag,
      recognizedVin: recognizedVin || attachment.recognizedVin,
      recognizedText: attachment.textContent?.trim() || attachment.recognizedText,
    };
  });
}

function getArkApiKey() {
  return import.meta.env.VITE_ARK_API_KEY?.trim() ?? "";
}

function getArkBaseUrl() {
  return (import.meta.env.VITE_ARK_BASE_URL?.trim() || defaultArkBaseUrl).replace(/\/+$/, "");
}

function getArkModel() {
  return import.meta.env.VITE_ARK_MODEL?.trim() || defaultArkModel;
}

function buildInputContent(
  systemPrompt: string,
  userPrompt: string,
  attachments: AssistantAttachment[],
) {
  const content: Array<Record<string, string>> = [
    {
      type: "input_text",
      text: `${systemPrompt.trim()}\n\n${userPrompt.trim()}\n\n请只返回 JSON，不要输出 Markdown、代码块或额外说明。`,
    },
  ];

  attachments.forEach((attachment, index) => {
    if (attachment.textContent?.trim()) {
      content.push({
        type: "input_text",
        text: `附件 ${index + 1}（${attachment.name}）文本内容：\n${attachment.textContent
          .trim()
          .slice(0, 12000)}`,
      });
    }

    if (attachment.kind === "image" && attachment.dataUrl) {
      content.push({
        type: "input_image",
        image_url: attachment.dataUrl,
      });
    }

    if (attachment.recognizedVin?.trim()) {
      content.push({
        type: "input_text",
        text: `附件 ${index + 1}（${attachment.name}）已识别到 VIN：${attachment.recognizedVin.trim()}`,
      });
    }

    if (
      attachment.recognizedText?.trim() &&
      attachment.recognizedText.trim() !== attachment.textContent?.trim()
    ) {
      content.push({
        type: "input_text",
        text: `附件 ${index + 1}（${attachment.name}）识别摘要：\n${attachment.recognizedText
          .trim()
          .slice(0, 4000)}`,
      });
    }
  });

  return content;
}

function extractOutputText(payload: unknown): string {
  if (!payload || typeof payload !== "object") {
    return "";
  }

  const data = payload as {
    output_text?: string;
    output?: Array<{
      content?: Array<{
        text?: string;
      }>;
    }>;
  };

  if (typeof data.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }

  const textChunks =
    data.output
      ?.flatMap((item) => item.content ?? [])
      .map((item) => item.text)
      .filter((item): item is string => typeof item === "string" && item.trim().length > 0) ?? [];

  return textChunks.join("\n").trim();
}

function parseJsonPayload<T>(raw: string): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];

    if (fenced) {
      return JSON.parse(fenced) as T;
    }

    const objectMatch = raw.match(/\{[\s\S]*\}/);

    if (objectMatch) {
      return JSON.parse(objectMatch[0]) as T;
    }

    throw new Error("The model response is not valid JSON.");
  }
}

async function callArkJson<T>(
  systemPrompt: string,
  userPrompt: string,
  attachments: AssistantAttachment[],
) {
  const apiKey = getArkApiKey();

  if (!apiKey) {
    throw new Error("ARK_API_KEY_MISSING");
  }

  const response = await fetch(`${getArkBaseUrl()}/responses`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: getArkModel(),
      input: [
        {
          role: "user",
          content: buildInputContent(systemPrompt, userPrompt, attachments),
        },
      ],
      max_output_tokens: 1800,
    }),
  });

  const payload = (await response.json().catch(() => null)) as unknown;

  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "error" in payload
        ? JSON.stringify((payload as { error?: unknown }).error)
        : `Ark request failed with status ${response.status}`;
    throw new Error(message);
  }

  const rawText = extractOutputText(payload);

  if (!rawText) {
    throw new Error("The model returned an empty response.");
  }

  return parseJsonPayload<T>(rawText);
}

export function isArkConfigured() {
  return Boolean(getArkApiKey());
}

export async function recognizeAssistantAttachments(input: {
  flow: AssistantFlow;
  text: string;
  attachments: AssistantAttachment[];
}) {
  if (input.attachments.length === 0) {
    return {
      attachments: input.attachments,
      vin: "",
    };
  }

  if (!isArkConfigured()) {
    const fallback = fallbackRecognizeAttachments(input.attachments);

    return {
      attachments: fallback,
      vin: fallback.find((item) => item.recognizedVin)?.recognizedVin ?? "",
    };
  }

  const payload = await callArkJson<AttachmentRecognitionPayload>(
    [
      "你是 S-Link 的附件识别助手。",
      "请逐个识别用户上传的附件，判断每个附件属于哪一类：vin、parts、accident、generic。",
      "vin 表示 VIN 码图片或 VIN 相关证据；parts 表示配件清单、报价单、零件表；accident 表示事故图、碰撞图、受损照片；generic 表示其他无关或无法判断的附件。",
      "如果附件里能清楚读到 17 位标准 VIN，请提取到 vin_candidate。",
      "如果附件里有可直接复用的关键信息，请写入 extracted_text，尽量简短准确。",
      "只返回 JSON。",
      'JSON 结构：{"vin":"string","attachments":[{"index":1,"tag":"vin|parts|accident|generic","summary":"string","extracted_text":"string","vin_candidate":"string"}]}',
    ].join("\n"),
    [
      `当前流程：${input.flow}`,
      input.text ? `用户文本：${input.text}` : "用户文本为空，仅上传了附件。",
      `附件数量：${input.attachments.length}`,
      ...input.attachments.map((attachment, index) => {
        const details = [
          `附件 ${index + 1}`,
          `名称：${attachment.name}`,
          `类型：${attachment.kind}`,
          attachment.mimeType ? `MIME：${attachment.mimeType}` : "",
          attachment.textContent?.trim()
            ? `已有文本：${attachment.textContent.trim().slice(0, 4000)}`
            : "",
        ]
          .filter(Boolean)
          .join(" / ");

        return details;
      }),
    ].join("\n"),
    input.attachments,
  );

  const recognized = input.attachments.map((attachment, index) => {
    const recognizedItem = payload.attachments?.find((item) => item.index === index + 1);
    const recognizedVin =
      recognizedItem?.vin_candidate?.toUpperCase().match(vinRegex)?.[0] ??
      attachment.recognizedVin;
    const recognizedText =
      recognizedItem?.extracted_text?.trim() ||
      attachment.textContent?.trim() ||
      attachment.recognizedText;

    return {
      ...attachment,
      tag: normalizeAttachmentTag(recognizedItem?.tag, attachment.tag),
      recognizedVin,
      recognizedText,
    };
  });

  const vin =
    payload.vin?.toUpperCase().match(vinRegex)?.[0] ??
    recognized.find((item) => item.recognizedVin)?.recognizedVin ??
    "";

  return {
    attachments: recognized,
    vin,
  };
}

export async function generateAssistantPartsMessage(
  input: {
    vehicle: AssistantVehicle;
    text: string;
    attachments: AssistantAttachment[];
    currentItems: AssistantPartsItem[];
  },
  createdAt: number,
): Promise<AssistantPartsMessage> {
  const payload = await callArkJson<PartsRecognitionPayload>(
    [
      "你是 S-Link 的配件清单识别助手。",
      "目标：从图片、文本或文件内容中提取配件清单。",
      "规则：",
      "1. 不要虚构 OEM 编号、价格和库存。",
      "2. 能识别到数量就输出数量，识别不到时数量填 1。",
      "3. note 用一句中文说明识别依据或不确定点。",
      "4. 只输出 JSON。",
      'JSON 结构：{"summary":"string","items":[{"part_name":"string","quantity":1,"part_number":"string","note":"string"}]}',
    ].join("\n"),
    [
      `车辆信息：${input.vehicle.brand["zh-CN"]} ${input.vehicle.series["zh-CN"]} ${input.vehicle.year} ${input.vehicle.model["zh-CN"]}`,
      input.vehicle.vin ? `VIN：${input.vehicle.vin}` : "",
      input.text ? `用户补充：${input.text}` : "用户未提供额外文字，仅上传了附件。",
      input.currentItems.length > 0
        ? `当前已识别配件：${input.currentItems
            .map((item) => `${item.name["zh-CN"]} x${item.quantity}`)
            .join("；")}`
        : "当前尚无已识别配件。",
    ]
      .filter(Boolean)
      .join("\n"),
    input.attachments,
  );

  const recognizedItems = (payload.items ?? [])
    .filter((item) => item.part_name?.trim())
    .map((item, index) => ({
      id: createId("part"),
      index: index + 1,
      sku: normalizeSku(item.part_number, "AI-LIST", index),
      name: makeLocaleText(item.part_name, "识别配件"),
      quantity:
        typeof item.quantity === "number" && Number.isFinite(item.quantity) && item.quantity > 0
          ? Math.max(1, Math.round(item.quantity))
          : 1,
      note: makeLocaleText(item.note, "由大模型识别生成"),
    }));

  const merged = mergePartsItems(input.currentItems, recognizedItems);

  return {
    id: createId("parts-card"),
    role: "assistant",
    kind: "parts-result",
    createdAt,
    summary: makeLocaleText(payload.summary, `已识别 ${merged.length} 条配件项目。`),
    items: merged,
  };
}

export async function generateAssistantEpcMessage(
  input: {
    vehicle: AssistantVehicle;
    text: string;
    attachments: AssistantAttachment[];
  },
  createdAt: number,
): Promise<AssistantEpcMessage> {
  const payload = await callArkJson<EpcRecognitionPayload>(
    [
      "你是 S-Link 的 EPC 配件定位助手。",
      "请根据车型信息、用户描述和附件内容，输出最相关的 EPC 配件候选项。",
      "规则：",
      "1. 必须尽量保留方位和位置信息，例如左后门、后保险杠、右后翼子板。",
      "2. 不要把后部件错误识别成前部件，也不要把门类部件误识别成灯具或保险杠。",
      "3. diagram_code、diagram_name、location 可以是便于前台预览的结构化名称，不要求真实 EPC 编码。",
      "4. quantity 默认 1；price 没把握时填 0。",
      "5. 只输出 JSON。",
      'JSON 结构：{"summary":"string","items":[{"part_name":"string","part_number":"string","diagram_code":"string","diagram_name":"string","location":"string","quantity":1,"price":0}]}',
    ].join("\n"),
    [
      `车辆信息：${input.vehicle.brand["zh-CN"]} ${input.vehicle.series["zh-CN"]} ${input.vehicle.year} ${input.vehicle.model["zh-CN"]}`,
      input.vehicle.vin ? `VIN：${input.vehicle.vin}` : "",
      input.text ? `查询内容：${input.text}` : "用户未提供额外文字，仅上传了附件。",
    ]
      .filter(Boolean)
      .join("\n"),
    input.attachments,
  );

  const items: AssistantEpcItem[] = (payload.items ?? [])
    .filter((item) => item.part_name?.trim())
    .map((item, index) => ({
      id: createId("epc"),
      sku: normalizeSku(item.part_number, "AI-EPC", index),
      name: makeLocaleText(item.part_name, "EPC 配件"),
      diagramCode: item.diagram_code?.trim() || `AI-DIAG-${String(index + 1).padStart(2, "0")}`,
      diagramName: makeLocaleText(item.diagram_name, "智能定位图例"),
      location: makeLocaleText(item.location, "待补充安装位置"),
      price:
        typeof item.price === "number" && Number.isFinite(item.price) && item.price > 0
          ? Math.round(item.price)
          : 0,
      defaultQuantity:
        typeof item.quantity === "number" && Number.isFinite(item.quantity) && item.quantity > 0
          ? Math.max(1, Math.round(item.quantity))
          : 1,
    }));

  if (items.length === 0) {
    throw new Error("EPC_EMPTY_RESULT");
  }

  return {
    id: createId("epc-card"),
    role: "assistant",
    kind: "epc-result",
    createdAt,
    query: makeLocaleText(input.text || "配件定位", input.text || "Part lookup"),
    items,
  };
}

export async function generateAssistantCollisionMessage(
  input: {
    vehicle: AssistantVehicle;
    text: string;
    attachments: AssistantAttachment[];
    previousAnalysis?: AssistantCollisionAnalysis;
  },
  createdAt: number,
): Promise<AssistantCollisionMessage> {
  const payload = await callArkJson<CollisionRecognitionPayload>(
    [
      "你是 S-Link 的事故碰撞分析助手。",
      "请结合事故图片和文字描述，输出结构化碰撞分析结果。",
      "规则：",
      "1. 只把明确能看见的内容放在 visible_damage_parts。",
      "2. 隐藏损伤和推测项放到 possible_internal_damage 或 inspection_items。",
      "3. confidence 范围是 0 到 1。",
      "4. risk_estimate_cny 是初步风险预估金额，不是正式报价。",
      "5. 只输出 JSON。",
      'JSON 结构：{"summary":"string","accident_position":"string","visible_damage_parts":["string"],"possible_internal_damage":["string"],"inspection_items":["string"],"risk_level":"low|medium|high","risk_estimate_cny":9000,"confidence":0.82,"safety_notes":["string"]}',
    ].join("\n"),
    [
      `车辆信息：${input.vehicle.brand["zh-CN"]} ${input.vehicle.series["zh-CN"]} ${input.vehicle.year} ${input.vehicle.model["zh-CN"]}`,
      input.vehicle.vin ? `VIN：${input.vehicle.vin}` : "",
      input.text ? `事故补充描述：${input.text}` : "用户未提供额外文字，仅上传了事故附件。",
      input.previousAnalysis
        ? `上一轮分析摘要：${input.previousAnalysis.summary["zh-CN"]}`
        : "当前是第一次分析。",
    ]
      .filter(Boolean)
      .join("\n"),
    input.attachments,
  );

  const riskLevel = payload.risk_level ?? "medium";
  const analysis: AssistantCollisionAnalysis = {
    summary: makeLocaleText(payload.summary, "已结合图像与文本生成初步碰撞分析。"),
    impactZone: makeLocaleText(payload.accident_position, "待确认碰撞位置"),
    visibleDamageParts: normalizeList(payload.visible_damage_parts, ["外覆盖件损伤待确认"]).map(
      (item) => makeLocaleText(item, item),
    ),
    possibleDamageParts: normalizeList(payload.possible_internal_damage, ["内部结构风险待拆检"]).map(
      (item) => makeLocaleText(item, item),
    ),
    inspectionItems: normalizeList(payload.inspection_items, ["建议补充举升或拆检"]).map((item) =>
      makeLocaleText(item, item),
    ),
    riskEstimate: normalizeRiskEstimate(payload.risk_estimate_cny, riskLevel),
    confidence: clampConfidence(payload.confidence),
    safetyNotes: normalizeList(payload.safety_notes, ["当前结论为初步分析，正式定损前仍需现场复核。"]).map(
      (item) => makeLocaleText(item, item),
    ),
  };

  return {
    id: createId("collision-card"),
    role: "assistant",
    kind: "collision-result",
    createdAt,
    analysis,
  };
}

export async function generateAssistantReportMessage(
  input: {
    vehicle: AssistantVehicle;
    analysis: AssistantCollisionAnalysis;
    replacementItems: AssistantReplacementItem[];
  },
  createdAt: number,
): Promise<AssistantReportMessage> {
  const payload = await callArkJson<ReportPayload>(
    [
      "你是 S-Link 的定损报告起草助手。",
      "请基于已有碰撞分析结果，输出一份适合前台预览的初步定损报告内容。",
      "规则：",
      "1. 语气专业、克制，不要夸张。",
      "2. 不要写最终定损结论，要明确这是初步报告。",
      "3. 只输出 JSON。",
      'JSON 结构：{"title":"string","summary":"string","accident_overview":"string","damage_conclusion":"string","visible_damage":["string"],"possible_damage":["string"],"inspection_items":["string"],"repair_advice":["string"],"caution_notes":["string"]}',
    ].join("\n"),
    [
      `车辆信息：${input.vehicle.brand["zh-CN"]} ${input.vehicle.series["zh-CN"]} ${input.vehicle.year} ${input.vehicle.model["zh-CN"]}`,
      input.vehicle.vin ? `VIN：${input.vehicle.vin}` : "",
      `碰撞位置：${input.analysis.impactZone["zh-CN"]}`,
      `事故摘要：${input.analysis.summary["zh-CN"]}`,
      `可见损伤：${input.analysis.visibleDamageParts.map((item) => item["zh-CN"]).join("；")}`,
      `可能损伤：${input.analysis.possibleDamageParts.map((item) => item["zh-CN"]).join("；")}`,
      `建议检查：${input.analysis.inspectionItems.map((item) => item["zh-CN"]).join("；")}`,
      input.replacementItems.length > 0
        ? `换件建议：${input.replacementItems
            .map((item) => `${item.name["zh-CN"]}（${item.advice["zh-CN"]}）`)
            .join("；")}`
        : "当前尚未生成换件清单。",
    ].join("\n"),
    [],
  );

  const titleText = payload.title?.trim() || `${input.vehicle.series["zh-CN"]} 初步定损报告`;
  const summaryText =
    payload.summary?.trim() ||
    `${input.vehicle.vin ?? input.vehicle.series["zh-CN"]} / ${input.analysis.impactZone["zh-CN"]}`;

  const html = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(titleText)}</title>
    <style>
      :root {
        color-scheme: light;
      }
      * {
        box-sizing: border-box;
      }
      body {
        margin: 0;
        padding: 36px;
        font-family: "Microsoft YaHei", "PingFang SC", sans-serif;
        color: #183042;
        background: linear-gradient(180deg, #f7fbff 0%, #eef4f8 100%);
      }
      h1, h2, p, ul {
        margin: 0;
      }
      main {
        max-width: 960px;
        margin: 0 auto;
        display: grid;
        gap: 20px;
      }
      .hero, .card {
        border: 1px solid #d5e0ea;
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.92);
        box-shadow: 0 18px 48px rgba(24, 48, 66, 0.08);
      }
      .hero {
        padding: 28px;
      }
      .hero p {
        margin-top: 10px;
        line-height: 1.7;
        color: #476173;
      }
      .meta {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 14px;
      }
      .meta .card, section.card {
        padding: 18px 20px;
      }
      .label {
        color: #5c7385;
        font-size: 12px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      .value {
        margin-top: 6px;
        font-size: 18px;
        font-weight: 700;
      }
      section.card {
        display: grid;
        gap: 10px;
      }
      ul {
        padding-left: 20px;
        line-height: 1.7;
        color: #284355;
      }
      .note {
        color: #5c7385;
        line-height: 1.7;
      }
      @media (max-width: 720px) {
        body {
          padding: 18px;
        }
        .meta {
          grid-template-columns: 1fr;
        }
      }
    </style>
  </head>
  <body>
    <main>
      <section class="hero">
        <h1>${escapeHtml(titleText)}</h1>
        <p>${escapeHtml(summaryText)}</p>
        <p>${escapeHtml(payload.accident_overview?.trim() || input.analysis.summary["zh-CN"])}</p>
      </section>
      <section class="meta">
        <div class="card">
          <div class="label">VIN</div>
          <div class="value">${escapeHtml(input.vehicle.vin ?? "-")}</div>
        </div>
        <div class="card">
          <div class="label">车型</div>
          <div class="value">${escapeHtml(
            `${input.vehicle.brand["zh-CN"]} / ${input.vehicle.series["zh-CN"]} / ${input.vehicle.year} / ${input.vehicle.model["zh-CN"]}`,
          )}</div>
        </div>
        <div class="card">
          <div class="label">碰撞位置</div>
          <div class="value">${escapeHtml(input.analysis.impactZone["zh-CN"])}</div>
        </div>
        <div class="card">
          <div class="label">分析置信度</div>
          <div class="value">${Math.round(input.analysis.confidence * 100)}%</div>
        </div>
      </section>
      <section class="card">
        <h2>初步结论</h2>
        <p class="note">${escapeHtml(
          payload.damage_conclusion?.trim() || "当前结论基于图片与文本输入生成，正式定损前仍需现场复核。",
        )}</p>
      </section>
      <section class="card">
        <h2>可见损伤</h2>
        <ul>${buildHtmlList(
          normalizeList(
            payload.visible_damage,
            input.analysis.visibleDamageParts.map((item) => item["zh-CN"]),
          ),
        )}</ul>
      </section>
      <section class="card">
        <h2>可能损伤</h2>
        <ul>${buildHtmlList(
          normalizeList(
            payload.possible_damage,
            input.analysis.possibleDamageParts.map((item) => item["zh-CN"]),
          ),
        )}</ul>
      </section>
      <section class="card">
        <h2>建议检查</h2>
        <ul>${buildHtmlList(
          normalizeList(
            payload.inspection_items,
            input.analysis.inspectionItems.map((item) => item["zh-CN"]),
          ),
        )}</ul>
      </section>
      <section class="card">
        <h2>维修建议</h2>
        <ul>${buildHtmlList(
          normalizeList(
            payload.repair_advice,
            input.replacementItems.length > 0
              ? input.replacementItems.map(
                  (item) => `${item.name["zh-CN"]}（${item.advice["zh-CN"]}）`,
                )
              : ["建议结合拆检结果确认最终换件范围。"],
          ),
        )}</ul>
      </section>
      <section class="card">
        <h2>风险提示</h2>
        <ul>${buildHtmlList(
          normalizeList(
            payload.caution_notes,
            input.analysis.safetyNotes.map((item) => item["zh-CN"]),
          ),
        )}</ul>
      </section>
    </main>
  </body>
</html>`;

  return {
    id: createId("report-card"),
    role: "assistant",
    kind: "report",
    createdAt,
    report: {
      title: makeLocaleText(titleText, titleText),
      summary: makeLocaleText(summaryText, summaryText),
      html,
    },
  };
}
