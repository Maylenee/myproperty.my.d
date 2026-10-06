import { Link, createFileRoute } from "@tanstack/react-router";
import { Building2, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState, PageHeader } from "@/components/app/common";
import { StatusBadge } from "@/components/app/property-card";
import { AdminShell, RoleGuard } from "@/components/app/shell";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatPrice, timeAgo } from "@/lib/format";
import { useSupabaseStore as useStore } from "@/lib/supabase-store";
import type { Property } from "@/lib/types";

export const Route = createFileRoute("/admin/properties")({
  head: () => ({
    meta: [
      { title: "Kelola Properti — Admin MyProperty" },
      { name: "description", content: "Tinjau, setujui, atau tolak listing properti." },
      { property: "og:title", content: "Kelola Properti — Admin MyProperty" },
      { property: "og:description", content: "Tinjau, setujui, atau tolak listing properti." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <RoleGuard role="admin">
      <AdminShell>
        <AdminProperties />
      </AdminShell>
    </RoleGuard>
  ),
});

const filters = [
  ["pending", "Menunggu Review"],
  ["aktif", "Disetujui"],
  ["ditolak", "Ditolak"],
  ["semua", "Semua"],
] as const;

function AdminProperties() {
  const { state, updateProperty, deleteProperty } = useStore();
  const [filter, setFilter] = useState<(typeof filters)[number][0]>("pending");
  const [q, setQ] = useState("");
  const [rejecting, setRejecting] = useState<Property | null>(null);
  const [reason, setReason] = useState("");

  const list = state.properties.filter((p) => {
    if (filter !== "semua" && p.status !== filter) return false;
    if (q && !`${p.name} ${p.city} ${p.district}`.toLowerCase().includes(q.toLowerCase()))
      return false;
    return p.status !== "draft";
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kelola Properti"
        description="Listing baru tayang di marketplace setelah Anda setujui."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 overflow-x-auto">
          {filters.map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              aria-pressed={filter === key}
              className={`shrink-0 border px-3 py-1.5 text-sm font-semibold ${
                filter === key
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground"
              }`}
            >
              {label} (
              {key === "semua"
                ? state.properties.filter((p) => p.status !== "draft").length
                : state.properties.filter((p) => p.status === key).length}
              )
            </button>
          ))}
        </div>
        <div className="relative sm:w-64">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            aria-label="Cari properti"
            placeholder="Cari properti"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Tidak ada properti"
          description="Tidak ada listing yang cocok dengan filter ini."
        />
      ) : (
        <ul className="space-y-3">
          {list.map((p) => {
            const seller = state.users.find((u) => u.id === p.sellerId);
            return (
              <li
                key={p.id}
                className="grid gap-4 border border-border bg-card p-4 sm:grid-cols-[120px_minmax(0,1fr)_auto]"
              >
                <img
                  src={p.photos[0]}
                  alt=""
                  className="aspect-[4/3] w-full object-cover sm:w-[120px]"
                />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={p.status} />
                    <span className="text-xs text-muted-foreground">
                      Diperbarui {timeAgo(p.updatedAt)}
                    </span>
                  </div>
                  <p className="mt-1 font-semibold text-foreground">{p.name}</p>
                  <p className="text-sm text-primary">{formatPrice(p.price, p.transaction)}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.district}, {p.city} · Penjual: {seller?.name}{" "}
                    {seller?.verified ? "(Terverifikasi)" : ""}
                  </p>
                  {p.rejectReason && p.status === "ditolak" ? (
                    <p className="mt-1 text-xs text-destructive">Alasan: {p.rejectReason}</p>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-start gap-2 sm:flex-col sm:items-stretch">
                  {p.status === "pending" || p.status === "ditolak" ? (
                    <Button
                      size="sm"
                      onClick={() => {
                        updateProperty(p.id, { status: "aktif", rejectReason: undefined });
                        toast.success(`"${p.name}" disetujui dan tayang di marketplace.`);
                      }}
                    >
                      Setujui
                    </Button>
                  ) : null}
                  {p.status === "pending" || p.status === "aktif" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setReason("");
                        setRejecting(p);
                      }}
                    >
                      Tolak
                    </Button>
                  ) : null}
                  {p.status === "aktif" ? (
                    <Button asChild size="sm" variant="ghost">
                      <Link to="/properties/$id" params={{ id: p.id }}>
                        Lihat
                      </Link>
                    </Button>
                  ) : null}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => {
                      if (window.confirm(`Hapus "${p.name}"?`)) {
                        deleteProperty(p.id);
                        toast.success("Listing dihapus.");
                      }
                    }}
                  >
                    Hapus
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog open={!!rejecting} onOpenChange={(o) => !o && setRejecting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak listing</DialogTitle>
            <DialogDescription>Alasan penolakan akan terlihat oleh penjual.</DialogDescription>
          </DialogHeader>
          <Textarea
            aria-label="Alasan penolakan"
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Contoh: Foto kurang jelas, mohon unggah foto tampak depan."
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setRejecting(null)}>
              Batal
            </Button>
            <Button
              disabled={reason.trim().length < 5}
              onClick={() => {
                if (!rejecting) return;
                updateProperty(rejecting.id, { status: "ditolak", rejectReason: reason.trim() });
                toast.success("Listing ditolak.");
                setRejecting(null);
              }}
            >
              Tolak Listing
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
