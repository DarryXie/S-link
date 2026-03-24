import { ArrowRight, History, Image, Search, X } from "lucide-react";
import { type ClipboardEvent, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { Locale } from "../../content";
import {
  EpcBackButton,
  brands,
  buildEpcPath,
  diagramHits,
  getText,
  pageCopy,
  partHits,
  readHistoryEntries,
  text,
  useEpcSelectionState,
  vehicleMap,
  vehicles,
} from "./EpcPage";
import { useEpcHeader } from "./epcHeaderContext";

type EpcHomePageProps = {
  locale: Locale;
};

const demoImageVin = "LS6J3E2X3SK414831";

function formatImageSize(size: number) {
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(size / 102.4) / 10)} KB`;
}

export function EpcHomePage({ locale }: EpcHomePageProps) {
  const ui = pageCopy[locale];
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  useEpcSelectionState(searchParams);
  const [query, setQuery] = useState("");
  const [vinVehicleId, setVinVehicleId] = useState<string | null>(null);
  const [recognizedVin, setRecognizedVin] = useState("");
  const [pastedImage, setPastedImage] = useState<{ name: string; size: number } | null>(null);
  const headerConfig = useMemo(
    () => ({
      backFallbackTo: "/",
      backLabel: locale === "zh-CN" ? "返回系统首页" : "Back to overview",
      breadcrumbs: [],
    }),
    [locale],
  );
  const [historyEntries] = useState(() => {
    const seeds = readHistoryEntries();
    const timeLabels = ["16:54", "16:53", "16:43", "15:40", "昨天", "昨天", "3月18日", "3月18日"];

    return Array.from({ length: 8 }, (_, index) => {
      const seed = seeds[index % seeds.length];

      return {
        ...seed,
        id: `${seed.id}-${index}`,
        timeLabel: timeLabels[index] ?? seed.timeLabel,
      };
    });
  });

  function handleSearch() {
    const normalized = query.trim().toUpperCase();
    const normalizedVin = normalized.replace(/[^A-Z0-9]/g, "");

    if (pastedImage) {
      setRecognizedVin(demoImageVin);
      setVinVehicleId(vehicles[0].id);
      return;
    }

    if (!normalized) {
      return;
    }

    if (normalizedVin.length === 17) {
      const vehicleHit =
        vehicles.find((vehicle) => vehicle.vin === normalizedVin) ??
        vehicles[normalizedVin.charCodeAt(normalizedVin.length - 1) % vehicles.length];

      setRecognizedVin(normalizedVin);
      setVinVehicleId(vehicleHit.id);
      return;
    }

    const firstPart = partHits.find(
      ({ part }) =>
        part.sku.includes(normalized) ||
        getText(locale, part.name).toLowerCase().includes(normalized.toLowerCase()),
    );

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

    const firstDiagram = diagramHits.find(
      ({ diagram }) =>
        diagram.code.includes(normalized) ||
        getText(locale, diagram.name).toLowerCase().includes(normalized.toLowerCase()),
    );

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
  }

  function handleImagePaste(event: ClipboardEvent<HTMLElement>) {
    const imageItem = Array.from(event.clipboardData.items).find((item) => item.type.startsWith("image/"));
    const file = imageItem?.getAsFile();

    if (!file) {
      return;
    }

    event.preventDefault();
    setPastedImage({
      name: file.name || (locale === "zh-CN" ? "剪贴板图片" : "Clipboard image"),
      size: file.size,
    });
  }

  useEpcHeader(headerConfig);

  return (
    <div className="page-stack epc-page epc-home-page">
      <div className="epc-subpage-bar reveal">
        <EpcBackButton
          fallbackTo="/"
          label={locale === "zh-CN" ? "返回系统首页" : "Back to overview"}
        />
      </div>

      <section className="epc-home-shell">
        <div className="epc-home-main">
          <section className="epc-home-intro reveal">
            <div className="epc-hero-copy epc-home-hero-copy">
              <p className="section-kicker">{ui.eyebrow}</p>
              <h2>{locale === "zh-CN" ? "欢迎使用EPC" : "Welcome to EPC"}</h2>
              <p>{ui.description}</p>
              <div className="epc-chip-row">
                {ui.quickLabels.map((label) => (
                  <span key={label} className="epc-inline-chip">
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <article className="epc-home-catalog-panel reveal delay-1">
            <label className="search-box epc-search-box" onPasteCapture={handleImagePaste}>
              <Search size={18} />
              <input
                type="text"
                value={query}
                placeholder={ui.searchPlaceholder}
                onChange={(event) => setQuery(event.target.value)}
                onPaste={handleImagePaste}
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
            <div className="epc-search-assist">
              {pastedImage ? (
                <div className="epc-paste-chip">
                  <div className="epc-paste-chip-copy">
                    <Image size={16} />
                    <span>
                      {locale === "zh-CN" ? "已粘贴图片" : "Image pasted"} · {pastedImage.name} ·{" "}
                      {formatImageSize(pastedImage.size)}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="icon-button epc-paste-chip-clear"
                    onClick={() => setPastedImage(null)}
                    aria-label={locale === "zh-CN" ? "清除图片" : "Clear image"}
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <p className="epc-search-hint">
                  {locale === "zh-CN"
                    ? "聚焦输入框后可直接粘贴图片，当前演示为点击“开始检索”后模拟识别 VIN。"
                    : "Focus the field and paste an image to simulate VIN recognition on search."}
                </p>
              )}
            </div>

            <div className="brand-matrix">
              {brands.map((brand) => (
                <button
                  key={brand.id}
                  type="button"
                  className="brand-card"
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
                </button>
              ))}
            </div>
          </article>
        </div>

        <aside className="epc-history-rail">
          <div className="epc-history-head">
            <p className="section-kicker">{ui.historyTitle}</p>
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
              </button>
            ))}
          </div>
        </aside>
      </section>

      {vinVehicleId ? (
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
                onClick={() => {
                  setRecognizedVin("");
                  setVinVehicleId(null);
                }}
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
                      <strong>{recognizedVin || vehicle.vin}</strong>
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
                        buildEpcPath("/epc/groups", {
                          vehicleId: vehicle.id,
                          groupId: vehicle.groups[0].id,
                          subgroupId: vehicle.groups[0].subgroups[0].id,
                          diagramId: vehicle.groups[0].subgroups[0].diagrams[0].id,
                          partId: vehicle.groups[0].subgroups[0].diagrams[0].parts[0].id,
                        }, {
                          vin: recognizedVin || vehicle.vin,
                        }),
                      );
                      setRecognizedVin("");
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
    </div>
  );
}
