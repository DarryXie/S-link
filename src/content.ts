export type Locale = "zh-CN" | "en-US";
export type AccentTheme = "steel" | "copper" | "teal";
export type PanelName = "assistant" | "cart" | null;

export const localeOptions = [
  { value: "zh-CN", label: "简体中文" },
  { value: "en-US", label: "English" },
] as const;

export const accentOptions = [
  { value: "steel", dot: "var(--swatch-steel)" },
  { value: "copper", dot: "var(--swatch-copper)" },
  { value: "teal", dot: "var(--swatch-teal)" },
] as const;

export const appMessages = {
  "zh-CN": {
    brand: {
      name: "Servision 配件互联",
      railLabel: "S-Link",
      strapline: "汽车后市场数字工作台",
      systemStatus: "首期前端框架已就绪",
    },
    nav: {
      dashboard: "总览",
      epc: "EPC",
      orders: "配件订购",
    },
    header: {
      language: "语言",
      theme: "主题色",
      assistant: "AI 助手",
      cart: "购物车",
      profileRole: "采购平台主管",
      profileOrg: "华东区域服务运营",
      logout: "退出登录",
    },
    themes: {
      steel: "钢蓝",
      copper: "铜棕",
      teal: "青釉",
    },
    common: {
      underConstruction: "待开发",
      openNow: "进入模块",
      globallyAvailable: "全局可用",
      buildReady: "可继续扩展",
      records: "条记录",
    },
    dashboard: {
      eyebrow: "Aftermarket Control Tower",
      title: "把 EPC、配件订购与智能协同收拢到同一张工作台。",
      description:
        "围绕后市场采购与运营用户的高频工作，先交付一套可扩展的主框架和交互底座，让 EPC、订单和 AI 助手沿着统一界面继续演进。",
      primaryAction: "查看 EPC",
      secondaryAction: "唤起 AI 助手",
      moduleHeading: "核心模块入口",
      moduleSubheading: "先把可浏览的业务骨架搭起来，再逐步接入真实业务能力。",
      modules: [
        {
          slug: "epc",
          title: "电子配件目录",
          description: "承接 VIN、图例、配件分组与目录检索能力。",
          meta: "目录骨架 / 搜索预留 / 可继续扩展",
        },
        {
          slug: "orders",
          title: "配件订购",
          description: "承接订单列表、询价、协同审批与购物车流程。",
          meta: "列表母版 / 交易入口 / 工作流预留",
        },
      ],
      signalsHeading: "当前交付边界",
      signals: [
        "已经建立统一主框架、全局抽屉与响应式布局。",
        "已经预留多语言、主题色和业务模块入口扩展位。",
        "已经为后续 EPC、订单和 AI 助手接入真实流程打好底座。",
      ],
      rolloutHeading: "建议推进顺序",
      rollout: [
        "先补齐 EPC 的检索、分组树和图例联动。",
        "再细化配件订购列表、明细与购物车结算。",
        "最后把 AI 助手与业务接口、识别能力联调。",
      ],
    },
    epc: {
      title: "EPC 模块",
      description: "当前为 EPC 占位页面，预留检索、分组和结果区域。",
      label: "电子配件目录",
      searchPlaceholder: "输入 VIN / 配件名称 / 图号",
      panels: [
        "VIN 检索与车辆识别",
        "总成分组树与图例导航",
        "配件明细与替代件关系",
      ],
      tips: [
        "建议优先补充 VIN 解码、车型过滤与替代链路。",
        "图例与列表联动应作为 EPC 的核心体验。",
      ],
    },
    orders: {
      title: "配件订购",
      description: "当前为订单列表骨架页，保留筛选、状态与明细联动区域。",
      label: "订单列表",
      filters: ["全部订单", "待确认", "待发货", "异常处理"],
      emptyTitle: "业务流程尚未接入",
      emptyDescription: "当前保留列表头部、筛选区和协作提示，后续可直接接入真实订单数据。",
    },
    assistant: {
      title: "AI 智能助手",
      description: "面向 EPC、配件订购与事故分析的全局业务助手。",
      quickPromptsTitle: "快捷问题",
      quickPrompts: [
        "帮我查找某个 VIN 对应的车型",
        "识别配件清单并生成购物车",
        "分析事故车并生成换件建议",
      ],
      briefTitle: "当前建议",
      briefBody: "先以 VIN 与车型为会话主键，把 EPC、订购和碰撞分析三条主流程串起来。",
      feedTitle: "面板状态",
      feed: [
        "支持全局入口、会话历史和卡片式确认流。",
        "当前使用模拟数据演示，方便后续接入火山引擎与业务接口。",
      ],
    },
    cart: {
      title: "购物车",
      description: "汇总待下单配件，并为询价与下单做准备。",
      summaryTitle: "结算摘要",
      summaryNote: "当前金额与条目为演示数据，用于承载后续真实购物车逻辑。",
      checkout: "继续结算",
      continueBrowsing: "继续浏览",
    },
  },
  "en-US": {
    brand: {
      name: "Servision Parts Connect",
      railLabel: "S-Link",
      strapline: "Aftermarket Operations Console",
      systemStatus: "Phase-one frontend shell is ready",
    },
    nav: {
      dashboard: "Overview",
      epc: "EPC",
      orders: "Parts Orders",
    },
    header: {
      language: "Language",
      theme: "Accent",
      assistant: "AI Assistant",
      cart: "Cart",
      profileRole: "Procurement Supervisor",
      profileOrg: "East Region Service Ops",
      logout: "Sign out",
    },
    themes: {
      steel: "Steel",
      copper: "Copper",
      teal: "Teal",
    },
    common: {
      underConstruction: "Coming next",
      openNow: "Open module",
      globallyAvailable: "Global panel",
      buildReady: "Ready to extend",
      records: "records",
    },
    dashboard: {
      eyebrow: "Aftermarket Control Tower",
      title: "Bring EPC, parts ordering, and intelligent coordination into one operating surface.",
      description:
        "This phase delivers a scalable shell for aftermarket buyers and operators, so EPC, ordering flows, and the AI assistant can evolve within one consistent interface.",
      primaryAction: "Open EPC",
      secondaryAction: "Launch AI Assistant",
      moduleHeading: "Core module entry points",
      moduleSubheading: "Build the browsable business skeleton first, then connect live workflows.",
      modules: [
        {
          slug: "epc",
          title: "Electronic Parts Catalog",
          description: "Home for VIN lookup, diagrams, grouping logic, and structured catalog browsing.",
          meta: "Catalog shell / search-ready layout / extendable",
        },
        {
          slug: "orders",
          title: "Parts Ordering",
          description: "Home for order lists, quotations, approvals, and cart handoff.",
          meta: "List shell / trade entry / workflow-ready",
        },
      ],
      signalsHeading: "What is included now",
      signals: [
        "A shared application shell, global drawers, and responsive layout.",
        "Language, accent theme, and business module entry points prepared for extension.",
        "A stable foundation for EPC, ordering, and assistant workflow integration.",
      ],
      rolloutHeading: "Recommended next sequence",
      rollout: [
        "Define EPC search, group tree, and diagram interactions first.",
        "Then detail the parts-order list, record detail, and checkout flow.",
        "Finally connect the AI assistant to live services and recognition models.",
      ],
    },
    epc: {
      title: "EPC Module",
      description: "This is a placeholder shell with future search, grouping, and result zones reserved.",
      label: "Electronic Parts Catalog",
      searchPlaceholder: "Search by VIN / part name / diagram number",
      panels: [
        "VIN lookup and vehicle recognition",
        "Assembly tree and diagram navigation",
        "Part details and replacement relationships",
      ],
      tips: [
        "Next step: add VIN decoding, vehicle filters, and replacement chains.",
        "Diagram-to-list linkage should become a core EPC interaction.",
      ],
    },
    orders: {
      title: "Parts Ordering",
      description: "This is the order-list shell with filters, statuses, and detail regions reserved.",
      label: "Order List",
      filters: ["All Orders", "Awaiting Review", "Ready to Ship", "Exceptions"],
      emptyTitle: "Business workflow not connected yet",
      emptyDescription: "The current screen preserves headers, filters, and collaboration cues for later live data integration.",
    },
    assistant: {
      title: "AI Assistant",
      description: "A global business assistant for EPC, parts ordering, and accident analysis.",
      quickPromptsTitle: "Quick prompts",
      quickPrompts: [
        "Look up a vehicle from VIN",
        "Recognize a parts list and build a cart",
        "Analyze accident damage and propose replacement parts",
      ],
      briefTitle: "Current recommendation",
      briefBody: "Use VIN and vehicle context as the conversation key so EPC, ordering, and analysis stay connected.",
      feedTitle: "Panel status",
      feed: [
        "Supports a global entry, conversation history, and card-based confirmation flow.",
        "Currently powered by mock data for future service integration.",
      ],
    },
    cart: {
      title: "Cart",
      description: "Stage parts for quotation and order creation.",
      summaryTitle: "Settlement summary",
      summaryNote: "Totals and line items are demo data intended to hold future cart logic.",
      checkout: "Proceed to checkout",
      continueBrowsing: "Continue browsing",
    },
  },
} as const;

export type Copy = (typeof appMessages)[keyof typeof appMessages];

export const cartItems = [
  {
    id: "axle-kit",
    sku: "SL-AX-2048",
    quantity: 1,
    unitPrice: 1280,
    name: {
      "zh-CN": "前桥维修包",
      "en-US": "Front Axle Repair Kit",
    },
    description: {
      "zh-CN": "适配售后维修场景的组合件示例",
      "en-US": "Example bundled item for aftermarket service",
    },
  },
  {
    id: "filter",
    sku: "SL-FL-1086",
    quantity: 2,
    unitPrice: 165,
    name: {
      "zh-CN": "高效机油滤芯",
      "en-US": "High-Efficiency Oil Filter",
    },
    description: {
      "zh-CN": "用于演示订单汇总与价格计算",
      "en-US": "Used to demonstrate order aggregation and pricing",
    },
  },
  {
    id: "sensor",
    sku: "SL-SN-5521",
    quantity: 1,
    unitPrice: 460,
    name: {
      "zh-CN": "温度传感器总成",
      "en-US": "Temperature Sensor Assembly",
    },
    description: {
      "zh-CN": "预留给后续真实购物车逻辑",
      "en-US": "Reserved for future live cart logic",
    },
  },
] as const;
