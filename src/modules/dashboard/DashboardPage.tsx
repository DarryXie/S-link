import { ArrowRight, Bot, Boxes, Orbit, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import type { Copy } from "../../content";

type DashboardPageProps = {
  copy: Copy;
  onOpenAssistant: () => void;
};

export function DashboardPage({ copy, onOpenAssistant }: DashboardPageProps) {
  const moduleLinks = [
    {
      href: "/epc",
      tone: "primary",
      icon: Orbit,
      ...copy.dashboard.modules[0],
    },
    {
      href: "/orders",
      tone: "secondary",
      icon: Boxes,
      ...copy.dashboard.modules[1],
    },
  ] as const;

  return (
    <div className="page-stack">
      <section className="hero-panel reveal">
        <div className="hero-copy">
          <p className="eyebrow">{copy.dashboard.eyebrow}</p>
          <h2>{copy.dashboard.title}</h2>
          <p className="hero-description">{copy.dashboard.description}</p>
          <div className="hero-actions">
            <Link className="primary-action" to="/epc">
              {copy.dashboard.primaryAction}
              <ArrowRight size={16} />
            </Link>
            <button className="secondary-action" type="button" onClick={onOpenAssistant}>
              <Bot size={16} />
              {copy.dashboard.secondaryAction}
            </button>
          </div>
        </div>

        <div className="hero-aside">
          <div className="hero-meter">
            <span>02</span>
            <p>{copy.dashboard.moduleHeading}</p>
            <small>{copy.common.buildReady}</small>
          </div>
          <div className="hero-signal-cluster">
            {copy.dashboard.signals.map((signal) => (
              <article key={signal} className="signal-chip">
                <ShieldCheck size={16} />
                <span>{signal}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-block reveal delay-1">
        <div className="section-heading">
          <div>
            <p className="section-kicker">{copy.dashboard.moduleHeading}</p>
            <h3>{copy.dashboard.moduleSubheading}</h3>
          </div>
        </div>
        <div className="module-grid">
          {moduleLinks.map((module) => {
            const Icon = module.icon;

            return (
              <Link key={module.slug} to={module.href} className={`module-tile tone-${module.tone}`}>
                <div className="module-topline">
                  <span className="module-icon">
                    <Icon size={18} />
                  </span>
                  <span className="status-pill">{copy.common.underConstruction}</span>
                </div>
                <div className="module-body">
                  <h4>{module.title}</h4>
                  <p>{module.description}</p>
                </div>
                <div className="module-footer">
                  <small>{module.meta}</small>
                  <span>
                    {copy.common.openNow}
                    <ArrowRight size={16} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="insight-grid reveal delay-2">
        <article className="insight-panel">
          <p className="section-kicker">{copy.dashboard.signalsHeading}</p>
          <ul className="detail-list">
            {copy.dashboard.signals.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="insight-panel emphasis">
          <p className="section-kicker">{copy.dashboard.rolloutHeading}</p>
          <ol className="ordered-list">
            {copy.dashboard.rollout.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </article>
      </section>
    </div>
  );
}
