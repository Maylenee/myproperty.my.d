import { Link, createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/app/common";
import { AdminShell, RoleGuard } from "@/components/app/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/format";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/admin/sellers")({
  head: () => ({
    meta: [
      { title: "Kelola Seller — Admin MyProperty" },
      { name: "description", content: "Verifikasi dan pantau penjual di MyProperty." },
      { property: "og:title", content: "Kelola Seller — Admin MyProperty" },
      { property: "og:description", content: "Verifikasi dan pantau penjual di MyProperty." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <RoleGuard role="admin">
      <AdminShell>
        <AdminSellers />
      </AdminShell>
    </RoleGuard>
  ),
});

function AdminSellers() {
  const { state, verifySeller } = useStore();
  const [q, setQ] = useState("");
  const sellers = state.users.filter(
    (u) => u.role === "seller" && `${u.name} ${u.email}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Kelola Seller" description="Beri badge Terverifikasi untuk penjual yang datanya sudah diperiksa." />
      <div className="relative sm:w-72">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input aria-label="Cari seller" placeholder="Cari nama atau email" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
      </div>
      <ul className="divide-y divide-border border border-border bg-card">
        {sellers.map((s) => {
          const count = state.properties.filter((p) => p.sellerId === s.id).length;
          return (
            <li key={s.id} className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <div className="min-w-0">
                <p className="font-semibold text-foreground">
                  {s.name}{" "}
                  {s.verified ? (
                    <span className="ml-1 inline-flex items-center gap-1 text-xs font-bold text-primary">
                      <BadgeCheck className="size-3.5" aria-hidden /> Terverifikasi
                    </span>
                  ) : (
                    <span className="ml-1 text-xs font-semibold text-muted-foreground">Belum terverifikasi</span>
                  )}
                </p>
                <p className="text-sm text-muted-foreground">
                  {s.email} · {s.phone} · {count} listing · bergabung {formatDate(s.createdAt)}
                </p>
              </div>
              <div className="flex gap-2">
                <Button asChild size="sm" variant="ghost">
                  <Link to="/seller/$id" params={{ id: s.id }}>
                    Profil
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant={s.verified ? "outline" : "default"}
                  onClick={() => {
                    verifySeller(s.id, !s.verified);
                    toast.success(s.verified ? "Verifikasi dicabut." : `${s.name} kini terverifikasi.`);
                  }}
                >
                  {s.verified ? "Cabut Verifikasi" : "Verifikasi"}
                </Button>
              </div>
            </li>
          );
        })}
        {sellers.length === 0 ? <li className="p-4 text-sm text-muted-foreground">Seller tidak ditemukan.</li> : null}
      </ul>
    </div>
  );
}
