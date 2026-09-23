import type { Property } from "./types";

export type SortKey = "terbaru" | "termurah" | "termahal" | "terpopuler";

export interface Filters {
  q: string;
  transaction: "" | "dijual" | "disewa";
  types: string[];
  minPrice: string;
  maxPrice: string;
  province: string;
  city: string;
  district: string;
  bedrooms: string;
  bathrooms: string;
  minLand: string;
  minBuilding: string;
  floors: string;
}

export const defaultFilters: Filters = {
  q: "",
  transaction: "",
  types: [],
  minPrice: "",
  maxPrice: "",
  province: "",
  city: "",
  district: "",
  bedrooms: "",
  bathrooms: "",
  minLand: "",
  minBuilding: "",
  floors: "",
};

const num = (value: string) => (value.trim() === "" ? undefined : Number(value));

export function applyFilters(properties: Property[], filters: Filters) {
  const q = filters.q.trim().toLowerCase();
  const min = num(filters.minPrice);
  const max = num(filters.maxPrice);
  const kt = num(filters.bedrooms);
  const km = num(filters.bathrooms);
  const land = num(filters.minLand);
  const building = num(filters.minBuilding);
  const floors = num(filters.floors);

  return properties.filter((p) => {
    if (q) {
      const haystack = `${p.name} ${p.district} ${p.city} ${p.province} ${p.address}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (filters.transaction && p.transaction !== filters.transaction) return false;
    if (filters.types.length > 0 && !filters.types.includes(p.type)) return false;
    if (min !== undefined && p.price < min) return false;
    if (max !== undefined && p.price > max) return false;
    if (filters.province && p.province !== filters.province) return false;
    if (filters.city && p.city !== filters.city) return false;
    if (filters.district && p.district !== filters.district) return false;
    if (kt !== undefined && p.bedrooms < kt) return false;
    if (km !== undefined && p.bathrooms < km) return false;
    if (land !== undefined && p.landArea < land) return false;
    if (building !== undefined && p.buildingArea < building) return false;
    if (floors !== undefined && p.floors < floors) return false;
    return true;
  });
}

export function sortProperties(properties: Property[], sort: SortKey) {
  const list = [...properties];
  switch (sort) {
    case "termurah":
      return list.sort((a, b) => a.price - b.price);
    case "termahal":
      return list.sort((a, b) => b.price - a.price);
    case "terpopuler":
      return list.sort((a, b) => b.views - a.views);
    default:
      return list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }
}

export function activeFilterChips(filters: Filters, typeName: (slug: string) => string) {
  const chips: { key: keyof Filters | string; label: string; clear: Partial<Filters> }[] = [];
  if (filters.q) chips.push({ key: "q", label: `"${filters.q}"`, clear: { q: "" } });
  if (filters.transaction)
    chips.push({
      key: "transaction",
      label: filters.transaction === "dijual" ? "Dijual" : "Disewa",
      clear: { transaction: "" },
    });
  filters.types.forEach((t) =>
    chips.push({
      key: `type-${t}`,
      label: typeName(t),
      clear: { types: filters.types.filter((x) => x !== t) },
    }),
  );
  if (filters.province) chips.push({ key: "province", label: filters.province, clear: { province: "", city: "", district: "" } });
  if (filters.city) chips.push({ key: "city", label: filters.city, clear: { city: "", district: "" } });
  if (filters.district) chips.push({ key: "district", label: filters.district, clear: { district: "" } });
  if (filters.minPrice) chips.push({ key: "minPrice", label: `≥ Rp ${filters.minPrice}`, clear: { minPrice: "" } });
  if (filters.maxPrice) chips.push({ key: "maxPrice", label: `≤ Rp ${filters.maxPrice}`, clear: { maxPrice: "" } });
  if (filters.bedrooms) chips.push({ key: "bedrooms", label: `${filters.bedrooms}+ KT`, clear: { bedrooms: "" } });
  if (filters.bathrooms) chips.push({ key: "bathrooms", label: `${filters.bathrooms}+ KM`, clear: { bathrooms: "" } });
  if (filters.minLand) chips.push({ key: "minLand", label: `Tanah ≥ ${filters.minLand} m²`, clear: { minLand: "" } });
  if (filters.minBuilding)
    chips.push({ key: "minBuilding", label: `Bangunan ≥ ${filters.minBuilding} m²`, clear: { minBuilding: "" } });
  if (filters.floors) chips.push({ key: "floors", label: `${filters.floors}+ lantai`, clear: { floors: "" } });
  return chips;
}
