import type {
  Applicability,
  Brand,
  DiagramRecord,
  GroupRecord,
  HistoryEntry,
  PartRecord,
  SubgroupRecord,
  VehicleRecord,
} from "./EpcPage";
import carRaw from "../../../mock/car.md?raw";
import groupRaw from "../../../mock/group.md?raw";
import partsRaw from "../../../mock/parts.md?raw";
import usageRaw from "../../../mock/usage.md?raw";

type MockCarModel = {
  "车型code": string;
  "车型名称": string;
};

type MockCarYear = {
  "年份": number;
  "车型列表": MockCarModel[];
};

type MockCarSeries = {
  "车系code": string;
  "车系名称": string;
  "年款": MockCarYear[];
};

type MockGroupDiagram = {
  "爆炸图code": string;
  "爆炸图名称": string;
};

type MockGroupSubgroup = {
  "二级分组code": string;
  "二级分组名称": string;
  "爆炸图列表": MockGroupDiagram[];
};

type MockGroup = {
  "一级分组code": string;
  "一级分组名称": string;
  "二级分组列表": MockGroupSubgroup[];
};

type MockUsagePart = {
  "热点": string;
  "配件号": string;
  "配件名称": string;
  "备注": string;
  "用量": number;
  "最小包装数": number;
  "币种": string;
  "金额": number;
};

type MockUsageDiagram = {
  "爆炸图code": string;
  "爆炸图名称": string;
  "装配配件列表": MockUsagePart[];
};

type MockPartApplicability = {
  "品牌": string;
  "车系code": string;
  "车系名称": string;
  "年款": number;
  "车型code": string;
  "车型名称": string;
  "配件所在爆炸图一级分组code": string;
  "配件所在爆炸图一级分组名称": string;
  "配件所在爆炸图二级分组code": string;
  "配件所在爆炸图二级分组名称": string;
  "热点号": string;
};

type MockPartReplacement = {
  "替换件code": string;
  "替换类型": string;
  "适用车型": string;
  "断点时间": string;
};

type MockPartDetail = {
  "配件号": string;
  "配件名称": string;
  "最小包装数": number;
  "币种": string;
  "价格": number;
  "配件适用车型清单": MockPartApplicability[];
  "配件替换链": MockPartReplacement[];
};

const carMock = JSON.parse(carRaw) as {
  automobile_data: Record<string, MockCarSeries[]>;
};

const groupMock = JSON.parse(groupRaw) as {
  car_bom_group_legend_data: MockGroup[];
};

const usageMock = JSON.parse(usageRaw) as {
  bom_chassis_assembly_data: MockUsageDiagram[];
};

const partsMock = JSON.parse(partsRaw) as {
  chassis_parts_info_list: MockPartDetail[];
};

const brandMetaByName: Record<string, { id: string; mark: string; en: string }> = {
  五菱: { id: "wuling", mark: "W", en: "Wuling" },
  宝骏: { id: "baojun", mark: "B", en: "Baojun" },
  新宝骏: { id: "new-baojun", mark: "N", en: "New Baojun" },
};

const groupAccentPalette = [
  "oklch(0.72 0.1 165)",
  "oklch(0.72 0.09 230)",
  "oklch(0.72 0.1 20)",
  "oklch(0.72 0.08 95)",
];

function localeText(zh: string, en?: string) {
  return {
    "zh-CN": zh,
    "en-US": en ?? zh,
  };
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function buildMockVin(modelCode: string, index: number) {
  const cleaned = `${modelCode}${index + 1}123456789ABCDEFGHJKLMNPRSTUVWXYZ`
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .replace(/[IOQ]/g, "X");

  return `LS${cleaned.slice(0, 15)}`;
}

function buildHotspotPosition(index: number, total: number) {
  const columns = total <= 4 ? total : Math.min(4, Math.ceil(Math.sqrt(total)));
  const rows = Math.max(1, Math.ceil(total / Math.max(columns, 1)));
  const column = columns === 1 ? 0 : index % columns;
  const row = Math.floor(index / Math.max(columns, 1));

  return {
    hotspotX: Math.round(columns === 1 ? 50 : 18 + (column * 64) / (columns - 1)),
    hotspotY: Math.round(rows === 1 ? 50 : 22 + (row * 56) / (rows - 1)),
  };
}

function buildPartGallery(sku: string) {
  return [`${sku} 正视图`, `${sku} 细节图`, `${sku} 包装图`];
}

function deriveEnergy(seriesName: string, modelName: string) {
  const joined = `${seriesName} ${modelName}`.toUpperCase();

  if (joined.includes("PHEV") || modelName.includes("混动")) {
    return localeText("插电混动", "PHEV");
  }

  if (joined.includes("EV") || modelName.includes("电")) {
    return localeText("纯电", "BEV");
  }

  return localeText("燃油", "ICE");
}

function deriveEmission(energyLabel: { "zh-CN": string }) {
  return energyLabel["zh-CN"] === "燃油"
    ? localeText("国 VI", "China VI")
    : localeText("零排放", "Zero emission");
}

function buildFallbackPartNumber(diagramCode: string, index: number) {
  const base = diagramCode.replace(/[^A-Z0-9]/gi, "").toUpperCase().slice(0, 8).padEnd(8, "X");
  return `${base}${String(index + 1).padStart(2, "0")}`;
}

function buildFallbackPrice(diagramCode: string, index: number) {
  const seed = diagramCode
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return Math.round((seed % 180 + 20 + index * 18.5) * 10) / 10;
}

function buildFallbackUsage(
  group: MockGroup,
  subgroup: MockGroupSubgroup,
  diagram: MockGroupDiagram,
): MockUsageDiagram {
  const partNames = [
    `${diagram["爆炸图名称"]}总成`,
    `${subgroup["二级分组名称"]}安装支架`,
    `${group["一级分组名称"]}固定件`,
  ];

  return {
    "爆炸图code": diagram["爆炸图code"],
    "爆炸图名称": diagram["爆炸图名称"],
    "装配配件列表": partNames.map((name, index) => ({
      "热点": String(index + 1),
      "配件号": buildFallbackPartNumber(diagram["爆炸图code"], index),
      "配件名称": name,
      "备注": `自动补齐的 ${diagram["爆炸图名称"]} mock 配件`,
      "用量": index === 2 ? 4 : 1,
      "最小包装数": index === 2 ? 10 : 1,
      "币种": "CNY",
      "金额": buildFallbackPrice(diagram["爆炸图code"], index),
    })),
  };
}

const usageByDiagramCode = new Map(
  usageMock.bom_chassis_assembly_data.map((item) => [item["爆炸图code"], item]),
);

for (const group of groupMock.car_bom_group_legend_data) {
  for (const subgroup of group["二级分组列表"]) {
    for (const diagram of subgroup["爆炸图列表"]) {
      if (!usageByDiagramCode.has(diagram["爆炸图code"])) {
        usageByDiagramCode.set(
          diagram["爆炸图code"],
          buildFallbackUsage(group, subgroup, diagram),
        );
      }
    }
  }
}

const partDetailBySku = new Map(
  partsMock.chassis_parts_info_list.map((item) => [item["配件号"], item]),
);

function buildApplicability(detail?: MockPartDetail): Applicability[] {
  if (!detail) {
    return [];
  }

  return detail["配件适用车型清单"].map((item) => ({
    code: item["车型code"],
    model: localeText(item["车型名称"]),
    brand: localeText(item["品牌"], brandMetaByName[item["品牌"]]?.en ?? item["品牌"]),
  }));
}

function buildDiagramParts(diagramCode: string): PartRecord[] {
  const diagramUsage = usageByDiagramCode.get(diagramCode);

  if (!diagramUsage) {
    return [];
  }

  return diagramUsage["装配配件列表"].map((part, index, list) => {
    const detail = partDetailBySku.get(part["配件号"]);
    const position = buildHotspotPosition(index, list.length);

    return {
      id: `${diagramCode}:${part["配件号"]}`,
      hotspot: String(part["热点"]).padStart(2, "0"),
      sku: part["配件号"],
      name: localeText(detail?.["配件名称"] ?? part["配件名称"]),
      note: localeText(part["备注"]),
      usage: part["用量"],
      packSize: detail?.["最小包装数"] ?? part["最小包装数"],
      price: detail?.["价格"] ?? part["金额"],
      images: buildPartGallery(part["配件号"]),
      applicability: buildApplicability(detail),
      supersession: detail
        ? [detail["配件号"], ...detail["配件替换链"].map((item) => item["替换件code"])]
        : [part["配件号"]],
      ...position,
    };
  });
}

const sharedGroups: GroupRecord[] = groupMock.car_bom_group_legend_data.map((group, groupIndex) => {
  const subgroups: SubgroupRecord[] = group["二级分组列表"].map((subgroup) => {
    const diagrams: DiagramRecord[] = subgroup["爆炸图列表"].map((diagram) => {
      const runtimeUsage = usageByDiagramCode.get(diagram["爆炸图code"]);

      return {
        id: diagram["爆炸图code"],
        code: diagram["爆炸图code"],
        name: localeText(runtimeUsage?.["爆炸图名称"] ?? diagram["爆炸图名称"]),
        blurb: localeText(""),
        parts: buildDiagramParts(diagram["爆炸图code"]),
      };
    });

    return {
      id: subgroup["二级分组code"],
      name: localeText(subgroup["二级分组名称"]),
      diagrams,
    };
  });

  return {
    id: group["一级分组code"],
    name: localeText(group["一级分组名称"]),
    accent: groupAccentPalette[groupIndex % groupAccentPalette.length],
    subgroups,
  };
});

export const brands: Brand[] = Object.keys(carMock.automobile_data).map((brandName) => ({
  id: brandMetaByName[brandName]?.id ?? slugify(brandName),
  mark: brandMetaByName[brandName]?.mark ?? brandName.slice(0, 1).toUpperCase(),
  name: localeText(brandName, brandMetaByName[brandName]?.en ?? brandName),
  summary: localeText(`${brandName} 车型目录`, `${brandMetaByName[brandName]?.en ?? brandName} catalog`),
}));

let vehicleCounter = 0;

export const vehicles: VehicleRecord[] = Object.entries(carMock.automobile_data).flatMap(
  ([brandName, seriesList]) =>
    seriesList.flatMap((series) =>
      series["年款"].flatMap((yearItem) =>
        yearItem["车型列表"].map((model) => {
          vehicleCounter += 1;
          const brandMeta = brandMetaByName[brandName];
          const energy = deriveEnergy(series["车系名称"], model["车型名称"]);

          return {
            id: model["车型code"],
            brandId: brandMeta?.id ?? slugify(brandName),
            seriesId: series["车系code"],
            brand: localeText(brandName, brandMeta?.en ?? brandName),
            series: localeText(series["车系名称"]),
            year: String(yearItem["年份"]),
            model: localeText(model["车型名称"]),
            code: model["车型code"],
            vin: buildMockVin(model["车型code"], vehicleCounter),
            vehicleType: localeText("乘用车", "Passenger vehicle"),
            energy,
            emission: deriveEmission(energy),
            body: localeText("乘用车", "Passenger vehicle"),
            country: localeText("中国", "China"),
            productionDate: `${yearItem["年份"]}-01-01`,
            groups: sharedGroups,
          };
        }),
      ),
    ),
);

function buildDefaultHistoryEntry(vehicle: VehicleRecord, timeLabel: string): HistoryEntry {
  const group = vehicle.groups[0];
  const subgroup = group.subgroups[0];
  const diagram = subgroup.diagrams[0];

  return {
    id: `seed-${vehicle.id}-${diagram.id}`,
    vehicleId: vehicle.id,
    groupId: group.id,
    subgroupId: subgroup.id,
    diagramId: diagram.id,
    title: localeText(`${vehicle.series["zh-CN"]} / ${diagram.name["zh-CN"]}`),
    trail: localeText(
      `${vehicle.brand["zh-CN"]} > ${vehicle.series["zh-CN"]} > ${group.name["zh-CN"]} > ${subgroup.name["zh-CN"]}`,
    ),
    timeLabel,
  };
}

const primaryVehicle = vehicles[0];
const secondaryVehicle =
  vehicles.find((vehicle) => vehicle.brandId !== primaryVehicle?.brandId) ??
  vehicles[1] ??
  primaryVehicle;

export const defaultHistoryEntries: HistoryEntry[] = primaryVehicle
  ? [
      buildDefaultHistoryEntry(primaryVehicle, "15:40"),
      buildDefaultHistoryEntry(secondaryVehicle, "昨天"),
    ]
  : [];
