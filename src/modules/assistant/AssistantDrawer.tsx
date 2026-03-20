import { Bot, Sparkles, X } from "lucide-react";
import type { Copy, Locale } from "../../content";

type AssistantDrawerProps = {
  locale: Locale;
  copy: Copy;
  isOpen: boolean;
  onClose: () => void;
};

export function AssistantDrawer({ locale, copy, isOpen, onClose }: AssistantDrawerProps) {
  return (
    <aside className={`side-drawer ${isOpen ? "is-open" : ""}`} aria-hidden={!isOpen}>
      <div className="drawer-head">
        <div>
          <p className="section-kicker">{copy.common.globallyAvailable}</p>
          <h2>{copy.assistant.title}</h2>
        </div>
        <button type="button" className="icon-button" onClick={onClose} aria-label="close assistant">
          <X size={18} />
        </button>
      </div>
      <p className="drawer-description">{copy.assistant.description}</p>

      <section className="drawer-section">
        <p className="drawer-label">{copy.assistant.quickPromptsTitle}</p>
        <div className="prompt-list">
          {copy.assistant.quickPrompts.map((prompt) => (
            <button key={prompt} type="button" className="prompt-chip">
              <Sparkles size={15} />
              {prompt}
            </button>
          ))}
        </div>
      </section>

      <section className="drawer-section conversation-stack">
        <article className="assistant-bubble assistant">
          <Bot size={16} />
          <div>
            <p>{copy.assistant.briefTitle}</p>
            <span>{copy.assistant.briefBody}</span>
          </div>
        </article>
        <article className="assistant-bubble user">
          <div>
            <p>{locale === "zh-CN" ? "系统状态" : "System status"}</p>
            <span>{copy.assistant.feed[0]}</span>
          </div>
        </article>
      </section>

      <section className="drawer-section">
        <p className="drawer-label">{copy.assistant.feedTitle}</p>
        <ul className="detail-list compact">
          {copy.assistant.feed.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </aside>
  );
}

