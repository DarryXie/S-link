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
      name: "Servision配件互联",
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
      teal: "青钛",
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
        "围绕后市场买方用户的高频工作，先交付一套可扩展的主框架与交互母版，让后续 EPC、订单和业务规则都能沿着统一界面体系继续开发。",
      primaryAction: "查看 EPC 占位页",
      secondaryAction: "唤起 AI 助手",
      moduleHeading: "核心模块入口",
      moduleSubheading: "模块先按目录解耦，页面先提供真实可浏览的 UI 壳层。",
      modules: [
        {
          slug: "epc",
          title: "电子配件目录",
          description: "承接 VIN、图解、配件分组与目录检索。",
          meta: "目录骨架 / 占位态 / 后续可扩展搜索",
        },
        {
          slug: "orders",
          title: "配件订购",
          description: "承接订单列表、筛选、协同审批和购物车流程。",
          meta: "列表母版 / 占位态 / 可演进工作流",
        },
      ],
      signalsHeading: "当前交付边界",
      signals: [
        "已建立统一主框架、全局抽屉与响应式布局。",
        "已预留多语言、主题色与业务模块入口扩展位。",
        "已为每个模块补充 Markdown 需求模板，方便后续分线程细化。",
      ],
      rolloutHeading: "建议的后续推进顺序",
      rollout: [
        "先补 EPC 的检索、分组树与图解交互需求。",
        "再细化配件订购列表、明细与结算流程。",
        "最后接入 AI 助手与购物车的真实业务数据。",
      ],
    },
    epc: {
      title: "EPC 模块",
      description: "当前为 UI 骨架页，保留检索、分类和结果区位置。",
      label: "电子配件目录",
      searchPlaceholder: "输入 VIN / 配件名称 / 图号",
      panels: [
        "VIN 检索与车辆识别",
        "总成分组树与图解导航",
        "配件明细与替换件关系",
      ],
      tips: [
        "建议后续补充 VIN 解码、车型过滤与配件替换链路。",
        "建议把图解与列表联动作为 EPC 的核心体验能力。",
      ],
    },
    orders: {
      title: "配件订购",
      description: "当前为订单列表骨架页，保留筛选、状态与明细联动区域。",
      label: "订单列表",
      filters: ["全部订单", "待确认", "待发运", "异常处理"],
      emptyTitle: "业务流程尚未接入",
      emptyDescription: "当前先保留表头、筛选区与协作提示，后续可直接接入真实订单数据。",
    },
    assistant: {
      title: "AI 智能助手",
      description: "全局侧滑面板，支持目录问答、采购协助与规则解释。",
      quickPromptsTitle: "快捷问题",
      quickPrompts: [
        "帮我解释 EPC 与订单模块的职责边界",
        "梳理后续最应该优先补齐的业务能力",
        "给采购用户一份今日待办建议",
      ],
      briefTitle: "当前建议",
      briefBody:
        "先把 EPC 与订单列表的数据结构定下来，再接入真实服务端接口，能显著降低后续返工概率。",
      feedTitle: "面板状态",
      feed: [
        "全局入口已接入 Header，可从任意页面唤起。",
        "当前示例回答为静态内容，等待业务能力接入。",
      ],
    },
    cart: {
      title: "购物车",
      description: "全局抽屉，用于汇总待下单配件并准备结算。",
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
        "This phase delivers a scalable shell for aftermarket buyers, so EPC, ordering flows, and service rules can evolve inside one consistent interface system.",
      primaryAction: "Open EPC placeholder",
      secondaryAction: "Launch AI Assistant",
      moduleHeading: "Core module entry points",
      moduleSubheading: "Each module is separated by directory, with browsable UI placeholders in place.",
      modules: [
        {
          slug: "epc",
          title: "Electronic Parts Catalog",
          description: "Home for VIN lookup, exploded views, and structured catalog browsing.",
          meta: "Catalog shell / placeholder state / search-ready layout",
        },
        {
          slug: "orders",
          title: "Parts Ordering",
          description: "Home for order lists, approvals, collaboration, and cart handoff.",
          meta: "List shell / placeholder state / workflow-ready layout",
        },
      ],
      signalsHeading: "What is included now",
      signals: [
        "A shared application shell, global drawers, and responsive layout.",
        "Language, accent theme, and module entry points prepared for extension.",
        "Module-level markdown templates ready for future scoped development.",
      ],
      rolloutHeading: "Recommended next sequence",
      rollout: [
        "Define EPC search, group tree, and exploded-view interactions first.",
        "Then detail the parts order list, record detail, and checkout flow.",
        "Finally connect live data to the AI panel and cart experience.",
      ],
    },
    epc: {
      title: "EPC Module",
      description: "This is a UI shell with the future search, category, and results zones reserved.",
      label: "Electronic Parts Catalog",
      searchPlaceholder: "Search by VIN / part name / diagram number",
      panels: [
        "VIN lookup and vehicle recognition",
        "Assembly tree and diagram navigation",
        "Part details and supersession relationships",
      ],
      tips: [
        "Next step: define VIN decoding, vehicle filters, and replacement chains.",
        "Diagram-to-list linkage should become a core EPC interaction.",
      ],
    },
    orders: {
      title: "Parts Ordering",
      description: "This is the order list shell with filters, statuses, and detail regions reserved.",
      label: "Order List",
      filters: ["All Orders", "Awaiting Review", "Ready to Ship", "Exceptions"],
      emptyTitle: "Business workflow not connected yet",
      emptyDescription: "The current screen preserves headers, filters, and collaboration cues for live data integration later.",
    },
    assistant: {
      title: "AI Assistant",
      description: "Global side panel for catalog questions, procurement support, and rule explanations.",
      quickPromptsTitle: "Quick prompts",
      quickPrompts: [
        "Explain the boundary between EPC and ordering",
        "Tell me what business capabilities should come next",
        "Draft a daily to-do list for procurement users",
      ],
      briefTitle: "Current recommendation",
      briefBody:
        "Lock down the EPC and order-list data shapes first, then connect backend services to reduce downstream rework.",
      feedTitle: "Panel status",
      feed: [
        "The global trigger is already wired into the header.",
        "Responses are static for now and ready for later service integration.",
      ],
    },
    cart: {
      title: "Cart",
      description: "Global drawer for staged parts and settlement preparation.",
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
      "zh-CN": "前桥修理包",
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
      "zh-CN": "支持订单汇总与价格演示",
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
      "zh-CN": "用于承载后续购物车真实逻辑",
      "en-US": "Reserved for future live cart logic",
    },
  },
] as const;
