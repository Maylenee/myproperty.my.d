import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Building2 } from "lucide-react";
import { toast } from "sonner";

import { EmptyState, PageHeader } from "@/components/app/common";
import { PropertyForm, valuesFromProperty, type PropertyFormValues } from "@/components/app/property-form";
import { RoleGuard, SellerShell } from "@/components/app/shell";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/seller/properties/$id/edit")({
  head: () => ({
    meta: [
      { title: "Edit Properti — MyProperty" },
      { name: "description", content: "Perbarui data listing properti Anda." },
      { property: "og:title", content: "Edit Properti — MyProperty" },
      { property: "og:description", content: "Perbarui data listing properti Anda." },
    ],
  }),
  component: () => (
    <RoleGuard role="seller">
      <SellerShell>
        <EditProperty />
      </SellerShell>
    </RoleGuard>
  ),
});

function toPatch(values: PropertyFormValues) {
  return {
    name: values.name.trim(),
    type: values.type,
    transaction: values.transaction,
    price: Number(values.price) || 0,
    address: values.address.trim(),
    province: values.province,
    city: values.city,
    district: values.district,
    landArea: Number(values.landArea) || 0,
    buildingArea: Number(values.buildingArea) || 0,
    bedrooms: Number(values.bedrooms) || 0,
    bathrooms: Number(values.bathrooms) || 0,
    floors: Number(values.floors) || 1,
    description: values.description.trim(),
    facilities: values.facilities,
    certificate: values.certificate,
    photos: values.photos,
  };
}

function EditProperty() {
  const { id } = Route.useParams();
  const { state, currentUser, updateProperty } = useStore();
  const navigate = useNavigate();
  const property = state.properties.find((p) => p.id === id && p.sellerId === currentUser?.id);

  if (!property) {
    return (
      <EmptyState
        icon={Building2}
        title="Listing tidak ditemukan"
        description="Listing ini tidak ada atau bukan milik akun Anda."
        actionLabel="Kembali ke Properti Saya"
        actionTo="/seller/properties"
      />
    );
  }

  const wasPublic = property.status === "aktif";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Properti"
        description={
          wasPublic
            ? "Perubahan pada listing aktif langsung tersimpan dan tetap tayang."
            : "Simpan perubahan lalu kirim kembali untuk direview admin."
        }
      />
      <PropertyForm
        initial={valuesFromProperty(property)}
        submitLabel="Simpan Perubahan"
        onSubmit={(values) => {
          const keep = ["aktif", "terjual", "disewa", "nonaktif", "pending"].includes(property.status);
          updateProperty(property.id, {
            ...toPatch(values),
            status: keep ? property.status : "pending",
            rejectReason: undefined,
          });
          toast.success("Perubahan berhasil disimpan.");
          navigate({ to: "/seller/properties" });
        }}
        onCancel={() => {
          if (window.confirm("Batalkan perubahan? Data yang belum disimpan akan hilang.")) {
            navigate({ to: "/seller/properties" });
          }
        }}
      />
    </div>
  );
}
