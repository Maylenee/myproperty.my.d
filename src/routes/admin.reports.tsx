import { Link, createFileRoute } from "@tanstack/react-router";
import { FileWarning } from "lucide-react";
import { toast } from "sonner";

import { EmptyState, PageHeader } from "@/components/app/common";
import { AdminShell, RoleGuard } from "@/components/app/shell";
import { Button } from "@/components/ui/button";
import { timeAgo } from "@/lib/format";
import { useSupabaseStore as useStore } from "@/lib/supabase-store";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({
    meta: [
      { title: "Laporan — Admin MyProperty" },
      { name: "description", content: "Tinjau laporan listing dari pengguna." },
      { property: "og:title", content: "Laporan — Admin MyProperty" },
      { property: "og:description", content: "Tinjau laporan listing dari pengguna." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <RoleGuard role="admin">
      <AdminShell>
        <AdminReports />
      </AdminShell>
    </RoleGuard>
  ),
});

const statusLabel = {
  pending: "Perlu ditinjau",
  ditindak: "Listing diturunkan",
  diabaikan: "Diabaikan",
} as const;

function AdminReports() {
  const { state, resolveReport, updateProperty } = useStore();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laporan"
        description="Laporan dari pengguna tentang listing yang bermasalah."
      />
      {state.reports.length === 0 ? (
        <EmptyState
          icon={FileWarning}
          title="Belum ada laporan"
          description="Laporan dari pengguna akan muncul di sini."
        />
      ) : (
        <ul className="divide-y divide-border border border-border bg-card">
          {state.reports.map((r) => {
            const p = state.properties.find((x) => x.id === r.propertyId);
            return (
              <li
                key={r.id}
                className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">
                    {r.reason}
                    <span
                      className={`ml-2 text-xs font-bold uppercase ${r.status === "pending" ? "text-accent-foreground" : "text-muted-foreground"}`}
                    >
                      {statusLabel[r.status]}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {p ? (
                      <Link
                        to="/properties/$id"
                        params={{ id: p.id }}
                        className="text-primary hover:underline"
                      >
                        {p.name}
                      </Link>
                    ) : (
                      "Properti dihapus"
                    )}{" "}
                    · dilaporkan oleh {r.reporter} · {timeAgo(r.createdAt)}
                  </p>
                </div>
                {r.status === "pending" ? (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        if (p) updateProperty(p.id, { status: "nonaktif" });
                        resolveReport(r.id, "ditindak");
                        toast.success("Listing diturunkan dari marketplace.");
                      }}
                    >
                      Turunkan Listing
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        resolveReport(r.id, "diabaikan");
                        toast.success("Laporan diabaikan.");
                      }}
                    >
                      Abaikan
                    </Button>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
