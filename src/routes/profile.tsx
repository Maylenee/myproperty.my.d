import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Heart, History, UserCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState, PageHeader } from "@/components/app/common";
import { AppShell } from "@/components/app/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/format";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profil Saya — MyProperty" },
      { name: "description", content: "Kelola data akun dan aktivitas Anda di MyProperty." },
      { property: "og:title", content: "Profil Saya — MyProperty" },
      { property: "og:description", content: "Kelola data akun dan aktivitas Anda di MyProperty." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { currentUser, hydrated, state, updateProfile, logout } = useStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: currentUser?.name ?? "",
    phone: currentUser?.phone ?? "",
    email: currentUser?.email ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!hydrated) {
    return (
      <AppShell>
        <div className="mx-auto max-w-3xl px-4 py-24 text-center text-sm text-muted-foreground sm:px-6">
          Memuat…
        </div>
      </AppShell>
    );
  }

  if (!currentUser) {
    return (
      <AppShell>
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <EmptyState
            icon={UserCircle2}
            title="Anda belum masuk"
            description="Masuk untuk melihat profil, properti tersimpan, dan riwayat pencarian Anda."
            actionLabel="Masuk"
            actionTo="/login"
          />
        </div>
      </AppShell>
    );
  }

  const onSave = (event: React.FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (form.name.trim().length < 3) next.name = "Nama minimal 3 karakter.";
    if (!/^0\d{8,13}$/.test(form.phone.trim())) next.phone = "Nomor HP diawali 0 dan 9–14 digit.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    updateProfile({ name: form.name.trim(), phone: form.phone.trim() });
    toast.success("Profil berhasil diperbarui.");
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <PageHeader
          title="Profil Saya"
          description={`Bergabung sejak ${formatDate(currentUser.createdAt)}.`}
        />

        <div className="mt-8 grid gap-6 md:grid-cols-[minmax(0,1fr)_260px]">
          <form onSubmit={onSave} noValidate className="space-y-4 border border-border bg-card p-6">
            <div>
              <Label htmlFor="name">Nama lengkap</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="mt-1.5"
                aria-invalid={!!errors.name}
              />
              {errors.name ? (
                <p className="mt-1 text-xs font-semibold text-destructive">{errors.name}</p>
              ) : null}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={form.email} disabled className="mt-1.5" />
              <p className="mt-1 text-xs text-muted-foreground">
                Email tidak dapat diubah pada aplikasi contoh ini.
              </p>
            </div>
            <div>
              <Label htmlFor="phone">Nomor HP</Label>
              <Input
                id="phone"
                inputMode="tel"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="mt-1.5"
                aria-invalid={!!errors.phone}
              />
              {errors.phone ? (
                <p className="mt-1 text-xs font-semibold text-destructive">{errors.phone}</p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="submit">Simpan Perubahan</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  logout();
                  navigate({ to: "/" });
                }}
              >
                Keluar
              </Button>
            </div>
          </form>

          <aside className="space-y-3">
            <Link
              to="/saved"
              className="flex items-center gap-3 border border-border bg-card p-4 hover:border-primary"
            >
              <Heart className="size-5 text-primary" aria-hidden />
              <span className="text-sm font-semibold text-foreground">
                Properti Tersimpan
                <span className="block text-xs font-normal text-muted-foreground">
                  {state.favorites.length} properti
                </span>
              </span>
            </Link>
            <Link
              to="/recently-viewed"
              className="flex items-center gap-3 border border-border bg-card p-4 hover:border-primary"
            >
              <History className="size-5 text-primary" aria-hidden />
              <span className="text-sm font-semibold text-foreground">
                Terakhir Dilihat
                <span className="block text-xs font-normal text-muted-foreground">
                  {state.recentlyViewed.length} properti
                </span>
              </span>
            </Link>
            {currentUser.role === "buyer" ? (
              <div className="border border-border bg-card p-4 text-sm">
                <p className="font-semibold text-foreground">Ingin menjual properti?</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Daftar akun penjual untuk memasang listing.
                </p>
                <Button asChild variant="outline" size="sm" className="mt-3 w-full">
                  <Link to="/register">Daftar sebagai Penjual</Link>
                </Button>
              </div>
            ) : null}
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
