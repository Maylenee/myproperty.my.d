import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { PageHeader } from "@/components/app/common";
import { PropertyForm, emptyValues, type PropertyFormValues } from "@/components/app/property-form";
import { RoleGuard, SellerShell } from "@/components/app/shell";
import { useStore } from "@/lib/store";
import type { PropertyStatus } from "@/lib/types";

export const Route = createFileRoute("/seller/properties/create")({
  head: () => ({
    meta: [
      { title: "Pasang Properti — MyProperty" },
      {
        name: "description",
        content: "Pasang listing properti baru dalam beberapa langkah mudah.",
      },
      { property: "og:title", content: "Pasang Properti — MyProperty" },
      {
        property: "og:description",
        content: "Pasang listing properti baru dalam beberapa langkah mudah.",
      },
    ],
  }),
  component: () => (
    <RoleGuard role="seller">
      <SellerShell>
        <CreateProperty />
      </SellerShell>
    </RoleGuard>
  ),
});

export function toProperty(values: PropertyFormValues) {
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

function CreateProperty() {
  const { createProperty, currentUser } = useStore();
  const navigate = useNavigate();

  const save = (values: PropertyFormValues, status: PropertyStatus) => {
    if (!currentUser) return;
    createProperty({ ...toProperty(values), sellerId: currentUser.id, status });
    toast.success(
      status === "draft"
        ? "Draft tersimpan."
        : "Listing dikirim. Menunggu review admin sebelum tayang.",
    );
    navigate({ to: "/seller/properties" });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pasang Properti"
        description="Lengkapi 7 langkah berikut. Listing akan tayang setelah disetujui admin."
      />
      <PropertyForm
        initial={emptyValues}
        submitLabel="Kirim untuk Review"
        onSubmit={save}
        onSaveDraft={(values) => {
          if (values.name.trim().length < 3) {
            toast.error("Isi nama properti terlebih dahulu sebelum menyimpan draft.");
            return;
          }
          save(values, "draft");
        }}
        onCancel={() => navigate({ to: "/seller/properties" })}
      />
    </div>
  );
}
