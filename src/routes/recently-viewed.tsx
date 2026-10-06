import { createFileRoute } from "@tanstack/react-router";
import { History } from "lucide-react";

import { CardGridSkeleton, EmptyState, PageHeader } from "@/components/app/common";
import { PropertyGrid } from "@/components/app/property-card";
import { AppShell } from "@/components/app/shell";
import { useSupabaseStore as useStore } from "@/lib/supabase-store";

export const Route = createFileRoute("/recently-viewed")({
  head: () => ({
    meta: [
      { title: "Terakhir Dilihat — MyProperty" },
      { name: "description", content: "Properti yang baru saja Anda lihat di MyProperty." },
      { property: "og:title", content: "Terakhir Dilihat — MyProperty" },
      { property: "og:description", content: "Properti yang baru saja Anda lihat di MyProperty." },
    ],
  }),
  component: RecentlyViewedPage,
});

function RecentlyViewedPage() {
  const { state, hydrated } = useStore();
  const list = state.recentlyViewed
    .map((id) => state.properties.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <PageHeader
          title="Terakhir Dilihat"
          description="Riwayat properti yang baru saja Anda buka, supaya mudah kembali membandingkan."
        />
        <div className="mt-8">
          {!hydrated ? (
            <CardGridSkeleton count={3} />
          ) : list.length === 0 ? (
            <EmptyState
              icon={History}
              title="Belum ada riwayat"
              description="Properti yang Anda buka akan tercatat di sini secara otomatis."
              actionLabel="Mulai Cari Properti"
              actionTo="/properties"
            />
          ) : (
            <PropertyGrid properties={list} />
          )}
        </div>
      </div>
    </AppShell>
  );
}
