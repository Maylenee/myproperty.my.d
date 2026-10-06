import { Link, createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";

import { AuthLayout, FieldError } from "@/components/app/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Lupa Kata Sandi — MyProperty" },
      { name: "description", content: "Atur ulang kata sandi akun MyProperty Anda." },
      { property: "og:title", content: "Lupa Kata Sandi — MyProperty" },
      { property: "og:description", content: "Atur ulang kata sandi akun MyProperty Anda." },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Format email belum benar.");
      return;
    }
    setError("");
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 600);
  };

  return (
    <AuthLayout
      title="Lupa kata sandi"
      description="Masukkan email akun Anda. Kami akan mengirimkan tautan untuk mengatur ulang kata sandi."
      footer={
        <Link to="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
          Kembali ke halaman masuk
        </Link>
      }
    >
      {sent ? (
        <div className="text-center">
          <CheckCircle2 className="mx-auto size-8 text-primary" aria-hidden />
          <h2 className="mt-3 text-base font-bold text-foreground">Tautan sudah dikirim</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Kami mengirim tautan pengaturan ulang ke <span className="font-semibold">{email}</span>.
            Pada aplikasi contoh ini, Anda bisa langsung membuka halaman atur ulang.
          </p>
          <Button asChild className="mt-5 w-full">
            <Link to="/reset-password" search={{ email }}>
              Atur Ulang Kata Sandi
            </Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              aria-invalid={!!error}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5"
              placeholder="nama@email.com"
            />
            <FieldError message={error} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            Kirim Tautan
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
