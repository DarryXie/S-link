import {
  Boxes,
  Check,
  Image as ImageIcon,
  Minus,
  Plus,
  RotateCcw,
  ShoppingCart,
  Sparkles,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type WheelEvent as ReactWheelEvent } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "react-router-dom";
import type { Locale } from "../../content";
import {
  buildCartBindingKey,
  normalizeCartVin,
  type CartLine,
} from "../cart/cartTypes";
import {
  buildEpcPath,
  buildVehicleContextLabel,
  formatMoney,
  getText,
  historyStorageKey,
  pageCopy,
  text,
  type HistoryEntry,
  useEpcSelectionState,
} from "./EpcPage";
import { useEpcHeader } from "./epcHeaderContext";

type EpcWorkbenchPageProps = {
  locale: Locale;
  onAddToCart: (item: CartLine) => void;
  cartLines: CartLine[];
};

type WorkbenchDemoPart = {
  id: string;
  hotspot: string;
  sku: string;
  side: string;
  purpose: string;
  name: ReturnType<typeof text>;
  note: ReturnType<typeof text>;
  usage: number;
  packSize: number;
  price: number;
  hotspotX: number;
  hotspotY: number;
  images: string[];
  applicability: {
    code: string;
    model: ReturnType<typeof text>;
    brand: ReturnType<typeof text>;
  }[];
  supersession: string[];
};

const demoIllustrationSrc = new URL("../../../mock/illustration/001.png", import.meta.url).href;

const screenshotWorkbenchDemoParts: WorkbenchDemoPart[] = [
  { hotspot: "01", sku: "23865385", side: "", name: text("前减振支柱螺母(物料演示)", "Front strut nut"), purpose: "(LC)(LD)69(LGV)", usage: 1, price: 20, hotspotX: 7.5, hotspotY: 14.8 },
  { hotspot: "01", sku: "24541212", side: "", name: text("前减振支柱座与车身连接件", "Front strut mount to body link"), purpose: "(LC)(LD)69(LGV)", usage: 2, price: 32, hotspotX: 23.8, hotspotY: 14.8 },
  { hotspot: "02", sku: "23865391", side: "", name: text("前减振支柱座总成(物料演示)", "Front strut seat assembly"), purpose: "(LC)(LD)69(LGV)", usage: 1, price: 44, hotspotX: 42.2, hotspotY: 15.0 },
  { hotspot: "03", sku: "23865390", side: "", name: text("前减振支柱座平面轴承", "Front strut seat bearing"), purpose: "(LC)(LD)69(LGV)", usage: 1, price: 56, hotspotX: 58.5, hotspotY: 15.0 },
  { hotspot: "04", sku: "23865389", side: "", name: text("前减振器上隔振垫总成", "Upper insulator assembly"), purpose: "(LC)(LD)69(LGV)", usage: 1, price: 68, hotspotX: 76.8, hotspotY: 15.0 },
  { hotspot: "05", sku: "23865387", side: "", name: text("前减振支柱缓冲块(物料演示)", "Front strut bumper"), purpose: "(LC)(LD)69(LGV)", usage: 1, price: 34, hotspotX: 16.5, hotspotY: 29.2 },
  { hotspot: "06", sku: "23865388", side: "", name: text("前减震器防尘罩(物料演示)", "Dust cover"), purpose: "(LC)(LD)69(LGV)", usage: 1, price: 46, hotspotX: 31.8, hotspotY: 29.2 },
  { hotspot: "07", sku: "23865392", side: "", name: text("前减振器下隔振垫总成", "Lower insulator assembly"), purpose: "(LC)(LD)69(LGV)", usage: 1, price: 58, hotspotX: 49.4, hotspotY: 29.2 },
  { hotspot: "08", sku: "23865384", side: "", name: text("前弹簧(物料已删除，演示件)", "Front spring"), purpose: "(LC)(LD)69(LGV)", usage: 1, price: 70, hotspotX: 65.4, hotspotY: 29.2 },
  { hotspot: "09", sku: "23865410", side: "右", name: text("前减振支柱减振器总成", "Front shock absorber assembly"), purpose: "(LC)(LD)69(LGV)", usage: 1, price: 39, hotspotX: 72.8, hotspotY: 43.1 },
  { hotspot: "09", sku: "23865413", side: "左", name: text("前减振支柱减振器总成", "Front shock absorber assembly"), purpose: "(LC)(LD)69(LGV)", usage: 1, price: 39, hotspotX: 16.2, hotspotY: 43.0 },
  { hotspot: "10", sku: "24563067", side: "右", name: text("转向节(物料已删除，演示件)", "Steering knuckle"), purpose: "(LC)(LD)69(LGV)", usage: 1, price: 35, hotspotX: 72.2, hotspotY: 57.2 },
  { hotspot: "10", sku: "24563068", side: "左", name: text("转向节(物料已删除，演示件)", "Steering knuckle"), purpose: "(LC)(LD)69(LGV)", usage: 1, price: 35, hotspotX: 13.2, hotspotY: 56.8 },
  { hotspot: "11", sku: "23865414", side: "", name: text("前减振支柱座板总成", "Front strut plate assembly"), purpose: "(LC)(LD)69(LGV)", usage: 2, price: 26, hotspotX: 82.2, hotspotY: 19.6 },
  { hotspot: "12", sku: "23865133", side: "", name: text("全金属六角法兰面锁紧螺母", "Flange lock nut"), purpose: "(LC)(LD)69(LGV)", usage: 4, price: 18, hotspotX: 46.8, hotspotY: 72.0 },
  { hotspot: "14", sku: "9020691", side: "", name: text("转向节螺栓", "Steering knuckle bolt"), purpose: "(LC)(LD)69(LGV)", usage: 2, price: 30, hotspotX: 58.8, hotspotY: 72.0 },
  { hotspot: "15", sku: "23890782", side: "", name: text("前稳定杆连接杆螺母", "Stabilizer link nut"), purpose: "(LC)(LD)69(LGV)", usage: 2, price: 18, hotspotX: 33.0, hotspotY: 72.0 },
  { hotspot: "15", sku: "9022937", side: "", name: text("转向节螺母", "Steering knuckle nut"), purpose: "(LC)(LD)69(LGV)", usage: 2, price: 24, hotspotX: 72.0, hotspotY: 72.0 },
].map((part) => ({
  id: `demo-${part.sku}`,
  hotspot: part.hotspot,
  sku: part.sku,
  side: part.side,
  purpose: part.purpose,
  name: part.name,
  note: text(part.side ? `${part.side} / ${part.purpose}` : part.purpose, part.side ? `${part.side} / ${part.purpose}` : part.purpose),
  usage: part.usage,
  packSize: 1,
  price: part.price,
  hotspotX: part.hotspotX,
  hotspotY: part.hotspotY,
  images: [`${part.sku} 图例定位`, `${part.sku} 配件细节`, `${part.sku} 安装参考`],
  applicability: [
    {
      code: "LC/LD/69/LGV",
      model: text("当前图例演示车型", "Current illustration demo vehicle"),
      brand: text("EPC Demo", "EPC Demo"),
    },
  ],
  supersession: [part.sku],
}));

export function EpcWorkbenchPage({ locale, onAddToCart, cartLines }: EpcWorkbenchPageProps) {
  const ui = pageCopy[locale];
  const [searchParams] = useSearchParams();
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});
  const cartButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const dragStateRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  const entryVin = searchParams.get("vin") ?? "";
  const { activePartId, setActivePartId, currentVehicle, currentGroup, currentSubgroup, currentDiagram } =
    useEpcSelectionState(searchParams);

  const displayedParts = screenshotWorkbenchDemoParts;
  const [partDetailId, setPartDetailId] = useState<string | null>(null);
  const [quantityEditorId, setQuantityEditorId] = useState<string | null>(null);
  const [draftQuantity, setDraftQuantity] = useState(1);
  const [toastVisible, setToastVisible] = useState(false);
  const [cartPopoverStyle, setCartPopoverStyle] = useState<{ top: number; left: number } | null>(null);
  const [diagramScale, setDiagramScale] = useState(1);
  const [diagramOffset, setDiagramOffset] = useState({ x: 0, y: 0 });
  const [isDraggingDiagram, setIsDraggingDiagram] = useState(false);

  const detailPart = displayedParts.find((part) => part.id === partDetailId) ?? null;
  const vehicleContextLabel = buildVehicleContextLabel(locale, currentVehicle, entryVin);
  const workbenchContextLabel = `${vehicleContextLabel} / ${getText(locale, currentGroup.name)} / ${getText(locale, currentSubgroup.name)}`;
  const normalizedEntryVin = normalizeCartVin(entryVin);
  const currentBindingKey = buildCartBindingKey(currentVehicle.id, normalizedEntryVin);
  const cartVehicle = {
    vehicleId: currentVehicle.id,
    source: normalizedEntryVin ? ("vin" as const) : ("vehicle" as const),
    vin: normalizedEntryVin || undefined,
    brand: currentVehicle.brand,
    series: currentVehicle.series,
    year: currentVehicle.year,
    model: currentVehicle.model,
  };

  const headerConfig = useMemo(
    () => ({
      backFallbackTo: buildEpcPath(
        "/epc/groups",
        {
          vehicleId: currentVehicle.id,
          groupId: currentGroup.id,
          subgroupId: currentSubgroup.id,
          diagramId: currentDiagram.id,
          partId: activePartId,
        },
        entryVin ? { vin: entryVin } : undefined,
      ),
      backLabel: locale === "zh-CN" ? "返回查询向导" : "Back to guide",
      breadcrumbs: [{ label: workbenchContextLabel }],
    }),
    [activePartId, currentDiagram.id, currentGroup.id, currentSubgroup.id, currentVehicle.id, entryVin, locale, workbenchContextLabel],
  );

  useEpcHeader(headerConfig);

  useEffect(() => {
    if (!displayedParts.some((part) => part.id === activePartId)) {
      setActivePartId(displayedParts[0]?.id ?? "");
    }
  }, [activePartId, displayedParts, setActivePartId]);

  useEffect(() => {
    const row = rowRefs.current[activePartId];
    if (row) row.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activePartId]);

  useEffect(() => {
    if (!quantityEditorId) {
      setCartPopoverStyle(null);
      return;
    }

    const editorId = quantityEditorId;
    function updatePopoverPosition() {
      const button = cartButtonRefs.current[editorId];
      if (!button) return;
      const rect = button.getBoundingClientRect();
      setCartPopoverStyle({ top: rect.bottom + 8, left: rect.right });
    }

    updatePopoverPosition();
    window.addEventListener("resize", updatePopoverPosition);
    window.addEventListener("scroll", updatePopoverPosition, true);
    return () => {
      window.removeEventListener("resize", updatePopoverPosition);
      window.removeEventListener("scroll", updatePopoverPosition, true);
    };
  }, [quantityEditorId]);

  useEffect(() => {
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
      timeLabel: new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(new Date()),
    };

    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(historyStorageKey);
    const current = raw ? ((JSON.parse(raw) as HistoryEntry[]) ?? []) : [];
    const next = [entry, ...current.filter((item) => item.id !== entry.id)].slice(0, 6);
    window.localStorage.setItem(historyStorageKey, JSON.stringify(next));
  }, [currentDiagram.id, currentGroup.id, currentSubgroup.id, currentVehicle.id, locale]);

  function clampScale(value: number) {
    return Math.min(3, Math.max(0.7, Number(value.toFixed(2))));
  }

  function resetDiagramView() {
    setDiagramScale(1);
    setDiagramOffset({ x: 0, y: 0 });
    setIsDraggingDiagram(false);
    dragStateRef.current = null;
  }

  function handleConfirmAdd() {
    const part = displayedParts.find((item) => item.id === quantityEditorId);
    if (!part) return;

    const context = text(
      `${currentGroup.name["zh-CN"]} / ${currentSubgroup.name["zh-CN"]} / ${currentDiagram.code}`,
      `${currentGroup.name["en-US"]} / ${currentSubgroup.name["en-US"]} / ${currentDiagram.code}`,
    );

    onAddToCart({
      id: `${part.sku}:${currentBindingKey}`,
      bindingKey: currentBindingKey,
      sku: part.sku,
      quantity: draftQuantity,
      unitPrice: part.price,
      name: part.name,
      description: text(`${getText(locale, part.name)} / ${getText(locale, part.note)}`, `${getText(locale, part.name)} / ${getText(locale, part.note)}`),
      context,
      vehicle: cartVehicle,
      addedAt: Date.now(),
    });

    setQuantityEditorId(null);
    setToastVisible(true);
    window.setTimeout(() => setToastVisible(false), 1800);
  }

  function handleDiagramWheel(event: ReactWheelEvent<HTMLDivElement>) {
    event.preventDefault();
    setDiagramScale((current) => clampScale(current + (event.deltaY < 0 ? 0.12 : -0.12)));
  }

  function handleDiagramPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: diagramOffset.x,
      originY: diagramOffset.y,
    };
    setIsDraggingDiagram(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleDiagramPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragStateRef.current || dragStateRef.current.pointerId !== event.pointerId) return;
    setDiagramOffset({
      x: dragStateRef.current.originX + (event.clientX - dragStateRef.current.startX),
      y: dragStateRef.current.originY + (event.clientY - dragStateRef.current.startY),
    });
  }

  function handleDiagramPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (dragStateRef.current?.pointerId !== event.pointerId) return;
    dragStateRef.current = null;
    setIsDraggingDiagram(false);
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  return (
    <div className="page-stack epc-page">
      <section className="epc-workbench reveal delay-2">
        <div className="epc-workbench-grid">
          <article className="diagram-stage">
            <div className="diagram-stage-head">
              <div className="diagram-title-row">
                <strong>{currentDiagram.code}</strong>
                <span>{getText(locale, currentDiagram.name)}</span>
              </div>
              <div className="diagram-stage-tools">
                <span className="status-pill">{displayedParts.length} parts</span>
                <div className="diagram-control-row">
                  <button type="button" className="icon-button diagram-control-button" onClick={() => setDiagramScale((current) => clampScale(current - 0.15))}>
                    <ZoomOut size={16} />
                  </button>
                  <button type="button" className="icon-button diagram-control-button" onClick={resetDiagramView}>
                    <RotateCcw size={16} />
                  </button>
                  <button type="button" className="icon-button diagram-control-button" onClick={() => setDiagramScale((current) => clampScale(current + 0.15))}>
                    <ZoomIn size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div
              className={`diagram-canvas ${isDraggingDiagram ? "is-dragging" : ""}`}
              onWheel={handleDiagramWheel}
              onPointerDown={handleDiagramPointerDown}
              onPointerMove={handleDiagramPointerMove}
              onPointerUp={handleDiagramPointerUp}
              onPointerCancel={handleDiagramPointerUp}
            >
              <div className="diagram-scene" style={{ transform: `translate(${diagramOffset.x}px, ${diagramOffset.y}px) scale(${diagramScale})` }}>
                <img src={demoIllustrationSrc} alt="demo illustration" className="diagram-demo-image" draggable={false} />
                {displayedParts.map((part) => (
                  <button
                    key={part.id}
                    type="button"
                    className={`diagram-hotspot ${activePartId === part.id ? "is-active" : ""}`}
                    style={{ left: `${part.hotspotX}%`, top: `${part.hotspotY}%` }}
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={() => setActivePartId(part.id)}
                  >
                    <span className="diagram-hotspot-number">{part.hotspot}</span>
                  </button>
                ))}
              </div>
            </div>
          </article>

          <article className="parts-table-shell">
            <div className="diagram-stage-head">
              <strong>{ui.partsTitle}</strong>
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
                  {displayedParts.map((part) => {
                    const isEditing = quantityEditorId === part.id;
                    const isInCart = cartLines.some(
                      (line) => line.bindingKey === currentBindingKey && line.sku === part.sku,
                    );

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
                        <td>CNY</td>
                        <td>{formatMoney(locale, part.price)}</td>
                        <td>
                          <div className="parts-action-cell" onClick={(event) => event.stopPropagation()}>
                            <button
                              type="button"
                              className={`icon-button epc-cart-action ${isInCart ? "is-added" : ""} ${isEditing ? "is-open" : ""}`}
                              ref={(node) => {
                                cartButtonRefs.current[part.id] = node;
                              }}
                              onClick={() => {
                                setQuantityEditorId((current) => (current === part.id ? null : part.id));
                                setDraftQuantity(Math.max(part.packSize, part.usage));
                              }}
                              aria-label={isInCart ? "Already in cart" : "Add to cart"}
                            >
                              {isInCart ? <Check size={16} /> : <ShoppingCart size={16} />}
                            </button>
                          </div>
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
                <span>{ui.table.price}</span>
                <strong>{formatMoney(locale, detailPart.price)}</strong>
              </div>
              <div>
                <span>{ui.table.note}</span>
                <strong>{getText(locale, detailPart.note)}</strong>
              </div>
              <div>
                <span>{ui.table.usage}</span>
                <strong>{detailPart.usage}</strong>
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
                {detailPart.supersession.map((item) => (
                  <div key={item} className="supersession-node">
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      ) : null}

      {quantityEditorId && cartPopoverStyle
        ? createPortal(
            <div className="epc-cart-popover quantity-inline is-floating" style={{ top: cartPopoverStyle.top, left: cartPopoverStyle.left }}>
              <div className="epc-cart-popover-body">
                <div className="epc-quantity-panel">
                  <span className="epc-quantity-label">{ui.quantityLabel}</span>
                  <div className="epc-quantity-stepper">
                    <button type="button" className="icon-button quantity-button" onClick={() => setDraftQuantity((current) => Math.max(1, current - 1))}>
                      <Minus size={16} />
                    </button>
                    <strong className="epc-quantity-value">{draftQuantity}</strong>
                    <button type="button" className="icon-button quantity-button" onClick={() => setDraftQuantity((current) => current + 1)}>
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
                <div className="epc-cart-popover-actions">
                  <button type="button" className="primary-action epc-mini-action" onClick={handleConfirmAdd}>
                    {ui.addConfirm}
                  </button>
                  <button type="button" className="secondary-action epc-mini-action" onClick={() => setQuantityEditorId(null)}>
                    {ui.close}
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
