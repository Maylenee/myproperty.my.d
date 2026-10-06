import { Link, createFileRoute } from "@tanstack/react-router";
import { Building2, CheckCircle2, Clock, MessageSquare, Store, Users } from "lucide-react";

import { PageHeader, StatCard } from "@/components/app/common";
import { StatusBadge } from "@/components/app/property-card";
import { AdminShell, RoleGuard } from "@/components/app/shell";
import { Button } from "@/components/ui/button";
import { timeAgo } from "@/lib/format";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Dashboard Admin — MyProperty" },
      {
        name: "description",
        content: "Ringkasan pengguna, listing, dan laporan marketplace MyProperty.",
      },
      { property: "og:title", content: "Dashboard Admin — MyProperty" },
      {
        property: "og:description",
        content: "Ringkasan pengguna, listing, dan laporan marketplace MyProperty.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <RoleGuard role="admin">
      <AdminShell>
        <AdminDashboard />
      </AdminShell>
    </RoleGuard>
  ),
});

function AdminDashboard() {
  const { state, resetData } = useStore();
  const pending = state.properties.filter((p) => p.status === "pending");

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard Admin"
        description="Pantau aktivitas marketplace dan tinjau listing yang menunggu persetujuan."
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (window.confirm("Kembalikan semua data ke kondisi awal?")) resetData();
            }}
          >
            Reset Data Demo
          </Button>
        }
      />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard
          label="Total User"
          value={state.users.filter((u) => u.role === "buyer").length}
          icon={Users}
        />
        <StatCard
          label="Total Seller"
          value={state.users.filter((u) => u.role === "seller").length}
          icon={Store}
        />
        <StatCard label="Total Properti" value={state.properties.length} icon={Building2} />
        <StatCard
          label="Listing Aktif"
          value={state.properties.filter((p) => p.status === "aktif").length}
          icon={CheckCircle2}
        />
        <StatCard label="Menunggu Review" value={pending.length} icon={Clock} />
        <StatCard label="Total Inquiry" value={state.inquiries.length} icon={MessageSquare} />
      </div>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Menunggu review</h2>
          <Link
            to="/admin/properties"
            className="text-sm font-semibold text-primary hover:underline"
          >
            Kelola properti
          </Link>
        </div>
        <ul className="mt-4 divide-y divide-border border border-border bg-card">
          {pending.length === 0 ? (
            <li className="p-4 text-sm text-muted-foreground">
              Tidak ada listing yang menunggu review.
            </li>
          ) : null}
          {pending.slice(0, 5).map((p) => (
            <li
              key={p.id}
              className="grid grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-3 p-3"
            >
              <img src={p.photos[0]} alt="" className="h-12 w-16 object-cover" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{p.name}</p>
                <p className="text-xs text-muted-foreground">
                  {state.users.find((u) => u.id === p.sellerId)?.name} · {timeAgo(p.updatedAt)}
                </p>
              </div>
              <StatusBadge status={p.status} />
            </li>
          ))}
        </ul>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Laporan terbaru</h2>
          <Link to="/admin/reports" className="text-sm font-semibold text-primary hover:underline">
            Lihat laporan
          </Link>
        </div>
        <ul className="mt-4 divide-y divide-border border border-border bg-card">
          {state.reports.length === 0 ? (
            <li className="p-4 text-sm text-muted-foreground">Belum ada laporan.</li>
          ) : null}
          {state.reports.slice(0, 5).map((r) => (
            <li key={r.id} className="p-3 text-sm">
              <p className="font-semibold text-foreground">{r.reason}</p>
              <p className="text-xs text-muted-foreground">
                {state.properties.find((p) => p.id === r.propertyId)?.name ?? "Properti dihapus"} ·{" "}
                {r.reporter} · {timeAgo(r.createdAt)}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
