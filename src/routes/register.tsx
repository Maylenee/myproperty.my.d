import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AuthLayout, FieldError } from "@/components/app/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSupabaseStore as useStore } from "@/lib/supabase-store";
import type { Role } from "@/lib/types";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Daftar Akun — MyProperty" },
      {
        name: "description",
        content: "Buat akun pembeli atau penjual di MyProperty secara gratis.",
      },
      { property: "og:title", content: "Daftar Akun — MyProperty" },
      {
        property: "og:description",
        content: "Buat akun pembeli atau penjual di MyProperty secara gratis.",
      },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const { register } = useStore();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("buyer");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (form.name.trim().length < 3) next.name = "Nama minimal 3 karakter.";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = "Format email belum benar.";
    if (!/^0\d{8,13}$/.test(form.phone.trim())) next.phone = "Nomor HP diawali 0 dan 9–14 digit.";
    if (form.password.length < 6) next.password = "Kata sandi minimal 6 karakter.";
    if (form.confirm !== form.password) next.confirm = "Konfirmasi kata sandi belum sama.";
    setErrors(next);
    setFormError("");
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    window.setTimeout(() => {
      const result = register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role,
      });
      setLoading(false);
      if (!result.ok) {
        setFormError(result.message ?? "Terjadi kesalahan. Silakan coba lagi.");
        return;
      }
      toast.success("Akun berhasil dibuat.");
      navigate({ to: role === "seller" ? "/seller/dashboard" : "/properties" });
    }, 600);
  };

  return (
    <AuthLayout
      title="Daftar akun"
      description="Pilih jenis akun sesuai kebutuhan Anda. Gratis dan hanya butuh beberapa detik."
      footer={
        <>
          Sudah punya akun?{" "}
          <Link
            to="/login"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            Masuk di sini
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {formError ? (
          <p
            role="alert"
            className="border border-destructive/40 bg-destructive/5 p-3 text-sm font-semibold text-destructive"
          >
            {formError}
          </p>
        ) : null}

        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-foreground">Saya ingin</legend>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ["buyer", "Mencari properti"],
                ["seller", "Menjual / menyewakan"],
              ] as [Role, string][]
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setRole(value)}
                aria-pressed={role === value}
                className={`border px-3 py-3 text-sm font-semibold transition-colors ${
                  role === value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-primary"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>

        <div>
          <Label htmlFor="name">Nama lengkap</Label>
          <Input
            id="name"
            value={form.name}
            onChange={set("name")}
            className="mt-1.5"
            aria-invalid={!!errors.name}
          />
          <FieldError message={errors.name} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={set("email")}
            className="mt-1.5"
            aria-invalid={!!errors.email}
          />
          <FieldError message={errors.email} />
        </div>
        <div>
          <Label htmlFor="phone">Nomor HP</Label>
          <Input
            id="phone"
            inputMode="tel"
            placeholder="08xxxxxxxxxx"
            value={form.phone}
            onChange={set("phone")}
            className="mt-1.5"
            aria-invalid={!!errors.phone}
          />
          <FieldError message={errors.phone} />
        </div>
        <div>
          <Label htmlFor="password">Kata sandi</Label>
          <Input
            id="password"
            type="password"
            value={form.password}
            onChange={set("password")}
            className="mt-1.5"
            aria-invalid={!!errors.password}
          />
          <FieldError message={errors.password} />
        </div>
        <div>
          <Label htmlFor="confirm">Ulangi kata sandi</Label>
          <Input
            id="confirm"
            type="password"
            value={form.confirm}
            onChange={set("confirm")}
            className="mt-1.5"
            aria-invalid={!!errors.confirm}
          />
          <FieldError message={errors.confirm} />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
          Buat Akun
        </Button>
      </form>
    </AuthLayout>
  );
}
