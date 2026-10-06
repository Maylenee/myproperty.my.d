import { Link, createFileRoute } from "@tanstack/react-router";
import { MessageSquare, Phone } from "lucide-react";
import { useState } from "react";

import { EmptyState, PageHeader } from "@/components/app/common";
import { RoleGuard, SellerShell } from "@/components/app/shell";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate, timeAgo } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Inquiry } from "@/lib/types";

export const Route = createFileRoute("/seller/inquiries")({
  head: () => ({
    meta: [
      { title: "Inquiry Masuk — MyProperty" },
      {
        name: "description",
        content: "Daftar pesan dari calon pembeli dan penyewa properti Anda.",
      },
      { property: "og:title", content: "Inquiry Masuk — MyProperty" },
      {
        property: "og:description",
        content: "Daftar pesan dari calon pembeli dan penyewa properti Anda.",
      },
    ],
  }),
  component: () => (
    <RoleGuard role="seller">
      <SellerShell>
        <Inquiries />
      </SellerShell>
    </RoleGuard>
  ),
});

function Inquiries() {
  const { state, currentUser, markInquiryRead } = useStore();
  const [active, setActive] = useState<Inquiry | null>(null);
  const list = state.inquiries.filter((i) => i.sellerId === currentUser?.id);

  const open = (inq: Inquiry) => {
    setActive(inq);
    if (inq.status === "baru") markInquiryRead(inq.id);
  };

  const property = active ? state.properties.find((p) => p.id === active.propertyId) : undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inquiry Masuk"
        description="Pesan dari calon pembeli. Balas cepat agar peluang transaksi lebih besar."
      />

      {list.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="Belum ada inquiry"
          description="Inquiry dari calon pembeli akan muncul di sini."
        />
      ) : (
        <ul className="divide-y divide-border border border-border bg-card">
          {list.map((inq) => {
            const p = state.properties.find((x) => x.id === inq.propertyId);
            return (
              <li key={inq.id}>
                <button
                  type="button"
                  onClick={() => open(inq)}
                  className="grid w-full grid-cols-[minmax(0,1fr)_auto] gap-3 p-4 text-left hover:bg-secondary/50"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">
                      {inq.buyerName}
                      <span
                        className={`ml-2 px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                          inq.status === "baru"
                            ? "bg-accent text-accent-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {inq.status === "baru" ? "Baru" : "Dibaca"}
                      </span>
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {p?.name ?? "Properti dihapus"} · {inq.buyerPhone}
                    </p>
                    <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{inq.message}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{timeAgo(inq.createdAt)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inquiry dari {active?.buyerName}</DialogTitle>
            <DialogDescription>{active ? formatDate(active.createdAt) : ""}</DialogDescription>
          </DialogHeader>
          {active ? (
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs font-bold uppercase text-muted-foreground">Properti</p>
                {property ? (
                  <Link
                    to="/properties/$id"
                    params={{ id: property.id }}
                    className="font-semibold text-primary hover:underline"
                  >
                    {property.name}
                  </Link>
                ) : (
                  <p>Properti dihapus</p>
                )}
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-muted-foreground">Nomor HP</p>
                <p className="font-semibold text-foreground">{active.buyerPhone}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-muted-foreground">Pesan</p>
                <p className="leading-6 text-foreground">{active.message}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button asChild>
                  <a
                    href={`https://wa.me/${active.buyerPhone.replace(/^0/, "62")}?text=${encodeURIComponent(
                      `Halo ${active.buyerName}, terima kasih atas minat Anda pada ${property?.name ?? "properti kami"}.`,
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageSquare className="size-4" aria-hidden /> Balas WhatsApp
                  </a>
                </Button>
                <Button asChild variant="outline">
                  <a href={`tel:${active.buyerPhone}`}>
                    <Phone className="size-4" aria-hidden /> Telepon
                  </a>
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
