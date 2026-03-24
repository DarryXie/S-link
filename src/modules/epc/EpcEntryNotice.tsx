import { Bot } from "lucide-react";
import type { Locale } from "../../content";

type EpcEntryNoticeProps = {
  locale: Locale;
  focus?: string | null;
};

export function EpcEntryNotice({ locale, focus }: EpcEntryNoticeProps) {
  const label =
    locale === "zh-CN"
      ? focus && focus !== "vehicle-confirm"
        ? `来自 AI 助手，关注项：${focus}`
        : "来自 AI 助手"
      : focus && focus !== "vehicle-confirm"
        ? `From AI assistant, focus: ${focus}`
        : "From AI assistant";

  return (
    <span className="epc-entry-chip" title={label} aria-label={label}>
      <Bot size={14} />
    </span>
  );
}
