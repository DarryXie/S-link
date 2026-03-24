import { ArrowRight, ChevronDown, ChevronRight, Image as ImageIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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

type EpcGroupPageProps = {
  locale: Locale;
};

export function EpcGroupPage({ locale }: EpcGroupPageProps) {
  const ui = pageCopy[locale];
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const entryVin = searchParams.get("vin") ?? "";
  const {
    activePartId,
    currentVehicle,
    currentGroup,
    currentSubgroup,
    currentDiagram,
    selectGroup,
    selectDiagram,
  } = useEpcSelectionState(searchParams);
  const [openGroupIds, setOpenGroupIds] = useState<string[]>([currentGroup.id]);

  useEffect(() => {
    setOpenGroupIds((current) =>
      current.includes(currentGroup.id) ? current : [...current, currentGroup.id],
    );
  }, [currentGroup.id]);

  const vehicleContextLabel = buildVehicleContextLabel(locale, currentVehicle, entryVin);

  const breadcrumbItems = [
    { label: ui.breadcrumbHome, onClick: () => navigate("/epc") },
    { label: vehicleContextLabel },
  ];
  const headerConfig = useMemo(
    () => ({
      backFallbackTo: buildEpcPath("/epc/wizard", {
        vehicleId: currentVehicle.id,
        groupId: currentGroup.id,
        subgroupId: currentSubgroup.id,
        diagramId: currentDiagram.id,
        partId: activePartId,
      }),
      backLabel: locale === "zh-CN" ? "返回车型选择" : "Back to vehicle selection",
      breadcrumbs: [{ label: vehicleContextLabel }],
      fromAssistant: searchParams.get("source") === "assistant",
      assistantFocus: searchParams.get("focus"),
    }),
    [
      activePartId,
      currentDiagram.id,
      currentGroup.id,
      currentSubgroup.id,
      currentVehicle.id,
      locale,
      vehicleContextLabel,
    ],
  );

  const groupTreeLabel = locale === "zh-CN" ? "分组树" : "Group tree";
  const diagramListLabel = locale === "zh-CN" ? "图例列表" : "Diagram list";
  const nextLabel = locale === "zh-CN" ? "下一步" : "Next";

  useEpcHeader(headerConfig);

  function toggleGroup(groupId: string) {
    setOpenGroupIds((current) => {
      if (current.includes(groupId)) {
        return current.filter((id) => id !== groupId);
      }

      return [...current, groupId];
    });
    selectGroup(groupId);
  }

  return (
    <div className="page-stack epc-page">
      <div className="epc-subpage-bar reveal">
        <EpcBackButton
          fallbackTo={buildEpcPath("/epc/wizard", {
            vehicleId: currentVehicle.id,
            groupId: currentGroup.id,
            subgroupId: currentSubgroup.id,
            diagramId: currentDiagram.id,
            partId: activePartId,
          })}
          label={locale === "zh-CN" ? "返回车型选择" : "Back to vehicle selection"}
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

      <section className="epc-group-page reveal delay-2">
        <div className="epc-group-page-grid">
          <article className="epc-group-tree-panel">
            <div className="epc-column-head">
              <p className="section-kicker">{groupTreeLabel}</p>
            </div>

            <div className="epc-group-tree-scroll">
              {currentVehicle.groups.map((group) => {
                const isCurrentGroup = currentGroup.id === group.id;
                const isOpen = openGroupIds.includes(group.id);

                return (
                  <div key={group.id} className="epc-group-tree-section">
                    <button
                      type="button"
                      className={`epc-group-tree-parent ${isCurrentGroup ? "is-active" : ""}`}
                      onClick={() => toggleGroup(group.id)}
                    >
                      <strong>{getText(locale, group.name)}</strong>
                      <ChevronDown
                        size={16}
                        className={`epc-group-tree-caret ${isOpen ? "is-open" : ""}`}
                      />
                    </button>

                    <div className={`epc-group-tree-children ${isOpen ? "is-open" : ""}`}>
                      <div className="epc-group-tree-children-inner">
                        {group.subgroups.map((subgroup) => {
                          const isCurrentSubgroup =
                            currentGroup.id === group.id && currentSubgroup.id === subgroup.id;

                          return (
                            <button
                              key={subgroup.id}
                              type="button"
                              className={`epc-group-tree-child ${isCurrentSubgroup ? "is-active" : ""}`}
                              onClick={() =>
                                navigate(
                                  buildEpcPath(
                                    "/epc/groups",
                                    {
                                      vehicleId: currentVehicle.id,
                                      groupId: group.id,
                                      subgroupId: subgroup.id,
                                      diagramId: subgroup.diagrams[0].id,
                                      partId: subgroup.diagrams[0].parts[0].id,
                                    },
                                    entryVin ? { vin: entryVin } : undefined,
                                  ),
                                )
                              }
                            >
                              <strong>{getText(locale, subgroup.name)}</strong>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </article>

          <article className="epc-group-diagram-panel">
            <div className="epc-column-head">
              <p className="section-kicker">{diagramListLabel}</p>
              <h4>{getText(locale, currentSubgroup.name)}</h4>
            </div>

            <div className="epc-group-diagram-scroll">
              <div className="epc-group-diagram-grid">
                {currentSubgroup.diagrams.map((diagram) => (
                  <button
                    key={diagram.id}
                    type="button"
                    className={`epc-group-diagram-tile ${currentDiagram.id === diagram.id ? "is-active" : ""}`}
                    onClick={() => selectDiagram(diagram.id)}
                  >
                    <div className="epc-group-diagram-frame">
                      <ImageIcon size={18} />
                      <span>{locale === "zh-CN" ? "图例缩略图" : "Diagram preview"}</span>
                    </div>
                    <div className="epc-group-diagram-copy">
                      <strong>{getText(locale, diagram.name)}</strong>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="epc-group-diagram-footer">
              <button
                type="button"
                className="primary-action epc-group-next"
                onClick={() =>
                  navigate(
                    buildEpcPath(
                      "/epc/workbench",
                      {
                        vehicleId: currentVehicle.id,
                        groupId: currentGroup.id,
                        subgroupId: currentSubgroup.id,
                        diagramId: currentDiagram.id,
                        partId: currentDiagram.parts[0].id,
                      },
                      entryVin ? { vin: entryVin } : undefined,
                    ),
                  )
                }
              >
                {nextLabel}
                <ArrowRight size={16} />
              </button>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
