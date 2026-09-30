import { createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, Building2, Mail, Phone } from "lucide-react";

import { EmptyState, PageHeader } from "@/components/app/common";
import { PropertyGrid } from "@/components/app/property-card";
import { AppShell } from "@/components/app/shell";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { isPublic, useStore } from "@/lib/store";

export const Route = createFileRoute("/seller/$id")({
  head: () => ({
    meta: [
      { title: "Profil Penjual — MyProperty" },
      { name: "description", content: "Lihat profil penjual dan seluruh properti yang sedang ditawarkan." },
      { property: "og:title", content: "Profil Penjual — MyProperty" },
      { property: "og:description", content: "Lihat profil penjual dan seluruh properti yang sedang ditawarkan." },
    ],
  }),
  component: SellerProfilePage,
});

function SellerProfilePage() {
  const { id } = Route.useParams();
  const { state, hydrated } = useStore();
  const seller = state.users.find((u) => u.id === id && u.role === "seller");
  const listings = state.properties.filter((p) => p.sellerId === id && isPublic(p));

  if (hydrated && !seller) {
    return (
      <AppShell>
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <EmptyState
            icon={Building2}
            title="Penjual tidak ditemukan"
            description="Profil penjual yang Anda cari tidak tersedia."
            actionLabel="Lihat Properti"
            actionTo="/properties"
          />
        </div>
      </AppShell>
    );
  }

  if (!seller) {
    return (
      <AppShell>
        <div className="mx-auto max-w-3xl px-4 py-24 text-center text-sm text-muted-foreground sm:px-6">Memuat…</div>
      </AppShell>
    );
  }

  const waNumber = seller.phone.replace(/^0/, "62");

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="border border-border bg-card p-6">
          <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-4">
            <span className="grid size-14 shrink-0 place-items-center rounded-full bg-secondary text-lg font-bold text-secondary-foreground">
              {seller.name.charAt(0)}
            </span>
            <div className="min-w-0">
              <h1 className="font-display text-2xl text-foreground sm:text-3xl">{seller.name}</h1>
              {seller.verified ? (
                <span className="mt-1 inline-flex items-center gap-1 text-sm font-bold text-primary">
                  <BadgeCheck className="size-4" aria-hidden /> Terverifikasi
                </span>
              ) : (
                <span className="mt-1 inline-block text-sm text-muted-foreground">Belum terverifikasi</span>
              )}
              {seller.bio ? <p className="mt-3 text-sm leading-6 text-muted-foreground">{seller.bio}</p> : null}
              <p className="mt-3 text-xs text-muted-foreground">
                Bergabung {formatDate(seller.createdAt)} · {listings.length} properti aktif
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm">
                  <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noreferrer">
                    <Phone className="size-4" aria-hidden /> Hubungi via WhatsApp
                  </a>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <a href={`mailto:${seller.email}`}>
                    <Mail className="size-4" aria-hidden /> {seller.email}
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <PageHeader title="Properti dari penjual ini" />
          <div className="mt-6">
            {listings.length === 0 ? (
              <EmptyState
                icon={Building2}
                title="Belum ada properti aktif"
                description="Penjual ini belum memiliki properti yang tayang saat ini."
                actionLabel="Lihat Properti Lain"
                actionTo="/properties"
              />
            ) : (
              <PropertyGrid properties={listings} />
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
