import { Link, createFileRoute } from "@tanstack/react-router";
import { Building2, CheckCircle2, Eye, MessageSquare, PlusCircle } from "lucide-react";

import { EmptyState, PageHeader, StatCard } from "@/components/app/common";
import { StatusBadge } from "@/components/app/property-card";
import { RoleGuard, SellerShell } from "@/components/app/shell";
import { Button } from "@/components/ui/button";
import { formatNumber, formatPrice, timeAgo } from "@/lib/format";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/seller/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard Penjual — MyProperty" },
      { name: "description", content: "Ringkasan listing, kunjungan, dan inquiry properti Anda." },
      { property: "og:title", content: "Dashboard Penjual — MyProperty" },
      {
        property: "og:description",
        content: "Ringkasan listing, kunjungan, dan inquiry properti Anda.",
      },
    ],
  }),
  component: () => (
    <RoleGuard role="seller">
      <SellerShell>
        <SellerDashboard />
      </SellerShell>
    </RoleGuard>
  ),
});

function SellerDashboard() {
  const { state, currentUser } = useStore();
  const mine = state.properties.filter((p) => p.sellerId === currentUser?.id);
  const inquiries = state.inquiries.filter((i) => i.sellerId === currentUser?.id);
  const views = mine.reduce((sum, p) => sum + p.views, 0);

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Halo, ${currentUser?.name.split(" ")[0]}`}
        description={
          currentUser?.verified
            ? "Akun Anda sudah terverifikasi."
            : "Akun Anda belum terverifikasi oleh admin."
        }
        action={
          <Button asChild>
            <Link to="/seller/properties/create">
              <PlusCircle className="size-4" aria-hidden />{" "}
              <span className="hidden sm:inline">Tambah Properti</span>
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Listing" value={mine.length} icon={Building2} />
        <StatCard
          label="Listing Aktif"
          value={mine.filter((p) => p.status === "aktif").length}
          icon={CheckCircle2}
        />
        <StatCard label="Total Dilihat" value={formatNumber(views)} icon={Eye} />
        <StatCard label="Total Inquiry" value={inquiries.length} icon={MessageSquare} />
      </div>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Inquiry terbaru</h2>
          <Link
            to="/seller/inquiries"
            className="text-sm font-semibold text-primary hover:underline"
          >
            Lihat semua
          </Link>
        </div>
        <div className="mt-4">
          {inquiries.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="Belum ada inquiry"
              description="Inquiry dari calon pembeli akan muncul di sini."
            />
          ) : (
            <ul className="divide-y divide-border border border-border bg-card">
              {inquiries.slice(0, 5).map((inq) => {
                const property = state.properties.find((p) => p.id === inq.propertyId);
                return (
                  <li key={inq.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 p-4">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-foreground">
                        {inq.buyerName}
                        {inq.status === "baru" ? (
                          <span className="ml-2 bg-accent px-1.5 py-0.5 text-[10px] font-bold uppercase text-accent-foreground">
                            Baru
                          </span>
                        ) : null}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">{property?.name}</p>
                      <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                        {inq.message}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">{timeAgo(inq.createdAt)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Listing terbaru</h2>
          <Link
            to="/seller/properties"
            className="text-sm font-semibold text-primary hover:underline"
          >
            Kelola listing
          </Link>
        </div>
        <ul className="mt-4 divide-y divide-border border border-border bg-card">
          {mine.slice(0, 5).map((p) => (
            <li
              key={p.id}
              className="grid grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-3 p-3"
            >
              <img src={p.photos[0]} alt="" className="h-12 w-16 object-cover" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{p.name}</p>
                <p className="text-sm text-primary">{formatPrice(p.price, p.transaction)}</p>
              </div>
              <StatusBadge status={p.status} />
            </li>
          ))}
          {mine.length === 0 ? (
            <li className="p-4 text-sm text-muted-foreground">Belum ada listing.</li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}
