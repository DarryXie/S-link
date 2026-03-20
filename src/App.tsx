import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import {
  appMessages,
  cartItems,
  type AccentTheme,
  type Locale,
  type PanelName,
} from "./content";
import { AssistantDrawer } from "./modules/assistant/AssistantDrawer";
import { CartDrawer } from "./modules/cart/CartDrawer";
import type { CartLine } from "./modules/cart/cartTypes";
import { DashboardPage } from "./modules/dashboard/DashboardPage";
import { EpcHomePage } from "./modules/epc/EpcHomePage";
import { EpcWizardPage } from "./modules/epc/EpcWizardPage";
import { EpcWorkbenchPage } from "./modules/epc/EpcWorkbenchPage";
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
  const [cartLines, setCartLines] = useState<CartLine[]>(() =>
    cartItems.map((item) => ({
      id: item.id,
      bindingKey: `seed-${item.id}`,
      sku: item.sku,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      name: item.name,
      description: item.description,
      context: {
        "zh-CN": "演示数据 / 初始购物车",
        "en-US": "Demo data / seeded cart",
      },
    })),
  );

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
  const cartCount = cartLines.reduce((sum, item) => sum + item.quantity, 0);

  function handleAddToCart(nextLine: CartLine) {
    setCartLines((current) => {
      const existing = current.find(
        (item) => item.sku === nextLine.sku && item.bindingKey === nextLine.bindingKey,
      );

      if (!existing) {
        return [nextLine, ...current];
      }

      return current.map((item) =>
        item.id === existing.id
          ? {
              ...item,
              quantity: item.quantity + nextLine.quantity,
              description: nextLine.description,
              context: nextLine.context,
            }
          : item,
      );
    });
    setActivePanel("cart");
  }

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
        cartCount={cartCount}
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
          <Route
            path="/epc"
            element={<EpcHomePage locale={locale} />}
          />
          <Route
            path="/epc/wizard"
            element={<EpcWizardPage locale={locale} />}
          />
          <Route
            path="/epc/workbench"
            element={
              <EpcWorkbenchPage
                locale={locale}
                onAddToCart={handleAddToCart}
                onOpenCart={() => setActivePanel("cart")}
              />
            }
          />
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
        items={cartLines}
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
