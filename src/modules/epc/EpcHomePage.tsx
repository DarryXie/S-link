import { ArrowRight, History, Info, ListFilter, Search, Sparkles, X } from "lucide-react";
import { useState } from "react";
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

type EpcHomePageProps = {
  locale: Locale;
};

export function EpcHomePage({ locale }: EpcHomePageProps) {
  const ui = pageCopy[locale];
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentVehicle, currentGroup, currentSubgroup, currentDiagram, activePartId } =
    useEpcSelectionState(searchParams);
  const [query, setQuery] = useState("");
  const [vinVehicleId, setVinVehicleId] = useState<string | null>(null);
  const [historyEntries] = useState(() => readHistoryEntries());

  function handleSearch() {
    const normalized = query.trim().toUpperCase();

    if (!normalized) {
      return;
    }

    const vehicleHit = vehicles.find((vehicle) => vehicle.vin === normalized);

    if (vehicleHit) {
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

  return (
    <div className="page-stack epc-page">
      <div className="epc-subpage-bar reveal">
        <EpcBackButton
          fallbackTo="/"
          label={locale === "zh-CN" ? "返回系统首页" : "Back to overview"}
        />
        <span className="status-pill">EPC</span>
      </div>

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
                className={`brand-card ${currentVehicle.brandId === brand.id ? "is-active" : ""}`}
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
    </div>
  );
}
