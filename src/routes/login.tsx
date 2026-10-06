import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AuthLayout, FieldError } from "@/components/app/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSupabaseStore as useStore } from "@/lib/supabase-store";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Masuk — MyProperty" },
      {
        name: "description",
        content: "Masuk ke akun MyProperty untuk menyimpan properti dan mengelola listing.",
      },
      { property: "og:title", content: "Masuk — MyProperty" },
      {
        property: "og:description",
        content: "Masuk ke akun MyProperty untuk menyimpan properti dan mengelola listing.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const next: typeof errors = {};
    if (!email.trim()) next.email = "Email wajib diisi.";
    else if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = "Format email belum benar.";
    if (!password) next.password = "Kata sandi wajib diisi.";
    setErrors(next);
    setFormError("");
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    window.setTimeout(() => {
      const result = login(email, password);
      setLoading(false);
      if (!result.ok) {
        setFormError(result.message ?? "Terjadi kesalahan. Silakan coba lagi.");
        return;
      }
      toast.success(`Selamat datang, ${result.user?.name.split(" ")[0]}.`);
      if (result.user?.role === "seller") navigate({ to: "/seller/dashboard" });
      else if (result.user?.role === "admin") navigate({ to: "/admin" });
      else navigate({ to: "/properties" });
    }, 500);
  };

  return (
    <AuthLayout
      title="Masuk ke MyProperty"
      description="Masuk untuk menyimpan properti favorit, mengirim inquiry, dan mengelola listing Anda."
      footer={
        <>
          Belum punya akun?{" "}
          <Link
            to="/register"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            Daftar sekarang
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
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            aria-invalid={!!errors.email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@email.com"
            className="mt-1.5"
          />
          <FieldError message={errors.email} />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Kata sandi</Label>
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Lupa kata sandi?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            aria-invalid={!!errors.password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5"
          />
          <FieldError message={errors.password} />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
          Masuk
        </Button>
      </form>

      <div className="mt-6 border-t border-border pt-4">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Akun demo</p>
        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
          <li>Pembeli: rina@buyer.id / buyer123</li>
          <li>Penjual: andi@seller.id / seller123</li>
          <li>Admin: admin@myproperty.id / admin123</li>
        </ul>
      </div>
    </AuthLayout>
  );
}
