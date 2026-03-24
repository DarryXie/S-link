import {
  ArrowUpRight,
  Bot,
  Check,
  ClipboardList,
  FileText,
  LoaderCircle,
  MessageSquarePlus,
  Paperclip,
  Search,
  SendHorizontal,
  ShoppingCart,
  Sparkles,
  Trash2,
  TriangleAlert,
  Upload,
  Wrench,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Copy, Locale } from "../../content";
import type { CartLine } from "../cart/cartTypes";
import { buildEpcPath, getText, partHits, vehicles as epcVehicles } from "../epc/EpcPage";
import {
  assistantGoals,
  assistantStorageKey,
  assistantText,
  buildAttachmentFromFile,
  buildCollisionResult,
  buildEpcResult,
  buildPartsResult,
  buildReplacementMessage,
  buildReportMessage,
  createWelcomeSession,
  createCartLineFromEpcItem,
  createCartLineFromPartsItem,
  createSessionFromGoal,
  createUserSummary,
  createVehicleConfirmMessage,
  detectGoalFromText,
  findVehicleCandidate,
  formatRelativeTime,
  goalLabel,
  type AssistantAttachment,
  type AssistantCollisionAnalysis,
  type AssistantEpcItem,
  type AssistantFlow,
  type AssistantLineSelection,
  type AssistantLocaleText,
  type AssistantMessage,
  type AssistantPartsItem,
  type AssistantReport,
  type AssistantReplacementItem,
  type AssistantSession,
  type AssistantVehicle,
} from "./assistantData";
import {
  generateAssistantCollisionMessage,
  generateAssistantPartsMessage,
  generateAssistantReportMessage,
  isArkConfigured,
} from "./arkService";

type AssistantDrawerProps = {
  locale: Locale;
  copy: Copy;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (line: CartLine) => void;
};

type BusyState = {
  sessionId: string;
  label: AssistantLocaleText;
};

function makeText(locale: Locale, zh: string, en: string) {
  return locale === "zh-CN" ? zh : en;
}

function makeLocaleText(zh: string, en: string): AssistantLocaleText {
  return {
    "zh-CN": zh,
    "en-US": en,
  };
}

const storedTextRewrites: Record<string, string> = {
  "Ark API key is not configured, so the assistant used demo data.":
    "未配置火山引擎 Ark API Key，已回退到演示结果。",
  "The current Ark API key was rejected with 401, so the assistant fell back to demo data.":
    "当前 Ark API Key 鉴权失败（401），可能已失效、被撤销或无调用权限，已回退到演示结果。",
  "The model request failed, so the assistant fell back to demo data.":
    "大模型调用失败，已回退到演示结果。",
  "The system is analyzing the parts list now.": "系统开始分析配件清单，请稍候。",
  "Recognizing parts list": "配件清单识别中",
  "Parts list recognized": "已完成清单识别",
  "The system is analyzing the collision now.": "系统开始分析碰撞情况，请稍候。",
  "Analyzing collision": "碰撞分析中",
  "Collision analysis ready": "已完成碰撞分析",
  "The system is preparing the draft report.": "系统正在生成初步定损报告，请稍候。",
  "Generating draft report": "初步报告生成中",
  "Draft damage report generated": "已生成初步定损报告",
  "Please choose whether this is EPC, parts ordering, or collision analysis.":
    "请选择这是 EPC 查询、配件订购，还是事故分析。",
  "Waiting for vehicle confirmation": "等待确认车型",
  "Please enter a 17-character VIN, upload a VIN image, or describe the vehicle.":
    "请输入 17 位 VIN，上传 VIN 图片，或直接描述车型信息。",
  "EPC suggestions ready": "已整理 EPC 建议",
  "Add more detail such as side, position, assembly name, or purpose if you want a narrower result.":
    "如果你想让我继续缩小范围，可以补充左右侧、安装位置、总成名称或用途。",
  "I only have the vehicle context right now. Please upload a parts list image/file or paste the parts text, then I can start recognition.":
    "我目前只有车型信息。请上传配件清单图片、文件，或直接粘贴清单文字，我再开始识别。",
  "I only have the vehicle context right now. Please upload collision photos or add a damage description, then I can start analysis.":
    "我目前只有车型信息。请上传事故图片，或补充损伤描述，我再开始分析。",
  "Input recorded. You can also continue from the action cards below.":
    "我已经记录这条输入，你也可以继续使用下方卡片里的操作。",
  "Waiting for a part description": "等待配件描述",
  "Vehicle confirmed. Describe the part and mounting position, such as front bumper or front wheel shock absorber.":
    "车型已确认。请描述需要的配件和安装位置，例如前保险杠、前轮减震器。",
  "Waiting for parts evidence": "等待配件清单",
  "Vehicle confirmed. Please upload a parts list image/file or paste the parts text, and I will recognize it after that.":
    "车型已确认。请上传配件清单图片、文件，或直接粘贴清单文字，我收到后就开始识别。",
  "Waiting for collision evidence": "等待事故信息",
  "Vehicle confirmed. Please upload collision photos or add a damage description, and I will analyze it after that.":
    "车型已确认。请上传事故图片，或补充损伤描述，我收到后就开始分析。",
  "Waiting for vehicle input": "等待车辆信息",
  "Please re-enter VIN or vehicle": "请重新输入 VIN 或车型",
  "Please re-enter the VIN or vehicle and I will identify it again.":
    "请重新输入 VIN 或车型，我会重新识别。",
  "Select at least one line item.": "请至少选择一条配件。",
  "Replacement list generated": "已生成换件清单",
  "The new tab was blocked by the browser. Please allow pop-ups and try again.":
    "新标签页被浏览器拦截了，请允许弹窗后重试。",
  "The report content is not available yet. Please generate the report again.":
    "报告内容还未生成成功，请重新生成一次初步报告。",
  "The part was added to the cart.": "配件已加入购物车。",
  "New conversation": "新会话",
  "Waiting for VIN or vehicle": "等待 VIN 或车型",
};

function normalizeStoredLocaleText(value: AssistantLocaleText): AssistantLocaleText {
  const zh =
    storedTextRewrites[value["zh-CN"]] ??
    storedTextRewrites[value["en-US"]] ??
    value["zh-CN"] ??
    value["en-US"];

  return {
    "zh-CN": zh,
    "en-US": zh,
  };
}

function isArkUnauthorizedError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return /status 401|unauthorized|authentication/i.test(error.message);
}

function createUiTextMessage(
  role: "assistant" | "user",
  body: AssistantLocaleText,
  attachments?: AssistantAttachment[],
): AssistantMessage {
  return {
    id: `${role}-${crypto.randomUUID()}`,
    role,
    kind: "text",
    createdAt: Date.now(),
    body,
    attachments,
  };
}

const vinPattern = /\b[A-HJ-NPR-Z0-9]{17}\b/gi;

function stripVinTokens(text: string) {
  return text.replace(vinPattern, " ").replace(/\s+/g, " ").trim();
}

function hasPartsEvidence(text: string, attachments: AssistantAttachment[]) {
  if (attachments.some((item) => item.tag !== "vin")) {
    return true;
  }

  const normalized = stripVinTokens(text).toLowerCase();

  if (!normalized) {
    return false;
  }

  return /(清单|配件|零件|订购|采购|数量|报价|part|parts|list|quote|qty|quantity)/.test(
    normalized,
  );
}

function hasCollisionEvidence(text: string, attachments: AssistantAttachment[]) {
  if (
    attachments.some(
      (item) => item.tag === "accident" || (item.kind === "image" && item.tag !== "vin"),
    )
  ) {
    return true;
  }

  const normalized = stripVinTokens(text).toLowerCase();

  if (!normalized) {
    return false;
  }

  return /(事故|碰撞|定损|受损|损伤|剐蹭|追尾|crash|collision|damage|dent|impact)/.test(
    normalized,
  );
}

function hasStrongPartsEvidence(text: string, attachments: AssistantAttachment[]) {
  if (
    attachments.some(
      (item) =>
        item.tag === "parts" ||
        item.kind === "document" ||
        Boolean(item.textContent?.trim()),
    )
  ) {
    return true;
  }

  const normalized = stripVinTokens(text).toLowerCase();

  if (!normalized) {
    return false;
  }

  return /(清单|配件|零件|数量|报价|part|parts|list|quote|qty|quantity)/.test(normalized);
}

function hasStrongCollisionEvidence(text: string, attachments: AssistantAttachment[]) {
  const normalized = stripVinTokens(text).toLowerCase();

  if (
    /(事故|碰撞|定损|受损|损伤|剐蹭|追尾|crash|collision|damage|dent|impact)/.test(
      normalized,
    )
  ) {
    return true;
  }

  return attachments.some(
    (item) =>
      item.tag === "accident" ||
      /accident|damage|crash|碰撞|事故|定损|受损/i.test(item.name),
  );
}

function sanitizeAttachmentForStorage(attachment: AssistantAttachment): AssistantAttachment {
  const { dataUrl: _dataUrl, textContent: _textContent, ...rest } = attachment;
  return rest;
}

function resolveReportHtml(report: AssistantReport) {
  if (report.html?.trim()) {
    return report.html;
  }

  if (report.url?.startsWith("data:text/html")) {
    const [, payload = ""] = report.url.split(",", 2);
    return decodeURIComponent(payload);
  }

  return "";
}

function serializeSessionsForStorage(sessions: AssistantSession[]) {
  return sessions.map((session) => ({
    ...session,
    pendingAttachments: session.pendingAttachments.map(sanitizeAttachmentForStorage),
    messages: session.messages.map((message) => {
      if (message.kind !== "text" || !message.attachments?.length) {
        return message;
      }

      return {
        ...message,
        attachments: message.attachments.map(sanitizeAttachmentForStorage),
      };
    }),
  }));
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file as data URL."));
    reader.readAsDataURL(file);
  });
}

function readFileAsText(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file as text."));
    reader.readAsText(file);
  });
}

function isTextLikeFile(file: File) {
  return (
    file.type.startsWith("text/") ||
    /\.(txt|csv|json|md|log|xml|yaml|yml)$/i.test(file.name)
  );
}

async function enrichAttachment(file: File, source: "picker" | "paste"): Promise<AssistantAttachment> {
  const attachment = buildAttachmentFromFile(file, source);

  try {
    if (attachment.kind === "image") {
      return {
        ...attachment,
        dataUrl: await readFileAsDataUrl(file),
      };
    }

    if (isTextLikeFile(file)) {
      return {
        ...attachment,
        textContent: (await readFileAsText(file)).slice(0, 16000),
      };
    }
  } catch {
    return attachment;
  }

  return attachment;
}

function loadSessions() {
  if (typeof window === "undefined") {
    return [createWelcomeSession()];
  }

  try {
    const raw = window.localStorage.getItem(assistantStorageKey);

    if (!raw) {
      return [createWelcomeSession()];
    }

    const parsed = JSON.parse(raw) as AssistantSession[];

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [createWelcomeSession()];
    }

    return parsed.map((session) => ({
      ...session,
      title: normalizeStoredLocaleText(session.title),
      contextKey: normalizeStoredLocaleText(session.contextKey),
      status: normalizeStoredLocaleText(session.status),
      pendingText: session.pendingText ?? "",
      pendingAttachments: session.pendingAttachments ?? [],
      latestEpcItems: session.latestEpcItems ?? [],
      latestPartsItems: session.latestPartsItems ?? [],
      latestReplacementItems: session.latestReplacementItems ?? [],
      partsSelection: session.partsSelection ?? {},
      replacementSelection: session.replacementSelection ?? {},
      messages: session.messages.map((message) => {
        if (message.kind === "text") {
          return {
            ...message,
            body: normalizeStoredLocaleText(message.body),
          };
        }

        if (message.kind === "vehicle-confirm") {
          return {
            ...message,
            hint: normalizeStoredLocaleText(message.hint),
          };
        }

        if (message.kind === "epc-result") {
          return {
            ...message,
            query: normalizeStoredLocaleText(message.query),
          };
        }

        if (message.kind === "parts-result") {
          return {
            ...message,
            summary: normalizeStoredLocaleText(message.summary),
          };
        }

        if (message.kind === "report") {
          return {
            ...message,
            report: {
              ...message.report,
              title: normalizeStoredLocaleText(message.report.title),
              summary: normalizeStoredLocaleText(message.report.summary),
            },
          };
        }

        return message;
      }),
    }));
  } catch {
    return [createWelcomeSession()];
  }
}

function createSelectionMap(items: Array<{ id: string; quantity: number }>): AssistantLineSelection {
  return Object.fromEntries(
    items.map((item) => [item.id, { selected: true, quantity: Math.max(1, item.quantity) }]),
  ) satisfies AssistantLineSelection;
}

function matchAssistantEpcPart(
  item: AssistantEpcItem,
  locale: Locale,
  vehicleBrand?: string,
) {
  const normalizedBrand = vehicleBrand?.toLowerCase() ?? "";
  const cues = [
    item.sku,
    item.name[locale],
    item.diagramCode,
    item.diagramName[locale],
    item.location[locale],
  ]
    .filter(Boolean)
    .map((value) => value.toLowerCase());

  const categorizedCues = [
    item.sku.includes("BRK") ? "brake" : "",
    item.sku.includes("SUSP") ? "axle" : "",
    item.sku.includes("BODY") || item.sku.includes("LAMP") ? "front" : "",
  ].filter(Boolean);

  const ranked = partHits
    .map((hit) => {
      const haystack = [
        hit.part.sku,
        getText(locale, hit.part.name),
        getText(locale, hit.diagram.name),
        hit.diagram.code,
        getText(locale, hit.group.name),
        getText(locale, hit.subgroup.name),
        getText(locale, hit.vehicle.brand),
        getText(locale, hit.vehicle.series),
      ]
        .join(" ")
        .toLowerCase();

      let score = 0;

      if (hit.part.sku === item.sku) {
        score += 64;
      }

      if (normalizedBrand && haystack.includes(normalizedBrand)) {
        score += 12;
      }

      cues.forEach((cue) => {
        if (haystack.includes(cue)) {
          score += 10;
          return;
        }

        cue
          .split(/[\s/]+/)
          .filter((token) => token.length >= 2)
          .forEach((token) => {
            if (haystack.includes(token)) {
              score += 3;
            }
          });
      });

      categorizedCues.forEach((cue) => {
        if (haystack.includes(cue)) {
          score += 4;
        }
      });

      return { hit, score };
    })
    .sort((left, right) => right.score - left.score);

  return ranked[0]?.score > 0 ? ranked[0].hit : null;
}

function resolveAssistantVehicleLink(vehicleBrand?: string, vehicleVin?: string) {
  const normalizedBrand = vehicleBrand?.toLowerCase() ?? "";
  const preferredVehicle =
    epcVehicles.find((vehicle) =>
      [vehicle.brand["zh-CN"], vehicle.brand["en-US"]]
        .join(" ")
        .toLowerCase()
        .includes(normalizedBrand),
    ) ?? epcVehicles[0];

  const targetGroup = preferredVehicle.groups[0];
  const targetSubgroup = targetGroup.subgroups[0];
  const targetDiagram = targetSubgroup.diagrams[0];
  const targetPart = targetDiagram.parts[0];

  return buildEpcPath(
    "/epc/groups",
    {
      vehicleId: preferredVehicle.id,
      groupId: targetGroup.id,
      subgroupId: targetSubgroup.id,
      diagramId: targetDiagram.id,
      partId: targetPart.id,
    },
    vehicleVin
      ? { vin: vehicleVin, source: "assistant", focus: "vehicle-confirm" }
      : { source: "assistant", focus: "vehicle-confirm" },
  );
}

function resolveAssistantEpcLink(
  item: AssistantEpcItem,
  locale: Locale,
  vehicleBrand?: string,
  vehicleVin?: string,
) {
  const matched = matchAssistantEpcPart(item, locale, vehicleBrand);

  if (matched) {
    return buildEpcPath(
      "/epc/workbench",
      {
        vehicleId: matched.vehicle.id,
        groupId: matched.group.id,
        subgroupId: matched.subgroup.id,
        diagramId: matched.diagram.id,
        partId: matched.part.id,
      },
      vehicleVin
        ? { vin: vehicleVin, source: "assistant", focus: item.sku }
        : { source: "assistant", focus: item.sku },
    );
  }

  return resolveAssistantVehicleLink(vehicleBrand, vehicleVin);
}

function resolveVehiclePreviewLink(session?: AssistantSession) {
  if (!session?.vehicle) {
    return "/epc";
  }

  return resolveAssistantVehicleLink(session.vehicle.brand["zh-CN"], session.vehicle.vin);
}

export function AssistantDrawer({
  locale,
  copy,
  isOpen,
  onClose,
  onAddToCart,
}: AssistantDrawerProps) {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const threadRef = useRef<HTMLDivElement | null>(null);
  const [sessions, setSessions] = useState<AssistantSession[]>(() => loadSessions());
  const [activeSessionId, setActiveSessionId] = useState("");
  const [draftText, setDraftText] = useState("");
  const [draftAttachments, setDraftAttachments] = useState<AssistantAttachment[]>([]);
  const [feedback, setFeedback] = useState<AssistantLocaleText | null>(null);
  const [busyState, setBusyState] = useState<BusyState | null>(null);

  useEffect(() => {
    window.localStorage.setItem(
      assistantStorageKey,
      JSON.stringify(serializeSessionsForStorage(sessions)),
    );
  }, [sessions]);

  useEffect(() => {
    if (!feedback) {
      return;
    }

    const timer = window.setTimeout(() => setFeedback(null), 2600);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  useEffect(() => {
    if (!activeSessionId && sessions[0]?.id) {
      setActiveSessionId(sessions[0].id);
      return;
    }

    if (!sessions.some((item) => item.id === activeSessionId)) {
      setActiveSessionId(sessions[0]?.id ?? "");
    }
  }, [activeSessionId, sessions]);

  useEffect(() => {
    const nextTextarea = textareaRef.current;

    if (!nextTextarea) {
      return;
    }

    nextTextarea.style.height = "0px";
    nextTextarea.style.height = `${Math.max(nextTextarea.scrollHeight, 48)}px`;
  }, [draftText]);

  const activeSession = sessions.find((item) => item.id === activeSessionId) ?? sessions[0];
  const orderedSessions = useMemo(
    () => [...sessions].sort((left, right) => right.updatedAt - left.updatedAt),
    [sessions],
  );
  const activeBusyLabel =
    busyState && activeSession?.id === busyState.sessionId ? busyState.label : null;
  const activeIsBusy = Boolean(activeBusyLabel);

  useEffect(() => {
    const thread = threadRef.current;

    if (!thread) {
      return;
    }

    thread.scrollTo({
      top: thread.scrollHeight,
      behavior: "smooth",
    });
  }, [activeSession?.id, activeSession?.messages.length]);

  function updateSessionById(
    sessionId: string,
    updater: (session: AssistantSession) => AssistantSession,
  ) {
    setSessions((current) =>
      current.map((session) => (session.id === sessionId ? updater(session) : session)),
    );
  }

  function updateActiveSession(updater: (session: AssistantSession) => AssistantSession) {
    if (!activeSessionId) {
      return;
    }

    updateSessionById(activeSessionId, updater);
  }

  function prependSession(session: AssistantSession) {
    setSessions((current) => [session, ...current]);
    setActiveSessionId(session.id);
  }

  function clearComposer() {
    setDraftText("");
    setDraftAttachments([]);
  }

  function notifyFallback(error: unknown) {
    const message =
      error instanceof Error && error.message === "ARK_API_KEY_MISSING"
        ? makeLocaleText(
            "未配置火山引擎 Ark API Key，已回退到演示结果。",
            "未配置火山引擎 Ark API Key，已回退到演示结果。",
          )
        : isArkUnauthorizedError(error)
          ? makeLocaleText(
              "当前 Ark API Key 鉴权失败（401），可能已失效、被撤销或无调用权限，已回退到演示结果。",
              "当前 Ark API Key 鉴权失败（401），可能已失效、被撤销或无调用权限，已回退到演示结果。",
            )
        : makeLocaleText(
            "大模型调用失败，已回退到演示结果。",
            "大模型调用失败，已回退到演示结果。",
          );

    if (error) {
      console.error("Assistant model fallback:", error);
    }

    setFeedback(message);
  }

  async function handleFiles(files: FileList | null, source: "picker" | "paste") {
    if (!files || files.length === 0) {
      return;
    }

    const mapped = await Promise.all(Array.from(files).map((file) => enrichAttachment(file, source)));
    setDraftAttachments((current) => [...current, ...mapped]);
  }

  async function runPartsRecognition(params: {
    sessionId: string;
    vehicle: AssistantVehicle;
    text: string;
    attachments: AssistantAttachment[];
    currentItems: AssistantPartsItem[];
  }) {
    const progressMessage = createUiTextMessage(
      "assistant",
      makeLocaleText("系统开始分析配件清单，请稍候。", "系统开始分析配件清单，请稍候。"),
    );

    updateSessionById(params.sessionId, (session) => ({
      ...session,
      updatedAt: Date.now(),
      pendingText: params.text,
      pendingAttachments: params.attachments,
      messages: [...session.messages, progressMessage],
    }));
    setBusyState({
      sessionId: params.sessionId,
      label: makeLocaleText("配件清单识别中", "配件清单识别中"),
    });

    try {
      const partsMessage = await generateAssistantPartsMessage(
        {
          vehicle: params.vehicle,
          text: params.text,
          attachments: params.attachments,
          currentItems: params.currentItems,
        },
        Date.now(),
      );

      updateSessionById(params.sessionId, (session) => ({
        ...session,
        stage: "awaiting-parts-append",
        status: makeLocaleText("已完成清单识别", "已完成清单识别"),
        updatedAt: Date.now(),
        latestPartsItems: partsMessage.items,
        partsSelection: createSelectionMap(partsMessage.items),
        pendingText: "",
        pendingAttachments: [],
        messages: [...session.messages, partsMessage],
      }));
    } catch (error) {
      const fallback = buildPartsResult(
        params.text,
        params.attachments,
        params.currentItems,
        Date.now(),
      );

      updateSessionById(params.sessionId, (session) => ({
        ...session,
        stage: "awaiting-parts-append",
        status: makeLocaleText("已完成清单识别", "已完成清单识别"),
        updatedAt: Date.now(),
        latestPartsItems: fallback.items,
        partsSelection: createSelectionMap(fallback.items),
        pendingText: "",
        pendingAttachments: [],
        messages: [...session.messages, fallback],
      }));
      notifyFallback(error);
    } finally {
      setBusyState((current) =>
        current?.sessionId === params.sessionId ? null : current,
      );
    }
  }

  async function runCollisionAnalysis(params: {
    sessionId: string;
    vehicle: AssistantVehicle;
    text: string;
    attachments: AssistantAttachment[];
    previousAnalysis?: AssistantCollisionAnalysis;
  }) {
    const progressMessage = createUiTextMessage(
      "assistant",
      makeLocaleText("系统开始分析碰撞情况，请稍候。", "系统开始分析碰撞情况，请稍候。"),
    );

    updateSessionById(params.sessionId, (session) => ({
      ...session,
      updatedAt: Date.now(),
      pendingText: params.text,
      pendingAttachments: params.attachments,
      messages: [...session.messages, progressMessage],
    }));
    setBusyState({
      sessionId: params.sessionId,
      label: makeLocaleText("碰撞分析中", "碰撞分析中"),
    });

    try {
      const collisionMessage = await generateAssistantCollisionMessage(
        {
          vehicle: params.vehicle,
          text: params.text,
          attachments: params.attachments,
          previousAnalysis: params.previousAnalysis,
        },
        Date.now(),
      );

      updateSessionById(params.sessionId, (session) => ({
        ...session,
        stage: "awaiting-collision-action",
        status: makeLocaleText("已完成碰撞分析", "已完成碰撞分析"),
        updatedAt: Date.now(),
        latestCollision: collisionMessage.analysis,
        latestReplacementItems: [],
        replacementSelection: {},
        latestReport: undefined,
        pendingText: "",
        pendingAttachments: [],
        messages: [...session.messages, collisionMessage],
      }));
    } catch (error) {
      const fallback = buildCollisionResult(params.text, params.attachments, Date.now());

      updateSessionById(params.sessionId, (session) => ({
        ...session,
        stage: "awaiting-collision-action",
        status: makeLocaleText("已完成碰撞分析", "已完成碰撞分析"),
        updatedAt: Date.now(),
        latestCollision: fallback.analysis,
        latestReplacementItems: [],
        replacementSelection: {},
        latestReport: undefined,
        pendingText: "",
        pendingAttachments: [],
        messages: [...session.messages, fallback],
      }));
      notifyFallback(error);
    } finally {
      setBusyState((current) =>
        current?.sessionId === params.sessionId ? null : current,
      );
    }
  }

  async function runReportGeneration(params: {
    sessionId: string;
    vehicle: AssistantVehicle;
    analysis: AssistantCollisionAnalysis;
    replacementItems: AssistantReplacementItem[];
  }) {
    const progressMessage = createUiTextMessage(
      "assistant",
      makeLocaleText("系统正在生成初步定损报告，请稍候。", "系统正在生成初步定损报告，请稍候。"),
    );

    updateSessionById(params.sessionId, (session) => ({
      ...session,
      updatedAt: Date.now(),
      messages: [...session.messages, progressMessage],
    }));
    setBusyState({
      sessionId: params.sessionId,
      label: makeLocaleText("初步报告生成中", "初步报告生成中"),
    });

    try {
      const reportMessage = await generateAssistantReportMessage(
        {
          vehicle: params.vehicle,
          analysis: params.analysis,
          replacementItems: params.replacementItems,
        },
        Date.now(),
      );

      updateSessionById(params.sessionId, (session) => ({
        ...session,
        latestReport: reportMessage.report,
        status: makeLocaleText("已生成初步定损报告", "已生成初步定损报告"),
        updatedAt: Date.now(),
        messages: [...session.messages, reportMessage],
      }));
    } catch (error) {
      const fallback = buildReportMessage(params.vehicle, params.analysis, Date.now());

      updateSessionById(params.sessionId, (session) => ({
        ...session,
        latestReport: fallback.report,
        status: makeLocaleText("已生成初步定损报告", "已生成初步定损报告"),
        updatedAt: Date.now(),
        messages: [...session.messages, fallback],
      }));
      notifyFallback(error);
    } finally {
      setBusyState((current) =>
        current?.sessionId === params.sessionId ? null : current,
      );
    }
  }

  async function handleSend(
    overrides?: {
      text?: string;
      attachments?: AssistantAttachment[];
      preserveComposer?: boolean;
    },
  ) {
    if (!activeSession || activeIsBusy) {
      return;
    }
    const text = (overrides?.text ?? draftText).trim();
    const attachments = overrides?.attachments ?? draftAttachments;
    const shouldClearComposer = !overrides?.preserveComposer;
    if (!text && attachments.length === 0) {
      return;
    }
    const userMessage = createUiTextMessage("user", createUserSummary(text, attachments), attachments);
    const sessionId = activeSession.id;
    if (activeSession.stage === "awaiting-goal") {
      const detected = detectGoalFromText(text);
      if (!detected) {
        updateSessionById(sessionId, (session) => ({
          ...session,
          updatedAt: Date.now(),
          messages: [
            ...session.messages,
            userMessage,
            createUiTextMessage(
              "assistant",
              makeLocaleText(
                "请选择这是 EPC 查询、配件订购，还是事故分析。",
                "请选择这是 EPC 查询、配件订购，还是事故分析。",
              ),
            ),
          ],
        }));
        if (shouldClearComposer) {
          clearComposer();
        }
        return;
      }
      const nextSession = createSessionFromGoal(detected);
      nextSession.messages = [...nextSession.messages, userMessage];
      nextSession.pendingText = text;
      nextSession.pendingAttachments = attachments;
      nextSession.updatedAt = Date.now();
      if (nextSession.stage === "awaiting-vehicle") {
        const vehicle = findVehicleCandidate(text, attachments);
        if (vehicle) {
          nextSession.vehicle = vehicle;
          nextSession.stage = "awaiting-vehicle-confirm";
          nextSession.contextKey = makeLocaleText(
            vehicle.vin ?? vehicle.series["zh-CN"],
            vehicle.vin ?? vehicle.series["en-US"],
          );
          nextSession.status = makeLocaleText(
            "等待确认车型",
            "等待确认车型",
          );
          nextSession.title = makeLocaleText(
            `${vehicle.vin ?? vehicle.series["zh-CN"]} / ${goalLabel(detected, "zh-CN")}`,
            `${vehicle.vin ?? vehicle.series["en-US"]} / ${goalLabel(detected, "en-US")}`,
          );
          nextSession.messages = [
            ...nextSession.messages,
            createVehicleConfirmMessage(vehicle, Date.now()),
          ];
        }
      }
      prependSession(nextSession);
      if (shouldClearComposer) {
        clearComposer();
      }
      return;
    }
    if (
      activeSession.stage === "awaiting-vehicle" ||
      activeSession.stage === "awaiting-vehicle-confirm"
    ) {
      updateSessionById(sessionId, (session) => {
        const next: AssistantSession = {
          ...session,
          updatedAt: Date.now(),
          pendingText: text,
          pendingAttachments: attachments,
          messages: [...session.messages, userMessage],
        };
        const vehicle = findVehicleCandidate(text, attachments);
        if (!vehicle) {
          next.messages.push(
            createUiTextMessage(
              "assistant",
              makeLocaleText(
                "请输入 17 位 VIN，上传 VIN 图片，或直接描述车型信息。",
                "请输入 17 位 VIN，上传 VIN 图片，或直接描述车型信息。",
              ),
            ),
          );
          return next;
        }
        next.vehicle = vehicle;
        next.stage = "awaiting-vehicle-confirm";
        next.contextKey = makeLocaleText(
          vehicle.vin ?? vehicle.series["zh-CN"],
          vehicle.vin ?? vehicle.series["en-US"],
        );
        next.status = makeLocaleText(
          "等待确认车型",
          "等待确认车型",
        );
        next.title = makeLocaleText(
          `${vehicle.vin ?? vehicle.series["zh-CN"]} / ${goalLabel(session.flow, "zh-CN")}`,
          `${vehicle.vin ?? vehicle.series["en-US"]} / ${goalLabel(session.flow, "en-US")}`,
        );
        next.messages.push(createVehicleConfirmMessage(vehicle, Date.now()));
        return next;
      });
      if (shouldClearComposer) {
        clearComposer();
      }
      return;
    }
    if (activeSession.flow === "epc" && activeSession.stage === "awaiting-part-query") {
      updateSessionById(sessionId, (session) => {
        const epcMessage = buildEpcResult(text, Date.now());
        return {
          ...session,
          updatedAt: Date.now(),
          pendingText: "",
          pendingAttachments: [],
          latestEpcItems: epcMessage.items,
          status: makeLocaleText("已整理 EPC 建议", "已整理 EPC 建议"),
          messages: [
            ...session.messages,
            userMessage,
            epcMessage,
            createUiTextMessage(
              "assistant",
              makeLocaleText(
                "如果你想让我继续缩小范围，可以补充左右侧、安装位置、总成名称或用途。",
                "如果你想让我继续缩小范围，可以补充左右侧、安装位置、总成名称或用途。",
              ),
            ),
          ],
        };
      });
      if (shouldClearComposer) {
        clearComposer();
      }
      return;
    }
    if (activeSession.flow === "parts-order" && activeSession.stage === "awaiting-parts-append") {
      if (!hasPartsEvidence(text, attachments)) {
        updateSessionById(sessionId, (session) => ({
          ...session,
          updatedAt: Date.now(),
          pendingText: text,
          pendingAttachments: attachments,
          messages: [
            ...session.messages,
            userMessage,
            createUiTextMessage(
              "assistant",
              makeLocaleText(
                "我目前只有车型信息。请上传配件清单图片、文件，或直接粘贴清单文字，我再开始识别。",
                "我目前只有车型信息。请上传配件清单图片、文件，或直接粘贴清单文字，我再开始识别。",
              ),
            ),
          ],
        }));
        if (shouldClearComposer) {
          clearComposer();
        }
        return;
      }

      updateSessionById(sessionId, (session) => ({
        ...session,
        updatedAt: Date.now(),
        pendingText: text,
        pendingAttachments: attachments,
        messages: [...session.messages, userMessage],
      }));
      if (shouldClearComposer) {
        clearComposer();
      }
      await runPartsRecognition({
        sessionId,
        vehicle: activeSession.vehicle!,
        text,
        attachments,
        currentItems: activeSession.latestPartsItems,
      });
      return;
    }
    if (activeSession.flow === "collision" && activeSession.stage === "awaiting-collision-action") {
      if (!hasCollisionEvidence(text, attachments)) {
        updateSessionById(sessionId, (session) => ({
          ...session,
          updatedAt: Date.now(),
          pendingText: text,
          pendingAttachments: attachments,
          messages: [
            ...session.messages,
            userMessage,
            createUiTextMessage(
              "assistant",
              makeLocaleText(
                "我目前只有车型信息。请上传事故图片，或补充损伤描述，我再开始分析。",
                "我目前只有车型信息。请上传事故图片，或补充损伤描述，我再开始分析。",
              ),
            ),
          ],
        }));
        if (shouldClearComposer) {
          clearComposer();
        }
        return;
      }

      updateSessionById(sessionId, (session) => ({
        ...session,
        updatedAt: Date.now(),
        pendingText: text,
        pendingAttachments: attachments,
        messages: [...session.messages, userMessage],
      }));
      if (shouldClearComposer) {
        clearComposer();
      }
      await runCollisionAnalysis({
        sessionId,
        vehicle: activeSession.vehicle!,
        text,
        attachments,
        previousAnalysis: activeSession.latestCollision,
      });
      return;
    }
    updateSessionById(sessionId, (session) => ({
      ...session,
      updatedAt: Date.now(),
      pendingText: text,
      pendingAttachments: attachments,
      messages: [
        ...session.messages,
        userMessage,
        createUiTextMessage(
          "assistant",
          makeLocaleText(
            "我已经记录这条输入，你也可以继续使用下方卡片里的操作。",
            "我已经记录这条输入，你也可以继续使用下方卡片里的操作。",
          ),
        ),
      ],
    }));
    if (shouldClearComposer) {
      clearComposer();
    }
  }
  async function handleConfirmVehicle() {
    if (!activeSession?.vehicle || activeIsBusy) {
      return;
    }
    const sessionId = activeSession.id;
    if (activeSession.flow === "epc") {
      updateSessionById(sessionId, (session) => ({
        ...session,
        stage: "awaiting-part-query",
        status: makeLocaleText("等待配件描述", "等待配件描述"),
        updatedAt: Date.now(),
        messages: [
          ...session.messages,
          createUiTextMessage(
            "assistant",
            makeLocaleText(
              "车型已确认。请描述需要的配件和安装位置，例如前保险杠、前轮减震器。",
              "车型已确认。请描述需要的配件和安装位置，例如前保险杠、前轮减震器。",
            ),
          ),
        ],
      }));
      return;
    }
    if (activeSession.flow === "parts-order") {
      if (!hasStrongPartsEvidence(activeSession.pendingText, activeSession.pendingAttachments)) {
        updateSessionById(sessionId, (session) => ({
          ...session,
          stage: "awaiting-parts-append",
          status: makeLocaleText("等待配件清单", "等待配件清单"),
          updatedAt: Date.now(),
          latestPartsItems: [],
          partsSelection: {},
          pendingText: "",
          pendingAttachments: [],
          messages: [
            ...session.messages,
            createUiTextMessage(
              "assistant",
              makeLocaleText(
                "车型已确认。请上传配件清单图片、文件，或直接粘贴清单文字，我收到后就开始识别。",
                "车型已确认。请上传配件清单图片、文件，或直接粘贴清单文字，我收到后就开始识别。",
              ),
            ),
          ],
        }));
        return;
      }

      await runPartsRecognition({
        sessionId,
        vehicle: activeSession.vehicle,
        text: activeSession.pendingText,
        attachments: activeSession.pendingAttachments,
        currentItems: activeSession.latestPartsItems,
      });
      return;
    }
    if (activeSession.flow === "collision") {
      if (!hasStrongCollisionEvidence(activeSession.pendingText, activeSession.pendingAttachments)) {
        updateSessionById(sessionId, (session) => ({
          ...session,
          stage: "awaiting-collision-action",
          status: makeLocaleText("等待事故信息", "等待事故信息"),
          updatedAt: Date.now(),
          latestCollision: undefined,
          latestReplacementItems: [],
          replacementSelection: {},
          latestReport: undefined,
          pendingText: "",
          pendingAttachments: [],
          messages: [
            ...session.messages,
            createUiTextMessage(
              "assistant",
              makeLocaleText(
                "车型已确认。请上传事故图片，或补充损伤描述，我收到后就开始分析。",
                "车型已确认。请上传事故图片，或补充损伤描述，我收到后就开始分析。",
              ),
            ),
          ],
        }));
        return;
      }

      await runCollisionAnalysis({
        sessionId,
        vehicle: activeSession.vehicle,
        text: activeSession.pendingText,
        attachments: activeSession.pendingAttachments,
        previousAnalysis: activeSession.latestCollision,
      });
    }
  }
  function handleResetVehicle() {
    if (activeIsBusy) {
      return;
    }
    updateActiveSession((session) => ({
      ...session,
      vehicle: undefined,
      stage: "awaiting-vehicle",
      status: makeLocaleText("等待车辆信息", "等待车辆信息"),
      contextKey: makeLocaleText("请重新输入 VIN 或车型", "请重新输入 VIN 或车型"),
      updatedAt: Date.now(),
      messages: [
        ...session.messages,
        createUiTextMessage(
          "assistant",
          makeLocaleText(
            "请重新输入 VIN 或车型，我会重新识别。",
            "请重新输入 VIN 或车型，我会重新识别。",
          ),
        ),
      ],
    }));
  }
  function updateSelection(
    type: "parts" | "replacement",
    lineId: string,
    patch: Partial<{ selected: boolean; quantity: number }>,
  ) {
    updateActiveSession((session) => {
      const map = type === "parts" ? session.partsSelection : session.replacementSelection;
      const nextMap = {
        ...map,
        [lineId]: {
          selected: patch.selected ?? map[lineId]?.selected ?? true,
          quantity: Math.max(1, patch.quantity ?? map[lineId]?.quantity ?? 1),
        },
      };

      return type === "parts"
        ? { ...session, partsSelection: nextMap, updatedAt: Date.now() }
        : { ...session, replacementSelection: nextMap, updatedAt: Date.now() };
    });
  }

  function addSelectedToCart(type: "parts" | "replacement") {
    if (!activeSession?.vehicle) {
      return;
    }

    const items =
      type === "parts" ? activeSession.latestPartsItems : activeSession.latestReplacementItems;
    const selection =
      type === "parts" ? activeSession.partsSelection : activeSession.replacementSelection;
    const selected = items.filter((item) => selection[item.id]?.selected);

    if (selected.length === 0) {
      setFeedback(makeLocaleText("请至少选择一条配件。", "请至少选择一条配件。"));
      return;
    }

    selected.forEach((item) => {
      onAddToCart(
        createCartLineFromPartsItem(
          item,
          activeSession.vehicle!,
          selection[item.id]?.quantity ?? item.quantity,
          type === "parts"
            ? assistantText("AI 助手 / 配件清单", "AI 助手 / 配件清单")
            : assistantText("AI 助手 / 换件建议", "AI 助手 / 换件建议"),
        ),
      );
    });

    setFeedback(
      makeLocaleText(
        `已将 ${selected.length} 条记录加入购物车。`,
        `已将 ${selected.length} 条记录加入购物车。`,
      ),
    );
  }

  function handleGenerateReplacement() {
    if (!activeSession?.latestCollision || activeIsBusy) {
      return;
    }

    const replacementMessage = buildReplacementMessage(activeSession.latestCollision, Date.now());
    updateActiveSession((session) => ({
      ...session,
      latestReplacementItems: replacementMessage.items,
      replacementSelection: createSelectionMap(replacementMessage.items),
      status: makeLocaleText("已生成换件清单", "已生成换件清单"),
      updatedAt: Date.now(),
      messages: [...session.messages, replacementMessage],
    }));
  }

  async function handleGenerateReport() {
    if (!activeSession?.latestCollision || !activeSession.vehicle || activeIsBusy) {
      return;
    }

    await runReportGeneration({
      sessionId: activeSession.id,
      vehicle: activeSession.vehicle,
      analysis: activeSession.latestCollision,
      replacementItems: activeSession.latestReplacementItems,
    });
  }

  function handleOpenReport(report: AssistantReport) {
    const html = resolveReportHtml(report);

    if (html) {
      try {
        const blob = new Blob([html], { type: "text/html;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const nextWindow = window.open(url, "_blank");

        if (!nextWindow) {
          URL.revokeObjectURL(url);
          setFeedback(
            makeLocaleText(
              "新标签页被浏览器拦截了，请允许弹窗后重试。",
              "新标签页被浏览器拦截了，请允许弹窗后重试。",
            ),
          );
          return;
        }

        window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
        return;
      } catch {
        const nextWindow = window.open("", "_blank");

        if (!nextWindow) {
          setFeedback(
            makeLocaleText(
              "新标签页被浏览器拦截了，请允许弹窗后重试。",
              "新标签页被浏览器拦截了，请允许弹窗后重试。",
            ),
          );
          return;
        }

        nextWindow.document.open();
        nextWindow.document.write(html);
        nextWindow.document.close();
        return;
      }
    }

    if (report.url) {
      const nextWindow = window.open(report.url, "_blank");

      if (!nextWindow) {
        setFeedback(
          makeLocaleText(
            "新标签页被浏览器拦截了，请允许弹窗后重试。",
            "新标签页被浏览器拦截了，请允许弹窗后重试。",
          ),
        );
      }
      return;
    }

    setFeedback(
      makeLocaleText(
        "报告内容还未生成成功，请重新生成一次初步报告。",
        "报告内容还未生成成功，请重新生成一次初步报告。",
      ),
    );
  }

  function handleAddEpcItem(item: AssistantEpcItem) {
    if (!activeSession?.vehicle) {
      return;
    }

    onAddToCart(createCartLineFromEpcItem(item, activeSession.vehicle));
    setFeedback(makeLocaleText("配件已加入购物车。", "配件已加入购物车。"));
  }

  function startGoal(goalId: AssistantFlow) {
    if (goalId === "welcome") {
      prependSession(createWelcomeSession());
      return;
    }

    prependSession(createSessionFromGoal(goalId));
  }

  function startFreshConversation() {
    prependSession(createWelcomeSession());
  }

  function getHistoryType(session: AssistantSession) {
    if (session.flow === "welcome") {
      return makeText(locale, "新会话", "New conversation");
    }

    return goalLabel(session.flow, locale);
  }

  function getHistoryVin(session: AssistantSession) {
    return (
      session.vehicle?.vin ??
      session.contextKey[locale] ??
      makeText(locale, "等待 VIN 或车型", "Waiting for VIN or vehicle")
    );
  }

  function handleDeleteSession(sessionId: string) {
    setSessions((current) => {
      const filtered = current.filter((session) => session.id !== sessionId);

      if (filtered.length > 0) {
        return filtered;
      }

      const fresh = createWelcomeSession();
      setActiveSessionId(fresh.id);
      return [fresh];
    });
  }

  async function handleQuickPrompt(prompt: string) {
    setDraftText(prompt);
    await handleSend({
      text: prompt,
      attachments: draftAttachments,
    });
  }

  function renderRowControls(
    type: "parts" | "replacement",
    item: AssistantPartsItem | AssistantReplacementItem,
  ) {
    const selection =
      type === "parts" ? activeSession.partsSelection : activeSession.replacementSelection;
    const current = selection[item.id] ?? { selected: true, quantity: item.quantity };

    return (
      <div className="assistant-line-actions">
        <label className="assistant-check">
          <input
            type="checkbox"
            checked={current.selected}
            onChange={(event) =>
              updateSelection(type, item.id, { selected: event.target.checked })
            }
          />
          <span>{makeText(locale, "选择", "Select")}</span>
        </label>
        <div className="assistant-stepper">
          <button
            type="button"
            onClick={() => updateSelection(type, item.id, { quantity: current.quantity - 1 })}
          >
            -
          </button>
          <strong>{current.quantity}</strong>
          <button
            type="button"
            onClick={() => updateSelection(type, item.id, { quantity: current.quantity + 1 })}
          >
            +
          </button>
        </div>
      </div>
    );
  }

  function renderMessage(message: AssistantMessage) {
    if (message.kind === "text") {
      return (
        <article
          key={message.id}
          className={`assistant-message ${message.role === "user" ? "is-user" : ""}`}
        >
          {message.role === "assistant" ? <Bot size={16} /> : null}
          <div>
            <p>{message.body[locale]}</p>
            {message.attachments?.length ? (
              <div className="assistant-attachment-list">
                {message.attachments.map((item) => (
                  <span key={item.id} className="assistant-attachment-pill">
                    <Paperclip size={12} />
                    {item.name}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </article>
      );
    }

    if (message.kind === "goal-picker") {
      return (
        <section key={message.id} className="assistant-card assistant-goal-grid">
          {assistantGoals.map((goal) => (
            <button
              key={goal.id}
              type="button"
              className="assistant-goal-card"
              onClick={() => startGoal(goal.id)}
            >
              <strong>{goal.label[locale]}</strong>
              <span>{goal.description[locale]}</span>
            </button>
          ))}
        </section>
      );
    }

    if (message.kind === "vehicle-confirm") {
      return (
        <section key={message.id} className="assistant-card assistant-vehicle-card">
          <div className="assistant-card-head">
            <div>
              <p className="section-kicker">{makeText(locale, "车型确认", "Vehicle confirmation")}</p>
              <h3>{`${message.vehicle.brand[locale]} / ${message.vehicle.series[locale]} / ${message.vehicle.year} / ${message.vehicle.model[locale]}`}</h3>
            </div>
            <span className="status-pill">{message.vehicle.vin ?? message.vehicle.vehicleId}</span>
          </div>
          <div className="assistant-fact-grid">
            <div><span>VIN</span><strong>{message.vehicle.vin ?? "-"}</strong></div>
            <div><span>{makeText(locale, "动力", "Powertrain")}</span><strong>{message.vehicle.engine[locale]}</strong></div>
            <div><span>{makeText(locale, "驱动", "Drive")}</span><strong>{message.vehicle.drivetrain[locale]}</strong></div>
            <div><span>{makeText(locale, "市场", "Market")}</span><strong>{message.vehicle.market[locale]}</strong></div>
          </div>
          <p className="assistant-card-note">{message.hint[locale]}</p>
          {activeSession?.stage === "awaiting-vehicle-confirm" ? (
            <div className="assistant-card-actions">
              <button
                type="button"
                className="secondary-action"
                onClick={() => navigate(resolveVehiclePreviewLink(activeSession))}
                disabled={activeIsBusy}
              >
                <ArrowUpRight size={14} />
                {makeText(locale, "预览 EPC", "Preview EPC")}
              </button>
              <button type="button" className="secondary-action" onClick={handleResetVehicle} disabled={activeIsBusy}>{makeText(locale, "重新输入", "Re-enter")}</button>
              <button type="button" className="primary-action" onClick={() => void handleConfirmVehicle()} disabled={activeIsBusy}>{makeText(locale, "确认车型", "Confirm")}</button>
            </div>
          ) : null}
        </section>
      );
    }

    if (message.kind === "epc-result") {
      return (
        <section key={message.id} className="assistant-card">
          <div className="assistant-card-head">
            <div>
              <p className="section-kicker">{makeText(locale, "EPC 结果", "EPC result")}</p>
              <h3>{message.query[locale]}</h3>
            </div>
            <Search size={18} />
          </div>
          <div className="assistant-list">
            {message.items.map((item) => (
              <article key={item.id} className="assistant-line-card">
                <div>
                  <strong>{item.name[locale]}</strong>
                  <p>{item.sku}</p>
                  <span>{`${item.diagramCode} / ${item.diagramName[locale]} / ${item.location[locale]}`}</span>
                </div>
                <div className="assistant-card-actions">
                  <button
                    type="button"
                    className="secondary-action"
                    onClick={() =>
                      navigate(
                        resolveAssistantEpcLink(
                          item,
                          locale,
                          activeSession?.vehicle?.brand[locale],
                          activeSession?.vehicle?.vin,
                        ),
                      )
                    }
                  >
                    <ArrowUpRight size={14} />
                    {makeText(locale, "查看图例", "Open EPC")}
                  </button>
                  <button type="button" className="primary-action" onClick={() => handleAddEpcItem(item)}>
                    <ShoppingCart size={14} />
                    {makeText(locale, "加入购物车", "Add to cart")}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      );
    }

    if (message.kind === "parts-result" || message.kind === "replacement-list") {
      const title =
        message.kind === "parts-result"
          ? makeText(locale, "配件清单", "Parts list")
          : makeText(locale, "换件清单", "Replacement list");
      const items = message.items;

      return (
        <section key={message.id} className="assistant-card">
          <div className="assistant-card-head">
            <div>
              <p className="section-kicker">{title}</p>
              <h3>
                {message.kind === "parts-result"
                  ? message.summary[locale]
                  : makeText(locale, "已根据碰撞结果生成换件候选项。", "Replacement candidates were generated from the collision result.")}
              </h3>
            </div>
            {message.kind === "parts-result" ? <ClipboardList size={18} /> : <Wrench size={18} />}
          </div>
          <div className="assistant-table">
            {items.map((item) => (
              <article key={item.id} className="assistant-table-row">
                <label className="assistant-check assistant-check-left">
                  <input
                    type="checkbox"
                    checked={
                      (message.kind === "parts-result"
                        ? activeSession.partsSelection
                        : activeSession.replacementSelection)[item.id]?.selected ?? true
                    }
                    onChange={(event) =>
                      updateSelection(
                        message.kind === "parts-result" ? "parts" : "replacement",
                        item.id,
                        { selected: event.target.checked },
                      )
                    }
                  />
                </label>
                <div className="assistant-table-main">
                  <strong>{`${item.index}. ${item.name[locale]}`}</strong>
                  <p>{item.sku}</p>
                  <span>{"note" in item ? item.note[locale] : item.advice[locale]}</span>
                </div>
                <div className="assistant-line-actions assistant-line-actions-right">
                  <div className="assistant-stepper">
                    <button
                      type="button"
                      onClick={() =>
                        updateSelection(
                          message.kind === "parts-result" ? "parts" : "replacement",
                          item.id,
                          {
                            quantity:
                              ((message.kind === "parts-result"
                                ? activeSession.partsSelection
                                : activeSession.replacementSelection)[item.id]?.quantity ?? item.quantity) - 1,
                          },
                        )
                      }
                    >
                      -
                    </button>
                    <strong>
                      {(message.kind === "parts-result"
                        ? activeSession.partsSelection
                        : activeSession.replacementSelection)[item.id]?.quantity ?? item.quantity}
                    </strong>
                    <button
                      type="button"
                      onClick={() =>
                        updateSelection(
                          message.kind === "parts-result" ? "parts" : "replacement",
                          item.id,
                          {
                            quantity:
                              ((message.kind === "parts-result"
                                ? activeSession.partsSelection
                                : activeSession.replacementSelection)[item.id]?.quantity ?? item.quantity) + 1,
                          },
                        )
                      }
                    >
                      +
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="assistant-card-actions">
            <button
              type="button"
              className="primary-action"
              onClick={() => addSelectedToCart(message.kind === "parts-result" ? "parts" : "replacement")}
            >
              <ShoppingCart size={14} />
              {makeText(locale, "加入购物车", "Add selected")}
            </button>
            <button type="button" className="secondary-action is-disabled" disabled>
              {makeText(locale, "发起询价（待开发）", "Quote next")}
            </button>
          </div>
        </section>
      );
    }

    if (message.kind === "collision-result") {
      const analysis = message.analysis;

      return (
        <section key={message.id} className="assistant-card">
          <div className="assistant-card-head">
            <div>
              <p className="section-kicker">{makeText(locale, "碰撞分析", "Collision analysis")}</p>
              <h3>{analysis.impactZone[locale]}</h3>
            </div>
            <TriangleAlert size={18} />
          </div>
          <p className="assistant-card-note">{analysis.summary[locale]}</p>
          <div className="assistant-analysis-grid">
            <div><span>{makeText(locale, "可见损伤", "Visible damage")}</span><strong>{analysis.visibleDamageParts.map((item) => item[locale]).join("、")}</strong></div>
            <div><span>{makeText(locale, "可能损伤", "Possible damage")}</span><strong>{analysis.possibleDamageParts.map((item) => item[locale]).join("、")}</strong></div>
            <div><span>{makeText(locale, "建议检查", "Inspection")}</span><strong>{analysis.inspectionItems.map((item) => item[locale]).join("、")}</strong></div>
            <div><span>{makeText(locale, "置信度", "Confidence")}</span><strong>{`${Math.round(analysis.confidence * 100)}% / ¥${analysis.riskEstimate.toLocaleString(locale === "zh-CN" ? "zh-CN" : "en-US")}`}</strong></div>
          </div>
          <div className="assistant-card-actions">
            <button type="button" className="primary-action" onClick={handleGenerateReplacement} disabled={activeIsBusy}>{makeText(locale, "生成换件清单", "Generate parts list")}</button>
            <button type="button" className="secondary-action" onClick={() => void handleGenerateReport()} disabled={activeIsBusy}>{makeText(locale, "生成初步报告", "Generate report")}</button>
          </div>
        </section>
      );
    }

    if (message.kind === "report") {
      return (
        <section key={message.id} className="assistant-card">
          <div className="assistant-card-head">
            <div>
              <p className="section-kicker">{makeText(locale, "报告已生成", "Report ready")}</p>
              <h3>{message.report.title[locale]}</h3>
            </div>
            <FileText size={18} />
          </div>
          <p className="assistant-card-note">{message.report.summary[locale]}</p>
          <div className="assistant-card-actions">
            <button
              type="button"
              className="primary-action"
              onClick={() => handleOpenReport(message.report)}
            >
              <ArrowUpRight size={14} />
              {makeText(locale, "新标签页打开", "Open in new tab")}
            </button>
          </div>
        </section>
      );
    }

    return (
      <section key={message.id} className="assistant-card">
        <div className="assistant-card-head">
          <div>
            <p className="section-kicker">{makeText(locale, "下一步建议", "Suggested next steps")}</p>
            <h3>{makeText(locale, "当前请求暂未接入标准流程", "This request is not on a standard flow yet")}</h3>
          </div>
          <Sparkles size={18} />
        </div>
        <ul className="detail-list compact assistant-tip-list">
          {message.tips.map((tip) => (
            <li key={tip[locale]}>{tip[locale]}</li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <aside className={`side-drawer assistant-drawer ${isOpen ? "is-open" : ""}`} aria-hidden={!isOpen}>
      <div className="assistant-drawer-layout">
        <div className="assistant-rail">
          <div className="drawer-head">
            <div>
              <h2>{copy.assistant.title}</h2>
            </div>
            <button type="button" className="icon-button" onClick={onClose} aria-label="close assistant">
              <X size={18} />
            </button>
          </div>
          <p className="drawer-description">{copy.assistant.description}</p>
          <button type="button" className="secondary-action assistant-new-button" onClick={startFreshConversation}>
            <MessageSquarePlus size={16} />
            {makeText(locale, "新建会话", "New conversation")}
          </button>
          <section className="drawer-section">
            <p className="drawer-label">{makeText(locale, "快捷入口", "Quick entry")}</p>
            <div className="prompt-list">
              {assistantGoals.slice(0, 3).map((goal) => (
                <button key={goal.id} type="button" className="prompt-chip" onClick={() => startGoal(goal.id)}>
                  <Sparkles size={15} />
                  {goal.label[locale]}
                </button>
              ))}
            </div>
          </section>
          <section className="drawer-section assistant-history">
            <p className="drawer-label">{makeText(locale, "会话历史", "Conversation history")}</p>
            <div className="assistant-history-list">
              {orderedSessions.map((session) => (
                <article
                  key={session.id}
                  className={`assistant-history-card ${session.id === activeSession?.id ? "is-active" : ""}`}
                >
                  <button
                    type="button"
                    className="assistant-history-main"
                    onClick={() => setActiveSessionId(session.id)}
                  >
                    <strong>{getHistoryType(session)}</strong>
                    <span>{getHistoryVin(session)}</span>
                    <small>{formatRelativeTime(locale, session.updatedAt)}</small>
                  </button>
                  <button
                    type="button"
                    className="assistant-history-delete"
                    aria-label={makeText(locale, "删除会话", "Delete conversation")}
                    onClick={() => handleDeleteSession(session.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </article>
              ))}
            </div>
          </section>
        </div>

        <div className="assistant-main">
          <div className="assistant-main-head">
            <div>
              <p className="section-kicker">{activeSession?.status[locale] ?? copy.assistant.feedTitle}</p>
              <h3>{activeSession?.title[locale] ?? copy.assistant.title}</h3>
            </div>
            {activeBusyLabel ? (
              <span className="assistant-toast is-busy"><LoaderCircle size={14} className="assistant-spinner" />{activeBusyLabel[locale]}</span>
            ) : feedback ? <span className="assistant-toast"><Check size={14} />{feedback[locale]}</span> : null}
          </div>
          <div ref={threadRef} className="assistant-thread">
            {activeSession?.messages.map((message) => renderMessage(message))}
          </div>
          <div className="assistant-composer" aria-busy={activeIsBusy}>
            <div className="assistant-quick-texts assistant-quick-texts-inline">
              {copy.assistant.quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className="assistant-quick-prompt"
                  onClick={() => void handleQuickPrompt(prompt)}
                  disabled={activeIsBusy}
                >
                  {prompt}
                </button>
              ))}
            </div>
            <div className="assistant-composer-head">
              <span>{isArkConfigured() ? makeText(locale, "支持文字、图片和文件输入；已配置 Ark，如鉴权失败会自动回退演示结果", "Supports text, images, and files; falls back to demo data if Ark authentication fails") : makeText(locale, "支持文字、图片和文件输入；未配置模型时会自动回退演示结果", "Supports text, images, and files; falls back to demo data when the model is not configured")}</span>
            </div>
            {draftAttachments.length ? (
              <div className="assistant-attachment-list">
                {draftAttachments.map((item) => (
                  <button key={item.id} type="button" className="assistant-attachment-pill" onClick={() => setDraftAttachments((current) => current.filter((entry) => entry.id !== item.id))} disabled={activeIsBusy}>
                    <Paperclip size={12} />
                    {item.name}
                    <X size={12} />
                  </button>
                ))}
              </div>
            ) : null}
            <div className="assistant-composer-row">
              <textarea
                ref={textareaRef}
                className="assistant-input"
                rows={1}
                value={draftText}
                disabled={activeIsBusy}
                placeholder={makeText(locale, "输入 VIN、车型、配件描述，或直接粘贴图片/文件", "Type a VIN, vehicle, or part request, or paste images/files")}
                onChange={(event) => setDraftText(event.target.value)}
                onPaste={(event) => {
                  if (event.clipboardData.files.length > 0) {
                    event.preventDefault();
                    void handleFiles(event.clipboardData.files, "paste");
                  }
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void handleSend();
                  }
                }}
              />
              <button
                type="button"
                className="toolbar-ghost assistant-attach-button"
                onClick={() => fileInputRef.current?.click()}
                disabled={activeIsBusy}
                aria-label={makeText(locale, "添加附件", "添加附件")}
              >
                <Upload size={16} />
              </button>
              <button
                type="button"
                className="primary-action assistant-send-button"
                onClick={() => void handleSend()}
                disabled={activeIsBusy}
                aria-label={makeText(locale, "发送消息", "Send message")}
              >
                <SendHorizontal size={16} />
              </button>
            </div>
            <input ref={fileInputRef} type="file" hidden multiple onChange={(event) => { void handleFiles(event.target.files, "picker"); event.target.value = ""; }} />
          </div>
        </div>
      </div>
    </aside>
  );
}



