import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/app/common";
import { AdminShell, RoleGuard } from "@/components/app/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import type { Category } from "@/lib/types";

export const Route = createFileRoute("/admin/categories")({
  head: () => ({
    meta: [
      { title: "Kelola Kategori — Admin MyProperty" },
      { name: "description", content: "Tambah, ubah, dan nonaktifkan kategori properti." },
      { property: "og:title", content: "Kelola Kategori — Admin MyProperty" },
      { property: "og:description", content: "Tambah, ubah, dan nonaktifkan kategori properti." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <RoleGuard role="admin">
      <AdminShell>
        <AdminCategories />
      </AdminShell>
    </RoleGuard>
  ),
});

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

function AdminCategories() {
  const { state, saveCategory, deleteCategory } = useStore();
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<Category | null>(null);
  const [editName, setEditName] = useState("");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kelola Kategori"
        description="Kategori aktif muncul di filter dan form pasang properti."
      />

      <form
        className="flex max-w-md gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const slug = slugify(name);
          if (name.trim().length < 3) {
            toast.error("Nama kategori minimal 3 karakter.");
            return;
          }
          if (state.categories.some((c) => c.slug === slug)) {
            toast.error("Kategori sudah ada.");
            return;
          }
          saveCategory({ id: `c-${slug}`, slug, name: name.trim(), active: true });
          setName("");
          toast.success("Kategori ditambahkan.");
        }}
      >
        <Input
          aria-label="Nama kategori baru"
          placeholder="Nama kategori baru"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button type="submit">Tambah</Button>
      </form>

      <ul className="divide-y divide-border border border-border bg-card">
        {state.categories.map((c) => {
          const count = state.properties.filter((p) => p.type === c.slug).length;
          return (
            <li
              key={c.id}
              className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
            >
              {editing?.id === c.id ? (
                <div className="flex gap-2">
                  <Input
                    aria-label="Ubah nama kategori"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      if (editName.trim().length < 3) return;
                      saveCategory({ ...c, name: editName.trim() });
                      setEditing(null);
                      toast.success("Kategori diperbarui.");
                    }}
                  >
                    Simpan
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>
                    Batal
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="font-semibold text-foreground">
                    {c.name}{" "}
                    <span
                      className={`ml-1 text-xs font-bold uppercase ${c.active ? "text-primary" : "text-muted-foreground"}`}
                    >
                      {c.active ? "Aktif" : "Nonaktif"}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">{count} properti</p>
                </div>
              )}
              {editing?.id !== c.id ? (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditing(c);
                      setEditName(c.name);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      saveCategory({ ...c, active: !c.active });
                      toast.success(c.active ? "Kategori dinonaktifkan." : "Kategori diaktifkan.");
                    }}
                  >
                    {c.active ? "Nonaktifkan" : "Aktifkan"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => {
                      if (count > 0) {
                        toast.error("Kategori masih dipakai properti. Nonaktifkan saja.");
                        return;
                      }
                      deleteCategory(c.id);
                      toast.success("Kategori dihapus.");
                    }}
                  >
                    Hapus
                  </Button>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
