import { SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { citiesByProvince, districtsByCity, provinces } from "@/lib/mock-data";
import { activeFilterChips, defaultFilters, type Filters, type SortKey } from "@/lib/search";
import { useStore } from "@/lib/store";

interface Props {
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
  onReset: () => void;
}

export function FilterFields({ filters, onChange, onReset }: Props) {
  const { state } = useStore();
  const activeCategories = state.categories.filter((c) => c.active);

  return (
    <div className="space-y-6">
      <fieldset>
        <legend className="mb-2 text-xs font-extrabold uppercase tracking-wide text-foreground">
          Transaksi
        </legend>
        <div className="flex gap-2">
          {[
            ["", "Semua"],
            ["dijual", "Dijual"],
            ["disewa", "Disewa"],
          ].map(([value, label]) => (
            <button
              key={label}
              type="button"
              onClick={() => onChange({ transaction: value as Filters["transaction"] })}
              aria-pressed={filters.transaction === value}
              className={`border px-3 py-1.5 text-sm font-semibold transition-colors ${
                filters.transaction === value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-xs font-extrabold uppercase tracking-wide text-foreground">
          Tipe Properti
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {activeCategories.map((category) => {
            const checked = filters.types.includes(category.slug);
            return (
              <label key={category.id} className="flex items-center gap-2 text-sm text-foreground">
                <Checkbox
                  checked={checked}
                  onCheckedChange={(value) =>
                    onChange({
                      types: value
                        ? [...filters.types, category.slug]
                        : filters.types.filter((t) => t !== category.slug),
                    })
                  }
                  aria-label={category.name}
                />
                {category.name}
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-xs font-extrabold uppercase tracking-wide text-foreground">
          Harga (Rp)
        </legend>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="minPrice" className="sr-only">
              Harga minimum
            </Label>
            <Input
              id="minPrice"
              inputMode="numeric"
              placeholder="Minimum"
              value={filters.minPrice}
              onChange={(e) => onChange({ minPrice: e.target.value.replace(/\D/g, "") })}
            />
          </div>
          <div>
            <Label htmlFor="maxPrice" className="sr-only">
              Harga maksimum
            </Label>
            <Input
              id="maxPrice"
              inputMode="numeric"
              placeholder="Maksimum"
              value={filters.maxPrice}
              onChange={(e) => onChange({ maxPrice: e.target.value.replace(/\D/g, "") })}
            />
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-xs font-extrabold uppercase tracking-wide text-foreground">
          Lokasi
        </legend>
        <div className="space-y-2">
          <select
            aria-label="Provinsi"
            className="h-10 w-full border border-input bg-card px-3 text-sm"
            value={filters.province}
            onChange={(e) => onChange({ province: e.target.value, city: "", district: "" })}
          >
            <option value="">Semua provinsi</option>
            {provinces.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <select
            aria-label="Kota atau kabupaten"
            className="h-10 w-full border border-input bg-card px-3 text-sm"
            value={filters.city}
            disabled={!filters.province}
            onChange={(e) => onChange({ city: e.target.value, district: "" })}
          >
            <option value="">Semua kota/kabupaten</option>
            {(citiesByProvince[filters.province] ?? []).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            aria-label="Kecamatan"
            className="h-10 w-full border border-input bg-card px-3 text-sm"
            value={filters.district}
            disabled={!filters.city}
            onChange={(e) => onChange({ district: e.target.value })}
          >
            <option value="">Semua kecamatan</option>
            {(districtsByCity[filters.city] ?? []).map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-xs font-extrabold uppercase tracking-wide text-foreground">
          Spesifikasi
        </legend>
        <div className="grid grid-cols-2 gap-2">
          <LabeledInput
            id="bedrooms"
            label="Kamar tidur min."
            value={filters.bedrooms}
            onChange={(v) => onChange({ bedrooms: v })}
          />
          <LabeledInput
            id="bathrooms"
            label="Kamar mandi min."
            value={filters.bathrooms}
            onChange={(v) => onChange({ bathrooms: v })}
          />
          <LabeledInput
            id="minLand"
            label="Luas tanah min."
            value={filters.minLand}
            onChange={(v) => onChange({ minLand: v })}
          />
          <LabeledInput
            id="minBuilding"
            label="Luas bangunan min."
            value={filters.minBuilding}
            onChange={(v) => onChange({ minBuilding: v })}
          />
          <LabeledInput
            id="floors"
            label="Jumlah lantai min."
            value={filters.floors}
            onChange={(v) => onChange({ floors: v })}
          />
        </div>
      </fieldset>

      <Button type="button" variant="outline" className="w-full" onClick={onReset}>
        Reset Filter
      </Button>
    </div>
  );
}

function LabeledInput({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <Label htmlFor={id} className="mb-1 block text-xs text-muted-foreground">
        {label}
      </Label>
      <Input
        id={id}
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
      />
    </div>
  );
}

export function FilterSidebar(props: Props) {
  return (
    <aside className="hidden w-64 shrink-0 lg:block">
      <div className="sticky top-24 border border-border bg-card p-5">
        <h2 className="mb-4 text-sm font-extrabold uppercase tracking-wide text-foreground">
          Filter
        </h2>
        <FilterFields {...props} />
      </div>
    </aside>
  );
}

export function FilterDrawer(props: Props) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="lg:hidden">
          <SlidersHorizontal className="size-4" aria-hidden /> Filter
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
        <SheetTitle>Filter Properti</SheetTitle>
        <div className="mt-4">
          <FilterFields {...props} />
          <Button className="mt-4 w-full" onClick={() => setOpen(false)}>
            Terapkan Filter
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function FilterChips({ filters, onChange, onReset }: Props) {
  const { state } = useStore();
  const typeName = (slug: string) => state.categories.find((c) => c.slug === slug)?.name ?? slug;
  const chips = activeFilterChips(filters, typeName);
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => onChange(chip.clear)}
          className="inline-flex items-center gap-1.5 border border-border bg-card px-2.5 py-1 text-xs font-semibold text-foreground hover:border-primary"
        >
          {chip.label}
          <X className="size-3.5" aria-hidden />
          <span className="sr-only">Hapus filter</span>
        </button>
      ))}
      <button
        type="button"
        onClick={onReset}
        className="text-xs font-bold uppercase text-primary underline-offset-4 hover:underline"
      >
        Reset semua
      </button>
    </div>
  );
}

export function SortSelect({
  value,
  onChange,
}: {
  value: SortKey;
  onChange: (v: SortKey) => void;
}) {
  return (
    <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
      <span className="hidden sm:inline">Urutkan</span>
      <select
        aria-label="Urutkan hasil"
        className="h-10 border border-input bg-card px-3 text-sm text-foreground"
        value={value}
        onChange={(e) => onChange(e.target.value as SortKey)}
      >
        <option value="terbaru">Terbaru</option>
        <option value="termurah">Harga terendah</option>
        <option value="termahal">Harga tertinggi</option>
        <option value="terpopuler">Terpopuler</option>
      </select>
    </label>
  );
}

export { defaultFilters };
