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
import { buildCartBindingKey, type CartLine } from "./modules/cart/cartTypes";
import { DashboardPage } from "./modules/dashboard/DashboardPage";
import { EpcGroupPage } from "./modules/epc/EpcGroupPage";
import { EpcHomePage } from "./modules/epc/EpcHomePage";
import { EpcWizardPage } from "./modules/epc/EpcWizardPage";
import { EpcWorkbenchPage } from "./modules/epc/EpcWorkbenchPage";
import { MainLayout } from "./modules/layout/MainLayout";
import { OrdersPage } from "./modules/orders/OrdersPage";

const localeStorageKey = "s-link.locale";
const accentStorageKey = "s-link.accent";

const seededVehicle = {
  vehicleId: "seed-demo-vehicle",
  source: "vehicle" as const,
  brand: {
    "zh-CN": "五菱",
    "en-US": "Wuling",
  },
  series: {
    "zh-CN": "宏光 MINI EV",
    "en-US": "Hongguang MINI EV",
  },
  year: "2025",
  model: {
    "zh-CN": "215km 轻享款",
    "en-US": "215km Lite",
  },
};

function readStorage<T extends string>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  const value = window.localStorage.getItem(key) as T | null;
  return value ?? fallback;
}

function createSeededCartLines() {
  const seededAt = Date.now();

  return cartItems.map((item, index) => ({
    id: item.id,
    bindingKey: buildCartBindingKey(seededVehicle.vehicleId),
    sku: item.sku,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    name: item.name,
    description: item.description,
    context: {
      "zh-CN": "演示数据 / 初始购物车",
      "en-US": "Demo data / seeded cart",
    },
    vehicle: seededVehicle,
    addedAt: seededAt - index,
  })) satisfies CartLine[];
}

export default function App() {
  const [locale, setLocale] = useState<Locale>(() => readStorage(localeStorageKey, "zh-CN"));
  const [accentTheme, setAccentTheme] = useState<AccentTheme>(() =>
    readStorage(accentStorageKey, "steel"),
  );
  const [activePanel, setActivePanel] = useState<PanelName>(null);
  const [cartLines, setCartLines] = useState<CartLine[]>(() => createSeededCartLines());
  const [selectedLineIds, setSelectedLineIds] = useState<Set<string>>(
    () => new Set(createSeededCartLines().map((item) => item.id)),
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

  function mergeCartLine(nextLine: CartLine, openCart: boolean) {
    setCartLines((current) => {
      const existing = current.find(
        (item) => item.sku === nextLine.sku && item.bindingKey === nextLine.bindingKey,
      );

      if (!existing) {
        setSelectedLineIds((selected) => new Set(selected).add(nextLine.id));
        return [nextLine, ...current];
      }

      setSelectedLineIds((selected) => new Set(selected).add(existing.id));
      return current.map((item) =>
        item.id === existing.id
          ? {
              ...item,
              quantity: item.quantity + nextLine.quantity,
              description: nextLine.description,
              context: nextLine.context,
              vehicle: nextLine.vehicle,
              addedAt: nextLine.addedAt,
            }
          : item,
      );
    });

    if (openCart) {
      setActivePanel("cart");
    }
  }

  function handleAddToCart(nextLine: CartLine) {
    mergeCartLine(nextLine, true);
  }

  function handleAddToCartQuietly(nextLine: CartLine) {
    mergeCartLine(nextLine, false);
  }

  function handleToggleLine(lineId: string) {
    setSelectedLineIds((current) => {
      const next = new Set(current);

      if (next.has(lineId)) {
        next.delete(lineId);
      } else {
        next.add(lineId);
      }

      return next;
    });
  }

  function handleToggleGroup(bindingKey: string, checked: boolean) {
    setSelectedLineIds((current) => {
      const next = new Set(current);

      cartLines.forEach((item) => {
        if (item.bindingKey !== bindingKey) {
          return;
        }

        if (checked) {
          next.add(item.id);
        } else {
          next.delete(item.id);
        }
      });

      return next;
    });
  }

  function handleQuantityChange(lineId: string, quantity: number) {
    setCartLines((current) =>
      current.map((item) =>
        item.id === lineId
          ? {
              ...item,
              quantity: Math.max(1, quantity),
            }
          : item,
      ),
    );
  }

  function handleDeleteLine(lineId: string) {
    setCartLines((current) => current.filter((item) => item.id !== lineId));
    setSelectedLineIds((current) => {
      const next = new Set(current);
      next.delete(lineId);
      return next;
    });
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
              <DashboardPage copy={copy} onOpenAssistant={() => setActivePanel("assistant")} />
            }
          />
          <Route path="/epc" element={<EpcHomePage locale={locale} />} />
          <Route path="/epc/wizard" element={<EpcWizardPage locale={locale} />} />
          <Route path="/epc/groups" element={<EpcGroupPage locale={locale} />} />
          <Route
            path="/epc/workbench"
            element={
              <EpcWorkbenchPage
                locale={locale}
                onAddToCart={handleAddToCart}
                cartLines={cartLines}
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
        onAddToCart={handleAddToCartQuietly}
      />
      <CartDrawer
        locale={locale}
        copy={copy}
        isOpen={activePanel === "cart"}
        onClose={() => setActivePanel(null)}
        items={cartLines}
        selectedLineIds={selectedLineIds}
        onToggleLine={handleToggleLine}
        onToggleGroup={handleToggleGroup}
        onQuantityChange={handleQuantityChange}
        onDeleteLine={handleDeleteLine}
      />
      {activePanel === "cart" ? (
        <button aria-label="close overlay" className="scrim" onClick={() => setActivePanel(null)} />
      ) : null}
    </>
  );
}
