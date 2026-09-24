import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AuthLayout, FieldError } from "@/components/app/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search: Record<string, unknown>) => ({
    email: typeof search.email === "string" ? search.email : "",
  }),
  head: () => ({
    meta: [
      { title: "Atur Ulang Kata Sandi — MyProperty" },
      { name: "description", content: "Buat kata sandi baru untuk akun MyProperty Anda." },
      { property: "og:title", content: "Atur Ulang Kata Sandi — MyProperty" },
      { property: "og:description", content: "Buat kata sandi baru untuk akun MyProperty Anda." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { email: initialEmail } = Route.useSearch();
  const { resetPassword } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = "Format email belum benar.";
    if (password.length < 6) next.password = "Kata sandi minimal 6 karakter.";
    if (confirm !== password) next.confirm = "Konfirmasi kata sandi belum sama.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    window.setTimeout(() => {
      const ok = resetPassword(email, password);
      setLoading(false);
      if (!ok) {
        setErrors({ email: "Email tidak ditemukan pada data akun." });
        return;
      }
      toast.success("Kata sandi berhasil diperbarui.");
      navigate({ to: "/login" });
    }, 600);
  };

  return (
    <AuthLayout
      title="Atur ulang kata sandi"
      description="Buat kata sandi baru untuk akun Anda."
      footer={
        <Link to="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
          Kembali ke halaman masuk
        </Link>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" aria-invalid={!!errors.email} />
          <FieldError message={errors.email} />
        </div>
        <div>
          <Label htmlFor="password">Kata sandi baru</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5" aria-invalid={!!errors.password} />
          <FieldError message={errors.password} />
        </div>
        <div>
          <Label htmlFor="confirm">Ulangi kata sandi baru</Label>
          <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="mt-1.5" aria-invalid={!!errors.confirm} />
          <FieldError message={errors.confirm} />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
          Simpan Kata Sandi
        </Button>
      </form>
    </AuthLayout>
  );
}
