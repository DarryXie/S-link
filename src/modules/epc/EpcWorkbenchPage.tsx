import {
  ArrowRight,
  Boxes,
  Check,
  ChevronRight,
  Image as ImageIcon,
  Minus,
  Plus,
  Search,
  ShoppingCart,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { Locale } from "../../content";
import type { CartLine } from "../cart/cartTypes";
import {
  EpcBackButton,
  blankAdvancedFilters,
  buildEpcPath,
  diagramHits,
  formatMoney,
  getText,
  historyStorageKey,
  lower,
  pageCopy,
  partHits,
  text,
  type AdvancedFilters,
  type HistoryEntry,
  useEpcSelectionState,
} from "./EpcPage";

type EpcWorkbenchPageProps = {
  locale: Locale;
  onAddToCart: (item: CartLine) => void;
  onOpenCart: () => void;
};

export function EpcWorkbenchPage({
  locale,
  onAddToCart,
  onOpenCart,
}: EpcWorkbenchPageProps) {
  const ui = pageCopy[locale];
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});
  const [searchParams] = useSearchParams();
  const entryVin = searchParams.get("vin") ?? "";
  const navigate = useNavigate();
  const {
    activePartId,
    setActivePartId,
    currentVehicle,
    currentGroup,
    currentSubgroup,
    currentDiagram,
    currentPart,
  } = useEpcSelectionState(searchParams);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [advancedTab, setAdvancedTab] = useState<"parts" | "diagrams">("parts");
  const [advancedDraft, setAdvancedDraft] = useState<AdvancedFilters>(blankAdvancedFilters);
  const [advancedCommitted, setAdvancedCommitted] = useState<AdvancedFilters>(blankAdvancedFilters);
  const [partDetailId, setPartDetailId] = useState<string | null>(null);
  const [quantityEditorId, setQuantityEditorId] = useState<string | null>(null);
  const [draftQuantity, setDraftQuantity] = useState(1);
  const [toastVisible, setToastVisible] = useState(false);

  const advancedPartResults = useMemo(() => {
    const filters = advancedCommitted;

    return partHits.filter(({ vehicle, group, subgroup, diagram, part }) => {
      if (filters.vin && !vehicle.vin.toLowerCase().includes(lower(filters.vin))) return false;
      if (filters.brandId && vehicle.brandId !== filters.brandId) return false;
      if (filters.seriesId && vehicle.seriesId !== filters.seriesId) return false;
      if (filters.year && vehicle.year !== filters.year) return false;
      if (filters.modelId && vehicle.id !== filters.modelId) return false;
      if (filters.groupId && group.id !== filters.groupId) return false;
      if (filters.subgroupId && subgroup.id !== filters.subgroupId) return false;
      if (filters.diagramCode && !diagram.code.toLowerCase().includes(lower(filters.diagramCode))) return false;
      if (filters.diagramName && !getText(locale, diagram.name).toLowerCase().includes(lower(filters.diagramName))) return false;
      if (filters.partNumber && !part.sku.toLowerCase().includes(lower(filters.partNumber))) return false;
      if (filters.partName && !getText(locale, part.name).toLowerCase().includes(lower(filters.partName))) return false;
      return true;
    });
  }, [advancedCommitted, locale]);

  const advancedDiagramResults = useMemo(() => {
    const filters = advancedCommitted;

    return diagramHits.filter(({ vehicle, group, subgroup, diagram }) => {
      if (filters.vin && !vehicle.vin.toLowerCase().includes(lower(filters.vin))) return false;
      if (filters.brandId && vehicle.brandId !== filters.brandId) return false;
      if (filters.seriesId && vehicle.seriesId !== filters.seriesId) return false;
      if (filters.year && vehicle.year !== filters.year) return false;
      if (filters.modelId && vehicle.id !== filters.modelId) return false;
      if (filters.groupId && group.id !== filters.groupId) return false;
      if (filters.subgroupId && subgroup.id !== filters.subgroupId) return false;
      if (filters.diagramCode && !diagram.code.toLowerCase().includes(lower(filters.diagramCode))) return false;
      if (filters.diagramName && !getText(locale, diagram.name).toLowerCase().includes(lower(filters.diagramName))) return false;
      if (filters.partNumber && !diagram.parts.some((part) => part.sku.toLowerCase().includes(lower(filters.partNumber)))) return false;
      if (filters.partName && !diagram.parts.some((part) => getText(locale, part.name).toLowerCase().includes(lower(filters.partName)))) return false;
      return true;
    });
  }, [advancedCommitted, locale]);

  function persistHistory(entry: HistoryEntry) {
    if (typeof window === "undefined") {
      return;
    }

    const raw = window.localStorage.getItem(historyStorageKey);
    const current = raw ? ((JSON.parse(raw) as HistoryEntry[]) ?? []) : [];
    const next = [entry, ...current.filter((item) => item.id !== entry.id)].slice(0, 6);
    window.localStorage.setItem(historyStorageKey, JSON.stringify(next));
  }

  function handleConfirmAdd() {
    const part = currentDiagram.parts.find((item) => item.id === quantityEditorId);

    if (!part) {
      return;
    }

    const context = text(
      `${currentVehicle.brand["zh-CN"]} / ${currentVehicle.series["zh-CN"]} / ${currentVehicle.year} / ${currentVehicle.model["zh-CN"]}`,
      `${currentVehicle.brand["en-US"]} / ${currentVehicle.series["en-US"]} / ${currentVehicle.year} / ${currentVehicle.model["en-US"]}`,
    );

    onAddToCart({
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
    persistHistory({
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
      timeLabel: new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(new Date()),
    });
  }, [currentDiagram.id, currentGroup.id, currentSubgroup.id, currentVehicle.id, locale]);

  const detailPart =
    currentDiagram.parts.find((part) => part.id === partDetailId) ??
    partHits.find(({ part }) => part.id === partDetailId)?.part ??
    null;

  const vehicleContextLabel = [
    entryVin,
    getText(locale, currentVehicle.brand),
    getText(locale, currentVehicle.series),
    currentVehicle.year,
    getText(locale, currentVehicle.model),
  ]
    .filter(Boolean)
    .join(" / ");

  const breadcrumbItems = [
    { label: ui.breadcrumbHome, onClick: () => navigate("/epc") },
    { label: vehicleContextLabel },
  ];

  return (
    <div className="page-stack epc-page">
      <div className="epc-subpage-bar reveal">
        <EpcBackButton
          fallbackTo={buildEpcPath(
            "/epc/groups",
            {
              vehicleId: currentVehicle.id,
              groupId: currentGroup.id,
              subgroupId: currentSubgroup.id,
              diagramId: currentDiagram.id,
              partId: activePartId,
            },
            entryVin ? { vin: entryVin } : undefined,
          )}
          label={locale === "zh-CN" ? "返回查询向导" : "Back to guide"}
        />
        <section className="epc-breadcrumbs" aria-label="breadcrumbs">
          {breadcrumbItems.map((item, index) => (
            <div key={`${item.label}-${index}`} className="epc-breadcrumb-item">
              {"onClick" in item ? (
                <button type="button" onClick={item.onClick}>
                  {item.label}
                </button>
              ) : (
                <span>{item.label}</span>
              )}
              {index < breadcrumbItems.length - 1 ? <ChevronRight size={14} /> : null}
            </div>
          ))}
        </section>
      </div>

      <section className="epc-workbench reveal delay-2">
        <div className="section-heading">
          <div>
            <p className="section-kicker">{ui.workspaceTitle}</p>
            <h3>{ui.workspaceHint}</h3>
          </div>
          <div className="hero-actions">
            <button type="button" className="secondary-action" onClick={() => setIsAdvancedOpen(true)}>
              <Search size={16} />
              {ui.advancedButton}
            </button>
            <button type="button" className="toolbar-ghost" onClick={onOpenCart}>
              <ShoppingCart size={16} />
              {ui.openCart}
            </button>
          </div>
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
                  <Search size={14} />
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
                              >
                                <Plus size={16} />
                              </button>
                              <button type="button" className="primary-action epc-mini-action" onClick={handleConfirmAdd}>
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

      {detailPart ? (
        <div className="epc-modal-wrap">
          <aside className="epc-detail-drawer">
            <div className="drawer-head">
              <div>
                <p className="section-kicker">{ui.partDetail}</p>
                <h2>{getText(locale, detailPart.name)}</h2>
              </div>
              <button type="button" className="icon-button" onClick={() => setPartDetailId(null)}>
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

      {isAdvancedOpen ? (
        <div className="epc-modal-wrap">
          <aside className="epc-advanced-panel">
            <div className="drawer-head">
              <div>
                <p className="section-kicker">{ui.advancedTitle}</p>
                <h2>{ui.advancedHint}</h2>
              </div>
              <button type="button" className="icon-button" onClick={() => setIsAdvancedOpen(false)}>
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
            </div>

            <div className="hero-actions">
              <button type="button" className="primary-action" onClick={() => setAdvancedCommitted(advancedDraft)}>
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
                        <button type="button" className="epc-link-button" onClick={() => setPartDetailId(part.id)}>
                          {part.sku}
                        </button>
                        <strong>{getText(locale, part.name)}</strong>
                        <p>
                          {getText(locale, vehicle.brand)} / {getText(locale, vehicle.series)} / {vehicle.year} /{" "}
                          {getText(locale, vehicle.model)}
                        </p>
                        <small>
                          {getText(locale, group.name)} / {getText(locale, subgroup.name)} / {diagram.code}
                        </small>
                      </div>
                      <div className="advanced-result-side">
                        <span>{formatMoney(locale, part.price)}</span>
                        <button
                          type="button"
                          className="secondary-action epc-mini-action"
                          onClick={() =>
                            navigate(
                              buildEpcPath("/epc/workbench", {
                                vehicleId: vehicle.id,
                                groupId: group.id,
                                subgroupId: subgroup.id,
                                diagramId: diagram.id,
                                partId: part.id,
                              }),
                            )
                          }
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
                          {getText(locale, vehicle.brand)} / {getText(locale, vehicle.series)} / {vehicle.year} /{" "}
                          {getText(locale, vehicle.model)}
                        </p>
                        <small>
                          {ui.diagramLocation}: {getText(locale, group.name)} / {getText(locale, subgroup.name)}
                        </small>
                      </div>
                      <div className="advanced-result-side">
                        <span>{diagram.parts.length} parts</span>
                        <button
                          type="button"
                          className="secondary-action epc-mini-action"
                          onClick={() =>
                            navigate(
                              buildEpcPath("/epc/workbench", {
                                vehicleId: vehicle.id,
                                groupId: group.id,
                                subgroupId: subgroup.id,
                                diagramId: diagram.id,
                                partId: diagram.parts[0].id,
                              }),
                            )
                          }
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
