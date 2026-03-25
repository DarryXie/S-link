import type { Locale } from "../../content";
import {
  buildCartBindingKey,
  normalizeCartVin,
  type CartLine,
  type CartVehicleContext,
} from "../cart/cartTypes";

export type AssistantLocaleText = Record<Locale, string>;
export type AssistantGoalId = "epc" | "parts-order" | "collision" | "order-query" | "other";
export type AssistantFlow = AssistantGoalId | "welcome";
export type AssistantStage =
  | "awaiting-goal"
  | "awaiting-vehicle"
  | "awaiting-vehicle-confirm"
  | "awaiting-part-query"
  | "awaiting-parts-append"
  | "awaiting-collision-action"
  | "manual-route";
export type AssistantAttachmentKind = "image" | "document";
export type AssistantAttachmentTag = "vin" | "parts" | "accident" | "generic";
export type AssistantLineSelection = Record<string, { selected: boolean; quantity: number }>;

export type AssistantAttachment = {
  id: string;
  name: string;
  kind: AssistantAttachmentKind;
  tag: AssistantAttachmentTag;
  source: "picker" | "paste";
  mimeType?: string;
  dataUrl?: string;
  textContent?: string;
  recognizedText?: string;
  recognizedVin?: string;
};

export type AssistantVehicle = CartVehicleContext & {
  engine: AssistantLocaleText;
  drivetrain: AssistantLocaleText;
  market: AssistantLocaleText;
};

export type AssistantGoal = {
  id: AssistantGoalId;
  label: AssistantLocaleText;
  description: AssistantLocaleText;
  prompt: AssistantLocaleText;
};

export type AssistantEpcItem = {
  id: string;
  sku: string;
  name: AssistantLocaleText;
  diagramCode: string;
  diagramName: AssistantLocaleText;
  location: AssistantLocaleText;
  price: number;
  defaultQuantity: number;
};

export type AssistantPartsItem = {
  id: string;
  index: number;
  sku: string;
  name: AssistantLocaleText;
  quantity: number;
  note: AssistantLocaleText;
};

export type AssistantReplacementItem = {
  id: string;
  index: number;
  sku: string;
  name: AssistantLocaleText;
  quantity: number;
  advice: AssistantLocaleText;
};

export type AssistantCollisionAnalysis = {
  summary: AssistantLocaleText;
  impactZone: AssistantLocaleText;
  visibleDamageParts: AssistantLocaleText[];
  possibleDamageParts: AssistantLocaleText[];
  inspectionItems: AssistantLocaleText[];
  riskEstimate: number;
  confidence: number;
  safetyNotes: AssistantLocaleText[];
};

export type AssistantReport = {
  title: AssistantLocaleText;
  summary: AssistantLocaleText;
  url?: string;
  html?: string;
};

export type AssistantTextMessage = {
  id: string;
  role: "assistant" | "user";
  kind: "text";
  createdAt: number;
  body: AssistantLocaleText;
  attachments?: AssistantAttachment[];
};

export type AssistantGoalMessage = {
  id: string;
  role: "assistant";
  kind: "goal-picker";
  createdAt: number;
};

export type AssistantVehicleMessage = {
  id: string;
  role: "assistant";
  kind: "vehicle-confirm";
  createdAt: number;
  vehicle: AssistantVehicle;
  hint: AssistantLocaleText;
};

export type AssistantEpcMessage = {
  id: string;
  role: "assistant";
  kind: "epc-result";
  createdAt: number;
  query: AssistantLocaleText;
  items: AssistantEpcItem[];
};

export type AssistantPartsMessage = {
  id: string;
  role: "assistant";
  kind: "parts-result";
  createdAt: number;
  summary: AssistantLocaleText;
  items: AssistantPartsItem[];
};

export type AssistantCollisionMessage = {
  id: string;
  role: "assistant";
  kind: "collision-result";
  createdAt: number;
  analysis: AssistantCollisionAnalysis;
};

export type AssistantReplacementMessage = {
  id: string;
  role: "assistant";
  kind: "replacement-list";
  createdAt: number;
  items: AssistantReplacementItem[];
};

export type AssistantReportMessage = {
  id: string;
  role: "assistant";
  kind: "report";
  createdAt: number;
  report: AssistantReport;
};

export type AssistantManualRouteMessage = {
  id: string;
  role: "assistant";
  kind: "manual-route";
  createdAt: number;
  tips: AssistantLocaleText[];
};

export type AssistantMessage =
  | AssistantTextMessage
  | AssistantGoalMessage
  | AssistantVehicleMessage
  | AssistantEpcMessage
  | AssistantPartsMessage
  | AssistantCollisionMessage
  | AssistantReplacementMessage
  | AssistantReportMessage
  | AssistantManualRouteMessage;

export type AssistantSession = {
  id: string;
  flow: AssistantFlow;
  stage: AssistantStage;
  title: AssistantLocaleText;
  contextKey: AssistantLocaleText;
  status: AssistantLocaleText;
  createdAt: number;
  updatedAt: number;
  vehicle?: AssistantVehicle;
  messages: AssistantMessage[];
  latestEpcItems: AssistantEpcItem[];
  latestPartsItems: AssistantPartsItem[];
  latestReplacementItems: AssistantReplacementItem[];
  latestCollision?: AssistantCollisionAnalysis;
  latestReport?: AssistantReport;
  pendingText: string;
  pendingAttachments: AssistantAttachment[];
  partsSelection: AssistantLineSelection;
  replacementSelection: AssistantLineSelection;
};

export const assistantStorageKey = "s-link.assistant.sessions";

export function assistantText(zh: string, en: string): AssistantLocaleText {
  return {
    "zh-CN": zh,
    "en-US": en,
  };
}

export function getAssistantText(locale: Locale, value: AssistantLocaleText) {
  return value[locale];
}

export function formatRelativeTime(locale: Locale, value: number) {
  return new Intl.DateTimeFormat(locale, {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export const assistantGoals: AssistantGoal[] = [
  {
    id: "epc",
    label: assistantText("EPC 查询", "EPC Lookup"),
    description: assistantText("识别 VIN 或车型后，帮你定位图例与配件。", "Resolve VIN or vehicle and locate diagrams and parts."),
    prompt: assistantText(
      "请先输入 VIN，或者直接粘贴 VIN 图片。我确认车型后，再帮你查配件或图例。",
      "Start with a VIN or a VIN image. After vehicle confirmation, I will locate the part or diagram.",
    ),
  },
  {
    id: "parts-order",
    label: assistantText("配件订购", "Parts Ordering"),
    description: assistantText("识别配件清单，整理成可勾选的购物车候选项。", "Extract a parts list into cart-ready selectable rows."),
    prompt: assistantText(
      "请提供 VIN，以及配件清单图片、文件或文字内容。我会先确认车型，再整理清单。",
      "Please provide a VIN plus a parts list image, file, or text. I will confirm the vehicle first, then structure the list.",
    ),
  },
  {
    id: "collision",
    label: assistantText("事故分析", "Collision Analysis"),
    description: assistantText("结合 VIN 与事故图，生成碰撞分析、换件建议与初步报告。", "Use VIN and crash photos to generate damage analysis, replacement advice, and a draft report."),
    prompt: assistantText(
      "请提供 VIN，以及事故图片或碰撞描述。我确认车型后开始分析碰撞情况。",
      "Please provide a VIN plus accident photos or a damage description. After vehicle confirmation I will analyze the collision.",
    ),
  },
  {
    id: "order-query",
    label: assistantText("订单查询", "Order Query"),
    description: assistantText("根据订单备注、时间或车型线索帮你筛选目标订单。", "Filter target orders from time, notes, or vehicle clues."),
    prompt: assistantText(
      "订单查询能力当前暂缓开发。你可以告诉我订单时间、备注或 VIN，我先帮你整理搜索线索。",
      "Order lookup is deferred for now. You can still tell me the order time, note, or VIN and I will help summarize search cues.",
    ),
  },
  {
    id: "other",
    label: assistantText("其他需求", "Other Requests"),
    description: assistantText("识别不在主流程中的问题，并给出下一步建议。", "Handle requests outside the main flows and suggest the next step."),
    prompt: assistantText(
      "请直接描述你的需求。我会优先判断能否落到 EPC、配件订购或事故分析流程中。",
      "Describe the request directly. I will first see whether it maps to EPC, ordering, or collision analysis.",
    ),
  },
];

const mockVehicles: AssistantVehicle[] = [
  {
    vehicleId: "wuling-mini-ev-2025",
    source: "vin",
    vin: "LZWADAGA7SA000137",
    brand: assistantText("五菱", "Wuling"),
    series: assistantText("宏光 MINI EV", "Hongguang MINI EV"),
    year: "2025",
    model: assistantText("215km 轻享款", "215km Lite"),
    engine: assistantText("纯电 30kW", "BEV 30kW"),
    drivetrain: assistantText("后驱", "RWD"),
    market: assistantText("中国大陆", "China Mainland"),
  },
  {
    vehicleId: "toyota-camry-2024",
    source: "vin",
    vin: "LVGBE40K0RG123518",
    brand: assistantText("丰田", "Toyota"),
    series: assistantText("凯美瑞", "Camry"),
    year: "2024",
    model: assistantText("2.0G 豪华版", "2.0G Luxury"),
    engine: assistantText("2.0L 汽油", "2.0L Gasoline"),
    drivetrain: assistantText("前驱", "FWD"),
    market: assistantText("中国大陆", "China Mainland"),
  },
  {
    vehicleId: "vw-tiguan-l-2024",
    source: "vin",
    vin: "LSVUZ65N6R2126408",
    brand: assistantText("大众", "Volkswagen"),
    series: assistantText("途观 L", "Tiguan L"),
    year: "2024",
    model: assistantText("330TSI R-Line", "330TSI R-Line"),
    engine: assistantText("2.0T 汽油", "2.0T Gasoline"),
    drivetrain: assistantText("前驱", "FWD"),
    market: assistantText("中国大陆", "China Mainland"),
  },
];

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function createTextMessage(
  role: "assistant" | "user",
  body: AssistantLocaleText,
  createdAt: number,
  attachments?: AssistantAttachment[],
): AssistantTextMessage {
  return {
    id: createId(role),
    role,
    kind: "text",
    createdAt,
    body,
    attachments,
  };
}

function createGoalPickerMessage(createdAt: number): AssistantGoalMessage {
  return {
    id: createId("goal"),
    role: "assistant",
    kind: "goal-picker",
    createdAt,
  };
}

export function createWelcomeSession(): AssistantSession {
  const now = Date.now();

  return {
    id: createId("session"),
    flow: "welcome",
    stage: "awaiting-goal",
    title: assistantText("新会话", "New Conversation"),
    contextKey: assistantText("请选择你的业务需求", "Choose a business goal"),
    status: assistantText("等待选择业务", "Waiting for a business goal"),
    createdAt: now,
    updatedAt: now,
    messages: [
      createTextMessage(
        "assistant",
        assistantText(
          "您好，欢迎使用 S-Link 智能助手。请在下方卡片中选择你的业务需求，或直接输入你的问题。",
          "Welcome to the S-Link assistant. Choose a business goal below, or type your request directly.",
        ),
        now,
      ),
      createGoalPickerMessage(now + 1),
    ],
    latestEpcItems: [],
    latestPartsItems: [],
    latestReplacementItems: [],
    pendingText: "",
    pendingAttachments: [],
    partsSelection: {},
    replacementSelection: {},
  };
}

function cloneVehicle(vehicle: AssistantVehicle, vin?: string): AssistantVehicle {
  const normalizedVin = normalizeCartVin(vin) || vehicle.vin;

  return {
    ...vehicle,
    source: normalizedVin ? "vin" : "vehicle",
    vin: normalizedVin || undefined,
  };
}

function pickVehicleByVin(vin?: string) {
  if (!vin) {
    return cloneVehicle(mockVehicles[0]);
  }

  const seed = vin
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return cloneVehicle(mockVehicles[seed % mockVehicles.length], vin);
}

export function detectGoalFromText(text: string): AssistantGoalId | null {
  const normalized = text.toLowerCase();

  if (/(事故|碰撞|定损|受损|damage|collision|crash)/.test(normalized)) {
    return "collision";
  }

  if (/(清单|订购|采购|购物车|quote|order|parts list)/.test(normalized)) {
    return "parts-order";
  }

  if (/(订单|物流|发货|运单|shipment)/.test(normalized)) {
    return "order-query";
  }

  if (/(epc|图例|配件|总成|vin|车型|catalog|diagram)/.test(normalized)) {
    return "epc";
  }

  if (normalized.trim()) {
    return "other";
  }

  return null;
}

export function extractVin(text: string, attachments: AssistantAttachment[]) {
  const match = text.toUpperCase().match(/\b[A-HJ-NPR-Z0-9]{17}\b/);

  if (match?.[0]) {
    return match[0];
  }

  for (const attachment of attachments) {
    const recognizedVin = attachment.recognizedVin?.toUpperCase().match(/\b[A-HJ-NPR-Z0-9]{17}\b/)?.[0];

    if (recognizedVin) {
      return recognizedVin;
    }

    const recognizedTextVin = attachment.recognizedText
      ?.toUpperCase()
      .match(/\b[A-HJ-NPR-Z0-9]{17}\b/)?.[0];

    if (recognizedTextVin) {
      return recognizedTextVin;
    }
  }

  return "";
}

export function findVehicleCandidate(text: string, attachments: AssistantAttachment[]) {
  const vin = extractVin(text, attachments);

  if (vin) {
    return pickVehicleByVin(vin);
  }

  const normalized = [
    text,
    ...attachments
      .map((item) => item.recognizedText?.trim())
      .filter((item): item is string => Boolean(item)),
  ]
    .join(" ")
    .toLowerCase();
  const manual =
    mockVehicles.find((vehicle) =>
      [vehicle.brand["zh-CN"], vehicle.brand["en-US"], vehicle.series["zh-CN"], vehicle.series["en-US"]]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    ) ?? null;

  return manual ? cloneVehicle(manual) : null;
}

export function goalLabel(flow: AssistantFlow, locale: Locale) {
  const goal = assistantGoals.find((item) => item.id === flow);

  if (!goal) {
    return locale === "zh-CN" ? "新会话" : "New Conversation";
  }

  return goal.label[locale];
}

function buildIntentTitle(flow: AssistantFlow, vehicle?: AssistantVehicle) {
  if (vehicle) {
    return assistantText(
      `${vehicle.vin ?? vehicle.series["zh-CN"]} / ${goalLabel(flow, "zh-CN")}`,
      `${vehicle.vin ?? vehicle.series["en-US"]} / ${goalLabel(flow, "en-US")}`,
    );
  }

  return assistantText(goalLabel(flow, "zh-CN"), goalLabel(flow, "en-US"));
}

export function createAssistantPrompt(flow: AssistantGoalId, createdAt: number) {
  const goal = assistantGoals.find((item) => item.id === flow);

  return createTextMessage(
    "assistant",
    goal?.prompt ??
      assistantText("请描述你的需求，我来帮你整理流程。", "Describe the request and I will help structure the next steps."),
    createdAt,
  );
}

export function createVehicleConfirmMessage(
  vehicle: AssistantVehicle,
  createdAt: number,
): AssistantVehicleMessage {
  return {
    id: createId("vehicle"),
    role: "assistant",
    kind: "vehicle-confirm",
    createdAt,
    vehicle,
    hint: assistantText(
      "请确认车型信息。如果不对，可以重新输入 VIN 或车型。",
      "Please confirm the vehicle. If it is wrong, re-enter the VIN or model.",
    ),
  };
}

function createManualRouteMessage(createdAt: number): AssistantManualRouteMessage {
  return {
    id: createId("manual"),
    role: "assistant",
    kind: "manual-route",
    createdAt,
    tips: [
      assistantText("当前订单查询能力暂未开发，建议先前往订单模块手动筛选。", "Order lookup is not implemented yet. Please use the orders module for manual filtering."),
      assistantText("如果你愿意，我也可以帮你先整理 VIN、订单时间、备注等筛选条件。", "I can still help you summarize VIN, time, and note clues for manual search."),
    ],
  };
}

function createSelectionMap<T extends { id: string; quantity: number }>(items: T[]) {
  return Object.fromEntries(
    items.map((item) => [
      item.id,
      {
        selected: true,
        quantity: Math.max(1, item.quantity),
      },
    ]),
  ) satisfies AssistantLineSelection;
}

function buildEpcItems(query: string): AssistantEpcItem[] {
  const normalized = query.toLowerCase();

  if (/(避震|减震|悬挂|shock|strut)/.test(normalized)) {
    return [
      {
        id: createId("epc"),
        sku: "SL-SUSP-1028",
        name: assistantText("前减震器总成", "Front Shock Absorber Assembly"),
        diagramCode: "FR-SUSP-02",
        diagramName: assistantText("前悬挂与减震", "Front Suspension & Dampers"),
        location: assistantText("前桥 / 左右前轮", "Front axle / both front wheels"),
        price: 680,
        defaultQuantity: 2,
      },
      {
        id: createId("epc"),
        sku: "SL-SUSP-1041",
        name: assistantText("前减震顶胶", "Front Strut Mount"),
        diagramCode: "FR-SUSP-02",
        diagramName: assistantText("前悬挂与减震", "Front Suspension & Dampers"),
        location: assistantText("减震器上支座", "Upper strut mount"),
        price: 145,
        defaultQuantity: 2,
      },
    ];
  }

  if (/(前脸|保险杠|中网|headlamp|bumper|front)/.test(normalized)) {
    return [
      {
        id: createId("epc"),
        sku: "SL-BODY-2105",
        name: assistantText("前保险杠总成", "Front Bumper Assembly"),
        diagramCode: "BD-FRONT-01",
        diagramName: assistantText("前围覆盖件", "Front Fascia"),
        location: assistantText("前脸外覆盖件", "Front exterior fascia"),
        price: 980,
        defaultQuantity: 1,
      },
      {
        id: createId("epc"),
        sku: "SL-LAMP-1140",
        name: assistantText("左前大灯总成", "Left Headlamp Assembly"),
        diagramCode: "BD-FRONT-03",
        diagramName: assistantText("前照灯与支架", "Headlamp & Bracket"),
        location: assistantText("左前角 / 灯组", "Front left corner / lamp set"),
        price: 1260,
        defaultQuantity: 1,
      },
    ];
  }

  return [
    {
      id: createId("epc"),
      sku: "SL-BRK-3055",
      name: assistantText("前制动片套装", "Front Brake Pad Set"),
      diagramCode: "BR-FR-01",
      diagramName: assistantText("前制动系统", "Front Brake System"),
      location: assistantText("前轮卡钳组件", "Front wheel caliper assembly"),
      price: 320,
      defaultQuantity: 1,
    },
    {
      id: createId("epc"),
      sku: "SL-BRK-3077",
      name: assistantText("前制动盘", "Front Brake Disc"),
      diagramCode: "BR-FR-01",
      diagramName: assistantText("前制动系统", "Front Brake System"),
      location: assistantText("前轮制动盘", "Front wheel brake disc"),
      price: 460,
      defaultQuantity: 2,
    },
  ];
}

export function buildEpcResult(query: string, createdAt: number): AssistantEpcMessage {
  return {
    id: createId("epc-card"),
    role: "assistant",
    kind: "epc-result",
    createdAt,
    query: assistantText(query || "配件定位", query || "Part lookup"),
    items: buildEpcItems(query),
  };
}

function mergePartsItems(current: AssistantPartsItem[], incoming: AssistantPartsItem[]) {
  const merged = new Map(current.map((item) => [item.sku, item]));

  incoming.forEach((item) => {
    const existing = merged.get(item.sku);

    if (existing) {
      merged.set(item.sku, {
        ...existing,
        quantity: existing.quantity + item.quantity,
      });
      return;
    }

    merged.set(item.sku, item);
  });

  return Array.from(merged.values()).map((item, index) => ({
    ...item,
    index: index + 1,
  }));
}

function inferPartsItems(text: string, attachments: AssistantAttachment[]) {
  const normalized = text.toLowerCase();

  if (/(刹车|制动|brake)/.test(normalized)) {
    return [
      {
        id: createId("part"),
        index: 1,
        sku: "SL-BRK-3055",
        name: assistantText("前制动片套装", "Front Brake Pad Set"),
        quantity: 1,
        note: assistantText("根据文本识别到制动耗材需求", "Detected from brake-related request"),
      },
      {
        id: createId("part"),
        index: 2,
        sku: "SL-BRK-3077",
        name: assistantText("前制动盘", "Front Brake Disc"),
        quantity: 2,
        note: assistantText("建议按左右一对处理", "Recommended as a left-right pair"),
      },
    ];
  }

  if (/(避震|减震|悬挂|shock|strut)/.test(normalized)) {
    return [
      {
        id: createId("part"),
        index: 1,
        sku: "SL-SUSP-1028",
        name: assistantText("前减震器总成", "Front Shock Absorber Assembly"),
        quantity: 2,
        note: assistantText("根据悬挂相关描述识别", "Detected from suspension-related description"),
      },
      {
        id: createId("part"),
        index: 2,
        sku: "SL-SUSP-1041",
        name: assistantText("前减震顶胶", "Front Strut Mount"),
        quantity: 2,
        note: assistantText("与减震器建议一并处理", "Recommended together with the dampers"),
      },
    ];
  }

  if (attachments.some((item) => item.tag === "parts")) {
    return [
      {
        id: createId("part"),
        index: 1,
        sku: "SL-BODY-2105",
        name: assistantText("前保险杠总成", "Front Bumper Assembly"),
        quantity: 1,
        note: assistantText("从清单文件中抽取", "Extracted from the uploaded list"),
      },
      {
        id: createId("part"),
        index: 2,
        sku: "SL-LAMP-1140",
        name: assistantText("左前大灯总成", "Left Headlamp Assembly"),
        quantity: 1,
        note: assistantText("从清单文件中抽取", "Extracted from the uploaded list"),
      },
      {
        id: createId("part"),
        index: 3,
        sku: "SL-FAST-0982",
        name: assistantText("前围固定卡扣包", "Front Fascia Clip Set"),
        quantity: 1,
        note: assistantText("由附件清单补足的辅料项", "Additional auxiliary item inferred from the attachment"),
      },
    ];
  }

  return [
    {
      id: createId("part"),
      index: 1,
      sku: "SL-FLTR-7780",
      name: assistantText("空气滤芯", "Air Filter"),
      quantity: 1,
      note: assistantText("按默认清单示例补齐", "Filled from the demo checklist"),
    },
    {
      id: createId("part"),
      index: 2,
      sku: "SL-OIL-4410",
      name: assistantText("机油滤芯", "Oil Filter"),
      quantity: 1,
      note: assistantText("按默认清单示例补齐", "Filled from the demo checklist"),
    },
  ];
}

export function buildPartsResult(
  text: string,
  attachments: AssistantAttachment[],
  current: AssistantPartsItem[],
  createdAt: number,
): AssistantPartsMessage {
  const merged = mergePartsItems(current, inferPartsItems(text, attachments));

  return {
    id: createId("parts-card"),
    role: "assistant",
    kind: "parts-result",
    createdAt,
    summary: assistantText(
      `已整理 ${merged.length} 条配件清单，可直接勾选加入购物车。`,
      `${merged.length} parts rows are ready for cart selection.`,
    ),
    items: merged,
  };
}

export function buildCollisionAnalysis(
  text: string,
  attachments: AssistantAttachment[],
): AssistantCollisionAnalysis {
  const normalized = text.toLowerCase();
  const impactZone = /(左前|左侧|left front|left)/.test(normalized)
    ? assistantText("左前侧碰撞", "Front-left impact")
    : /(右前|right front|right)/.test(normalized)
      ? assistantText("右前侧碰撞", "Front-right impact")
      : assistantText("前部碰撞", "Front impact");
  const imageBoost = attachments.filter((item) => item.tag === "accident").length;
  const confidence = Math.min(0.94, 0.68 + imageBoost * 0.08);

  return {
    summary: assistantText(
      "从当前描述看，前部覆盖件受损较明确，内部支架和散热器周边存在连带风险。",
      "The current evidence strongly suggests front fascia damage, with secondary risk around brackets and radiator support.",
    ),
    impactZone,
    visibleDamageParts: [
      assistantText("前保险杠总成", "Front bumper assembly"),
      assistantText("前格栅", "Front grille"),
      assistantText("左前大灯支架", "Left headlamp bracket"),
    ],
    possibleDamageParts: [
      assistantText("水箱框架", "Radiator support"),
      assistantText("冷凝器", "A/C condenser"),
      assistantText("前防撞梁", "Front reinforcement bar"),
    ],
    inspectionItems: [
      assistantText("前纵梁变形", "Front rail deformation"),
      assistantText("散热器渗漏", "Radiator leakage"),
      assistantText("传感器安装位", "Sensor mounting points"),
    ],
    riskEstimate: /(大灯|纵梁|安全气囊)/.test(normalized) ? 12600 : 8600,
    confidence,
    safetyNotes: [
      assistantText("若涉及灯组支架或纵梁，请先做结构检查后再确认换件。", "If lamp brackets or front rails are involved, inspect structure before confirming replacements."),
      assistantText("当前结果基于图片和描述推断，隐藏损伤可能在拆检后上升。", "This result is inferred from photos and text. Hidden damage may increase after teardown."),
    ],
  };
}

export function buildCollisionResult(
  text: string,
  attachments: AssistantAttachment[],
  createdAt: number,
): AssistantCollisionMessage {
  return {
    id: createId("collision-card"),
    role: "assistant",
    kind: "collision-result",
    createdAt,
    analysis: buildCollisionAnalysis(text, attachments),
  };
}

export function buildReplacementItems(analysis: AssistantCollisionAnalysis) {
  const combined = [
    ...analysis.visibleDamageParts.map((item) => ({
      name: item,
      advice: assistantText("更换", "Replace"),
    })),
    ...analysis.possibleDamageParts.map((item) => ({
      name: item,
      advice: assistantText("建议更换", "Recommend replace"),
    })),
    ...analysis.inspectionItems.map((item) => ({
      name: item,
      advice: assistantText("建议检查", "Inspect first"),
    })),
  ];

  return combined.map((item, index) => ({
    id: createId("replace"),
    index: index + 1,
    sku: `SL-RPL-${String(index + 1).padStart(3, "0")}`,
    name: item.name,
    quantity: 1,
    advice: item.advice,
  }));
}

export function buildReplacementMessage(
  analysis: AssistantCollisionAnalysis,
  createdAt: number,
): AssistantReplacementMessage {
  return {
    id: createId("replacement-card"),
    role: "assistant",
    kind: "replacement-list",
    createdAt,
    items: buildReplacementItems(analysis),
  };
}

export function buildReport(vehicle: AssistantVehicle, analysis: AssistantCollisionAnalysis): AssistantReport {
  const title = assistantText(
    `${vehicle.brand["zh-CN"]} ${vehicle.series["zh-CN"]} 初步定损报告`,
    `${vehicle.brand["en-US"]} ${vehicle.series["en-US"]} Draft Damage Report`,
  );
  const summary = assistantText(
    `${vehicle.vin ?? ""} / ${analysis.impactZone["zh-CN"]} / 风险估价 ¥${analysis.riskEstimate.toLocaleString("zh-CN")}`,
    `${vehicle.vin ?? ""} / ${analysis.impactZone["en-US"]} / Estimated risk ¥${analysis.riskEstimate.toLocaleString("en-US")}`,
  );

  const html = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <title>${title["zh-CN"]}</title>
    <style>
      body { font-family: "Microsoft YaHei", sans-serif; padding: 32px; color: #1f2933; }
      h1, h2 { margin: 0 0 12px; }
      section { margin-top: 24px; }
      .meta { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
      .card { padding: 14px 16px; border: 1px solid #d6dde5; border-radius: 12px; background: #f7fafc; }
      ul { margin: 8px 0 0; padding-left: 18px; }
    </style>
  </head>
  <body>
    <h1>${title["zh-CN"]}</h1>
    <p>${summary["zh-CN"]}</p>
    <section class="meta">
      <div class="card"><strong>VIN</strong><div>${vehicle.vin ?? "-"}</div></div>
      <div class="card"><strong>车型</strong><div>${vehicle.brand["zh-CN"]} / ${vehicle.series["zh-CN"]} / ${vehicle.year} / ${vehicle.model["zh-CN"]}</div></div>
      <div class="card"><strong>碰撞位置</strong><div>${analysis.impactZone["zh-CN"]}</div></div>
      <div class="card"><strong>置信度</strong><div>${Math.round(analysis.confidence * 100)}%</div></div>
    </section>
    <section>
      <h2>事故总结</h2>
      <p>${analysis.summary["zh-CN"]}</p>
    </section>
    <section>
      <h2>可见损伤配件</h2>
      <ul>${analysis.visibleDamageParts.map((item) => `<li>${item["zh-CN"]}</li>`).join("")}</ul>
    </section>
    <section>
      <h2>可能损伤配件</h2>
      <ul>${analysis.possibleDamageParts.map((item) => `<li>${item["zh-CN"]}</li>`).join("")}</ul>
    </section>
    <section>
      <h2>建议检查项目</h2>
      <ul>${analysis.inspectionItems.map((item) => `<li>${item["zh-CN"]}</li>`).join("")}</ul>
    </section>
  </body>
</html>`;

  return {
    title,
    summary,
    html,
  };
}

export function buildReportMessage(
  vehicle: AssistantVehicle,
  analysis: AssistantCollisionAnalysis,
  createdAt: number,
): AssistantReportMessage {
  return {
    id: createId("report-card"),
    role: "assistant",
    kind: "report",
    createdAt,
    report: buildReport(vehicle, analysis),
  };
}

export function createSessionFromGoal(goal: AssistantGoalId): AssistantSession {
  const now = Date.now();
  const title = assistantText(goalLabel(goal, "zh-CN"), goalLabel(goal, "en-US"));
  const manual = goal === "order-query" || goal === "other";

  return {
    id: createId("session"),
    flow: goal,
    stage: manual ? "manual-route" : "awaiting-vehicle",
    title,
    contextKey: assistantText(
      manual ? "非标准流程" : "等待录入 VIN 或车型",
      manual ? "Non-standard flow" : "Waiting for VIN or vehicle",
    ),
    status: assistantText(
      manual ? "给出下一步建议" : "等待车辆信息",
      manual ? "Guiding the next step" : "Waiting for vehicle input",
    ),
    createdAt: now,
    updatedAt: now,
    messages: [
      createTextMessage(
        "assistant",
        assistantText(
          "我们开始吧。我会按业务流帮你确认关键字段，避免后面反复补信息。",
          "Let us begin. I will guide the workflow and confirm the key fields early to reduce rework later.",
        ),
        now,
      ),
      createAssistantPrompt(goal, now + 1),
      ...(manual ? [createManualRouteMessage(now + 2)] : []),
    ],
    latestEpcItems: [],
    latestPartsItems: [],
    latestReplacementItems: [],
    pendingText: "",
    pendingAttachments: [],
    partsSelection: {},
    replacementSelection: {},
  };
}

function seedEpcSession(offsetMs: number): AssistantSession {
  const vehicle = cloneVehicle(mockVehicles[0]);
  const createdAt = Date.now() - offsetMs;
  const epcMessage = buildEpcResult("前脸保险杠和左前大灯", createdAt + 3);

  return {
    id: createId("seed-epc"),
    flow: "epc",
    stage: "awaiting-part-query",
    title: buildIntentTitle("epc", vehicle),
    contextKey: assistantText(vehicle.vin ?? vehicle.series["zh-CN"], vehicle.vin ?? vehicle.series["en-US"]),
    status: assistantText("已完成一次 EPC 定位", "EPC lookup completed once"),
    createdAt,
    updatedAt: createdAt + 3,
    vehicle,
    messages: [
      createTextMessage("assistant", assistantText("这是一个演示会话，你可以继续补充配件描述。", "This is a demo session. You can continue refining the part request."), createdAt),
      createVehicleConfirmMessage(vehicle, createdAt + 1),
      createTextMessage("user", assistantText("我需要前脸位置的保险杠和左前大灯。", "I need the front bumper and the left headlamp."), createdAt + 2),
      epcMessage,
    ],
    latestEpcItems: epcMessage.items,
    latestPartsItems: [],
    latestReplacementItems: [],
    pendingText: "",
    pendingAttachments: [],
    partsSelection: {},
    replacementSelection: {},
  };
}

function seedCollisionSession(offsetMs: number): AssistantSession {
  const vehicle = cloneVehicle(mockVehicles[2]);
  const createdAt = Date.now() - offsetMs;
  const analysis = buildCollisionAnalysis("左前碰撞，保险杠开裂，大灯支架变形。", []);
  const collisionMessage: AssistantCollisionMessage = {
    id: createId("collision-seed"),
    role: "assistant",
    kind: "collision-result",
    createdAt: createdAt + 3,
    analysis,
  };
  const replacementMessage = buildReplacementMessage(analysis, createdAt + 4);
  const reportMessage = buildReportMessage(vehicle, analysis, createdAt + 5);

  return {
    id: createId("seed-collision"),
    flow: "collision",
    stage: "awaiting-collision-action",
    title: buildIntentTitle("collision", vehicle),
    contextKey: assistantText(vehicle.vin ?? vehicle.series["zh-CN"], vehicle.vin ?? vehicle.series["en-US"]),
    status: assistantText("已生成分析结论", "Analysis result generated"),
    createdAt,
    updatedAt: createdAt + 5,
    vehicle,
    messages: [
      createTextMessage("assistant", assistantText("事故分析演示会话，可继续补充图片或描述。", "Demo collision session. You can add more photos or notes."), createdAt),
      createVehicleConfirmMessage(vehicle, createdAt + 1),
      createTextMessage("user", assistantText("左前侧碰撞，保险杠和灯组受损。", "Front-left collision, with bumper and lamp damage."), createdAt + 2),
      collisionMessage,
      replacementMessage,
      reportMessage,
    ],
    latestEpcItems: [],
    latestPartsItems: [],
    latestReplacementItems: replacementMessage.items,
    latestCollision: analysis,
    latestReport: reportMessage.report,
    pendingText: "",
    pendingAttachments: [],
    partsSelection: {},
    replacementSelection: createSelectionMap(replacementMessage.items),
  };
}

export function createSeedSessions() {
  return [createWelcomeSession(), seedEpcSession(1000 * 60 * 20), seedCollisionSession(1000 * 60 * 80)];
}

export function updateSessionMeta(
  session: AssistantSession,
  next: Partial<Pick<AssistantSession, "flow" | "stage" | "vehicle" | "status" | "contextKey">>,
) {
  const vehicle = next.vehicle ?? session.vehicle;
  const flow = next.flow ?? session.flow;

  return {
    ...session,
    ...next,
    title: vehicle ? buildIntentTitle(flow, vehicle) : buildIntentTitle(flow),
    updatedAt: Date.now(),
  };
}

export function buildAttachmentFromFile(file: File, source: "picker" | "paste"): AssistantAttachment {
  const lower = file.name.toLowerCase();
  const kind: AssistantAttachmentKind = file.type.startsWith("image/") ? "image" : "document";
  let tag: AssistantAttachmentTag = "generic";

  if (/vin/.test(lower)) {
    tag = "vin";
  } else if (/accident|damage|crash|碰撞|事故/.test(lower)) {
    tag = "accident";
  } else if (/parts|list|quote|清单|报价/.test(lower)) {
    tag = "parts";
  }

  return {
    id: createId("file"),
    name: file.name,
    kind,
    tag,
    source,
    mimeType: file.type || undefined,
  };
}

export function createUserSummary(text: string, attachments: AssistantAttachment[]) {
  const attachmentLabel =
    attachments.length > 0
      ? assistantText(
          `已附带 ${attachments.length} 个附件：${attachments.map((item) => item.name).join("、")}`,
          `Attached ${attachments.length} files: ${attachments.map((item) => item.name).join(", ")}`,
        )
      : assistantText("", "");
  const base = text.trim()
    ? assistantText(text.trim(), text.trim())
    : assistantText("已上传附件，请帮我继续处理。", "I uploaded files. Please continue.");

  if (!attachments.length) {
    return base;
  }

  return assistantText(
    `${base["zh-CN"]}\n${attachmentLabel["zh-CN"]}`,
    `${base["en-US"]}\n${attachmentLabel["en-US"]}`,
  );
}

export function createCartLineFromEpcItem(item: AssistantEpcItem, vehicle: AssistantVehicle): CartLine {
  const bindingKey = buildCartBindingKey(vehicle.vehicleId, vehicle.vin);

  return {
    id: `${item.sku}:${bindingKey}`,
    bindingKey,
    sku: item.sku,
    quantity: item.defaultQuantity,
    unitPrice: item.price,
    name: item.name,
    description: assistantText(
      `${item.diagramName["zh-CN"]} / ${item.location["zh-CN"]}`,
      `${item.diagramName["en-US"]} / ${item.location["en-US"]}`,
    ),
    context: assistantText(`EPC 助手 / ${item.diagramCode}`, `Assistant EPC / ${item.diagramCode}`),
    vehicle,
    addedAt: Date.now(),
  };
}

export function createCartLineFromPartsItem(
  item: AssistantPartsItem | AssistantReplacementItem,
  vehicle: AssistantVehicle,
  quantity: number,
  contextLabel: AssistantLocaleText,
): CartLine {
  const bindingKey = buildCartBindingKey(vehicle.vehicleId, vehicle.vin);

  return {
    id: `${item.sku}:${bindingKey}`,
    bindingKey,
    sku: item.sku,
    quantity,
    unitPrice: 0,
    name: item.name,
    description: "note" in item ? item.note : item.advice,
    context: contextLabel,
    vehicle,
    addedAt: Date.now(),
  };
}
