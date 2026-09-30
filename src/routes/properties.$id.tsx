import { Link, createFileRoute } from "@tanstack/react-router";
import {
  BadgeCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Flag,
  Home,
  Loader2,
  MapPin,
  MessageSquare,
  Phone,
  Share2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/app/common";
import { FavoriteButton, PropertyCard, SpecLine, StatusBadge, TransactionBadge } from "@/components/app/property-card";
import { AppShell } from "@/components/app/shell";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatNumber, formatPrice, timeAgo } from "@/lib/format";
import { isPublic, useStore } from "@/lib/store";

export const Route = createFileRoute("/properties/$id")({
  head: () => ({
    meta: [
      { title: "Detail Properti — MyProperty" },
      { name: "description", content: "Lihat foto, harga, spesifikasi, lokasi, dan kontak penjual properti di MyProperty." },
      { property: "og:title", content: "Detail Properti — MyProperty" },
      { property: "og:description", content: "Lihat foto, harga, spesifikasi, lokasi, dan kontak penjual properti di MyProperty." },
    ],
  }),
  component: PropertyDetailPage,
});

function PropertyDetailPage() {
  const { id } = Route.useParams();
  const { state, hydrated, viewProperty, sendInquiry, addReport, currentUser } = useStore();
  const property = state.properties.find((p) => p.id === id);

  useEffect(() => {
    if (property && isPublic(property)) viewProperty(property.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, hydrated]);

  const seller = state.users.find((u) => u.id === property?.sellerId);
  const category = state.categories.find((c) => c.slug === property?.type);

  const similar = useMemo(
    () =>
      state.properties
        .filter((p) => isPublic(p) && p.id !== id && (p.type === property?.type || p.city === property?.city))
        .slice(0, 3),
    [state.properties, id, property?.type, property?.city],
  );

  if (hydrated && (!property || !isPublic(property))) {
    return (
      <AppShell>
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <EmptyState
            icon={Home}
            title="Properti tidak tersedia"
            description="Properti yang Anda cari sudah tidak tayang atau tautannya tidak valid."
            actionLabel="Lihat Properti Lain"
            actionTo="/properties"
          />
        </div>
      </AppShell>
    );
  }

  if (!property) {
    return (
      <AppShell>
        <div className="mx-auto max-w-3xl px-4 py-24 text-center text-sm text-muted-foreground sm:px-6">Memuat…</div>
      </AppShell>
    );
  }

  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) await navigator.share({ title: property.name, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success("Tautan properti disalin.");
      }
    } catch {
      toast.error("Terjadi kesalahan. Silakan coba lagi.");
    }
  };

  const waNumber = (seller?.phone ?? "").replace(/^0/, "62");
  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    `Halo ${seller?.name ?? ""}, saya tertarik dengan properti "${property.name}" di MyProperty.`,
  )}`;

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">
            Beranda
          </Link>
          <span className="px-2">/</span>
          <Link to="/properties" className="hover:text-primary">
            Properti
          </Link>
          {category ? (
            <>
              <span className="px-2">/</span>
              <Link to="/category/$slug" params={{ slug: category.slug }} className="hover:text-primary">
                {category.name}
              </Link>
            </>
          ) : null}
        </nav>

        <Gallery photos={property.photos} name={property.name} />

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-8">
            <header>
              <div className="flex flex-wrap items-center gap-2">
                <TransactionBadge transaction={property.transaction} />
                <StatusBadge status={property.status} />
                {category ? (
                  <span className="border border-border px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    {category.name}
                  </span>
                ) : null}
              </div>
              <h1 className="mt-3 font-display text-3xl leading-tight text-foreground sm:text-4xl">{property.name}</h1>
              <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="size-4" aria-hidden /> {property.address}, {property.district}, {property.city},{" "}
                {property.province}
              </p>
              <p className="mt-4 font-display text-3xl text-primary">
                {formatPrice(property.price, property.transaction)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Dipasang {timeAgo(property.createdAt)} · {formatNumber(property.views)} kali dilihat
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <FavoriteButton propertyId={property.id} withLabel className="h-10" />
                <Button variant="outline" onClick={share}>
                  <Share2 className="size-4" aria-hidden /> Bagikan
                </Button>
                <ReportDialog
                  onSubmit={(reason) => {
                    addReport({ propertyId: property.id, reporter: currentUser?.name ?? "Pengunjung", reason });
                    toast.success("Laporan terkirim. Tim kami akan meninjau properti ini.");
                  }}
                />
              </div>
            </header>

            <section>
              <h2 className="text-lg font-bold text-foreground">Spesifikasi</h2>
              <dl className="mt-3 grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-3">
                <Spec label="Luas tanah" value={`${property.landArea} m²`} />
                <Spec label="Luas bangunan" value={property.buildingArea ? `${property.buildingArea} m²` : "—"} />
                <Spec label="Kamar tidur" value={property.bedrooms ? `${property.bedrooms}` : "—"} />
                <Spec label="Kamar mandi" value={property.bathrooms ? `${property.bathrooms}` : "—"} />
                <Spec label="Jumlah lantai" value={`${property.floors}`} />
                <Spec label="Sertifikat" value={property.certificate} />
              </dl>
            </section>

            <section>
              <h2 className="text-lg font-bold text-foreground">Deskripsi</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted-foreground">{property.description}</p>
            </section>

            {property.facilities.length > 0 ? (
              <section>
                <h2 className="text-lg font-bold text-foreground">Fasilitas</h2>
                <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {property.facilities.map((f) => (
                    <li key={f} className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="size-4 shrink-0 text-primary" aria-hidden /> {f}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <section>
              <h2 className="text-lg font-bold text-foreground">Lokasi</h2>
              <MapPreview
                address={`${property.address}, ${property.district}`}
                city={property.city}
                province={property.province}
              />
            </section>

            {similar.length > 0 ? (
              <section>
                <h2 className="text-lg font-bold text-foreground">Properti serupa</h2>
                <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {similar.map((p) => (
                    <PropertyCard key={p.id} property={p} />
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="border border-border bg-card p-5">
              <p className="text-xs font-extrabold uppercase tracking-wide text-muted-foreground">Dipasang oleh</p>
              <div className="mt-3 flex items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground">
                  {seller?.name.charAt(0) ?? "?"}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-bold text-foreground">{seller?.name}</p>
                  {seller?.verified ? (
                    <span className="mt-0.5 inline-flex items-center gap-1 text-xs font-bold text-primary">
                      <BadgeCheck className="size-3.5" aria-hidden /> Terverifikasi
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Belum terverifikasi</span>
                  )}
                </div>
              </div>
              {seller ? (
                <Button asChild variant="outline" className="mt-4 w-full">
                  <Link to="/seller/$id" params={{ id: seller.id }}>
                    Lihat Profil Penjual
                  </Link>
                </Button>
              ) : null}
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Button asChild variant="outline">
                  <a href={waLink} target="_blank" rel="noreferrer">
                    <MessageSquare className="size-4" aria-hidden /> WhatsApp
                  </a>
                </Button>
                <Button asChild variant="outline">
                  <a href={`tel:${seller?.phone ?? ""}`}>
                    <Phone className="size-4" aria-hidden /> Telepon
                  </a>
                </Button>
              </div>
            </div>

            <InquiryForm
              propertyName={property.name}
              onSend={(data) => {
                sendInquiry({
                  propertyId: property.id,
                  sellerId: property.sellerId,
                  buyerName: data.name,
                  buyerPhone: data.phone,
                  message: data.message,
                });
              }}
            />
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card p-4">
      <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-foreground">{value}</dd>
    </div>
  );
}

function Gallery({ photos, name }: { photos: string[]; name: string }) {
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const total = photos.length;
  const go = (dir: number) => setIndex((i) => (i + dir + total) % total);

  return (
    <div>
      <div className="relative aspect-[16/10] overflow-hidden bg-muted sm:aspect-[16/8]">
        <img src={photos[index]} alt={`${name} — foto ${index + 1}`} className="size-full object-cover" />
        <button
          type="button"
          onClick={() => setLightbox(true)}
          className="absolute inset-0"
          aria-label="Perbesar foto"
        />
        {total > 1 ? (
          <>
            <GalleryArrow side="left" onClick={() => go(-1)} />
            <GalleryArrow side="right" onClick={() => go(1)} />
            <span className="absolute bottom-3 right-3 bg-foreground/85 px-2.5 py-1 text-xs font-bold text-background">
              {index + 1} / {total}
            </span>
          </>
        ) : null}
      </div>

      {total > 1 ? (
        <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
          {photos.map((photo, i) => (
            <button
              key={photo + i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Lihat foto ${i + 1}`}
              aria-current={i === index}
              className={`h-16 w-24 shrink-0 overflow-hidden border sm:h-20 sm:w-28 ${
                i === index ? "border-primary" : "border-border opacity-70 hover:opacity-100"
              }`}
            >
              <img src={photo} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}

      {lightbox ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/95 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Galeri foto"
        >
          <button
            type="button"
            onClick={() => setLightbox(false)}
            aria-label="Tutup galeri"
            className="absolute right-4 top-4 grid size-10 place-items-center border border-background/40 text-background"
          >
            <X className="size-5" />
          </button>
          <img src={photos[index]} alt={`${name} — foto ${index + 1}`} className="max-h-[80vh] max-w-full object-contain" />
          {total > 1 ? (
            <>
              <GalleryArrow side="left" onClick={() => go(-1)} inverse />
              <GalleryArrow side="right" onClick={() => go(1)} inverse />
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function GalleryArrow({
  side,
  onClick,
  inverse = false,
}: {
  side: "left" | "right";
  onClick: () => void;
  inverse?: boolean;
}) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Foto sebelumnya" : "Foto berikutnya"}
      className={`absolute top-1/2 grid size-10 -translate-y-1/2 place-items-center ${
        side === "left" ? "left-3" : "right-3"
      } ${inverse ? "border border-background/40 text-background" : "bg-card/90 text-foreground hover:bg-card"}`}
    >
      <Icon className="size-5" />
    </button>
  );
}

function MapPreview({ address, city, province }: { address: string; city: string; province: string }) {
  return (
    <div className="mt-3 border border-border bg-card">
      <div
        className="relative h-56 w-full"
        style={{
          backgroundColor: "oklch(0.94 0.02 150)",
          backgroundImage:
            "linear-gradient(0deg, color-mix(in oklab, currentColor 8%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in oklab, currentColor 8%, transparent) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          color: "oklch(0.285 0.063 153)",
        }}
        role="img"
        aria-label={`Peta lokasi ${address}, ${city}`}
      >
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
          <MapPin className="size-8 text-primary" aria-hidden />
        </span>
      </div>
      <div className="border-t border-border p-4 text-sm">
        <p className="font-semibold text-foreground">{address}</p>
        <p className="text-muted-foreground">
          {city}, {province}
        </p>
      </div>
    </div>
  );
}

function InquiryForm({
  propertyName,
  onSend,
}: {
  propertyName: string;
  onSend: (data: { name: string; phone: string; message: string }) => void;
}) {
  const { currentUser } = useStore();
  const [name, setName] = useState(currentUser?.name ?? "");
  const [phone, setPhone] = useState(currentUser?.phone ?? "");
  const [message, setMessage] = useState(`Saya tertarik dengan properti "${propertyName}". Mohon informasinya.`);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="border border-border bg-card p-5 text-center">
        <CheckCircle2 className="mx-auto size-8 text-primary" aria-hidden />
        <p className="mt-3 font-bold text-foreground">Inquiry berhasil dikirim.</p>
        <p className="mt-1 text-sm text-muted-foreground">Penjual akan menghubungi Anda melalui nomor yang dikirim.</p>
        <Button variant="outline" className="mt-4 w-full" onClick={() => setSent(false)}>
          Kirim Inquiry Lagi
        </Button>
      </div>
    );
  }

  return (
    <form
      className="border border-border bg-card p-5"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const next: Record<string, string> = {};
        if (name.trim().length < 3) next.name = "Nama minimal 3 karakter.";
        if (!/^0\d{8,13}$/.test(phone.trim())) next.phone = "Nomor HP diawali 0 dan 9–14 digit.";
        if (message.trim().length < 10) next.message = "Pesan minimal 10 karakter.";
        setErrors(next);
        if (Object.keys(next).length > 0) return;
        setLoading(true);
        window.setTimeout(() => {
          onSend({ name: name.trim(), phone: phone.trim(), message: message.trim() });
          setLoading(false);
          setSent(true);
          toast.success("Inquiry berhasil dikirim.");
        }, 600);
      }}
    >
      <h2 className="text-base font-bold text-foreground">Tertarik dengan properti ini?</h2>
      <p className="mt-1 text-sm text-muted-foreground">Kirim pesan, penjual akan menghubungi Anda.</p>
      <div className="mt-4 space-y-3">
        <div>
          <Label htmlFor="inq-name">Nama</Label>
          <Input id="inq-name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" aria-invalid={!!errors.name} />
          {errors.name ? <p className="mt-1 text-xs font-semibold text-destructive">{errors.name}</p> : null}
        </div>
        <div>
          <Label htmlFor="inq-phone">Nomor HP</Label>
          <Input id="inq-phone" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1.5" aria-invalid={!!errors.phone} />
          {errors.phone ? <p className="mt-1 text-xs font-semibold text-destructive">{errors.phone}</p> : null}
        </div>
        <div>
          <Label htmlFor="inq-message">Pesan</Label>
          <Textarea id="inq-message" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} className="mt-1.5" aria-invalid={!!errors.message} />
          {errors.message ? <p className="mt-1 text-xs font-semibold text-destructive">{errors.message}</p> : null}
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
          Kirim Inquiry
        </Button>
      </div>
    </form>
  );
}

function ReportDialog({ onSubmit }: { onSubmit: (reason: string) => void }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("Informasi tidak sesuai");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost">
          <Flag className="size-4" aria-hidden /> Laporkan
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Laporkan properti ini</DialogTitle>
          <DialogDescription>Pilih alasan laporan. Tim kami akan meninjau properti tersebut.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {["Informasi tidak sesuai", "Properti sudah tidak tersedia", "Foto tidak sesuai", "Dugaan penipuan"].map((r) => (
            <label key={r} className="flex items-center gap-2 text-sm text-foreground">
              <input type="radio" name="report-reason" value={r} checked={reason === r} onChange={() => setReason(r)} />
              {r}
            </label>
          ))}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Batal
          </Button>
          <Button
            onClick={() => {
              onSubmit(reason);
              setOpen(false);
            }}
          >
            Kirim Laporan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
