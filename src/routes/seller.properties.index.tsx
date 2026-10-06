import { Link, createFileRoute } from "@tanstack/react-router";
import { Building2, MoreHorizontal, PlusCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState, PageHeader } from "@/components/app/common";
import { StatusBadge } from "@/components/app/property-card";
import { RoleGuard, SellerShell } from "@/components/app/shell";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatNumber, formatPrice } from "@/lib/format";
import { useSupabaseStore as useStore } from "@/lib/supabase-store";
import type { Property, PropertyStatus } from "@/lib/types";

export const Route = createFileRoute("/seller/properties/")({
  head: () => ({
    meta: [
      { title: "Properti Saya — MyProperty" },
      { name: "description", content: "Kelola semua listing properti Anda di MyProperty." },
      { property: "og:title", content: "Properti Saya — MyProperty" },
      { property: "og:description", content: "Kelola semua listing properti Anda di MyProperty." },
    ],
  }),
  component: () => (
    <RoleGuard role="seller">
      <SellerShell>
        <MyProperties />
      </SellerShell>
    </RoleGuard>
  ),
});

const tabs: { key: "semua" | PropertyStatus; label: string }[] = [
  { key: "semua", label: "Semua" },
  { key: "aktif", label: "Aktif" },
  { key: "pending", label: "Menunggu Review" },
  { key: "draft", label: "Draft" },
  { key: "ditolak", label: "Ditolak" },
  { key: "terjual", label: "Terjual" },
  { key: "disewa", label: "Disewa" },
  { key: "nonaktif", label: "Nonaktif" },
];

function MyProperties() {
  const { state, currentUser, updateProperty, deleteProperty } = useStore();
  const [tab, setTab] = useState<(typeof tabs)[number]["key"]>("semua");
  const [toDelete, setToDelete] = useState<Property | null>(null);

  const mine = state.properties.filter((p) => p.sellerId === currentUser?.id);
  const list = tab === "semua" ? mine : mine.filter((p) => p.status === tab);

  const setStatus = (p: Property, status: PropertyStatus, message: string) => {
    updateProperty(p.id, { status });
    toast.success(message);
  };

  const actions = (p: Property) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" aria-label={`Aksi untuk ${p.name}`}>
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {p.status === "aktif" || p.status === "terjual" || p.status === "disewa" ? (
          <DropdownMenuItem asChild>
            <Link to="/properties/$id" params={{ id: p.id }}>
              Lihat
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem asChild>
          <Link to="/seller/properties/$id/edit" params={{ id: p.id }}>
            Edit
          </Link>
        </DropdownMenuItem>
        {p.status === "draft" || p.status === "ditolak" ? (
          <DropdownMenuItem
            onClick={() => setStatus(p, "pending", "Listing dikirim untuk direview admin.")}
          >
            Kirim untuk Review
          </DropdownMenuItem>
        ) : null}
        {p.status === "aktif" ? (
          <>
            <DropdownMenuItem
              onClick={() =>
                setStatus(
                  p,
                  p.transaction === "dijual" ? "terjual" : "disewa",
                  "Status listing diperbarui.",
                )
              }
            >
              Tandai {p.transaction === "dijual" ? "Terjual" : "Disewa"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatus(p, "nonaktif", "Listing dinonaktifkan.")}>
              Nonaktifkan
            </DropdownMenuItem>
          </>
        ) : null}
        {p.status === "nonaktif" || p.status === "terjual" || p.status === "disewa" ? (
          <DropdownMenuItem onClick={() => setStatus(p, "aktif", "Listing diaktifkan kembali.")}>
            Aktifkan Kembali
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive" onClick={() => setToDelete(p)}>
          Hapus
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Properti Saya"
        description="Kelola semua listing Anda: edit, ubah status, atau hapus."
        action={
          <Button asChild>
            <Link to="/seller/properties/create">
              <PlusCircle className="size-4" aria-hidden />{" "}
              <span className="hidden sm:inline">Tambah Properti</span>
            </Link>
          </Button>
        }
      />

      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist">
        {tabs.map((t) => {
          const count =
            t.key === "semua" ? mine.length : mine.filter((p) => p.status === t.key).length;
          return (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className={`shrink-0 border px-3 py-1.5 text-sm font-semibold ${
                tab === t.key
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary"
              }`}
            >
              {t.label} ({count})
            </button>
          );
        })}
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Belum ada listing di sini"
          description="Mulai pasang properti pertama Anda agar bisa ditemukan calon pembeli."
          actionLabel="Tambah Properti"
          actionTo="/seller/properties/create"
        />
      ) : (
        <>
          <div className="hidden overflow-hidden border border-border bg-card md:block">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="p-3">Properti</th>
                  <th className="p-3">Harga</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Dilihat</th>
                  <th className="p-3">Inquiry</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {list.map((p) => (
                  <tr key={p.id}>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <img src={p.photos[0]} alt="" className="h-12 w-16 shrink-0 object-cover" />
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground">{p.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {p.district}, {p.city}
                          </p>
                          {p.status === "ditolak" && p.rejectReason ? (
                            <p className="mt-1 text-xs text-destructive">
                              Alasan: {p.rejectReason}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-semibold text-primary">
                      {formatPrice(p.price, p.transaction)}
                    </td>
                    <td className="p-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="p-3">{formatNumber(p.views)}</td>
                    <td className="p-3">
                      {state.inquiries.filter((i) => i.propertyId === p.id).length}
                    </td>
                    <td className="p-3 text-right">{actions(p)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="space-y-3 md:hidden">
            {list.map((p) => (
              <li key={p.id} className="border border-border bg-card p-3">
                <div className="grid grid-cols-[80px_minmax(0,1fr)_auto] gap-3">
                  <img src={p.photos[0]} alt="" className="h-16 w-20 object-cover" />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">{p.name}</p>
                    <p className="text-sm text-primary">{formatPrice(p.price, p.transaction)}</p>
                    <div className="mt-1">
                      <StatusBadge status={p.status} />
                    </div>
                  </div>
                  {actions(p)}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {formatNumber(p.views)} dilihat ·{" "}
                  {state.inquiries.filter((i) => i.propertyId === p.id).length} inquiry
                </p>
                {p.status === "ditolak" && p.rejectReason ? (
                  <p className="mt-1 text-xs text-destructive">Alasan ditolak: {p.rejectReason}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </>
      )}

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus listing ini?</AlertDialogTitle>
            <AlertDialogDescription>
              "{toDelete?.name}" akan dihapus permanen beserta inquiry terkait. Tindakan ini tidak
              bisa dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (toDelete) deleteProperty(toDelete.id);
                toast.success("Listing berhasil dihapus.");
                setToDelete(null);
              }}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
