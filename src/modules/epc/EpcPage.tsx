import { Search, Sparkles } from "lucide-react";
import type { Copy } from "../../content";

type EpcPageProps = {
  copy: Copy;
};

export function EpcPage({ copy }: EpcPageProps) {
  return (
    <div className="page-stack">
      <section className="placeholder-hero reveal">
        <div className="placeholder-copy">
          <p className="section-kicker">{copy.epc.label}</p>
          <h2>{copy.epc.title}</h2>
          <p>{copy.epc.description}</p>
        </div>
        <span className="status-pill">{copy.common.underConstruction}</span>
      </section>

      <section className="epc-layout reveal delay-1">
        <article className="epc-search-shell">
          <label className="search-box">
            <Search size={18} />
            <input type="text" placeholder={copy.epc.searchPlaceholder} readOnly />
          </label>
          <div className="panel-columns">
            {copy.epc.panels.map((panel) => (
              <div key={panel} className="ghost-panel">
                <p>{panel}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="epc-note-shell">
          <div className="epc-note-head">
            <Sparkles size={18} />
            <p>{copy.common.buildReady}</p>
          </div>
          <ul className="detail-list">
            {copy.epc.tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  );
}

