import {
  BookOpen,
  Bot,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  House,
  Languages,
  LogOut,
  Menu,
  Palette,
  ShoppingBag,
  ShoppingCart,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  accentOptions,
  localeOptions,
  type AccentTheme,
  type Copy,
  type Locale,
  type PanelName,
} from "../../content";
import { EpcEntryNotice } from "../epc/EpcEntryNotice";
import { EpcHeaderProvider, type EpcHeaderConfig } from "../epc/epcHeaderContext";

type MainLayoutProps = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  accentTheme: AccentTheme;
  setAccentTheme: (theme: AccentTheme) => void;
  activePanel: PanelName;
  setActivePanel: (panel: PanelName) => void;
  copy: Copy;
  cartCount: number;
  children: React.ReactNode;
};

type MenuName = "language" | "theme" | "profile" | null;

export function MainLayout({
  locale,
  setLocale,
  accentTheme,
  setAccentTheme,
  activePanel,
  setActivePanel,
  copy,
  cartCount,
  children,
}: MainLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<MenuName>(null);
  const [epcHeader, setEpcHeader] = useState<EpcHeaderConfig | null>(null);
  const actionsRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const pageTitle = useMemo(() => {
    if (location.pathname.startsWith("/epc")) {
      return copy.nav.epc;
    }

    if (location.pathname.startsWith("/orders")) {
      return copy.nav.orders;
    }

    return copy.nav.dashboard;
  }, [copy.nav.dashboard, copy.nav.epc, copy.nav.orders, location.pathname]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (actionsRef.current && !actionsRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  useEffect(() => {
    setIsSidebarOpen(false);
    setOpenMenu(null);
  }, [location.pathname]);

  useEffect(() => {
    if (!location.pathname.startsWith("/epc")) {
      setEpcHeader(null);
    }
  }, [location.pathname]);

  const navigationItems = [
    { to: "/", label: copy.nav.dashboard, icon: House, caption: "01" },
    { to: "/epc", label: copy.nav.epc, icon: BookOpen, caption: "02" },
    { to: "/orders", label: copy.nav.orders, icon: ShoppingBag, caption: "03" },
  ];
  const isEpcRoute = location.pathname.startsWith("/epc");

  return (
    <div className="shell">
      <aside className={`sidebar ${isSidebarOpen ? "is-open" : ""}`}>
        <div className="brand-block">
          <div className="brand-stack">
            <div className="brand-mark" title={copy.brand.name}>
              SL
            </div>
            <p className="rail-brand-label">{copy.brand.railLabel}</p>
          </div>
        </div>
        <nav className="sidebar-nav" aria-label="Primary">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                title={item.label}
                aria-label={item.label}
                className={({ isActive }) => `nav-link ${isActive ? "is-active" : ""}`}
              >
                <span className="nav-icon">
                  <Icon size={18} />
                </span>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <div className="content-shell">
        <EpcHeaderProvider value={setEpcHeader}>
          <header className="topbar">
            <div className="topbar-leading">
              <button
                className="icon-button mobile-only"
                type="button"
                onClick={() => setIsSidebarOpen((current) => !current)}
                aria-label="toggle sidebar"
              >
                {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
              {isEpcRoute && epcHeader ? (
                <div className="epc-topbar-shell">
                  <p className="page-kicker">{copy.brand.name}</p>
                  <div className="epc-topbar-trail">
                    <button
                      type="button"
                      className="icon-button epc-topbar-back"
                      aria-label={epcHeader.backLabel}
                      onClick={() => {
                        if (window.history.length > 1) {
                          navigate(-1);
                          return;
                        }

                        navigate(epcHeader.backFallbackTo);
                      }}
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <section className="epc-breadcrumbs epc-topbar-breadcrumbs" aria-label="breadcrumbs">
                      <div className="epc-breadcrumb-item epc-breadcrumb-system">
                        <button type="button" onClick={() => navigate("/epc")}>
                          {pageTitle}
                        </button>
                      </div>
                      {epcHeader.breadcrumbs.map((item, index) => (
                        <div key={`${item.label}-${index}`} className="epc-breadcrumb-item">
                          <ChevronRight size={14} />
                          {"onClick" in item ? (
                            <button type="button" onClick={item.onClick}>
                              {item.label}
                            </button>
                          ) : (
                            <span>{item.label}</span>
                          )}
                        </div>
                      ))}
                      {epcHeader.fromAssistant ? (
                        <div className="epc-breadcrumb-item epc-breadcrumb-ai">
                          <EpcEntryNotice locale={locale} focus={epcHeader.assistantFocus} />
                        </div>
                      ) : null}
                    </section>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="page-kicker">{copy.brand.name}</p>
                  <h1 className="page-title">{pageTitle}</h1>
                </div>
              )}
            </div>

            <div className="topbar-actions" ref={actionsRef}>
            <div className="menu-anchor">
              <button
                className={`toolbar-button ${openMenu === "language" ? "is-open" : ""}`}
                type="button"
                onClick={() => setOpenMenu((current) => (current === "language" ? null : "language"))}
              >
                <Languages size={18} />
                <span>{localeOptions.find((item) => item.value === locale)?.label}</span>
                <ChevronDown size={16} />
              </button>
              {openMenu === "language" ? (
                <div className="dropdown-menu">
                  {localeOptions.map((item) => (
                    <button
                      key={item.value}
                      className={`dropdown-option ${locale === item.value ? "is-selected" : ""}`}
                      type="button"
                      onClick={() => {
                        setLocale(item.value);
                        setOpenMenu(null);
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="menu-anchor">
              <button
                className={`toolbar-button ${openMenu === "theme" ? "is-open" : ""}`}
                type="button"
                onClick={() => setOpenMenu((current) => (current === "theme" ? null : "theme"))}
              >
                <Palette size={18} />
                <span>{copy.themes[accentTheme]}</span>
                <ChevronDown size={16} />
              </button>
              {openMenu === "theme" ? (
                <div className="dropdown-menu">
                  {accentOptions.map((item) => (
                    <button
                      key={item.value}
                      className={`dropdown-option ${accentTheme === item.value ? "is-selected" : ""}`}
                      type="button"
                      onClick={() => {
                        setAccentTheme(item.value);
                        setOpenMenu(null);
                      }}
                    >
                      <span className="theme-dot" style={{ background: item.dot }} />
                      {copy.themes[item.value]}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <button
              className={`toolbar-button ${activePanel === "assistant" ? "is-open" : ""}`}
              type="button"
              onClick={() => setActivePanel(activePanel === "assistant" ? null : "assistant")}
            >
              <Bot size={18} />
              <span>{copy.header.assistant}</span>
            </button>

            <button
              className={`toolbar-button ${activePanel === "cart" ? "is-open" : ""}`}
              type="button"
              onClick={() => setActivePanel(activePanel === "cart" ? null : "cart")}
            >
              <ShoppingCart size={18} />
              <span>{copy.header.cart}</span>
              <span className="badge">{cartCount}</span>
            </button>

            <div className="menu-anchor">
              <button
                className={`profile-button ${openMenu === "profile" ? "is-open" : ""}`}
                type="button"
                onClick={() => setOpenMenu((current) => (current === "profile" ? null : "profile"))}
              >
                <span className="avatar-shell">
                  <CircleUserRound size={20} />
                </span>
                <span className="profile-meta">
                  <strong>Alex Tan</strong>
                  <small>{copy.header.profileRole}</small>
                </span>
                <ChevronDown size={16} />
              </button>
              {openMenu === "profile" ? (
                <div className="dropdown-menu profile-menu">
                  <p className="profile-name">Alex Tan</p>
                  <p className="profile-org">{copy.header.profileOrg}</p>
                  <button className="dropdown-option signout-option" type="button">
                    <LogOut size={16} />
                    {copy.header.logout}
                  </button>
                </div>
              ) : null}
            </div>
            </div>
          </header>

          <main className={`workspace ${isEpcRoute ? "is-epc-workspace" : ""}`}>{children}</main>
        </EpcHeaderProvider>
      </div>

      {isSidebarOpen ? (
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="close sidebar"
          onClick={() => setIsSidebarOpen(false)}
        />
      ) : null}
    </div>
  );
}
