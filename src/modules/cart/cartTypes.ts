import type { Locale } from "../../content";

export type LocaleText = Record<Locale, string>;

export type CartLine = {
  id: string;
  bindingKey: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  name: LocaleText;
  description: LocaleText;
  context: LocaleText;
};
