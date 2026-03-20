import { ShoppingCart, X } from "lucide-react";
import type { Copy, Locale } from "../../content";
import type { CartLine } from "./cartTypes";

type CartDrawerProps = {
  locale: Locale;
  copy: Copy;
  isOpen: boolean;
  onClose: () => void;
  items: CartLine[];
};

export function CartDrawer({ locale, copy, isOpen, onClose, items }: CartDrawerProps) {
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: locale === "zh-CN" ? "CNY" : "USD",
    maximumFractionDigits: 0,
  });

  const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  return (
    <aside className={`side-drawer ${isOpen ? "is-open" : ""}`} aria-hidden={!isOpen}>
      <div className="drawer-head">
        <div>
          <p className="section-kicker">{copy.common.globallyAvailable}</p>
          <h2>{copy.cart.title}</h2>
        </div>
        <button type="button" className="icon-button" onClick={onClose} aria-label="close cart">
          <X size={18} />
        </button>
      </div>
      <p className="drawer-description">{copy.cart.description}</p>

      <section className="drawer-section cart-list">
        {items.map((item) => (
          <article key={item.id} className="cart-item">
            <div className="cart-item-topline">
              <p>{item.name[locale]}</p>
              <span>x{item.quantity}</span>
            </div>
            <small>{item.sku}</small>
            <span>{item.description[locale]}</span>
            <small>{item.context[locale]}</small>
            <strong>{formatter.format(item.unitPrice * item.quantity)}</strong>
          </article>
        ))}
      </section>

      <section className="drawer-section cart-summary">
        <div className="summary-heading">
          <ShoppingCart size={16} />
          <p>{copy.cart.summaryTitle}</p>
        </div>
        <div className="summary-row">
          <span>
            {items.length} {copy.common.records}
          </span>
          <strong>{formatter.format(total)}</strong>
        </div>
        <p className="summary-note">{copy.cart.summaryNote}</p>
        <button type="button" className="primary-action block">
          {copy.cart.checkout}
        </button>
        <button type="button" className="secondary-action block" onClick={onClose}>
          {copy.cart.continueBrowsing}
        </button>
      </section>
    </aside>
  );
}
