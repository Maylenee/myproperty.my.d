import { Link, createFileRoute } from "@tanstack/react-router";
import { BadgeCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/app/common";
import { RoleGuard, SellerShell } from "@/components/app/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSupabaseStore as useStore } from "@/lib/supabase-store";

export const Route = createFileRoute("/seller/profile")({
  head: () => ({
    meta: [
      { title: "Profil Penjual — MyProperty" },
      { name: "description", content: "Kelola profil publik Anda sebagai penjual di MyProperty." },
      { property: "og:title", content: "Profil Penjual — MyProperty" },
      {
        property: "og:description",
        content: "Kelola profil publik Anda sebagai penjual di MyProperty.",
      },
    ],
  }),
  component: () => (
    <RoleGuard role="seller">
      <SellerShell>
        <SellerProfileForm />
      </SellerShell>
    </RoleGuard>
  ),
});

function SellerProfileForm() {
  const { currentUser, updateProfile } = useStore();
  const [form, setForm] = useState({
    name: currentUser?.name ?? "",
    phone: currentUser?.phone ?? "",
    bio: currentUser?.bio ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profil Penjual"
        description="Informasi ini tampil di halaman detail properti dan profil publik Anda."
        action={
          currentUser ? (
            <Button asChild variant="outline">
              <Link to="/seller/$id" params={{ id: currentUser.id }}>
                Lihat Profil Publik
              </Link>
            </Button>
          ) : null
        }
      />

      <div className="border border-border bg-card p-4 text-sm">
        {currentUser?.verified ? (
          <p className="inline-flex items-center gap-2 font-semibold text-primary">
            <BadgeCheck className="size-4" aria-hidden /> Akun Anda sudah terverifikasi.
          </p>
        ) : (
          <p className="text-muted-foreground">
            Akun Anda belum terverifikasi. Admin akan meninjau profil dan listing Anda sebelum
            memberikan badge Terverifikasi.
          </p>
        )}
      </div>

      <form
        noValidate
        className="max-w-2xl space-y-4 border border-border bg-card p-6"
        onSubmit={(e) => {
          e.preventDefault();
          const next: Record<string, string> = {};
          if (form.name.trim().length < 3) next.name = "Nama minimal 3 karakter.";
          if (!/^0\d{8,13}$/.test(form.phone.trim()))
            next.phone = "Nomor HP diawali 0 dan 9–14 digit.";
          setErrors(next);
          if (Object.keys(next).length > 0) return;
          updateProfile({ name: form.name.trim(), phone: form.phone.trim(), bio: form.bio.trim() });
          toast.success("Profil berhasil diperbarui.");
        }}
      >
        <div>
          <Label htmlFor="name">Nama / nama agensi</Label>
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
          <Label htmlFor="phone">Nomor HP / WhatsApp</Label>
          <Input
            id="phone"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className="mt-1.5"
            aria-invalid={!!errors.phone}
          />
          {errors.phone ? (
            <p className="mt-1 text-xs font-semibold text-destructive">{errors.phone}</p>
          ) : null}
        </div>
        <div>
          <Label htmlFor="bio">Tentang Anda</Label>
          <Textarea
            id="bio"
            rows={4}
            value={form.bio}
            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            className="mt-1.5"
            placeholder="Contoh: Agen properti di Indramayu sejak 2015."
          />
        </div>
        <Button type="submit">Simpan Profil</Button>
      </form>
    </div>
  );
}
