import { ArrowRight, CalendarRange, CarFront, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { Locale } from "../../content";
import {
  EpcBackButton,
  buildVehicleContextLabel,
  buildEpcPath,
  getText,
  pageCopy,
  useEpcSelectionState,
} from "./EpcPage";
import { useEpcHeader } from "./epcHeaderContext";

type EpcWizardPageProps = {
  locale: Locale;
};

export function EpcWizardPage({ locale }: EpcWizardPageProps) {
  const ui = pageCopy[locale];
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const entryVin = searchParams.get("vin") ?? "";
  const {
    selectedVehicleId,
    selectedGroupId,
    selectedSubgroupId,
    selectedDiagramId,
    activePartId,
    currentVehicle,
    seriesOptions,
    yearOptions,
    modelOptions,
    selectSeries,
    selectYear,
    applyVehicleSelection,
  } = useEpcSelectionState(searchParams);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  const currentBrandSeries = useMemo(
    () => seriesOptions.filter((vehicle) => vehicle.brandId === currentVehicle.brandId),
    [currentVehicle.brandId, seriesOptions],
  );

  const vehicleContextLabel = buildVehicleContextLabel(locale, currentVehicle, entryVin);

  const breadcrumbItems = [
    { label: ui.breadcrumbHome, onClick: () => navigate("/epc") },
    { label: vehicleContextLabel },
  ];
  const headerConfig = useMemo(
    () => ({
      backFallbackTo: "/epc",
      backLabel: locale === "zh-CN" ? "返回 EPC 首页" : "Back to EPC home",
      breadcrumbs: [{ label: vehicleContextLabel }],
      fromAssistant: searchParams.get("source") === "assistant",
      assistantFocus: searchParams.get("focus"),
    }),
    [locale, vehicleContextLabel],
  );

  const nextStepLabel =
    locale === "zh-CN" ? "下一步，选择分组与图例" : "Next, choose group and diagram";
  const yearLabel = locale === "zh-CN" ? "年款" : "Year";
  useEpcHeader(headerConfig);

  return (
    <div className="page-stack epc-page">
      <div className="epc-subpage-bar reveal">
        <EpcBackButton
          fallbackTo="/epc"
          label={locale === "zh-CN" ? "返回 EPC 首页" : "Back to EPC home"}
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

      <section
        className={`epc-vehicle-layout reveal delay-2 ${isSelectorOpen ? "is-selector-open" : ""}`}
      >
        <article className="epc-vehicle-board">
          <div className="epc-vehicle-head">
            <div>
              <h3>{getText(locale, currentVehicle.brand)}</h3>
            </div>
          </div>

          <div className="epc-series-grid">
            {currentBrandSeries.map((seriesVehicle) => {
              const isActive = currentVehicle.seriesId === seriesVehicle.seriesId && isSelectorOpen;
              const seriesLabel = getText(locale, seriesVehicle.series);

              return (
                <button
                  key={seriesVehicle.seriesId}
                  type="button"
                  className={`epc-series-card ${isActive ? "is-active" : ""}`}
                  onClick={() => {
                    selectSeries(seriesVehicle.seriesId);
                    setIsSelectorOpen(true);
                  }}
                >
                  <div className="epc-series-card-media" aria-hidden="true">
                    <CarFront size={30} strokeWidth={1.9} />
                  </div>
                  <div className="epc-series-card-copy">
                    <strong>{seriesLabel}</strong>
                  </div>
                </button>
              );
            })}
          </div>
        </article>

        {isSelectorOpen ? (
          <aside className="epc-vehicle-selector">
            <div className="epc-year-panel">
              <p className="section-kicker">{yearLabel}</p>
              <div className="epc-year-grid">
                {yearOptions.map((vehicle) => (
                  <button
                    key={vehicle.year}
                    type="button"
                    className={`epc-year-chip ${currentVehicle.year === vehicle.year ? "is-active" : ""}`}
                    onClick={() => selectYear(vehicle.year)}
                  >
                    <CalendarRange size={15} />
                    <span>{vehicle.year}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="epc-model-panel">
              <p className="section-kicker">{ui.modelStep}</p>
              <div className="epc-vehicle-model-list">
                {modelOptions.map((vehicle) => (
                  <button
                    key={vehicle.id}
                    type="button"
                    className={`epc-vehicle-model-card ${selectedVehicleId === vehicle.id ? "is-active" : ""}`}
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

            <div className="epc-vehicle-selector-footer">
              <button
                type="button"
                className="primary-action epc-vehicle-next"
                onClick={() =>
                  navigate(
                    buildEpcPath("/epc/groups", {
                      vehicleId: selectedVehicleId,
                      groupId: selectedGroupId,
                      subgroupId: selectedSubgroupId,
                      diagramId: selectedDiagramId,
                      partId: activePartId,
                    }),
                  )
                }
              >
                {nextStepLabel}
                <ArrowRight size={16} />
              </button>
            </div>
          </aside>
        ) : null}
      </section>
    </div>
  );
}
