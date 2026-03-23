import {
  ArrowRight,
  Boxes,
  CarFront,
  Check,
  ChevronRight,
  CircleDot,
  History,
  Image as ImageIcon,
  Info,
  ListFilter,
  Minus,
  Plus,
  Search,
  ShoppingCart,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import type { Locale } from "../../content";
import type { CartLine, LocaleText } from "../cart/cartTypes";

export type Brand = {
  id: string;
  mark: string;
  name: LocaleText;
  summary: LocaleText;
};

export type Applicability = {
  code: string;
  model: LocaleText;
  brand: LocaleText;
};

export type PartRecord = {
  id: string;
  hotspot: string;
  sku: string;
  name: LocaleText;
  note: LocaleText;
  usage: number;
  packSize: number;
  price: number;
  hotspotX: number;
  hotspotY: number;
  images: string[];
  applicability: Applicability[];
  supersession: string[];
};

export type DiagramRecord = {
  id: string;
  code: string;
  name: LocaleText;
  blurb: LocaleText;
  parts: PartRecord[];
};

export type SubgroupRecord = {
  id: string;
  name: LocaleText;
  diagrams: DiagramRecord[];
};

export type GroupRecord = {
  id: string;
  name: LocaleText;
  accent: string;
  subgroups: SubgroupRecord[];
};

export type VehicleRecord = {
  id: string;
  brandId: string;
  seriesId: string;
  brand: LocaleText;
  series: LocaleText;
  year: string;
  model: LocaleText;
  code: string;
  vin: string;
  vehicleType: LocaleText;
  energy: LocaleText;
  emission: LocaleText;
  body: LocaleText;
  country: LocaleText;
  productionDate: string;
  groups: GroupRecord[];
};

export type HistoryEntry = {
  id: string;
  vehicleId: string;
  groupId: string;
  subgroupId: string;
  diagramId: string;
  title: LocaleText;
  trail: LocaleText;
  timeLabel: string;
};

export type AdvancedFilters = {
  vin: string;
  brandId: string;
  seriesId: string;
  year: string;
  modelId: string;
  groupId: string;
  subgroupId: string;
  diagramCode: string;
  diagramName: string;
  partNumber: string;
  partName: string;
};

export type AdvancedDiagramHit = {
  vehicle: VehicleRecord;
  group: GroupRecord;
  subgroup: SubgroupRecord;
  diagram: DiagramRecord;
};

type EpcPageProps = {
  locale: Locale;
  onAddToCart?: (item: CartLine) => void;
  onOpenCart?: () => void;
  view?: "home" | "wizard" | "workbench";
};

export const historyStorageKey = "s-link.epc.history";

export const text = (zh: string, en: string): LocaleText => ({
  "zh-CN": zh,
  "en-US": en,
});

export const brands: Brand[] = [
  {
    id: "wuling",
    mark: "W",
    name: text("五菱", "Wuling"),
    summary: text("聚焦新能源与高频售后车型", "Focused on EV and high-volume service models"),
  },
  {
    id: "baojun",
    mark: "B",
    name: text("宝骏", "Baojun"),
    summary: text("覆盖乘用车常用车身与底盘件", "Coverage for passenger body and chassis parts"),
  },
  {
    id: "new-baojun",
    mark: "N",
    name: text("新宝骏", "New Baojun"),
    summary: text("适配混动与智能化配置检索", "Built for hybrid and smart-trim lookups"),
  },
];

export const vehicles: VehicleRecord[] = [
  {
    id: "wuling-mini-215",
    brandId: "wuling",
    seriesId: "hongguang-mini",
    brand: text("五菱", "Wuling"),
    series: text("宏光 MINI EV", "Hongguang MINI EV"),
    year: "2024",
    model: text("215km 轻享款", "215km Lite"),
    code: "GAME-215-L",
    vin: "LZWADAGA7RF021584",
    vehicleType: text("微型纯电乘用车", "Mini battery electric passenger vehicle"),
    energy: text("纯电", "Battery EV"),
    emission: text("零排放", "Zero emission"),
    body: text("三门四座掀背", "3-door 4-seat hatch"),
    country: text("中国", "China"),
    productionDate: "2025-01-18",
    groups: [
      {
        id: "powertrain",
        name: text("动力总成", "Powertrain"),
        accent: "oklch(0.72 0.1 165)",
        subgroups: [
          {
            id: "reducer",
            name: text("减速器与半轴", "Reducer and axle shaft"),
            diagrams: [
              {
                id: "mini-reducer-layout",
                code: "E-01",
                name: text("减速器总成分解图", "Reducer assembly exploded view"),
                blurb: text(
                  "用于驱动减速器、半轴与油封检索，适合售后快查。",
                  "Used for reducer, axle shaft, and seal searches in service work.",
                ),
                parts: [
                  {
                    id: "mini-left-axle",
                    hotspot: "01",
                    sku: "24581001",
                    name: text("左前半轴总成", "Front left axle shaft assembly"),
                    note: text("含等速万向节，适配 215km 版本。", "Includes CV joint, matched to the 215km trim."),
                    usage: 1,
                    packSize: 1,
                    price: 428,
                    hotspotX: 25,
                    hotspotY: 58,
                    images: ["AXLE FRONT", "SPLINE DETAIL", "BOOT VIEW"],
                    applicability: [
                      {
                        code: "GAME-170-E",
                        model: text("170km 进阶款", "170km Advance"),
                        brand: text("五菱", "Wuling"),
                      },
                      {
                        code: "GAME-215-L",
                        model: text("215km 轻享款", "215km Lite"),
                        brand: text("五菱", "Wuling"),
                      },
                    ],
                    supersession: ["24581001A", "24581001B", "24581001"],
                  },
                  {
                    id: "mini-right-axle",
                    hotspot: "02",
                    sku: "24581002",
                    name: text("右前半轴总成", "Front right axle shaft assembly"),
                    note: text("带防尘套卡箍，单车用量 1。", "Includes boot clamp, one per vehicle."),
                    usage: 1,
                    packSize: 1,
                    price: 428,
                    hotspotX: 76,
                    hotspotY: 58,
                    images: ["AXLE REAR", "BOOT CLAMP", "JOINT CUT"],
                    applicability: [
                      {
                        code: "GAME-215-L",
                        model: text("215km 轻享款", "215km Lite"),
                        brand: text("五菱", "Wuling"),
                      },
                    ],
                    supersession: ["24581002A", "24581002"],
                  },
                  {
                    id: "mini-oil-seal",
                    hotspot: "03",
                    sku: "24581017",
                    name: text("差速器油封", "Differential oil seal"),
                    note: text("建议成对更换，防渗漏。", "Recommended to replace as a pair for leak prevention."),
                    usage: 2,
                    packSize: 2,
                    price: 36,
                    hotspotX: 49,
                    hotspotY: 37,
                    images: ["SEAL FACE", "PROFILE", "PACKAGE"],
                    applicability: [
                      {
                        code: "GAME-215-L",
                        model: text("215km 轻享款", "215km Lite"),
                        brand: text("五菱", "Wuling"),
                      },
                      {
                        code: "E50-LI",
                        model: text("KiWi EV 智潮版", "KiWi EV Smart"),
                        brand: text("宝骏", "Baojun"),
                      },
                    ],
                    supersession: ["24581012", "24581017"],
                  },
                  {
                    id: "mini-drain-plug",
                    hotspot: "04",
                    sku: "24581029",
                    name: text("减速器放油螺塞", "Reducer drain plug"),
                    note: text("含磁吸端头，保养时建议同步更换。", "Magnetic tip; recommended during service."),
                    usage: 1,
                    packSize: 5,
                    price: 18,
                    hotspotX: 52,
                    hotspotY: 76,
                    images: ["PLUG HEAD", "THREAD VIEW", "GASKET"],
                    applicability: [
                      {
                        code: "GAME-215-L",
                        model: text("215km 轻享款", "215km Lite"),
                        brand: text("五菱", "Wuling"),
                      },
                    ],
                    supersession: ["24581029"],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "baojun-kiwi-smart",
    brandId: "baojun",
    seriesId: "kiwi-ev",
    brand: text("宝骏", "Baojun"),
    series: text("KiWi EV", "KiWi EV"),
    year: "2023",
    model: text("智潮版", "Smart"),
    code: "E50-LI",
    vin: "LZWADCB18PF098631",
    vehicleType: text("纯电乘用车", "Battery electric passenger vehicle"),
    energy: text("纯电", "Battery EV"),
    emission: text("零排放", "Zero emission"),
    body: text("双门四座", "2-door 4-seat"),
    country: text("中国", "China"),
    productionDate: "2024-11-06",
    groups: [
      {
        id: "chassis",
        name: text("底盘系统", "Chassis"),
        accent: "oklch(0.72 0.09 230)",
        subgroups: [
          {
            id: "front-brake",
            name: text("前制动", "Front brake"),
            diagrams: [
              {
                id: "kiwi-brake-layout",
                code: "C-03",
                name: text("前制动卡钳与盘", "Front caliper and disc"),
                blurb: text(
                  "适合制动盘、卡钳导向销快查。",
                  "Built for quick brake disc and caliper-pin lookups.",
                ),
                parts: [
                  {
                    id: "kiwi-brake-disc",
                    hotspot: "01",
                    sku: "35011009",
                    name: text("前制动盘", "Front brake disc"),
                    note: text("最小包装 2，适合左右轮同步更换。", "Min pack 2 for left-right replacement."),
                    usage: 2,
                    packSize: 2,
                    price: 198,
                    hotspotX: 48,
                    hotspotY: 46,
                    images: ["DISC FACE", "VENT CORE", "PACKAGE"],
                    applicability: [
                      {
                        code: "E50-LI",
                        model: text("KiWi EV 智潮版", "KiWi EV Smart"),
                        brand: text("宝骏", "Baojun"),
                      },
                    ],
                    supersession: ["35011009"],
                  },
                  {
                    id: "kiwi-caliper-pin",
                    hotspot: "02",
                    sku: "35011022",
                    name: text("卡钳导向销修包", "Caliper guide pin kit"),
                    note: text("含润滑脂与防尘套。", "Includes grease and dust boot."),
                    usage: 1,
                    packSize: 1,
                    price: 56,
                    hotspotX: 65,
                    hotspotY: 58,
                    images: ["PIN KIT", "GREASE", "BOOT"],
                    applicability: [
                      {
                        code: "E50-LI",
                        model: text("KiWi EV 智潮版", "KiWi EV Smart"),
                        brand: text("宝骏", "Baojun"),
                      },
                    ],
                    supersession: ["35011018", "35011022"],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "newbaojun-yunduo-hybrid",
    brandId: "new-baojun",
    seriesId: "yunduo",
    brand: text("新宝骏", "New Baojun"),
    series: text("云朵", "Yunduo"),
    year: "2025",
    model: text("插混旗舰版", "PHEV Flagship"),
    code: "YD-PHEV-F",
    vin: "LZWADCF24SF112406",
    vehicleType: text("插电混动乘用车", "Plug-in hybrid passenger vehicle"),
    energy: text("插混", "Plug-in hybrid"),
    emission: text("国六 B", "China VI-B"),
    body: text("五门五座掀背", "5-door 5-seat hatch"),
    country: text("中国", "China"),
    productionDate: "2025-02-09",
    groups: [
      {
        id: "cabin",
        name: text("座舱与饰件", "Cabin and trim"),
        accent: "oklch(0.75 0.11 30)",
        subgroups: [
          {
            id: "center-console",
            name: text("中控总成", "Center console"),
            diagrams: [
              {
                id: "yunduo-console-layout",
                code: "T-07",
                name: text("中控台面板与出风口", "Dashboard panel and air vent"),
                blurb: text(
                  "适用于面板总成、饰条与风口导流件查询。",
                  "For panel assembly, trim strip, and air-vent guide lookups.",
                ),
                parts: [
                  {
                    id: "yunduo-console-panel",
                    hotspot: "01",
                    sku: "55041003",
                    name: text("中控台面板总成", "Dashboard panel assembly"),
                    note: text("含软包饰面，不含屏幕模组。", "Includes soft-touch trim, excludes display module."),
                    usage: 1,
                    packSize: 1,
                    price: 688,
                    hotspotX: 50,
                    hotspotY: 41,
                    images: ["PANEL FACE", "TRIM SEAM", "BACK FRAME"],
                    applicability: [
                      {
                        code: "YD-PHEV-F",
                        model: text("插混旗舰版", "PHEV Flagship"),
                        brand: text("新宝骏", "New Baojun"),
                      },
                    ],
                    supersession: ["55041001", "55041003"],
                  },
                  {
                    id: "yunduo-air-vent",
                    hotspot: "02",
                    sku: "55041017",
                    name: text("中央出风口总成", "Center air vent assembly"),
                    note: text("黑钛饰条版本，含拨片。", "Dark titanium trim version with fin slider."),
                    usage: 1,
                    packSize: 1,
                    price: 132,
                    hotspotX: 58,
                    hotspotY: 57,
                    images: ["VENT FACE", "BLADE", "MOUNT FRAME"],
                    applicability: [
                      {
                        code: "YD-PHEV-F",
                        model: text("插混旗舰版", "PHEV Flagship"),
                        brand: text("新宝骏", "New Baojun"),
                      },
                    ],
                    supersession: ["55041017"],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

export const pageCopy = {
  "zh-CN": {
    eyebrow: "Electronic Parts Catalog",
    title: "把 VIN、车型目录、爆炸图与加购动作收拢到同一张 EPC 工作台。",
    description:
      "当前版本以高频售后检索为主线，先打通 VIN 直达、正向选车、高级查询、图例联动与购物车绑定。",
    searchPlaceholder: "输入 VIN / 配件号 / 配件名称 / 图例编号",
    searchButton: "开始检索",
    advancedButton: "高级查询",
    quickLabels: ["VIN 直达", "品牌选车", "图例联动", "购物车绑定"],
    vinCardTitle: "VIN 已识别到车型",
    vinButton: "前往 EPC",
    brandTitle: "品牌矩阵",
    brandHint: "先选品牌，再逐级锁定车系、年款与配置。",
    historyTitle: "历史记录",
    historyHint: "记录最近一次停留的图例位置，可一键回到工作现场。",
    breadcrumbHome: "EPC 首页",
    wizardTitle: "查询向导",
    wizardHint: "左侧锁定车型，右侧推进分组与图例。",
    brandStep: "品牌",
    seriesStep: "车系",
    yearStep: "年款",
    modelStep: "车型配置",
    groupStep: "主分组",
    subgroupStep: "子分组",
    diagramTitle: "图例列表",
    workspaceTitle: "左图右数据工作台",
    workspaceHint: "热点与列表双向联动，点击配件号查看详情。",
    partsTitle: "配件列表",
    table: {
      hotspot: "热点号",
      sku: "配件号",
      name: "配件名称",
      note: "备注",
      usage: "单车用量",
      pack: "最小包装",
      currency: "币种",
      price: "价格",
      action: "操作",
    },
    add: "加入购物车",
    addConfirm: "确认加购",
    openCart: "查看购物车",
    quantityLabel: "数量",
    partDetail: "配件详情",
    applicability: "配件适用性",
    supersession: "替换关系",
    advancedTitle: "高级查询",
    advancedHint: "支持 VIN、车型、分组、图例与零件多条件联合过滤。",
    filterFields: {
      vin: "VIN",
      brand: "品牌",
      series: "车系",
      year: "年款",
      model: "车型",
      group: "一级分组",
      subgroup: "二级分组",
      diagramCode: "图例编号",
      diagramName: "图例名称",
      partNumber: "零件编号",
      partName: "零件名称",
    },
    query: "查询",
    reset: "重置",
    matchParts: "匹配零件",
    matchDiagrams: "匹配图例",
    emptyResults: "当前条件下没有命中结果，可以放宽 VIN、图例或零件条件。",
    diagramLocation: "所在位置",
    selectedState: "当前图例",
    addedToast: "已加入购物车并绑定当前车型。",
    ocrHint: "支持粘贴 VIN 图片做 OCR，当前演示先用示例 VIN 模拟。",
    close: "关闭",
    useHistory: "恢复此记录",
  },
  "en-US": {
    eyebrow: "Electronic Parts Catalog",
    title: "Bring VIN, vehicle hierarchy, exploded diagrams, and cart actions into one EPC workbench.",
    description:
      "This build focuses on service lookups with VIN jump-in, guided selection, advanced search, diagram linkage, and cart binding.",
    searchPlaceholder: "Search by VIN / part number / part name / diagram code",
    searchButton: "Search",
    advancedButton: "Advanced",
    quickLabels: ["VIN jump-in", "Brand browse", "Linked diagrams", "Cart binding"],
    vinCardTitle: "VIN matched a vehicle",
    vinButton: "Open EPC",
    brandTitle: "Brand matrix",
    brandHint: "Choose a brand first, then narrow down series, year, and trim.",
    historyTitle: "History",
    historyHint: "Recent diagram positions can be reopened in one click.",
    breadcrumbHome: "EPC Home",
    wizardTitle: "Catalog guide",
    wizardHint: "Lock the vehicle on the left, then step into groups and diagrams.",
    brandStep: "Brand",
    seriesStep: "Series",
    yearStep: "Year",
    modelStep: "Model",
    groupStep: "Main group",
    subgroupStep: "Subgroup",
    diagramTitle: "Diagram list",
    workspaceTitle: "Diagram and data workbench",
    workspaceHint: "Hotspots and rows are linked in both directions. Open the part number for details.",
    partsTitle: "Parts list",
    table: {
      hotspot: "Hotspot",
      sku: "Part number",
      name: "Part name",
      note: "Notes",
      usage: "Usage",
      pack: "Min pack",
      currency: "Currency",
      price: "Price",
      action: "Action",
    },
    add: "Add to cart",
    addConfirm: "Confirm",
    openCart: "Open cart",
    quantityLabel: "Quantity",
    partDetail: "Part details",
    applicability: "Applicability",
    supersession: "Supersession",
    advancedTitle: "Advanced search",
    advancedHint: "Filter across VIN, vehicle, groups, diagrams, and parts.",
    filterFields: {
      vin: "VIN",
      brand: "Brand",
      series: "Series",
      year: "Year",
      model: "Model",
      group: "Main group",
      subgroup: "Subgroup",
      diagramCode: "Diagram code",
      diagramName: "Diagram name",
      partNumber: "Part number",
      partName: "Part name",
    },
    query: "Run query",
    reset: "Reset",
    matchParts: "Matched parts",
    matchDiagrams: "Matched diagrams",
    emptyResults: "No results for the current criteria. Relax the VIN, diagram, or part filters.",
    diagramLocation: "Location",
    selectedState: "Current diagram",
    addedToast: "Added to cart and bound to the current vehicle.",
    ocrHint: "VIN image OCR will be connected later. The demo currently simulates it with sample VINs.",
    close: "Close",
    useHistory: "Resume",
  },
} as const;

export const defaultHistoryEntries: HistoryEntry[] = [
  {
    id: "seed-mini-reducer",
    vehicleId: "wuling-mini-215",
    groupId: "powertrain",
    subgroupId: "reducer",
    diagramId: "mini-reducer-layout",
    title: text("宏光 MINI EV / 减速器总成", "MINI EV / Reducer assembly"),
    trail: text("五菱 > 宏光 MINI EV > 动力总成 > 减速器与半轴", "Wuling > MINI EV > Powertrain > Reducer and axle shaft"),
    timeLabel: "15:40",
  },
  {
    id: "seed-kiwi-brake",
    vehicleId: "baojun-kiwi-smart",
    groupId: "chassis",
    subgroupId: "front-brake",
    diagramId: "kiwi-brake-layout",
    title: text("KiWi EV / 前制动卡钳与盘", "KiWi EV / Front caliper and disc"),
    trail: text("宝骏 > KiWi EV > 底盘系统 > 前制动", "Baojun > KiWi EV > Chassis > Front brake"),
    timeLabel: "昨天",
  },
];

export const blankAdvancedFilters: AdvancedFilters = {
  vin: "",
  brandId: "",
  seriesId: "",
  year: "",
  modelId: "",
  groupId: "",
  subgroupId: "",
  diagramCode: "",
  diagramName: "",
  partNumber: "",
  partName: "",
};

export function lower(value: string) {
  return value.trim().toLowerCase();
}

export function getText(locale: Locale, value: LocaleText) {
  return value[locale];
}

export function formatMoney(locale: Locale, amount: number) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: locale === "zh-CN" ? "CNY" : "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export type SelectionIds = {
  vehicleId: string;
  groupId: string;
  subgroupId: string;
  diagramId: string;
  partId: string;
};

export const vehicleMap = new Map(vehicles.map((vehicle) => [vehicle.id, vehicle]));

export const diagramHits = vehicles.flatMap((vehicle) =>
  vehicle.groups.flatMap((group) =>
    group.subgroups.flatMap((subgroup) =>
      subgroup.diagrams.map((diagram) => ({
        vehicle,
        group,
        subgroup,
        diagram,
      })),
    ),
  ),
);

export const partHits = diagramHits.flatMap((hit) =>
  hit.diagram.parts.map((part) => ({
    vehicle: hit.vehicle,
    group: hit.group,
    subgroup: hit.subgroup,
    diagram: hit.diagram,
    part,
  })),
);

export function resolveSelectionFromIds(input?: Partial<SelectionIds>) {
  const vehicle = vehicleMap.get(input?.vehicleId ?? "") ?? vehicles[0];
  const group = vehicle.groups.find((item) => item.id === input?.groupId) ?? vehicle.groups[0];
  const subgroup = group.subgroups.find((item) => item.id === input?.subgroupId) ?? group.subgroups[0];
  const diagram = subgroup.diagrams.find((item) => item.id === input?.diagramId) ?? subgroup.diagrams[0];
  const part = diagram.parts.find((item) => item.id === input?.partId) ?? diagram.parts[0];

  return {
    vehicle,
    group,
    subgroup,
    diagram,
    part,
    ids: {
      vehicleId: vehicle.id,
      groupId: group.id,
      subgroupId: subgroup.id,
      diagramId: diagram.id,
      partId: part.id,
    },
  };
}

export function buildEpcPath(
  pathname: "/epc/wizard" | "/epc/groups" | "/epc/workbench",
  input: Partial<SelectionIds>,
  extra?: Record<string, string>,
) {
  const { ids } = resolveSelectionFromIds(input);
  const params = new URLSearchParams({
    vehicle: ids.vehicleId,
    group: ids.groupId,
    subgroup: ids.subgroupId,
    diagram: ids.diagramId,
    part: ids.partId,
  });

  Object.entries(extra ?? {}).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  return `${pathname}?${params.toString()}`;
}

export function readHistoryEntries() {
  if (typeof window === "undefined") {
    return defaultHistoryEntries;
  }

  const stored = window.localStorage.getItem(historyStorageKey);

  if (!stored) {
    return defaultHistoryEntries;
  }

  try {
    return JSON.parse(stored) as HistoryEntry[];
  } catch {
    return defaultHistoryEntries;
  }
}

type BackButtonProps = {
  fallbackTo: string;
  label: string;
};

export function EpcBackButton({ fallbackTo, label }: BackButtonProps) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      className="secondary-action epc-back-button"
      onClick={() => {
        if (window.history.length > 1) {
          navigate(-1);
          return;
        }

        navigate(fallbackTo);
      }}
    >
      <ChevronRight size={16} className="epc-back-icon" />
      {label}
    </button>
  );
}

export function useEpcSelectionState(searchParams: URLSearchParams) {
  const paramsKey = searchParams.toString();
  const initialSelection = useMemo(
    () =>
      resolveSelectionFromIds({
        vehicleId: searchParams.get("vehicle") ?? undefined,
        groupId: searchParams.get("group") ?? undefined,
        subgroupId: searchParams.get("subgroup") ?? undefined,
        diagramId: searchParams.get("diagram") ?? undefined,
        partId: searchParams.get("part") ?? undefined,
      }),
    [paramsKey, searchParams],
  );

  const [selectedBrandId, setSelectedBrandId] = useState(initialSelection.vehicle.brandId);
  const [selectedSeriesId, setSelectedSeriesId] = useState(initialSelection.vehicle.seriesId);
  const [selectedYear, setSelectedYear] = useState(initialSelection.vehicle.year);
  const [selectedVehicleId, setSelectedVehicleId] = useState(initialSelection.vehicle.id);
  const [selectedGroupId, setSelectedGroupId] = useState(initialSelection.group.id);
  const [selectedSubgroupId, setSelectedSubgroupId] = useState(initialSelection.subgroup.id);
  const [selectedDiagramId, setSelectedDiagramId] = useState(initialSelection.diagram.id);
  const [activePartId, setActivePartId] = useState(initialSelection.part.id);

  useEffect(() => {
    setSelectedBrandId(initialSelection.vehicle.brandId);
    setSelectedSeriesId(initialSelection.vehicle.seriesId);
    setSelectedYear(initialSelection.vehicle.year);
    setSelectedVehicleId(initialSelection.vehicle.id);
    setSelectedGroupId(initialSelection.group.id);
    setSelectedSubgroupId(initialSelection.subgroup.id);
    setSelectedDiagramId(initialSelection.diagram.id);
    setActivePartId(initialSelection.part.id);
  }, [initialSelection]);

  const currentVehicle = vehicleMap.get(selectedVehicleId) ?? vehicles[0];
  const currentGroup =
    currentVehicle.groups.find((group) => group.id === selectedGroupId) ?? currentVehicle.groups[0];
  const currentSubgroup =
    currentGroup.subgroups.find((subgroup) => subgroup.id === selectedSubgroupId) ??
    currentGroup.subgroups[0];
  const currentDiagram =
    currentSubgroup.diagrams.find((diagram) => diagram.id === selectedDiagramId) ??
    currentSubgroup.diagrams[0];
  const currentPart =
    currentDiagram.parts.find((part) => part.id === activePartId) ?? currentDiagram.parts[0];

  const seriesOptions = useMemo(() => {
    const seen = new Set<string>();

    return vehicles.filter((vehicle) => {
      if (vehicle.brandId !== selectedBrandId || seen.has(vehicle.seriesId)) {
        return false;
      }

      seen.add(vehicle.seriesId);
      return true;
    });
  }, [selectedBrandId]);

  const yearOptions = useMemo(() => {
    const seen = new Set<string>();

    return vehicles.filter((vehicle) => {
      if (
        vehicle.brandId !== selectedBrandId ||
        vehicle.seriesId !== selectedSeriesId ||
        seen.has(vehicle.year)
      ) {
        return false;
      }

      seen.add(vehicle.year);
      return true;
    });
  }, [selectedBrandId, selectedSeriesId]);

  const modelOptions = useMemo(
    () =>
      vehicles.filter(
        (vehicle) =>
          vehicle.brandId === selectedBrandId &&
          vehicle.seriesId === selectedSeriesId &&
          vehicle.year === selectedYear,
      ),
    [selectedBrandId, selectedSeriesId, selectedYear],
  );

  function applyVehicleSelection(
    vehicleId: string,
    next?: {
      groupId?: string;
      subgroupId?: string;
      diagramId?: string;
      partId?: string;
    },
  ) {
    const vehicle = vehicleMap.get(vehicleId);

    if (!vehicle) {
      return;
    }

    const group = vehicle.groups.find((item) => item.id === next?.groupId) ?? vehicle.groups[0];
    const subgroup =
      group.subgroups.find((item) => item.id === next?.subgroupId) ?? group.subgroups[0];
    const diagram =
      subgroup.diagrams.find((item) => item.id === next?.diagramId) ?? subgroup.diagrams[0];
    const part = diagram.parts.find((item) => item.id === next?.partId) ?? diagram.parts[0];

    setSelectedBrandId(vehicle.brandId);
    setSelectedSeriesId(vehicle.seriesId);
    setSelectedYear(vehicle.year);
    setSelectedVehicleId(vehicle.id);
    setSelectedGroupId(group.id);
    setSelectedSubgroupId(subgroup.id);
    setSelectedDiagramId(diagram.id);
    setActivePartId(part.id);
  }

  function selectBrand(brandId: string) {
    const firstVehicle = vehicles.find((vehicle) => vehicle.brandId === brandId);

    if (firstVehicle) {
      applyVehicleSelection(firstVehicle.id);
    }
  }

  function selectSeries(seriesId: string) {
    const firstVehicle = vehicles.find(
      (vehicle) => vehicle.brandId === selectedBrandId && vehicle.seriesId === seriesId,
    );

    if (firstVehicle) {
      applyVehicleSelection(firstVehicle.id);
    }
  }

  function selectYear(year: string) {
    const firstVehicle = vehicles.find(
      (vehicle) =>
        vehicle.brandId === selectedBrandId &&
        vehicle.seriesId === selectedSeriesId &&
        vehicle.year === year,
    );

    if (firstVehicle) {
      applyVehicleSelection(firstVehicle.id);
    }
  }

  function selectGroup(groupId: string) {
    const group = currentVehicle.groups.find((item) => item.id === groupId);

    if (!group) {
      return;
    }

    setSelectedGroupId(group.id);
    setSelectedSubgroupId(group.subgroups[0].id);
    setSelectedDiagramId(group.subgroups[0].diagrams[0].id);
    setActivePartId(group.subgroups[0].diagrams[0].parts[0].id);
  }

  function selectSubgroup(subgroupId: string) {
    const subgroup = currentGroup.subgroups.find((item) => item.id === subgroupId);

    if (!subgroup) {
      return;
    }

    setSelectedSubgroupId(subgroup.id);
    setSelectedDiagramId(subgroup.diagrams[0].id);
    setActivePartId(subgroup.diagrams[0].parts[0].id);
  }

  function selectDiagram(diagramId: string) {
    const diagram = currentSubgroup.diagrams.find((item) => item.id === diagramId);

    if (!diagram) {
      return;
    }

    setSelectedDiagramId(diagram.id);
    setActivePartId(diagram.parts[0].id);
  }

  return {
    selectedBrandId,
    selectedSeriesId,
    selectedYear,
    selectedVehicleId,
    selectedGroupId,
    selectedSubgroupId,
    selectedDiagramId,
    activePartId,
    setActivePartId,
    setSelectedDiagramId,
    currentVehicle,
    currentGroup,
    currentSubgroup,
    currentDiagram,
    currentPart,
    seriesOptions,
    yearOptions,
    modelOptions,
    applyVehicleSelection,
    selectBrand,
    selectSeries,
    selectYear,
    selectGroup,
    selectSubgroup,
    selectDiagram,
  };
}

export function EpcPage({
  locale,
  onAddToCart,
  onOpenCart,
  view = "workbench",
}: EpcPageProps) {
  const ui = pageCopy[locale];
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialSelection = resolveSelectionFromIds({
    vehicleId: searchParams.get("vehicle") ?? undefined,
    groupId: searchParams.get("group") ?? undefined,
    subgroupId: searchParams.get("subgroup") ?? undefined,
    diagramId: searchParams.get("diagram") ?? undefined,
    partId: searchParams.get("part") ?? undefined,
  });
  const addToCart = onAddToCart ?? (() => undefined);
  const openCart = onOpenCart ?? (() => undefined);

  const [query, setQuery] = useState("");
  const [selectedBrandId, setSelectedBrandId] = useState(initialSelection.vehicle.brandId);
  const [selectedSeriesId, setSelectedSeriesId] = useState(initialSelection.vehicle.seriesId);
  const [selectedYear, setSelectedYear] = useState(initialSelection.vehicle.year);
  const [selectedVehicleId, setSelectedVehicleId] = useState(initialSelection.vehicle.id);
  const [selectedGroupId, setSelectedGroupId] = useState(initialSelection.group.id);
  const [selectedSubgroupId, setSelectedSubgroupId] = useState(initialSelection.subgroup.id);
  const [selectedDiagramId, setSelectedDiagramId] = useState(initialSelection.diagram.id);
  const [activePartId, setActivePartId] = useState(initialSelection.part.id);
  const [vinVehicleId, setVinVehicleId] = useState<string | null>(null);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [advancedTab, setAdvancedTab] = useState<"parts" | "diagrams">("parts");
  const [advancedDraft, setAdvancedDraft] = useState<AdvancedFilters>(blankAdvancedFilters);
  const [advancedCommitted, setAdvancedCommitted] = useState<AdvancedFilters>(blankAdvancedFilters);
  const [partDetailId, setPartDetailId] = useState<string | null>(null);
  const [quantityEditorId, setQuantityEditorId] = useState<string | null>(null);
  const [draftQuantity, setDraftQuantity] = useState(1);
  const [toastVisible, setToastVisible] = useState(false);
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>(() => readHistoryEntries());

  const currentVehicle = vehicleMap.get(selectedVehicleId) ?? vehicles[0];
  const currentGroup =
    currentVehicle.groups.find((group) => group.id === selectedGroupId) ?? currentVehicle.groups[0];
  const currentSubgroup =
    currentGroup.subgroups.find((subgroup) => subgroup.id === selectedSubgroupId) ??
    currentGroup.subgroups[0];
  const currentDiagram =
    currentSubgroup.diagrams.find((diagram) => diagram.id === selectedDiagramId) ??
    currentSubgroup.diagrams[0];
  const currentPart =
    currentDiagram.parts.find((part) => part.id === activePartId) ?? currentDiagram.parts[0];

  const seriesOptions = useMemo(() => {
    const seen = new Set<string>();

    return vehicles.filter((vehicle) => {
      if (vehicle.brandId !== selectedBrandId || seen.has(vehicle.seriesId)) {
        return false;
      }

      seen.add(vehicle.seriesId);
      return true;
    });
  }, [selectedBrandId]);

  const yearOptions = useMemo(() => {
    const seen = new Set<string>();

    return vehicles.filter((vehicle) => {
      if (
        vehicle.brandId !== selectedBrandId ||
        vehicle.seriesId !== selectedSeriesId ||
        seen.has(vehicle.year)
      ) {
        return false;
      }

      seen.add(vehicle.year);
      return true;
    });
  }, [selectedBrandId, selectedSeriesId]);

  const modelOptions = useMemo(
    () =>
      vehicles.filter(
        (vehicle) =>
          vehicle.brandId === selectedBrandId &&
          vehicle.seriesId === selectedSeriesId &&
          vehicle.year === selectedYear,
      ),
    [selectedBrandId, selectedSeriesId, selectedYear],
  );

  const advancedPartResults = useMemo(() => {
    const filters = advancedCommitted;

    return partHits.filter(({ vehicle, group, subgroup, diagram, part }) => {
      if (filters.vin && !vehicle.vin.toLowerCase().includes(lower(filters.vin))) {
        return false;
      }

      if (filters.brandId && vehicle.brandId !== filters.brandId) {
        return false;
      }

      if (filters.seriesId && vehicle.seriesId !== filters.seriesId) {
        return false;
      }

      if (filters.year && vehicle.year !== filters.year) {
        return false;
      }

      if (filters.modelId && vehicle.id !== filters.modelId) {
        return false;
      }

      if (filters.groupId && group.id !== filters.groupId) {
        return false;
      }

      if (filters.subgroupId && subgroup.id !== filters.subgroupId) {
        return false;
      }

      if (filters.diagramCode && !diagram.code.toLowerCase().includes(lower(filters.diagramCode))) {
        return false;
      }

      if (
        filters.diagramName &&
        !getText(locale, diagram.name).toLowerCase().includes(lower(filters.diagramName))
      ) {
        return false;
      }

      if (filters.partNumber && !part.sku.toLowerCase().includes(lower(filters.partNumber))) {
        return false;
      }

      if (
        filters.partName &&
        !getText(locale, part.name).toLowerCase().includes(lower(filters.partName))
      ) {
        return false;
      }

      return true;
    });
  }, [advancedCommitted, locale, partHits]);

  const advancedDiagramResults = useMemo(() => {
    const filters = advancedCommitted;

    return diagramHits.filter(({ vehicle, group, subgroup, diagram }) => {
      if (filters.vin && !vehicle.vin.toLowerCase().includes(lower(filters.vin))) {
        return false;
      }

      if (filters.brandId && vehicle.brandId !== filters.brandId) {
        return false;
      }

      if (filters.seriesId && vehicle.seriesId !== filters.seriesId) {
        return false;
      }

      if (filters.year && vehicle.year !== filters.year) {
        return false;
      }

      if (filters.modelId && vehicle.id !== filters.modelId) {
        return false;
      }

      if (filters.groupId && group.id !== filters.groupId) {
        return false;
      }

      if (filters.subgroupId && subgroup.id !== filters.subgroupId) {
        return false;
      }

      if (filters.diagramCode && !diagram.code.toLowerCase().includes(lower(filters.diagramCode))) {
        return false;
      }

      if (
        filters.diagramName &&
        !getText(locale, diagram.name).toLowerCase().includes(lower(filters.diagramName))
      ) {
        return false;
      }

      if (filters.partNumber) {
        const containsNumber = diagram.parts.some((part) =>
          part.sku.toLowerCase().includes(lower(filters.partNumber)),
        );

        if (!containsNumber) {
          return false;
        }
      }

      if (filters.partName) {
        const containsName = diagram.parts.some((part) =>
          getText(locale, part.name).toLowerCase().includes(lower(filters.partName)),
        );

        if (!containsName) {
          return false;
        }
      }

      return true;
    });
  }, [advancedCommitted, diagramHits, locale]);

  function applyVehicleSelection(
    vehicleId: string,
    next?: {
      groupId?: string;
      subgroupId?: string;
      diagramId?: string;
      partId?: string;
    },
  ) {
    const vehicle = vehicleMap.get(vehicleId);

    if (!vehicle) {
      return;
    }

    const group = vehicle.groups.find((item) => item.id === next?.groupId) ?? vehicle.groups[0];
    const subgroup =
      group.subgroups.find((item) => item.id === next?.subgroupId) ?? group.subgroups[0];
    const diagram =
      subgroup.diagrams.find((item) => item.id === next?.diagramId) ?? subgroup.diagrams[0];
    const part = diagram.parts.find((item) => item.id === next?.partId) ?? diagram.parts[0];

    setSelectedBrandId(vehicle.brandId);
    setSelectedSeriesId(vehicle.seriesId);
    setSelectedYear(vehicle.year);
    setSelectedVehicleId(vehicle.id);
    setSelectedGroupId(group.id);
    setSelectedSubgroupId(subgroup.id);
    setSelectedDiagramId(diagram.id);
    setActivePartId(part.id);
  }

  function selectBrand(brandId: string) {
    const firstVehicle = vehicles.find((vehicle) => vehicle.brandId === brandId);

    if (firstVehicle) {
      applyVehicleSelection(firstVehicle.id);
    }
  }

  function selectSeries(seriesId: string) {
    const firstVehicle = vehicles.find(
      (vehicle) => vehicle.brandId === selectedBrandId && vehicle.seriesId === seriesId,
    );

    if (firstVehicle) {
      applyVehicleSelection(firstVehicle.id);
    }
  }

  function selectYear(year: string) {
    const firstVehicle = vehicles.find(
      (vehicle) =>
        vehicle.brandId === selectedBrandId &&
        vehicle.seriesId === selectedSeriesId &&
        vehicle.year === year,
    );

    if (firstVehicle) {
      applyVehicleSelection(firstVehicle.id);
    }
  }

  function selectGroup(groupId: string) {
    const group = currentVehicle.groups.find((item) => item.id === groupId);

    if (!group) {
      return;
    }

    setSelectedGroupId(group.id);
    setSelectedSubgroupId(group.subgroups[0].id);
    setSelectedDiagramId(group.subgroups[0].diagrams[0].id);
    setActivePartId(group.subgroups[0].diagrams[0].parts[0].id);
  }

  function selectSubgroup(subgroupId: string) {
    const subgroup = currentGroup.subgroups.find((item) => item.id === subgroupId);

    if (!subgroup) {
      return;
    }

    setSelectedSubgroupId(subgroup.id);
    setSelectedDiagramId(subgroup.diagrams[0].id);
    setActivePartId(subgroup.diagrams[0].parts[0].id);
  }

  function selectDiagram(diagramId: string) {
    const diagram = currentSubgroup.diagrams.find((item) => item.id === diagramId);

    if (!diagram) {
      return;
    }

    setSelectedDiagramId(diagram.id);
    setActivePartId(diagram.parts[0].id);
  }

  function persistHistory(entry: HistoryEntry) {
    setHistoryEntries((current) => {
      const next = [entry, ...current.filter((item) => item.id !== entry.id)].slice(0, 6);

      if (typeof window !== "undefined") {
        window.localStorage.setItem(historyStorageKey, JSON.stringify(next));
      }

      return next;
    });
  }

  function handleSearch() {
    const normalized = query.trim().toUpperCase();

    if (!normalized) {
      return;
    }

    const vehicleHit = vehicles.find((vehicle) => vehicle.vin === normalized);

    if (vehicleHit) {
      if (view === "home") {
        setVinVehicleId(vehicleHit.id);
        return;
      }

      applyVehicleSelection(vehicleHit.id);
      return;
    }

    const matchingParts = partHits.filter(
      ({ part }) =>
        part.sku.includes(normalized) ||
        getText(locale, part.name).toLowerCase().includes(normalized.toLowerCase()),
    );
    const matchingDiagrams = diagramHits.filter(
      ({ diagram }) =>
        diagram.code.includes(normalized) ||
        getText(locale, diagram.name).toLowerCase().includes(normalized.toLowerCase()),
    );

    if (view === "home") {
      const firstPart = matchingParts[0];

      if (firstPart) {
        navigate(
          buildEpcPath("/epc/workbench", {
            vehicleId: firstPart.vehicle.id,
            groupId: firstPart.group.id,
            subgroupId: firstPart.subgroup.id,
            diagramId: firstPart.diagram.id,
            partId: firstPart.part.id,
          }),
        );
        return;
      }

      const firstDiagram = matchingDiagrams[0];

      if (firstDiagram) {
        navigate(
          buildEpcPath("/epc/workbench", {
            vehicleId: firstDiagram.vehicle.id,
            groupId: firstDiagram.group.id,
            subgroupId: firstDiagram.subgroup.id,
            diagramId: firstDiagram.diagram.id,
            partId: firstDiagram.diagram.parts[0].id,
          }),
        );
      }
      return;
    }

    const nextFilters: AdvancedFilters = {
      ...blankAdvancedFilters,
      partNumber: matchingParts.some(({ part }) => part.sku.includes(normalized)) ? normalized : "",
      partName:
        matchingParts.length > 0 &&
        !matchingParts.some(({ part }) => part.sku.includes(normalized))
          ? query
          : "",
      diagramCode:
        matchingDiagrams.length > 0 &&
        matchingDiagrams.some(({ diagram }) => diagram.code.includes(normalized))
          ? normalized
          : "",
      diagramName:
        matchingDiagrams.length > 0 &&
        !matchingDiagrams.some(({ diagram }) => diagram.code.includes(normalized))
          ? query
          : "",
    };

    setAdvancedDraft(nextFilters);
    setAdvancedCommitted(nextFilters);
    setAdvancedTab(matchingParts.length >= matchingDiagrams.length ? "parts" : "diagrams");
    setIsAdvancedOpen(true);
  }

  function handleConfirmAdd(part: PartRecord) {
    const context = text(
      `${currentVehicle.brand["zh-CN"]} / ${currentVehicle.series["zh-CN"]} / ${currentVehicle.year} / ${currentVehicle.model["zh-CN"]}`,
      `${currentVehicle.brand["en-US"]} / ${currentVehicle.series["en-US"]} / ${currentVehicle.year} / ${currentVehicle.model["en-US"]}`,
    );

    addToCart({
      id: `${part.sku}:${currentVehicle.id}`,
      bindingKey: currentVehicle.id,
      sku: part.sku,
      quantity: draftQuantity,
      unitPrice: part.price,
      name: part.name,
      description: part.note,
      context,
    });

    setQuantityEditorId(null);
    setToastVisible(true);
    window.setTimeout(() => setToastVisible(false), 1800);
  }

  useEffect(() => {
    const row = rowRefs.current[activePartId];

    if (row) {
      row.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [activePartId]);

  useEffect(() => {
    if (view !== "workbench") {
      return;
    }

    const entry: HistoryEntry = {
      id: `${currentVehicle.id}:${currentDiagram.id}`,
      vehicleId: currentVehicle.id,
      groupId: currentGroup.id,
      subgroupId: currentSubgroup.id,
      diagramId: currentDiagram.id,
      title: text(
        `${currentVehicle.series["zh-CN"]} / ${currentDiagram.name["zh-CN"]}`,
        `${currentVehicle.series["en-US"]} / ${currentDiagram.name["en-US"]}`,
      ),
      trail: text(
        `${currentVehicle.brand["zh-CN"]} > ${currentVehicle.series["zh-CN"]} > ${currentGroup.name["zh-CN"]} > ${currentSubgroup.name["zh-CN"]}`,
        `${currentVehicle.brand["en-US"]} > ${currentVehicle.series["en-US"]} > ${currentGroup.name["en-US"]} > ${currentSubgroup.name["en-US"]}`,
      ),
      timeLabel: new Intl.DateTimeFormat(locale, {
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date()),
    };

    persistHistory(entry);
  }, [currentDiagram.id, currentGroup.id, currentSubgroup.id, currentVehicle.id, locale, view]);

  const breadcrumbItems = [
    {
      label: ui.breadcrumbHome,
      onClick: () => applyVehicleSelection(currentVehicle.id),
    },
    {
      label: getText(locale, currentVehicle.brand),
      onClick: () => selectBrand(currentVehicle.brandId),
    },
    {
      label: getText(locale, currentVehicle.series),
      onClick: () => selectSeries(currentVehicle.seriesId),
    },
    {
      label: currentVehicle.year,
      onClick: () => selectYear(currentVehicle.year),
    },
    {
      label: getText(locale, currentGroup.name),
      onClick: () => selectGroup(currentGroup.id),
    },
    {
      label: getText(locale, currentSubgroup.name),
      onClick: () => selectSubgroup(currentSubgroup.id),
    },
    {
      label: `${currentDiagram.code} ${getText(locale, currentDiagram.name)}`,
      onClick: () => selectDiagram(currentDiagram.id),
    },
  ];

  const detailPart =
    currentDiagram.parts.find((part) => part.id === partDetailId) ??
    partHits.find(({ part }) => part.id === partDetailId)?.part ??
    null;
  const isHomeView = view === "home";
  const isWizardView = view === "wizard";
  const isWorkbenchView = view === "workbench";
  const backLabel =
    locale === "zh-CN"
      ? isHomeView
        ? "返回系统首页"
        : isWizardView
          ? "返回 EPC 首页"
          : "返回查询向导"
      : isHomeView
        ? "Back to overview"
        : isWizardView
          ? "Back to EPC home"
          : "Back to guide";
  const backFallback = isHomeView
    ? "/"
    : isWizardView
      ? "/epc"
      : buildEpcPath("/epc/wizard", {
          vehicleId: currentVehicle.id,
          groupId: currentGroup.id,
          subgroupId: currentSubgroup.id,
          diagramId: currentDiagram.id,
          partId: activePartId,
        });

  return (
    <div className="page-stack epc-page">
      <div className="epc-subpage-bar reveal">
        <EpcBackButton fallbackTo={backFallback} label={backLabel} />
      </div>

      {isHomeView ? (
      <section className="epc-hero reveal">
        <div className="epc-hero-copy">
          <p className="section-kicker">{ui.eyebrow}</p>
          <h2>{ui.title}</h2>
          <p>{ui.description}</p>
          <div className="epc-chip-row">
            {ui.quickLabels.map((label) => (
              <span key={label} className="epc-inline-chip">
                {label}
              </span>
            ))}
          </div>
          <label className="search-box epc-search-box">
            <Search size={18} />
            <input
              type="text"
              value={query}
              placeholder={ui.searchPlaceholder}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleSearch();
                }
              }}
            />
            <button type="button" className="toolbar-ghost epc-search-action" onClick={handleSearch}>
              {ui.searchButton}
            </button>
          </label>
          <div className="hero-actions">
            <button type="button" className="secondary-action" onClick={() => setVinVehicleId(vehicles[0].id)}>
              VIN Demo
            </button>
            <button
              type="button"
              className="primary-action"
              onClick={() =>
                navigate(
                  buildEpcPath("/epc/wizard", {
                    vehicleId: currentVehicle.id,
                    groupId: currentGroup.id,
                    subgroupId: currentSubgroup.id,
                    diagramId: currentDiagram.id,
                    partId: activePartId,
                  }),
                )
              }
            >
              <ListFilter size={16} />
              {locale === "zh-CN" ? "进入查询向导" : "Open guide"}
            </button>
          </div>
        </div>

        <div className="epc-hero-aside">
          <article className="epc-aside-panel">
            <div className="epc-aside-title">
              <Sparkles size={16} />
              <span>{ui.selectedState}</span>
            </div>
            <strong>{currentDiagram.code}</strong>
            <p>{getText(locale, currentDiagram.name)}</p>
            <small>{getText(locale, currentDiagram.blurb)}</small>
          </article>

          <article className="epc-aside-panel subtle">
            <div className="epc-aside-title">
              <Info size={16} />
              <span>OCR</span>
            </div>
            <p>{ui.ocrHint}</p>
          </article>
        </div>
      </section>
      ) : null}

      {isHomeView ? (
      <section className="epc-home-grid reveal delay-1">
        <article className="epc-brand-board">
          <div className="section-heading">
            <div>
              <p className="section-kicker">{ui.brandTitle}</p>
              <h3>{ui.brandHint}</h3>
            </div>
          </div>
          <div className="brand-matrix">
            {brands.map((brand) => (
              <button
                key={brand.id}
                type="button"
                className={`brand-card ${selectedBrandId === brand.id ? "is-active" : ""}`}
                onClick={() => {
                  const vehicle = vehicles.find((item) => item.brandId === brand.id);

                  if (vehicle) {
                    navigate(
                      buildEpcPath("/epc/wizard", {
                        vehicleId: vehicle.id,
                        groupId: vehicle.groups[0].id,
                        subgroupId: vehicle.groups[0].subgroups[0].id,
                        diagramId: vehicle.groups[0].subgroups[0].diagrams[0].id,
                        partId: vehicle.groups[0].subgroups[0].diagrams[0].parts[0].id,
                      }),
                    );
                  }
                }}
              >
                <span className="brand-card-mark">{brand.mark}</span>
                <strong>{getText(locale, brand.name)}</strong>
                <small>{getText(locale, brand.summary)}</small>
              </button>
            ))}
          </div>
        </article>

        <aside className="epc-history-rail">
          <div className="section-heading">
            <div>
              <p className="section-kicker">{ui.historyTitle}</p>
              <h3>{ui.historyHint}</h3>
            </div>
          </div>
          <div className="epc-history-list">
            {historyEntries.map((entry) => (
              <button
                key={entry.id}
                type="button"
                className="history-card"
                onClick={() =>
                  navigate(
                    buildEpcPath("/epc/workbench", {
                      vehicleId: entry.vehicleId,
                      groupId: entry.groupId,
                      subgroupId: entry.subgroupId,
                      diagramId: entry.diagramId,
                    }),
                  )
                }
              >
                <div className="history-card-head">
                  <History size={15} />
                  <span>{entry.timeLabel}</span>
                </div>
                <strong>{getText(locale, entry.title)}</strong>
                <p>{getText(locale, entry.trail)}</p>
                <small>{ui.useHistory}</small>
              </button>
            ))}
          </div>
        </aside>
      </section>
      ) : null}

      {isWizardView ? (
      <section className="epc-breadcrumbs reveal delay-1" aria-label="breadcrumbs">
        {breadcrumbItems.map((item, index) => (
          <div key={`${item.label}-${index}`} className="epc-breadcrumb-item">
            <button type="button" onClick={item.onClick}>
              {item.label}
            </button>
            {index < breadcrumbItems.length - 1 ? <ChevronRight size={14} /> : null}
          </div>
        ))}
      </section>
      ) : null}

      {isWizardView ? (
      <section className="epc-guide reveal delay-2">
        <article className="epc-guide-panel">
          <div className="section-heading">
            <div>
              <p className="section-kicker">{ui.wizardTitle}</p>
              <h3>{ui.wizardHint}</h3>
            </div>
          </div>

          <div className="epc-step-grid">
            <div className="epc-step-card">
              <span>{ui.brandStep}</span>
              <div className="epc-pill-row">
                {brands.map((brand) => (
                  <button
                    key={brand.id}
                    type="button"
                    className={`filter-chip ${selectedBrandId === brand.id ? "is-active" : ""}`}
                    onClick={() => selectBrand(brand.id)}
                  >
                    {getText(locale, brand.name)}
                  </button>
                ))}
              </div>
            </div>

            <div className="epc-step-card">
              <span>{ui.seriesStep}</span>
              <div className="epc-pill-row">
                {seriesOptions.map((vehicle) => (
                  <button
                    key={vehicle.seriesId}
                    type="button"
                    className={`filter-chip ${selectedSeriesId === vehicle.seriesId ? "is-active" : ""}`}
                    onClick={() => selectSeries(vehicle.seriesId)}
                  >
                    {getText(locale, vehicle.series)}
                  </button>
                ))}
              </div>
            </div>

            <div className="epc-step-card">
              <span>{ui.yearStep}</span>
              <div className="epc-pill-row">
                {yearOptions.map((vehicle) => (
                  <button
                    key={vehicle.year}
                    type="button"
                    className={`filter-chip ${selectedYear === vehicle.year ? "is-active" : ""}`}
                    onClick={() => selectYear(vehicle.year)}
                  >
                    {vehicle.year}
                  </button>
                ))}
              </div>
            </div>

            <div className="epc-step-card">
              <span>{ui.modelStep}</span>
              <div className="epc-model-list">
                {modelOptions.map((vehicle) => (
                  <button
                    key={vehicle.id}
                    type="button"
                    className={`epc-model-card ${selectedVehicleId === vehicle.id ? "is-active" : ""}`}
                    onClick={() => applyVehicleSelection(vehicle.id)}
                  >
                    <div>
                      <strong>{getText(locale, vehicle.model)}</strong>
                      <small>{vehicle.code}</small>
                    </div>
                    <CarFront size={16} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </article>

        <article className="epc-guide-panel">
          <div className="epc-split-head">
            <div>
              <p className="section-kicker">{ui.groupStep}</p>
              <h3>{getText(locale, currentVehicle.model)}</h3>
            </div>
            <span className="status-pill">{currentVehicle.code}</span>
          </div>

          <div className="epc-group-grid">
            <div className="epc-step-card">
              <span>{ui.groupStep}</span>
              <div className="epc-stack-list">
                {currentVehicle.groups.map((group) => (
                  <button
                    key={group.id}
                    type="button"
                    className={`epc-stack-button ${selectedGroupId === group.id ? "is-active" : ""}`}
                    onClick={() => selectGroup(group.id)}
                  >
                    <span className="epc-stack-accent" style={{ background: group.accent }} />
                    <strong>{getText(locale, group.name)}</strong>
                  </button>
                ))}
              </div>
            </div>

            <div className="epc-step-card">
              <span>{ui.subgroupStep}</span>
              <div className="epc-stack-list">
                {currentGroup.subgroups.map((subgroup) => (
                  <button
                    key={subgroup.id}
                    type="button"
                    className={`epc-stack-button ${selectedSubgroupId === subgroup.id ? "is-active" : ""}`}
                    onClick={() => selectSubgroup(subgroup.id)}
                  >
                    <Boxes size={16} />
                    <strong>{getText(locale, subgroup.name)}</strong>
                  </button>
                ))}
              </div>
            </div>

            <div className="epc-step-card">
              <span>{ui.diagramTitle}</span>
              <div className="epc-diagram-list">
                {currentSubgroup.diagrams.map((diagram) => (
                  <button
                    key={diagram.id}
                    type="button"
                    className={`epc-diagram-card ${selectedDiagramId === diagram.id ? "is-active" : ""}`}
                    onClick={() =>
                      navigate(
                        buildEpcPath("/epc/workbench", {
                          vehicleId: currentVehicle.id,
                          groupId: currentGroup.id,
                          subgroupId: currentSubgroup.id,
                          diagramId: diagram.id,
                          partId: diagram.parts[0].id,
                        }),
                      )
                    }
                  >
                    <div className="epc-diagram-thumb">
                      <ImageIcon size={18} />
                      <span>{diagram.code}</span>
                    </div>
                    <div>
                      <strong>{getText(locale, diagram.name)}</strong>
                      <small>{getText(locale, diagram.blurb)}</small>
                    </div>
                    <ArrowRight size={16} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </article>
      </section>
      ) : null}

      {isWorkbenchView ? (
      <section className="epc-workbench reveal delay-2">
        <div className="section-heading">
          <div>
            <p className="section-kicker">{ui.workspaceTitle}</p>
            <h3>{ui.workspaceHint}</h3>
          </div>
          <button type="button" className="toolbar-ghost" onClick={openCart}>
            <ShoppingCart size={16} />
            {ui.openCart}
          </button>
        </div>

        <div className="epc-workbench-grid">
          <article className="diagram-stage">
            <div className="diagram-stage-head">
              <div>
                <strong>{currentDiagram.code}</strong>
                <p>{getText(locale, currentDiagram.name)}</p>
              </div>
              <span className="status-pill">{currentDiagram.parts.length} parts</span>
            </div>

            <div className="diagram-canvas">
              <div className="diagram-outline primary" />
              <div className="diagram-outline secondary" />
              {currentDiagram.parts.map((part) => (
                <button
                  key={part.id}
                  type="button"
                  className={`diagram-hotspot ${activePartId === part.id ? "is-active" : ""}`}
                  style={{ left: `${part.hotspotX}%`, top: `${part.hotspotY}%` }}
                  onClick={() => setActivePartId(part.id)}
                >
                  <CircleDot size={16} />
                  <span>{part.hotspot}</span>
                </button>
              ))}
            </div>

            <div className="diagram-caption">
              <div>
                <small>{ui.selectedState}</small>
                <strong>{getText(locale, currentPart.name)}</strong>
              </div>
              <span>{getText(locale, currentPart.note)}</span>
            </div>
          </article>

          <article className="parts-table-shell">
            <div className="diagram-stage-head">
              <div>
                <strong>{ui.partsTitle}</strong>
                <p>{currentVehicle.vin}</p>
              </div>
              {toastVisible ? (
                <span className="epc-toast-pill">
                  <Check size={14} />
                  {ui.addedToast}
                </span>
              ) : null}
            </div>
            <div className="parts-table-scroll">
              <table className="parts-table">
                <thead>
                  <tr>
                    <th>{ui.table.hotspot}</th>
                    <th>{ui.table.sku}</th>
                    <th>{ui.table.name}</th>
                    <th>{ui.table.note}</th>
                    <th>{ui.table.usage}</th>
                    <th>{ui.table.pack}</th>
                    <th>{ui.table.currency}</th>
                    <th>{ui.table.price}</th>
                    <th>{ui.table.action}</th>
                  </tr>
                </thead>
                <tbody>
                  {currentDiagram.parts.map((part) => {
                    const isEditing = quantityEditorId === part.id;

                    return (
                      <tr
                        key={part.id}
                        ref={(node) => {
                          rowRefs.current[part.id] = node;
                        }}
                        className={activePartId === part.id ? "is-active" : ""}
                        onClick={() => setActivePartId(part.id)}
                      >
                        <td>{part.hotspot}</td>
                        <td>
                          <button
                            type="button"
                            className="epc-link-button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setPartDetailId(part.id);
                            }}
                          >
                            {part.sku}
                          </button>
                        </td>
                        <td>{getText(locale, part.name)}</td>
                        <td>{getText(locale, part.note)}</td>
                        <td>{part.usage}</td>
                        <td>{part.packSize}</td>
                        <td>{locale === "zh-CN" ? "CNY" : "USD"}</td>
                        <td>{formatMoney(locale, part.price)}</td>
                        <td>
                          {isEditing ? (
                            <div className="quantity-inline" onClick={(event) => event.stopPropagation()}>
                              <button
                                type="button"
                                className="icon-button quantity-button"
                                onClick={() => setDraftQuantity((current) => Math.max(1, current - 1))}
                                aria-label="decrease quantity"
                              >
                                <Minus size={16} />
                              </button>
                              <span>
                                {ui.quantityLabel} {draftQuantity}
                              </span>
                              <button
                                type="button"
                                className="icon-button quantity-button"
                                onClick={() => setDraftQuantity((current) => current + 1)}
                                aria-label="increase quantity"
                              >
                                <Plus size={16} />
                              </button>
                              <button
                                type="button"
                                className="primary-action epc-mini-action"
                                onClick={() => handleConfirmAdd(part)}
                              >
                                {ui.addConfirm}
                              </button>
                              <button
                                type="button"
                                className="secondary-action epc-mini-action"
                                onClick={() => setQuantityEditorId(null)}
                              >
                                {ui.close}
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              className="secondary-action epc-mini-action"
                              onClick={(event) => {
                                event.stopPropagation();
                                setQuantityEditorId(part.id);
                                setDraftQuantity(Math.max(part.packSize, part.usage));
                              }}
                            >
                              <Plus size={14} />
                              {ui.add}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </article>
        </div>
      </section>
      ) : null}

      {isHomeView && vinVehicleId ? (
        <div className="epc-modal-wrap">
          <div className="epc-modal-card">
            <div className="drawer-head">
              <div>
                <p className="section-kicker">{ui.vinCardTitle}</p>
                <h2>
                  {getText(locale, vehicleMap.get(vinVehicleId)?.brand ?? text("", ""))} /{" "}
                  {getText(locale, vehicleMap.get(vinVehicleId)?.series ?? text("", ""))} /{" "}
                  {vehicleMap.get(vinVehicleId)?.year} /{" "}
                  {getText(locale, vehicleMap.get(vinVehicleId)?.model ?? text("", ""))}
                </h2>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setVinVehicleId(null)}
                aria-label="close vin modal"
              >
                <X size={18} />
              </button>
            </div>
            {(() => {
              const vehicle = vehicleMap.get(vinVehicleId);

              if (!vehicle) {
                return null;
              }

              return (
                <>
                  <div className="vehicle-facts">
                    <div>
                      <span>VIN</span>
                      <strong>{vehicle.vin}</strong>
                    </div>
                    <div>
                      <span>{ui.filterFields.model}</span>
                      <strong>{vehicle.code}</strong>
                    </div>
                    <div>
                      <span>{ui.filterFields.year}</span>
                      <strong>{vehicle.year}</strong>
                    </div>
                    <div>
                      <span>Type</span>
                      <strong>{getText(locale, vehicle.vehicleType)}</strong>
                    </div>
                    <div>
                      <span>Energy</span>
                      <strong>{getText(locale, vehicle.energy)}</strong>
                    </div>
                    <div>
                      <span>Body</span>
                      <strong>{getText(locale, vehicle.body)}</strong>
                    </div>
                    <div>
                      <span>Country</span>
                      <strong>{getText(locale, vehicle.country)}</strong>
                    </div>
                    <div>
                      <span>Date</span>
                      <strong>{vehicle.productionDate}</strong>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="primary-action"
                    onClick={() => {
                      navigate(
                        buildEpcPath("/epc/wizard", {
                          vehicleId: vehicle.id,
                          groupId: vehicle.groups[0].id,
                          subgroupId: vehicle.groups[0].subgroups[0].id,
                          diagramId: vehicle.groups[0].subgroups[0].diagrams[0].id,
                          partId: vehicle.groups[0].subgroups[0].diagrams[0].parts[0].id,
                        }),
                      );
                      setVinVehicleId(null);
                    }}
                  >
                    {ui.vinButton}
                    <ArrowRight size={16} />
                  </button>
                </>
              );
            })()}
          </div>
        </div>
      ) : null}

      {isWorkbenchView && detailPart ? (
        <div className="epc-modal-wrap">
          <aside className="epc-detail-drawer">
            <div className="drawer-head">
              <div>
                <p className="section-kicker">{ui.partDetail}</p>
                <h2>{getText(locale, detailPart.name)}</h2>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setPartDetailId(null)}
                aria-label="close part detail"
              >
                <X size={18} />
              </button>
            </div>

            <div className="part-gallery">
              {detailPart.images.map((image) => (
                <div key={image} className="part-gallery-card">
                  <ImageIcon size={16} />
                  <span>{image}</span>
                </div>
              ))}
            </div>

            <div className="part-meta-grid">
              <div>
                <span>{ui.table.sku}</span>
                <strong>{detailPart.sku}</strong>
              </div>
              <div>
                <span>{ui.table.pack}</span>
                <strong>{detailPart.packSize}</strong>
              </div>
              <div>
                <span>{ui.table.price}</span>
                <strong>{formatMoney(locale, detailPart.price)}</strong>
              </div>
              <div>
                <span>{ui.table.note}</span>
                <strong>{getText(locale, detailPart.note)}</strong>
              </div>
            </div>

            <button
              type="button"
              className="primary-action block"
              onClick={() => {
                setQuantityEditorId(detailPart.id);
                setDraftQuantity(Math.max(detailPart.packSize, detailPart.usage));
                setPartDetailId(null);
              }}
            >
              <ShoppingCart size={16} />
              {ui.add}
            </button>

            <section className="drawer-section">
              <div className="summary-heading">
                <Boxes size={16} />
                <p>{ui.applicability}</p>
              </div>
              <div className="compatibility-list">
                {detailPart.applicability.map((item) => (
                  <article key={`${item.code}-${item.brand["en-US"]}`} className="compatibility-card">
                    <strong>{item.code}</strong>
                    <span>{getText(locale, item.model)}</span>
                    <small>{getText(locale, item.brand)}</small>
                  </article>
                ))}
              </div>
            </section>

            <section className="drawer-section">
              <div className="summary-heading">
                <Sparkles size={16} />
                <p>{ui.supersession}</p>
              </div>
              <div className="supersession-chain">
                {detailPart.supersession.map((item, index) => (
                  <div key={item} className="supersession-node">
                    <span>{item}</span>
                    {index < detailPart.supersession.length - 1 ? <ArrowRight size={14} /> : null}
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      ) : null}

      {isWorkbenchView && isAdvancedOpen ? (
        <div className="epc-modal-wrap">
          <aside className="epc-advanced-panel">
            <div className="drawer-head">
              <div>
                <p className="section-kicker">{ui.advancedTitle}</p>
                <h2>{ui.advancedHint}</h2>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setIsAdvancedOpen(false)}
                aria-label="close advanced search"
              >
                <X size={18} />
              </button>
            </div>
            <div className="advanced-form-grid">
              {(
                [
                  ["vin", ui.filterFields.vin],
                  ["diagramCode", ui.filterFields.diagramCode],
                  ["diagramName", ui.filterFields.diagramName],
                  ["partNumber", ui.filterFields.partNumber],
                  ["partName", ui.filterFields.partName],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="advanced-field">
                  <span>{label}</span>
                  <input
                    value={advancedDraft[key]}
                    onChange={(event) =>
                      setAdvancedDraft((current) => ({
                        ...current,
                        [key]: event.target.value,
                      }))
                    }
                  />
                </label>
              ))}

              <label className="advanced-field">
                <span>{ui.filterFields.brand}</span>
                <select
                  value={advancedDraft.brandId}
                  onChange={(event) =>
                    setAdvancedDraft((current) => ({
                      ...current,
                      brandId: event.target.value,
                    }))
                  }
                >
                  <option value="">All</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {getText(locale, brand.name)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="advanced-field">
                <span>{ui.filterFields.series}</span>
                <select
                  value={advancedDraft.seriesId}
                  onChange={(event) =>
                    setAdvancedDraft((current) => ({
                      ...current,
                      seriesId: event.target.value,
                    }))
                  }
                >
                  <option value="">All</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.seriesId}>
                      {getText(locale, vehicle.series)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="advanced-field">
                <span>{ui.filterFields.year}</span>
                <select
                  value={advancedDraft.year}
                  onChange={(event) =>
                    setAdvancedDraft((current) => ({
                      ...current,
                      year: event.target.value,
                    }))
                  }
                >
                  <option value="">All</option>
                  {[...new Set(vehicles.map((vehicle) => vehicle.year))].map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </label>

              <label className="advanced-field">
                <span>{ui.filterFields.model}</span>
                <select
                  value={advancedDraft.modelId}
                  onChange={(event) =>
                    setAdvancedDraft((current) => ({
                      ...current,
                      modelId: event.target.value,
                    }))
                  }
                >
                  <option value="">All</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {getText(locale, vehicle.series)} / {getText(locale, vehicle.model)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="advanced-field">
                <span>{ui.filterFields.group}</span>
                <select
                  value={advancedDraft.groupId}
                  onChange={(event) =>
                    setAdvancedDraft((current) => ({
                      ...current,
                      groupId: event.target.value,
                    }))
                  }
                >
                  <option value="">All</option>
                  {[...new Map(diagramHits.map(({ group }) => [group.id, group])).values()].map((group) => (
                    <option key={group.id} value={group.id}>
                      {getText(locale, group.name)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="advanced-field">
                <span>{ui.filterFields.subgroup}</span>
                <select
                  value={advancedDraft.subgroupId}
                  onChange={(event) =>
                    setAdvancedDraft((current) => ({
                      ...current,
                      subgroupId: event.target.value,
                    }))
                  }
                >
                  <option value="">All</option>
                  {[...new Map(diagramHits.map(({ subgroup }) => [subgroup.id, subgroup])).values()].map((subgroup) => (
                    <option key={subgroup.id} value={subgroup.id}>
                      {getText(locale, subgroup.name)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="hero-actions">
              <button
                type="button"
                className="primary-action"
                onClick={() => setAdvancedCommitted(advancedDraft)}
              >
                {ui.query}
              </button>
              <button
                type="button"
                className="secondary-action"
                onClick={() => {
                  setAdvancedDraft(blankAdvancedFilters);
                  setAdvancedCommitted(blankAdvancedFilters);
                }}
              >
                {ui.reset}
              </button>
            </div>

            <div className="advanced-tabs">
              <button
                type="button"
                className={`filter-chip ${advancedTab === "parts" ? "is-active" : ""}`}
                onClick={() => setAdvancedTab("parts")}
              >
                {ui.matchParts} ({advancedPartResults.length})
              </button>
              <button
                type="button"
                className={`filter-chip ${advancedTab === "diagrams" ? "is-active" : ""}`}
                onClick={() => setAdvancedTab("diagrams")}
              >
                {ui.matchDiagrams} ({advancedDiagramResults.length})
              </button>
            </div>

            <div className="advanced-results">
              {advancedTab === "parts"
                ? advancedPartResults.map(({ vehicle, group, subgroup, diagram, part }) => (
                    <article key={`${vehicle.id}-${part.id}`} className="advanced-result-card">
                      <div className="advanced-result-thumb">
                        <ImageIcon size={18} />
                        <span>{diagram.code}</span>
                      </div>
                      <div className="advanced-result-body">
                        <button
                          type="button"
                          className="epc-link-button"
                          onClick={() => setPartDetailId(part.id)}
                        >
                          {part.sku}
                        </button>
                        <strong>{getText(locale, part.name)}</strong>
                        <p>
                          {getText(locale, vehicle.brand)} / {getText(locale, vehicle.series)} /{" "}
                          {vehicle.year} / {getText(locale, vehicle.model)}
                        </p>
                        <small>
                          {getText(locale, group.name)} / {getText(locale, subgroup.name)} /{" "}
                          {diagram.code}
                        </small>
                      </div>
                      <div className="advanced-result-side">
                        <span>{formatMoney(locale, part.price)}</span>
                        <button
                          type="button"
                          className="secondary-action epc-mini-action"
                          onClick={() => {
                            applyVehicleSelection(vehicle.id, {
                              groupId: group.id,
                              subgroupId: subgroup.id,
                              diagramId: diagram.id,
                              partId: part.id,
                            });
                            setIsAdvancedOpen(false);
                          }}
                        >
                          {ui.selectedState}
                        </button>
                      </div>
                    </article>
                  ))
                : advancedDiagramResults.map(({ vehicle, group, subgroup, diagram }) => (
                    <article key={`${vehicle.id}-${diagram.id}`} className="advanced-result-card">
                      <div className="advanced-result-thumb">
                        <ImageIcon size={18} />
                        <span>{diagram.code}</span>
                      </div>
                      <div className="advanced-result-body">
                        <strong>{getText(locale, diagram.name)}</strong>
                        <p>
                          {getText(locale, vehicle.brand)} / {getText(locale, vehicle.series)} /{" "}
                          {vehicle.year} / {getText(locale, vehicle.model)}
                        </p>
                        <small>
                          {ui.diagramLocation}: {getText(locale, group.name)} /{" "}
                          {getText(locale, subgroup.name)}
                        </small>
                      </div>
                      <div className="advanced-result-side">
                        <span>{diagram.parts.length} parts</span>
                        <button
                          type="button"
                          className="secondary-action epc-mini-action"
                          onClick={() => {
                            applyVehicleSelection(vehicle.id, {
                              groupId: group.id,
                              subgroupId: subgroup.id,
                              diagramId: diagram.id,
                            });
                            setIsAdvancedOpen(false);
                          }}
                        >
                          {ui.selectedState}
                        </button>
                      </div>
                    </article>
                  ))}

              {advancedTab === "parts" && advancedPartResults.length === 0 ? (
                <p className="advanced-empty-state">{ui.emptyResults}</p>
              ) : null}
              {advancedTab === "diagrams" && advancedDiagramResults.length === 0 ? (
                <p className="advanced-empty-state">{ui.emptyResults}</p>
              ) : null}
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
