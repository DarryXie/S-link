import { ArrowUpRight, SlidersHorizontal } from "lucide-react";
import type { Copy } from "../../content";

type OrdersPageProps = {
  copy: Copy;
};

const demoRows = [
  { no: "SO-2026-0041", state: "Pending", amount: "¥ 12,640" },
  { no: "SO-2026-0038", state: "Shipping", amount: "¥ 4,380" },
  { no: "SO-2026-0035", state: "Exception", amount: "¥ 1,960" },
];

export function OrdersPage({ copy }: OrdersPageProps) {
  return (
    <div className="page-stack">
      <section className="placeholder-hero reveal">
        <div className="placeholder-copy">
          <p className="section-kicker">{copy.orders.label}</p>
          <h2>{copy.orders.title}</h2>
          <p>{copy.orders.description}</p>
        </div>
        <span className="status-pill">{copy.common.underConstruction}</span>
      </section>

      <section className="orders-layout reveal delay-1">
        <article className="orders-board">
          <div className="orders-toolbar">
            <div className="filter-strip">
              {copy.orders.filters.map((filter, index) => (
                <button key={filter} type="button" className={`filter-chip ${index === 0 ? "is-active" : ""}`}>
                  {filter}
                </button>
              ))}
            </div>
            <button type="button" className="toolbar-ghost">
              <SlidersHorizontal size={16} />
              Filters
            </button>
          </div>

          <div className="order-table">
            {demoRows.map((row) => (
              <div key={row.no} className="order-row">
                <div>
                  <strong>{row.no}</strong>
                  <small>{copy.common.underConstruction}</small>
                </div>
                <span>{row.state}</span>
                <strong>{row.amount}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="orders-empty-state">
          <div>
            <p className="section-kicker">{copy.common.buildReady}</p>
            <h3>{copy.orders.emptyTitle}</h3>
            <p>{copy.orders.emptyDescription}</p>
          </div>
          <button type="button" className="secondary-action">
            <ArrowUpRight size={16} />
            {copy.common.openNow}
          </button>
        </article>
      </section>
    </div>
  );
}

