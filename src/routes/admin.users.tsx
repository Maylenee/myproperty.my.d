import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";

import { PageHeader } from "@/components/app/common";
import { AdminShell, RoleGuard } from "@/components/app/shell";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/format";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/admin/users")({
  head: () => ({
    meta: [
      { title: "Kelola User — Admin MyProperty" },
      { name: "description", content: "Daftar seluruh pengguna MyProperty." },
      { property: "og:title", content: "Kelola User — Admin MyProperty" },
      { property: "og:description", content: "Daftar seluruh pengguna MyProperty." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <RoleGuard role="admin">
      <AdminShell>
        <AdminUsers />
      </AdminShell>
    </RoleGuard>
  ),
});

const roleLabel = { buyer: "Pembeli", seller: "Penjual", admin: "Admin" } as const;

function AdminUsers() {
  const { state } = useStore();
  const [q, setQ] = useState("");
  const users = state.users.filter((u) => `${u.name} ${u.email}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-6">
      <PageHeader title="Kelola User" description="Semua akun yang terdaftar di MyProperty." />
      <div className="relative sm:w-72">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input aria-label="Cari user" placeholder="Cari nama atau email" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
      </div>
      <div className="overflow-x-auto border border-border bg-card">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="border-b border-border bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="p-3">Nama</th>
              <th className="p-3">Email</th>
              <th className="p-3">Peran</th>
              <th className="p-3">Bergabung</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="p-3 font-semibold text-foreground">{u.name}</td>
                <td className="p-3 text-muted-foreground">{u.email}</td>
                <td className="p-3">
                  <span className="border border-border px-2 py-0.5 text-xs font-bold uppercase">{roleLabel[u.role]}</span>
                </td>
                <td className="p-3 text-muted-foreground">{formatDate(u.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
