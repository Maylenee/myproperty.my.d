import { Link } from "@tanstack/react-router";
import { House, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link
      to="/"
      className={cn(
        "inline-flex items-center gap-2.5 font-extrabold",
        inverse ? "text-primary-foreground" : "text-primary",
      )}
      aria-label="MyProperty beranda"
    >
      <span
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-md",
          inverse ? "bg-primary-foreground text-primary" : "bg-primary text-primary-foreground",
        )}
      >
        <House className="size-5" strokeWidth={2.4} />
      </span>
      <span className="text-lg">MyProperty</span>
    </Link>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 border-b border-border pb-6">
      <div className="min-w-0">
        <h1 className="font-display text-3xl leading-tight text-foreground sm:text-4xl">{title}</h1>
        {description ? (
          <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionTo,
  onAction,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center border border-dashed border-border bg-card px-6 py-16 text-center">
      <span className="grid size-12 place-items-center rounded-md bg-secondary text-secondary-foreground">
        <Icon className="size-6" />
      </span>
      <h2 className="mt-5 text-lg font-bold text-foreground">{title}</h2>
      <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{description}</p>
      {actionLabel ? (
        actionTo ? (
          <Button asChild className="mt-6">
            <Link to={actionTo}>{actionLabel}</Link>
          </Button>
        ) : (
          <Button className="mt-6" onClick={onAction}>
            {actionLabel}
          </Button>
        )
      ) : null}
    </div>
  );
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border border-border bg-card">
          <Skeleton className="aspect-[4/3] w-full rounded-none" />
          <div className="space-y-3 p-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-5 w-2/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
}) {
  return (
    <div className="border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
        <Icon className="size-4 shrink-0 text-primary" aria-hidden />
      </div>
      <p className="mt-3 font-display text-3xl text-foreground">{value}</p>
    </div>
  );
}

export function ErrorNotice({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="border border-destructive/40 bg-destructive/5 p-5 text-sm">
      <p className="font-semibold text-foreground">
        {message ?? "Terjadi kesalahan. Silakan coba lagi."}
      </p>
      {onRetry ? (
        <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
          Coba lagi
        </Button>
      ) : null}
    </div>
  );
}
