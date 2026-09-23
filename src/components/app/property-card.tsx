import { Link } from "@tanstack/react-router";
import { Bath, BedDouble, Heart, Layers3, LandPlot, Loader2, MapPin, Ruler } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { formatPrice } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Property, PropertyStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const statusLabel: Record<PropertyStatus, string> = {
  draft: "Draft",
  pending: "Menunggu Review",
  aktif: "Aktif",
  ditolak: "Ditolak",
  terjual: "Terjual",
  disewa: "Disewa",
  nonaktif: "Nonaktif",
};

const statusStyle: Record<PropertyStatus, string> = {
  draft: "border-border bg-muted text-muted-foreground",
  pending: "border-accent bg-accent/25 text-accent-foreground",
  aktif: "border-primary bg-primary/10 text-primary",
  ditolak: "border-destructive/50 bg-destructive/10 text-destructive",
  terjual: "border-border bg-foreground text-background",
  disewa: "border-border bg-foreground text-background",
  nonaktif: "border-border bg-muted text-muted-foreground",
};

export function StatusBadge({ status }: { status: PropertyStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center border px-2 py-0.5 text-xs font-bold uppercase tracking-wide",
        statusStyle[status],
      )}
    >
      {statusLabel[status]}
    </span>
  );
}

export function TransactionBadge({ transaction }: { transaction: Property["transaction"] }) {
  return (
    <span className="inline-flex items-center border border-primary bg-primary px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-primary-foreground">
      {transaction === "dijual" ? "Dijual" : "Disewa"}
    </span>
  );
}

export function FavoriteButton({
  propertyId,
  className,
  withLabel = false,
}: {
  propertyId: string;
  className?: string;
  withLabel?: boolean;
}) {
  const { isFavorite, toggleFavorite } = useStore();
  const [loading, setLoading] = useState(false);
  const saved = isFavorite(propertyId);

  const onClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (loading) return;
    setLoading(true);
    window.setTimeout(() => {
      const nowSaved = toggleFavorite(propertyId);
      setLoading(false);
      toast.success(nowSaved ? "Properti disimpan." : "Properti dihapus dari tersimpan.");
    }, 250);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={saved}
      aria-label={saved ? "Hapus dari properti tersimpan" : "Simpan properti"}
      disabled={loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-70",
        saved && "border-primary text-primary",
        className,
      )}
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" aria-hidden />
      ) : (
        <Heart className={cn("size-4", saved && "fill-primary")} aria-hidden />
      )}
      {withLabel ? <span>{saved ? "Tersimpan" : "Simpan"}</span> : null}
    </button>
  );
}

export function SpecLine({ property, className }: { property: Property; className?: string }) {
  const items: { icon: typeof BedDouble; text: string }[] = [];
  if (property.bedrooms > 0) items.push({ icon: BedDouble, text: `${property.bedrooms} KT` });
  if (property.bathrooms > 0) items.push({ icon: Bath, text: `${property.bathrooms} KM` });
  if (property.buildingArea > 0) items.push({ icon: Ruler, text: `${property.buildingArea} m² bangunan` });
  if (property.landArea > 0) items.push({ icon: LandPlot, text: `${property.landArea} m² tanah` });
  if (property.floors > 1) items.push({ icon: Layers3, text: `${property.floors} lantai` });

  return (
    <ul className={cn("flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground", className)}>
      {items.slice(0, 4).map((item) => (
        <li key={item.text} className="inline-flex items-center gap-1.5">
          <item.icon className="size-4 shrink-0" aria-hidden />
          <span>{item.text}</span>
        </li>
      ))}
    </ul>
  );
}

export function PropertyCard({ property, showFavorite = true }: { property: Property; showFavorite?: boolean }) {
  return (
    <article className="group relative flex h-full flex-col border border-border bg-card transition-colors hover:border-primary">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={property.photos[0]}
          alt={property.name}
          loading="lazy"
          width={1200}
          height={800}
          className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <TransactionBadge transaction={property.transaction} />
          {property.status === "terjual" || property.status === "disewa" ? (
            <StatusBadge status={property.status} />
          ) : null}
        </div>
        {showFavorite ? (
          <FavoriteButton propertyId={property.id} className="absolute right-3 top-3 size-9 p-0" />
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-base font-bold leading-snug text-foreground">
          <Link
            to="/properties/$id"
            params={{ id: property.id }}
            className="after:absolute after:inset-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {property.name}
          </Link>
        </h3>
        <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-4 shrink-0" aria-hidden />
          <span className="truncate">
            {property.district}, {property.city}
          </span>
        </p>
        <p className="font-display text-xl text-primary">
          {formatPrice(property.price, property.transaction)}
        </p>
        <SpecLine property={property} className="mt-auto pt-2 text-xs" />
      </div>
    </article>
  );
}

export function PropertyGrid({ properties }: { properties: Property[] }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}
