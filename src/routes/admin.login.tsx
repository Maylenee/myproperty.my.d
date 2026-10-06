import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AuthLayout, FieldError } from "@/components/app/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSupabaseStore as useStore } from "@/lib/supabase-store";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Masuk Admin — MyProperty" },
      { name: "description", content: "Halaman masuk khusus admin MyProperty." },
      { property: "og:title", content: "Masuk Admin — MyProperty" },
      { property: "og:description", content: "Halaman masuk khusus admin MyProperty." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const { login } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@myproperty.id");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <AuthLayout title="Masuk Admin" description="Khusus tim pengelola marketplace MyProperty.">
      <form
        noValidate
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!email || !password) {
            setError("Email dan kata sandi wajib diisi.");
            return;
          }
          setLoading(true);
          window.setTimeout(() => {
            const result = login(email, password, "admin");
            setLoading(false);
            if (!result.ok) {
              setError(result.message ?? "Terjadi kesalahan. Silakan coba lagi.");
              return;
            }
            toast.success("Berhasil masuk sebagai admin.");
            navigate({ to: "/admin" });
          }, 500);
        }}
      >
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="password">Kata sandi</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5"
          />
          <FieldError message={error} />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
          Masuk
        </Button>
        <p className="text-xs text-muted-foreground">Akun demo: admin@myproperty.id / admin123</p>
      </form>
    </AuthLayout>
  );
}
