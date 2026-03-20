import { ArrowRight, Boxes, CarFront, ChevronRight, Image as ImageIcon } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { Locale } from "../../content";
import {
  EpcBackButton,
  brands,
  buildEpcPath,
  getText,
  pageCopy,
  useEpcSelectionState,
} from "./EpcPage";

type EpcWizardPageProps = {
  locale: Locale;
};

export function EpcWizardPage({ locale }: EpcWizardPageProps) {
  const ui = pageCopy[locale];
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    selectedBrandId,
    selectedSeriesId,
    selectedYear,
    selectedVehicleId,
    selectedGroupId,
    selectedSubgroupId,
    currentVehicle,
    currentGroup,
    currentSubgroup,
    currentDiagram,
    seriesOptions,
    yearOptions,
    modelOptions,
    applyVehicleSelection,
    selectBrand,
    selectSeries,
    selectYear,
    selectGroup,
    selectSubgroup,
  } = useEpcSelectionState(searchParams);

  const breadcrumbItems = [
    { label: ui.breadcrumbHome, onClick: () => navigate("/epc") },
    { label: getText(locale, currentVehicle.brand), onClick: () => selectBrand(currentVehicle.brandId) },
    { label: getText(locale, currentVehicle.series), onClick: () => selectSeries(currentVehicle.seriesId) },
    { label: currentVehicle.year, onClick: () => selectYear(currentVehicle.year) },
    { label: getText(locale, currentGroup.name), onClick: () => selectGroup(currentGroup.id) },
    { label: getText(locale, currentSubgroup.name), onClick: () => selectSubgroup(currentSubgroup.id) },
    { label: `${currentDiagram.code} ${getText(locale, currentDiagram.name)}`, onClick: () => undefined },
  ];

  return (
    <div className="page-stack epc-page">
      <div className="epc-subpage-bar reveal">
        <EpcBackButton
          fallbackTo="/epc"
          label={locale === "zh-CN" ? "返回 EPC 首页" : "Back to EPC home"}
        />
        <span className="status-pill">EPC</span>
      </div>

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
                    className={`epc-diagram-card ${currentDiagram.id === diagram.id ? "is-active" : ""}`}
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
    </div>
  );
}
