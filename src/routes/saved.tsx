import { createFileRoute } from "@tanstack/react-router";
import { Heart } from "lucide-react";

import { CardGridSkeleton, EmptyState, PageHeader } from "@/components/app/common";
import { PropertyGrid } from "@/components/app/property-card";
import { AppShell } from "@/components/app/shell";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/saved")({
  head: () => ({
    meta: [
      { title: "Properti Tersimpan — MyProperty" },
      { name: "description", content: "Daftar properti yang Anda simpan di MyProperty." },
      { property: "og:title", content: "Properti Tersimpan — MyProperty" },
      { property: "og:description", content: "Daftar properti yang Anda simpan di MyProperty." },
    ],
  }),
  component: SavedPage,
});

function SavedPage() {
  const { state, hydrated } = useStore();
  const saved = state.favorites
    .map((id) => state.properties.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <PageHeader
          title="Properti Tersimpan"
          description="Properti yang Anda simpan akan muncul di sini, siap dibandingkan kapan saja."
        />
        <div className="mt-8">
          {!hydrated ? (
            <CardGridSkeleton count={3} />
          ) : saved.length === 0 ? (
            <EmptyState
              icon={Heart}
              title="Belum ada properti tersimpan"
              description="Tekan ikon hati pada properti yang Anda minati untuk menyimpannya di sini."
              actionLabel="Cari Properti"
              actionTo="/properties"
            />
          ) : (
            <PropertyGrid properties={saved} />
          )}
        </div>
      </div>
    </AppShell>
  );
}
