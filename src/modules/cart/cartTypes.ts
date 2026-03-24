import type { Locale } from "../../content";

export type LocaleText = Record<Locale, string>;

export type CartVehicleContext = {
  vehicleId: string;
  source: "vin" | "vehicle";
  vin?: string;
  brand: LocaleText;
  series: LocaleText;
  year: string;
  model: LocaleText;
};

export type CartLine = {
  id: string;
  bindingKey: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  name: LocaleText;
  description: LocaleText;
  context: LocaleText;
  vehicle: CartVehicleContext;
  addedAt: number;
};

export function normalizeCartVin(vin?: string) {
  return vin?.trim().toUpperCase() ?? "";
}

export function buildCartBindingKey(vehicleId: string, vin?: string) {
  const normalizedVin = normalizeCartVin(vin);
  return normalizedVin ? `${vehicleId}:${normalizedVin}` : vehicleId;
}
