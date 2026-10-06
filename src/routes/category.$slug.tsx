import { Link, createFileRoute } from "@tanstack/react-router";
import { SearchX } from "lucide-react";
import { useMemo, useState } from "react";

import { CardGridSkeleton, EmptyState, PageHeader } from "@/components/app/common";
import {
  FilterChips,
  FilterDrawer,
  FilterSidebar,
  SortSelect,
} from "@/components/app/property-filters";
import { PropertyGrid } from "@/components/app/property-card";
import { AppShell } from "@/components/app/shell";
import {
  applyFilters,
  defaultFilters,
  sortProperties,
  type Filters,
  type SortKey,
} from "@/lib/search";
import { isPublic } from "@/lib/store"; import { useSupabaseStore as useStore } from "@/lib/supabase-store";

export const Route = createFileRoute("/category/$slug")({
  head: ({ params }) => {
    const name = params.slug.charAt(0).toUpperCase() + params.slug.slice(1);
    return {
      meta: [
        { title: `${name} Dijual & Disewa — MyProperty` },
        {
          name: "description",
          content: `Daftar properti kategori ${name} di MyProperty, lengkap dengan harga dan spesifikasi.`,
        },
        { property: "og:title", content: `${name} Dijual & Disewa — MyProperty` },
        { property: "og:description", content: `Daftar properti kategori ${name} di MyProperty.` },
      ],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const { state, hydrated } = useStore();
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [sort, setSort] = useState<SortKey>("terbaru");

  const category = state.categories.find((c) => c.slug === slug);
  const results = useMemo(() => {
    const list = state.properties.filter((p) => isPublic(p) && p.type === slug);
    return sortProperties(applyFilters(list, filters), sort);
  }, [state.properties, slug, filters, sort]);

  const change = (patch: Partial<Filters>) => setFilters((f) => ({ ...f, ...patch }));
  const reset = () => setFilters(defaultFilters);

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">
            Beranda
          </Link>
          <span className="px-2">/</span>
          <Link to="/properties" className="hover:text-primary">
            Properti
          </Link>
          <span className="px-2">/</span>
          <span className="font-semibold text-foreground">{category?.name ?? slug}</span>
        </nav>

        <PageHeader
          title={category?.name ?? "Kategori"}
          description={`Semua properti kategori ${category?.name ?? slug} yang tersedia di MyProperty.`}
        />

        <div className="mt-8 flex gap-8">
          <FilterSidebar filters={filters} onChange={change} onReset={reset} />
          <section className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                <span className="font-bold text-foreground">{results.length}</span> properti
                ditemukan
              </p>
              <div className="flex items-center gap-2">
                <FilterDrawer filters={filters} onChange={change} onReset={reset} />
                <SortSelect value={sort} onChange={setSort} />
              </div>
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
                  title="Belum ada properti di kategori ini"
                  description="Coba lihat kategori lain atau jelajahi semua properti yang tersedia."
                  actionLabel="Lihat Semua Properti"
                  actionTo="/properties"
                />
              ) : (
                <PropertyGrid properties={results} />
              )}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
