import { ArrowLeft, ArrowRight, Check, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatPrice } from "@/lib/format";
import { citiesByProvince, districtsByCity, facilityOptions, photoByType, provinces } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import type { Property, PropertyStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface PropertyFormValues {
  name: string;
  type: string;
  transaction: "dijual" | "disewa";
  price: string;
  address: string;
  province: string;
  city: string;
  district: string;
  landArea: string;
  buildingArea: string;
  bedrooms: string;
  bathrooms: string;
  floors: string;
  description: string;
  facilities: string[];
  certificate: string;
  photos: string[];
}

export const emptyValues: PropertyFormValues = {
  name: "",
  type: "rumah",
  transaction: "dijual",
  price: "",
  address: "",
  province: "Jawa Barat",
  city: "",
  district: "",
  landArea: "",
  buildingArea: "",
  bedrooms: "",
  bathrooms: "",
  floors: "1",
  description: "",
  facilities: [],
  certificate: "SHM",
  photos: [],
};

export function valuesFromProperty(p: Property): PropertyFormValues {
  return {
    name: p.name,
    type: p.type,
    transaction: p.transaction,
    price: String(p.price),
    address: p.address,
    province: p.province,
    city: p.city,
    district: p.district,
    landArea: String(p.landArea),
    buildingArea: String(p.buildingArea),
    bedrooms: String(p.bedrooms),
    bathrooms: String(p.bathrooms),
    floors: String(p.floors),
    description: p.description,
    facilities: p.facilities,
    certificate: p.certificate,
    photos: p.photos,
  };
}

const steps = [
  "Informasi Dasar",
  "Lokasi",
  "Spesifikasi",
  "Deskripsi",
  "Fasilitas",
  "Foto",
  "Pratinjau",
];

export function PropertyForm({
  initial,
  submitLabel,
  onSubmit,
  onSaveDraft,
  onCancel,
}: {
  initial: PropertyFormValues;
  submitLabel: string;
  onSubmit: (values: PropertyFormValues, status: PropertyStatus) => void;
  onSaveDraft?: (values: PropertyFormValues) => void;
  onCancel?: () => void;
}) {
  const { state } = useStore();
  const categories = state.categories.filter((c) => c.active);
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<PropertyFormValues>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const set = (patch: Partial<PropertyFormValues>) => setValues((v) => ({ ...v, ...patch }));

  const validateStep = (index: number) => {
    const next: Record<string, string> = {};
    if (index === 0) {
      if (values.name.trim().length < 5) next.name = "Nama properti minimal 5 karakter.";
      if (!values.price || Number(values.price) <= 0) next.price = "Harga wajib diisi.";
    }
    if (index === 1) {
      if (!values.address.trim()) next.address = "Alamat wajib diisi.";
      if (!values.city) next.city = "Pilih kota/kabupaten.";
      if (!values.district) next.district = "Pilih kecamatan.";
    }
    if (index === 2) {
      if (!values.landArea || Number(values.landArea) <= 0) next.landArea = "Luas tanah wajib diisi.";
    }
    if (index === 3) {
      if (values.description.trim().length < 30) next.description = "Deskripsi minimal 30 karakter.";
    }
    if (index === 5) {
      if (values.photos.length === 0) next.photos = "Unggah minimal satu foto properti.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const next = () => {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const submit = () => {
    for (let i = 0; i < steps.length - 1; i++) {
      if (!validateStep(i)) {
        setStep(i);
        toast.error("Beberapa data belum lengkap. Periksa kembali langkah yang ditandai.");
        return;
      }
    }
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      onSubmit(values, "pending");
    }, 700);
  };

  return (
    <div className="space-y-6">
      <ol className="flex flex-wrap gap-2" aria-label="Langkah pengisian">
        {steps.map((label, i) => (
          <li key={label}>
            <button
              type="button"
              onClick={() => (i < step ? setStep(i) : undefined)}
              aria-current={i === step}
              className={cn(
                "border px-3 py-1.5 text-xs font-bold uppercase tracking-wide",
                i === step
                  ? "border-primary bg-primary text-primary-foreground"
                  : i < step
                    ? "border-primary bg-card text-primary"
                    : "border-border bg-card text-muted-foreground",
              )}
            >
              {i + 1}. {label}
            </button>
          </li>
        ))}
      </ol>

      <div className="border border-border bg-card p-6">
        {step === 0 ? (
          <div className="space-y-4">
            <Field id="name" label="Nama properti" error={errors.name}>
              <Input id="name" value={values.name} onChange={(e) => set({ name: e.target.value })} placeholder="Rumah Minimalis Modern" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="type" label="Kategori">
                <select
                  id="type"
                  className="h-10 w-full border border-input bg-card px-3 text-sm"
                  value={values.type}
                  onChange={(e) => set({ type: e.target.value })}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field id="transaction" label="Jenis transaksi">
                <select
                  id="transaction"
                  className="h-10 w-full border border-input bg-card px-3 text-sm"
                  value={values.transaction}
                  onChange={(e) => set({ transaction: e.target.value as "dijual" | "disewa" })}
                >
                  <option value="dijual">Dijual</option>
                  <option value="disewa">Disewa</option>
                </select>
              </Field>
            </div>
            <Field id="price" label="Harga (Rp)" error={errors.price} hint={values.price ? formatPrice(Number(values.price), values.transaction) : undefined}>
              <Input id="price" inputMode="numeric" value={values.price} onChange={(e) => set({ price: e.target.value.replace(/\D/g, "") })} placeholder="650000000" />
            </Field>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="space-y-4">
            <Field id="address" label="Alamat lengkap" error={errors.address}>
              <Input id="address" value={values.address} onChange={(e) => set({ address: e.target.value })} placeholder="Jl. Melati No. 12" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field id="province" label="Provinsi">
                <select id="province" className="h-10 w-full border border-input bg-card px-3 text-sm" value={values.province} onChange={(e) => set({ province: e.target.value, city: "", district: "" })}>
                  {provinces.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </Field>
              <Field id="city" label="Kota/Kabupaten" error={errors.city}>
                <select id="city" className="h-10 w-full border border-input bg-card px-3 text-sm" value={values.city} onChange={(e) => set({ city: e.target.value, district: "" })}>
                  <option value="">Pilih kota</option>
                  {(citiesByProvince[values.province] ?? []).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
              <Field id="district" label="Kecamatan" error={errors.district}>
                <select id="district" className="h-10 w-full border border-input bg-card px-3 text-sm" value={values.district} onChange={(e) => set({ district: e.target.value })} disabled={!values.city}>
                  <option value="">Pilih kecamatan</option>
                  {(districtsByCity[values.city] ?? []).map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="landArea" label="Luas tanah (m²)" error={errors.landArea}>
              <Input id="landArea" inputMode="numeric" value={values.landArea} onChange={(e) => set({ landArea: e.target.value.replace(/\D/g, "") })} />
            </Field>
            <Field id="buildingArea" label="Luas bangunan (m²)">
              <Input id="buildingArea" inputMode="numeric" value={values.buildingArea} onChange={(e) => set({ buildingArea: e.target.value.replace(/\D/g, "") })} />
            </Field>
            <Field id="bedrooms" label="Kamar tidur">
              <Input id="bedrooms" inputMode="numeric" value={values.bedrooms} onChange={(e) => set({ bedrooms: e.target.value.replace(/\D/g, "") })} />
            </Field>
            <Field id="bathrooms" label="Kamar mandi">
              <Input id="bathrooms" inputMode="numeric" value={values.bathrooms} onChange={(e) => set({ bathrooms: e.target.value.replace(/\D/g, "") })} />
            </Field>
            <Field id="floors" label="Jumlah lantai">
              <Input id="floors" inputMode="numeric" value={values.floors} onChange={(e) => set({ floors: e.target.value.replace(/\D/g, "") })} />
            </Field>
            <Field id="certificate" label="Sertifikat">
              <select id="certificate" className="h-10 w-full border border-input bg-card px-3 text-sm" value={values.certificate} onChange={(e) => set({ certificate: e.target.value })}>
                {["SHM", "HGB", "Girik", "AJB", "Strata Title"].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        ) : null}

        {step === 3 ? (
          <Field id="description" label="Deskripsi properti" error={errors.description}>
            <Textarea
              id="description"
              rows={8}
              value={values.description}
              onChange={(e) => set({ description: e.target.value })}
              placeholder="Ceritakan kondisi properti, keunggulan lokasi, akses jalan, dan hal penting lain bagi calon pembeli."
            />
          </Field>
        ) : null}

        {step === 4 ? (
          <fieldset>
            <legend className="mb-3 text-sm font-semibold text-foreground">Pilih fasilitas yang tersedia</legend>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {facilityOptions.map((f) => (
                <label key={f} className="flex items-center gap-2 text-sm text-foreground">
                  <Checkbox
                    checked={values.facilities.includes(f)}
                    onCheckedChange={(checked) =>
                      set({
                        facilities: checked
                          ? [...values.facilities, f]
                          : values.facilities.filter((x) => x !== f),
                      })
                    }
                    aria-label={f}
                  />
                  {f}
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}

        {step === 5 ? (
          <PhotoUploader
            photos={values.photos}
            error={errors.photos}
            fallback={photoByType[values.type] ?? photoByType.rumah}
            onChange={(photos) => set({ photos })}
          />
        ) : null}

        {step === 6 ? <Preview values={values} /> : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            <ArrowLeft className="size-4" aria-hidden /> Kembali
          </Button>
          {onCancel ? (
            <Button type="button" variant="ghost" onClick={onCancel}>
              Batal
            </Button>
          ) : null}
        </div>
        <div className="flex gap-2">
          {onSaveDraft ? (
            <Button type="button" variant="outline" onClick={() => onSaveDraft(values)}>
              Simpan Draft
            </Button>
          ) : null}
          {step < steps.length - 1 ? (
            <Button type="button" onClick={next}>
              Lanjut <ArrowRight className="size-4" aria-hidden />
            </Button>
          ) : (
            <Button type="button" onClick={submit} disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Check className="size-4" aria-hidden />}
              {submitLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="mt-1.5">{children}</div>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      {error ? (
        <p role="alert" className="mt-1 text-xs font-semibold text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function PhotoUploader({
  photos,
  onChange,
  error,
  fallback,
}: {
  photos: string[];
  onChange: (photos: string[]) => void;
  error?: string;
  fallback: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const addFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const readers = Array.from(files)
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, 8)
      .map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.readAsDataURL(file);
          }),
      );
    if (readers.length === 0) {
      toast.error("Hanya file gambar yang bisa diunggah.");
      return;
    }
    Promise.all(readers).then((urls) => {
      onChange([...photos, ...urls]);
      toast.success(`${urls.length} foto ditambahkan.`);
    });
  };

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= photos.length) return;
    const copy = [...photos];
    const [item] = copy.splice(index, 1);
    copy.splice(target, 0, item as string);
    onChange(copy);
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          addFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center justify-center border border-dashed px-6 py-10 text-center",
          dragOver ? "border-primary bg-secondary" : "border-border bg-background",
        )}
      >
        <ImagePlus className="size-7 text-primary" aria-hidden />
        <p className="mt-3 text-sm font-semibold text-foreground">Tarik foto ke sini atau pilih dari perangkat</p>
        <p className="mt-1 text-xs text-muted-foreground">Format JPG atau PNG. Foto pertama menjadi foto utama.</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>
            Pilih Foto
          </Button>
          <Button type="button" variant="ghost" onClick={() => onChange([...photos, fallback])}>
            Gunakan Foto Contoh
          </Button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          aria-label="Unggah foto properti"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>
      {error ? (
        <p role="alert" className="mt-2 text-xs font-semibold text-destructive">
          {error}
        </p>
      ) : null}

      {photos.length > 0 ? (
        <ul className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {photos.map((photo, i) => (
            <li key={photo.slice(0, 40) + i} className="border border-border bg-card">
              <div className="relative aspect-[4/3] bg-muted">
                <img src={photo} alt={`Foto properti ${i + 1}`} className="size-full object-cover" />
                {i === 0 ? (
                  <span className="absolute left-2 top-2 bg-primary px-2 py-0.5 text-[11px] font-bold uppercase text-primary-foreground">
                    Utama
                  </span>
                ) : null}
              </div>
              <div className="flex items-center justify-between gap-1 p-2">
                <div className="flex gap-1">
                  <Button type="button" size="sm" variant="outline" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Geser ke kiri">
                    ←
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => move(i, 1)} disabled={i === photos.length - 1} aria-label="Geser ke kanan">
                    →
                  </Button>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  aria-label={`Hapus foto ${i + 1}`}
                  onClick={() => onChange(photos.filter((_, idx) => idx !== i))}
                >
                  <Trash2 className="size-4 text-destructive" aria-hidden />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function Preview({ values }: { values: PropertyFormValues }) {
  const { state } = useStore();
  const category = state.categories.find((c) => c.slug === values.type);
  return (
    <div>
      <h2 className="text-lg font-bold text-foreground">Pratinjau listing</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Periksa kembali data berikut. Setelah dikirim, listing akan berstatus Menunggu Review admin.
      </p>
      <div className="mt-5 grid gap-5 sm:grid-cols-[220px_minmax(0,1fr)]">
        <div className="aspect-[4/3] overflow-hidden border border-border bg-muted">
          {values.photos[0] ? (
            <img src={values.photos[0]} alt="Foto utama" className="size-full object-cover" />
          ) : (
            <div className="grid size-full place-items-center text-xs text-muted-foreground">Belum ada foto</div>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            {category?.name} · {values.transaction === "dijual" ? "Dijual" : "Disewa"}
          </p>
          <h3 className="mt-1 font-display text-2xl text-foreground">{values.name || "Tanpa nama"}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {values.address}, {values.district}, {values.city}
          </p>
          <p className="mt-3 font-display text-2xl text-primary">
            {values.price ? formatPrice(Number(values.price), values.transaction) : "Harga belum diisi"}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            {values.landArea || 0} m² tanah · {values.buildingArea || 0} m² bangunan · {values.bedrooms || 0} KT ·{" "}
            {values.bathrooms || 0} KM
          </p>
          <p className="mt-3 line-clamp-4 text-sm leading-6 text-muted-foreground">{values.description}</p>
          {values.facilities.length > 0 ? (
            <p className="mt-3 text-xs text-muted-foreground">Fasilitas: {values.facilities.join(", ")}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
