import { createFileRoute } from "@tanstack/react-router";
import { SearchX, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { CardGridSkeleton, EmptyState, PageHeader } from "@/components/app/common";
import { FilterChips, FilterDrawer, FilterSidebar, SortSelect } from "@/components/app/property-filters";
import { PropertyGrid } from "@/components/app/property-card";
import { AppShell } from "@/components/app/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { applyFilters, defaultFilters, sortProperties, type Filters, type SortKey } from "@/lib/search";
import { isPublic, useStore } from "@/lib/store";

export const Route = createFileRoute("/properties/")({
  validateSearch: (search: Record<string, unknown>): { q?: string; tipe?: string; transaksi?: string; maks?: string } => ({
    q: typeof search.q === "string" ? search.q : undefined,
    tipe: typeof search.tipe === "string" ? search.tipe : undefined,
    transaksi: typeof search.transaksi === "string" ? search.transaksi : undefined,
    maks: typeof search.maks === "string" ? search.maks : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Cari Properti — MyProperty" },
      {
        name: "description",
        content: "Cari rumah, tanah, apartemen, ruko, kost, dan villa dijual atau disewa dengan filter lengkap.",
      },
      { property: "og:title", content: "Cari Properti — MyProperty" },
      {
        property: "og:description",
        content: "Cari rumah, tanah, apartemen, ruko, kost, dan villa dijual atau disewa dengan filter lengkap.",
      },
    ],
  }),
  component: PropertiesPage,
});

const PAGE_SIZE = 9;

function PropertiesPage() {
  const search = Route.useSearch();
  const { state, hydrated } = useStore();
  const [filters, setFilters] = useState<Filters>({
    ...defaultFilters,
    q: search.q ?? "",
    types: search.tipe ? [search.tipe] : [],
    transaction: search.transaksi === "dijual" || search.transaksi === "disewa" ? search.transaksi : "",
    maxPrice: search.maks ?? "",
  });
  const [keyword, setKeyword] = useState(search.q ?? "");
  const [sort, setSort] = useState<SortKey>("terbaru");
  const [page, setPage] = useState(1);

  const change = (patch: Partial<Filters>) => {
    setFilters((f) => ({ ...f, ...patch }));
    setPage(1);
  };
  const reset = () => {
    setFilters(defaultFilters);
    setKeyword("");
    setPage(1);
  };

  const results = useMemo(() => {
    const publicOnes = state.properties.filter(isPublic);
    return sortProperties(applyFilters(publicOnes, filters), sort);
  }, [state.properties, filters, sort]);

  useEffect(() => {
    setPage(1);
  }, [sort]);

  const visible = results.slice(0, page * PAGE_SIZE);

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <PageHeader
          title="Cari Properti"
          description="Gunakan pencarian dan filter untuk menemukan properti yang paling sesuai."
        />

        <form
          className="mt-6 flex flex-col gap-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            change({ q: keyword });
          }}
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              aria-label="Cari nama properti, kota, atau kecamatan"
              placeholder="Cari nama properti, kota, atau kecamatan"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="h-11 pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="h-11 flex-1 sm:flex-none">
              Cari
            </Button>
            <FilterDrawer filters={filters} onChange={change} onReset={reset} />
          </div>
        </form>

        <div className="mt-8 flex gap-8">
          <FilterSidebar filters={filters} onChange={change} onReset={reset} />

          <section className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                Menampilkan <span className="font-bold text-foreground">{visible.length}</span> dari{" "}
                <span className="font-bold text-foreground">{results.length}</span> properti
              </p>
              <SortSelect value={sort} onChange={setSort} />
            </div>

            <div className="mt-4">
              <FilterChips filters={filters} onChange={change} onReset={reset} />
            </div>

            <div className="mt-6">
              {!hydrated ? (
                <CardGridSkeleton />
              ) : results.length === 0 ? (
                <EmptyState
                  icon={SearchX}
                  title="Properti tidak ditemukan"
                  description="Coba ubah kata kunci atau longgarkan filter yang Anda pakai."
                  actionLabel="Reset Filter"
                  onAction={reset}
                />
              ) : (
                <>
                  <PropertyGrid properties={visible} />
                  {visible.length < results.length ? (
                    <div className="mt-8 flex justify-center">
                      <Button variant="outline" onClick={() => setPage((p) => p + 1)}>
                        Muat Lebih Banyak
                      </Button>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
