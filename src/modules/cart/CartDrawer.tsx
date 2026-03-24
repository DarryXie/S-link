import { Minus, Plus, Trash2, X } from "lucide-react";
import { useEffect, useRef } from "react";
import type { Copy, Locale } from "../../content";
import type { CartLine } from "./cartTypes";

type CartDrawerProps = {
  locale: Locale;
  copy: Copy;
  isOpen: boolean;
  onClose: () => void;
  items: CartLine[];
  selectedLineIds: Set<string>;
  onToggleLine: (lineId: string) => void;
  onToggleGroup: (bindingKey: string, checked: boolean) => void;
  onQuantityChange: (lineId: string, quantity: number) => void;
  onDeleteLine: (lineId: string) => void;
};

type CartGroup = {
  key: string;
  items: CartLine[];
  latestAddedAt: number;
  total: number;
};

type SelectionCheckboxProps = {
  checked: boolean;
  indeterminate?: boolean;
  ariaLabel: string;
  onChange: (checked: boolean) => void;
};

function SelectionCheckbox({
  checked,
  indeterminate = false,
  ariaLabel,
  onChange,
}: SelectionCheckboxProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <input
      ref={inputRef}
      type="checkbox"
      className="cart-checkbox"
      checked={checked}
      aria-label={ariaLabel}
      onChange={(event) => onChange(event.target.checked)}
    />
  );
}

function formatVehicleLabel(locale: Locale, item: CartLine) {
  return [
    item.vehicle.brand[locale],
    item.vehicle.series[locale],
    item.vehicle.year,
    item.vehicle.model[locale],
  ].join(" / ");
}

export function CartDrawer({
  locale,
  copy,
  isOpen,
  onClose,
  items,
  selectedLineIds,
  onToggleLine,
  onToggleGroup,
  onQuantityChange,
  onDeleteLine,
}: CartDrawerProps) {
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: locale === "zh-CN" ? "CNY" : "USD",
    maximumFractionDigits: 0,
  });
  const quoteLabel = locale === "zh-CN" ? "去询价" : "Request Quote";
  const orderLabel = locale === "zh-CN" ? "去下单" : "Place Order";
  const selectedQuantityLabel = locale === "zh-CN" ? "已选" : "Selected";
  const unitLabel = locale === "zh-CN" ? "件" : "pcs";
  const deleteLabel = locale === "zh-CN" ? "删除" : "Delete";

  const groupedItems = Array.from(
    items.reduce((groups, item) => {
      const existing = groups.get(item.bindingKey);
      const lineTotal = item.quantity * item.unitPrice;

      if (!existing) {
        groups.set(item.bindingKey, {
          key: item.bindingKey,
          items: [item],
          latestAddedAt: item.addedAt,
          total: lineTotal,
        });
        return groups;
      }

      existing.items.push(item);
      existing.latestAddedAt = Math.max(existing.latestAddedAt, item.addedAt);
      existing.total += lineTotal;
      return groups;
    }, new Map<string, CartGroup>()),
  )
    .map(([, group]) => ({
      ...group,
      items: [...group.items].sort((left, right) => right.addedAt - left.addedAt),
    }))
    .sort((left, right) => right.latestAddedAt - left.latestAddedAt);

  const selectedItems = items.filter((item) => selectedLineIds.has(item.id));
  const selectedQuantity = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  const selectedTotal = selectedItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );

  return (
    <aside className={`side-drawer ${isOpen ? "is-open" : ""}`} aria-hidden={!isOpen}>
      <div className="drawer-head">
        <div>
          <h2>{copy.cart.title}</h2>
        </div>
        <button type="button" className="icon-button" onClick={onClose} aria-label="close cart">
          <X size={18} />
        </button>
      </div>

      <div className="cart-scroll-region">
        <section className="drawer-section cart-list">
          {groupedItems.map((group) => {
            const leadItem = group.items[0];
            const allSelected = group.items.every((item) => selectedLineIds.has(item.id));
            const someSelected =
              !allSelected && group.items.some((item) => selectedLineIds.has(item.id));

            return (
              <section key={group.key} className="cart-vehicle-group">
                <div className="cart-vehicle-header">
                  <div className="cart-vehicle-meta">
                    <SelectionCheckbox
                      checked={allSelected}
                      indeterminate={someSelected}
                      ariaLabel={locale === "zh-CN" ? "按车型全选" : "Select vehicle group"}
                      onChange={(checked) => onToggleGroup(group.key, checked)}
                    />
                    <div className="cart-vehicle-copy">
                      <p className="cart-vehicle-title">{formatVehicleLabel(locale, leadItem)}</p>
                      {leadItem.vehicle.vin ? (
                        <small className="cart-vehicle-vin">VIN {leadItem.vehicle.vin}</small>
                      ) : null}
                    </div>
                  </div>
                  <strong className="cart-vehicle-total">{formatter.format(group.total)}</strong>
                </div>

                <div className="cart-vehicle-items">
                  {group.items.map((item) => (
                    <article key={item.id} className="cart-item">
                      <SelectionCheckbox
                        checked={selectedLineIds.has(item.id)}
                        ariaLabel={locale === "zh-CN" ? "选择配件" : "Select part"}
                        onChange={() => onToggleLine(item.id)}
                      />

                      <div className="cart-item-main">
                        <div className="cart-item-copy">
                          <p className="cart-item-name">{item.name[locale]}</p>
                          <small className="cart-item-sku">{item.sku}</small>
                          <span className="cart-item-amount">
                            {formatter.format(item.unitPrice * item.quantity)}
                          </span>
                        </div>

                        <div className="cart-item-side">
                          <button
                            type="button"
                            className="cart-delete-button"
                            onClick={() => onDeleteLine(item.id)}
                          >
                            <Trash2 size={14} />
                            {deleteLabel}
                          </button>

                          <div className="cart-item-bottom">
                            <div className="cart-qty-stepper">
                              <button
                                type="button"
                                className="icon-button cart-mini-button"
                                onClick={() => onQuantityChange(item.id, item.quantity - 1)}
                                aria-label={locale === "zh-CN" ? "减少数量" : "Decrease quantity"}
                              >
                                <Minus size={14} />
                              </button>
                              <strong className="cart-qty-value">{item.quantity}</strong>
                              <button
                                type="button"
                                className="icon-button cart-mini-button"
                                onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                                aria-label={locale === "zh-CN" ? "增加数量" : "Increase quantity"}
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </section>
      </div>

      <section className="drawer-section cart-summary">
        <div className="summary-row">
          <span>
            {selectedQuantityLabel} {selectedQuantity} {unitLabel}
          </span>
          <strong>{formatter.format(selectedTotal)}</strong>
        </div>
        <div className="cart-summary-actions">
          <button type="button" className="primary-action block">
            {quoteLabel}
          </button>
          <button type="button" className="secondary-action block">
            {orderLabel}
          </button>
        </div>
      </section>
    </aside>
  );
}
