import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { appMessages, type AccentTheme, type Locale, type PanelName } from "./content";
import { AssistantDrawer } from "./modules/assistant/AssistantDrawer";
import { CartDrawer } from "./modules/cart/CartDrawer";
import { DashboardPage } from "./modules/dashboard/DashboardPage";
import { EpcPage } from "./modules/epc/EpcPage";
import { MainLayout } from "./modules/layout/MainLayout";
import { OrdersPage } from "./modules/orders/OrdersPage";

const localeStorageKey = "s-link.locale";
const accentStorageKey = "s-link.accent";

function readStorage<T extends string>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  const value = window.localStorage.getItem(key) as T | null;
  return value ?? fallback;
}

export default function App() {
  const [locale, setLocale] = useState<Locale>(() => readStorage(localeStorageKey, "zh-CN"));
  const [accentTheme, setAccentTheme] = useState<AccentTheme>(() =>
    readStorage(accentStorageKey, "steel"),
  );
  const [activePanel, setActivePanel] = useState<PanelName>(null);

  useEffect(() => {
    window.localStorage.setItem(localeStorageKey, locale);
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    window.localStorage.setItem(accentStorageKey, accentTheme);
    document.body.dataset.accent = accentTheme;
  }, [accentTheme]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActivePanel(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const copy = appMessages[locale];

  return (
    <>
      <MainLayout
        locale={locale}
        setLocale={setLocale}
        accentTheme={accentTheme}
        setAccentTheme={setAccentTheme}
        activePanel={activePanel}
        setActivePanel={setActivePanel}
        copy={copy}
      >
        <Routes>
          <Route
            path="/"
            element={
              <DashboardPage
                copy={copy}
                onOpenAssistant={() => setActivePanel("assistant")}
              />
            }
          />
          <Route path="/epc" element={<EpcPage copy={copy} />} />
          <Route path="/orders" element={<OrdersPage copy={copy} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MainLayout>
      <AssistantDrawer
        locale={locale}
        copy={copy}
        isOpen={activePanel === "assistant"}
        onClose={() => setActivePanel(null)}
      />
      <CartDrawer
        locale={locale}
        copy={copy}
        isOpen={activePanel === "cart"}
        onClose={() => setActivePanel(null)}
      />
      {activePanel ? (
        <button
          aria-label="close overlay"
          className="scrim"
          onClick={() => setActivePanel(null)}
        />
      ) : null}
    </>
  );
}

