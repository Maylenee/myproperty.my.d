import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  Bath,
  BedDouble,
  Building2,
  Check,
  ChevronDown,
  CircleCheck,
  Heart,
  House,
  Layers3,
  MapPin,
  Menu,
  MessageCircle,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  SquareStack,
  UserRoundCheck,
  X,
} from "lucide-react";

import apartmentImage from "@/assets/property-apartment.jpg";
import houseImage from "@/assets/property-modern-house.jpg";
import villaImage from "@/assets/property-villa.jpg";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MyProperty — Cari Rumah, Tanah & Properti Impianmu" },
      {
        name: "description",
        content:
          "Cari rumah, tanah, apartemen, ruko, kost, dan villa untuk dijual atau disewa dalam satu marketplace properti.",
      },
      { property: "og:title", content: "MyProperty — Marketplace Properti Indonesia" },
      {
        property: "og:description",
        content: "Cari, bandingkan, simpan, dan hubungi penjual properti dalam satu tempat.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const problems = [
  [Layers3, "Tersebar di mana-mana", "Listing tersebar di banyak platform dan grup chat, membuat pencarian melelahkan."],
  [SquareStack, "Informasi tidak lengkap", "Foto, ukuran, fasilitas, dan detail penting sering tidak tersedia dengan jelas."],
  [SlidersHorizontal, "Sulit dibandingkan", "Format harga dan spesifikasi berbeda-beda sehingga sulit mengambil keputusan."],
  [MapPin, "Status kurang jelas", "Lokasi tidak presisi dan listing yang sudah terjual sering masih terlihat aktif."],
] as const;

const values = [
  [Search, "Pencarian mudah", "Mulai dari lokasi atau kebutuhanmu, lalu temukan pilihan yang paling relevan."],
  [SlidersHorizontal, "Filter lengkap", "Persempit hasil berdasarkan transaksi, tipe, harga, luas, dan spesifikasi."],
  [Building2, "Informasi terstruktur", "Semua listing memakai format konsisten agar mudah dibaca dan dibandingkan."],
  [MessageCircle, "Hubungi langsung", "Simpan favorit dan terhubung langsung dengan pemilik atau agen properti."],
] as const;

const features = [
  "Search Property",
  "Filter lengkap",
  "Property Card",
  "Property Detail",
  "Property Gallery",
  "Lokasi & Map",
  "Seller Profile",
  "Favorite Property",
  "Contact Seller",
  "Property Inquiry",
];

const buyerTags = ["Mahasiswa", "Pasangan muda", "Keluarga", "Pekerja", "Investor", "Pengusaha", "Pencari tanah", "Pencari tempat usaha"];
const sellerTags = ["Pemilik rumah", "Pemilik tanah", "Pemilik apartemen", "Pemilik kost", "Pemilik ruko", "Developer", "Agen properti"];
const benefits = [
  "Hemat waktu pencarian",
  "Mudah membandingkan properti",
  "Informasi tersusun rapi",
  "Lokasi jelas melalui map",
  "Simpan properti favorit",
  "Langsung hubungi seller",
  "Seller mudah kelola listing",
  "Listing direview sebelum tayang",
];

const faqs = [
  ["Apa itu MyProperty?", "MyProperty adalah marketplace properti yang mempertemukan pembeli atau penyewa dengan pemilik, penjual, dan agen dalam satu tempat."],
  ["Properti apa saja yang tersedia?", "Kamu dapat menemukan rumah, tanah, apartemen, ruko, villa, kost, gudang, gedung, dan tempat usaha."],
  ["Apakah properti bisa disewa?", "Bisa. Pilih transaksi Disewa pada pencarian atau filter untuk melihat properti sewa yang tersedia."],
  ["Bagaimana cara mencari properti?", "Masukkan lokasi, pilih tipe properti dan transaksi, tentukan rentang harga, lalu gunakan filter lanjutan bila diperlukan."],
  ["Bagaimana cara menghubungi seller?", "Buka detail properti lalu hubungi seller melalui chat, WhatsApp, atau telepon yang tersedia pada profilnya."],
  ["Bagaimana cara memasang listing?", "Pilih Pasang Properti, lengkapi informasi dan foto, lalu kirim untuk proses review sebelum ditayangkan."],
  ["Apakah status listing bisa diubah?", "Bisa. Seller dapat mengubah status menjadi tersedia, terjual, tersewa, atau nonaktif melalui halaman kelola listing."],
] as const;

function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <a href="#top" className={`inline-flex items-center gap-2.5 font-extrabold ${inverse ? "text-primary-foreground" : "text-primary"}`} aria-label="MyProperty">
      <span className={`grid size-9 place-items-center rounded-md ${inverse ? "bg-primary-foreground text-primary" : "bg-primary text-primary-foreground"}`}>
        <House className="size-5" strokeWidth={2.4} />
      </span>
      <span className="text-lg">MyProperty</span>
    </a>
  );
}

function SectionHeading({ eyebrow, title, body, align = "left" }: { eyebrow: string; title: string; body?: string; align?: "left" | "center" }) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="mb-3 text-xs font-extrabold uppercase text-primary">{eyebrow}</p>
      <h2 className="font-display text-4xl leading-tight text-foreground sm:text-5xl">{title}</h2>
      {body ? <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">{body}</p> : null}
    </div>
  );
}

function PropertyCard({ image, badge, title, location, price, meta }: { image: string; badge: string; title: string; location: string; price: string; meta: string }) {
  return (
    <article className="overflow-hidden rounded-md border border-border bg-card">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={image} alt={title} width={1280} height={864} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]" />
        <span className="absolute left-3 top-3 rounded-sm bg-primary px-2.5 py-1 text-[10px] font-bold uppercase text-primary-foreground">{badge}</span>
        <button type="button" aria-label={`Simpan ${title}`} className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-background text-foreground shadow-sm transition-colors hover:text-primary">
          <Heart className="size-4" />
        </button>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-card-foreground">{title}</h3>
        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="size-3" />{location}</p>
        <p className="mt-3 text-lg font-extrabold text-primary">{price}</p>
        <p className="mt-2 border-t border-border pt-3 text-xs font-semibold text-muted-foreground">{meta}</p>
      </div>
    </article>
  );
}

function Index() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main id="top" className="overflow-hidden bg-background">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/70 bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 lg:px-8">
          <Logo />
          <nav className="hidden items-center gap-8 md:flex" aria-label="Navigasi utama">
            <a href="#preview" className="text-sm font-semibold text-foreground hover:text-primary">Cari Properti</a>
            <a href="#cara-kerja" className="text-sm font-semibold text-foreground hover:text-primary">Cara Kerja</a>
            <a href="#faq" className="text-sm font-semibold text-foreground hover:text-primary">Bantuan</a>
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <Button variant="ghost">Masuk</Button>
            <Button asChild><a href="#harga">Pasang Properti</a></Button>
          </div>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMenuOpen((open) => !open)} aria-label="Buka menu" aria-expanded={menuOpen}>
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
        {menuOpen ? (
          <div className="border-t border-border bg-background px-5 py-5 md:hidden">
            <nav className="flex flex-col gap-4" aria-label="Navigasi seluler">
              <a href="#preview" onClick={() => setMenuOpen(false)} className="font-semibold">Cari Properti</a>
              <a href="#cara-kerja" onClick={() => setMenuOpen(false)} className="font-semibold">Cara Kerja</a>
              <a href="#faq" onClick={() => setMenuOpen(false)} className="font-semibold">Bantuan</a>
              <div className="grid grid-cols-2 gap-3 pt-2"><Button variant="secondary">Masuk</Button><Button asChild><a href="#harga">Pasang Properti</a></Button></div>
            </nav>
          </div>
        ) : null}
      </header>

      <section className="relative flex min-h-[760px] items-center pt-24 text-primary-foreground sm:min-h-[820px]">
        <img src={houseImage} alt="Rumah modern di Jakarta" width={1280} height={864} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-primary/78" />
        <div className="relative mx-auto w-full max-w-7xl px-5 py-16 lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex items-center gap-2 rounded-sm border border-primary-foreground/30 bg-primary/30 px-3 py-1.5 text-xs font-bold uppercase">
              <ShieldCheck className="size-4" /> Marketplace properti tepercaya
            </p>
            <h1 className="font-display text-5xl leading-[1.04] sm:text-6xl lg:text-7xl">Temukan Properti yang Tepat untukmu.</h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-primary-foreground/85 sm:text-xl sm:leading-8">Cari rumah, tanah, apartemen, ruko, kost, dan villa untuk dibeli atau disewa dalam satu marketplace.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="hero" size="lg" asChild><a href="#preview">Cari Properti <ArrowRight className="size-4" /></a></Button>
              <Button variant="heroOutline" size="lg" asChild><a href="#harga">Pasang Properti</a></Button>
            </div>
          </div>

          <form className="mt-12 grid gap-2 rounded-md bg-background p-3 text-foreground shadow-xl md:grid-cols-[1.2fr_1fr_1fr_1fr_auto]" onSubmit={(event) => event.preventDefault()}>
            <label className="flex min-h-16 items-center gap-3 rounded-sm px-3 hover:bg-muted">
              <MapPin className="size-5 shrink-0 text-primary" />
              <span className="min-w-0 flex-1"><span className="block text-[10px] font-bold uppercase text-muted-foreground">Lokasi</span><input aria-label="Lokasi" placeholder="Kota atau area" className="mt-1 w-full bg-transparent text-sm font-semibold outline-none placeholder:text-muted-foreground" /></span>
            </label>
            <label className="flex min-h-16 items-center gap-3 rounded-sm border-t border-border px-3 md:border-l md:border-t-0">
              <Building2 className="size-5 shrink-0 text-primary" /><span className="min-w-0 flex-1"><span className="block text-[10px] font-bold uppercase text-muted-foreground">Tipe Properti</span><select aria-label="Tipe Properti" className="mt-1 w-full bg-transparent text-sm font-semibold outline-none"><option>Semua tipe</option><option>Rumah</option><option>Apartemen</option><option>Tanah</option><option>Ruko</option></select></span>
            </label>
            <label className="flex min-h-16 items-center gap-3 rounded-sm border-t border-border px-3 md:border-l md:border-t-0">
              <CircleCheck className="size-5 shrink-0 text-primary" /><span className="min-w-0 flex-1"><span className="block text-[10px] font-bold uppercase text-muted-foreground">Transaksi</span><select aria-label="Transaksi" className="mt-1 w-full bg-transparent text-sm font-semibold outline-none"><option>Dijual</option><option>Disewa</option></select></span>
            </label>
            <label className="flex min-h-16 items-center gap-3 rounded-sm border-t border-border px-3 md:border-l md:border-t-0">
              <span className="font-extrabold text-primary">Rp</span><span className="min-w-0 flex-1"><span className="block text-[10px] font-bold uppercase text-muted-foreground">Rentang Harga</span><select aria-label="Rentang Harga" className="mt-1 w-full bg-transparent text-sm font-semibold outline-none"><option>Semua harga</option><option>&lt; Rp500 juta</option><option>Rp500 jt–Rp2 M</option><option>&gt; Rp2 miliar</option></select></span>
            </label>
            <Button type="submit" size="lg" className="h-16"><Search className="size-5" />Cari</Button>
          </form>
        </div>
      </section>

      <section className="border-b border-border bg-background">
        <div className="mx-auto grid max-w-7xl divide-y divide-border px-5 py-6 sm:grid-cols-3 sm:divide-x sm:divide-y-0 lg:px-8">
          {["8 kategori properti", "Jual & sewa", "Diverifikasi sebelum tayang"].map((item, index) => (
            <div key={item} className="flex items-center justify-center gap-3 py-3 text-sm font-bold sm:px-6">
              {index === 0 ? <Building2 className="size-5 text-primary" /> : index === 1 ? <ArrowRight className="size-5 text-primary" /> : <ShieldCheck className="size-5 text-primary" />}{item}
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 py-24 lg:px-8" id="masalah">
        <div className="mx-auto max-w-7xl">
          <SectionHeading eyebrow="Pencarian hari ini" title="Mencari properti seharusnya tidak serumit ini." body="Informasi yang terpencar dan tidak konsisten membuat keputusan besar terasa lebih sulit dari seharusnya." />
          <div className="mt-12 grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {problems.map(([Icon, title, body], index) => (
              <article key={title} className="bg-card p-6 lg:min-h-64">
                <span className="text-sm font-extrabold text-muted-foreground">0{index + 1}</span>
                <Icon className="mt-8 size-7 text-primary" />
                <h3 className="mt-5 text-lg font-bold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-primary px-5 py-24 text-primary-foreground lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl"><p className="mb-3 text-xs font-extrabold uppercase text-accent">Kenapa MyProperty</p><h2 className="font-display text-4xl leading-tight sm:text-5xl">Lebih jelas sejak pencarian pertama.</h2><p className="mt-4 text-primary-foreground/70">Dibangun untuk membantu kamu menemukan, memahami, dan menindaklanjuti setiap pilihan dengan percaya diri.</p></div>
          <div className="mt-12 grid gap-px overflow-hidden rounded-md border border-primary-foreground/15 bg-primary-foreground/15 md:grid-cols-2 lg:grid-cols-4">
            {values.map(([Icon, title, body]) => (
              <article key={title} className="bg-primary p-7"><span className="grid size-12 place-items-center rounded-md bg-accent text-accent-foreground"><Icon className="size-5" /></span><h3 className="mt-6 text-lg font-bold">{title}</h3><p className="mt-3 text-sm leading-6 text-primary-foreground/65">{body}</p></article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-24 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div className="lg:sticky lg:top-28"><SectionHeading eyebrow="Fitur unggulan" title="Semua yang dibutuhkan, tanpa membuatmu kewalahan." body="Dari pencarian awal sampai percakapan dengan seller, setiap langkah tersusun dalam satu alur yang sederhana." /></div>
          <div className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2">
            {features.map((feature, index) => (
              <div key={feature} className="flex min-h-28 items-center gap-4 bg-card p-5"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-sm font-extrabold text-secondary-foreground">{String(index + 1).padStart(2, "0")}</span><div><h3 className="font-bold">{feature}</h3><p className="mt-1 text-xs leading-5 text-muted-foreground">{index === 1 ? "Transaksi, tipe, harga, lokasi, kamar, luas, dan lantai." : index === 8 ? "Chat, WhatsApp, atau telepon langsung." : "Informasi lengkap dalam alur yang mudah digunakan."}</p></div></div>
            ))}
          </div>
        </div>
      </section>

      <section id="cara-kerja" className="border-y border-border bg-card px-5 py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading eyebrow="Cara kerja" title="Dari mencari hingga terhubung dalam empat langkah." align="center" />
          <div className="relative mt-14 grid gap-8 md:grid-cols-4">
            {[["Cari", "Mulai dari kota, area, atau tipe properti yang kamu inginkan."], ["Filter", "Sesuaikan hasil berdasarkan anggaran dan kebutuhan spesifikmu."], ["Temukan", "Bandingkan detail dan simpan pilihan yang paling menarik."], ["Hubungi", "Terhubung langsung dengan pemilik atau agen terverifikasi."]].map(([title, body], index) => (
              <article key={title} className="relative text-center"><span className="mx-auto grid size-13 place-items-center rounded-full border-2 border-primary bg-background text-lg font-extrabold text-primary">{index + 1}</span><h3 className="mt-5 text-xl font-bold">{title}</h3><p className="mx-auto mt-2 max-w-60 text-sm leading-6 text-muted-foreground">{body}</p></article>
            ))}
          </div>
        </div>
      </section>

      <section id="preview" className="px-5 py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading eyebrow="Preview aplikasi" title="Melihat pilihan terasa lebih nyata." body="Kartu yang konsisten memudahkan perbandingan. Detail yang lengkap membantu kamu melangkah tanpa menebak-nebak." align="center" />
          <div className="mt-14 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-md border border-border bg-card p-4 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center justify-between"><div><p className="text-xs font-bold uppercase text-muted-foreground">Hasil pencarian</p><h3 className="mt-1 text-xl font-bold">Properti pilihan di Jakarta</h3></div><Button variant="secondary" size="sm"><SlidersHorizontal className="size-4" />Filter</Button></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <PropertyCard image={houseImage} badge="Dijual" title="Rumah Modern Cilandak" location="Cilandak, Jakarta Selatan" price="Rp4,85 M" meta="4 KT  •  3 KM  •  LT 220 m²" />
                <PropertyCard image={apartmentImage} badge="Disewa" title="Apartemen Senopati" location="Kebayoran Baru, Jakarta" price="Rp18 jt / bulan" meta="2 KT  •  2 KM  •  96 m²" />
              </div>
            </div>
            <div className="overflow-hidden rounded-md border border-border bg-card shadow-sm">
              <div className="relative aspect-[16/10]"><img src={villaImage} alt="Villa tropis di Bali" width={1280} height={864} loading="lazy" className="h-full w-full object-cover" /><span className="absolute left-4 top-4 rounded-sm bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground">Dijual</span><button type="button" aria-label="Simpan villa" className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-primary text-primary-foreground"><Heart className="size-4 fill-current" /></button></div>
              <div className="p-5 sm:p-6"><p className="text-xs font-bold text-muted-foreground">VILLA • BADUNG</p><h3 className="mt-2 text-xl font-bold">Villa Tropis Berawa</h3><p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="size-4" />Berawa, Bali</p><p className="mt-5 text-3xl font-extrabold text-primary">Rp7,2 M</p><div className="mt-5 grid grid-cols-3 border-y border-border py-4 text-center text-xs font-bold"><span className="flex items-center justify-center gap-1"><BedDouble className="size-4 text-primary" />3 KT</span><span className="flex items-center justify-center gap-1 border-x border-border"><Bath className="size-4 text-primary" />3 KM</span><span>280 m²</span></div><div className="mt-5 flex items-center gap-3"><span className="grid size-11 place-items-center rounded-full bg-secondary text-secondary-foreground"><UserRoundCheck className="size-5" /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">Nadira Property</p><p className="flex items-center gap-1 text-xs text-primary"><ShieldCheck className="size-3" />Seller terverifikasi</p></div><Button size="sm">Hubungi</Button></div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-secondary px-5 py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading eyebrow="Dibuat untuk semua" title="Satu marketplace, berbagai kebutuhan properti." />
          <div className="mt-12 grid gap-px overflow-hidden rounded-md border border-border bg-border lg:grid-cols-2">
            {[["Untuk Pembeli / Penyewa", buyerTags, Search], ["Untuk Penjual / Agen", sellerTags, House]].map(([title, tags, Icon]) => {
              const IconComponent = Icon as typeof Search;
              return <article key={title as string} className="bg-card p-7 sm:p-10"><IconComponent className="size-7 text-primary" /><h3 className="mt-5 text-2xl font-bold">{title as string}</h3><div className="mt-6 flex flex-wrap gap-2">{(tags as string[]).map((tag) => <span key={tag} className="rounded-full border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground">{tag}</span>)}</div></article>;
            })}
          </div>
        </div>
      </section>

      <section className="px-5 py-24 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center">
          <div><SectionHeading eyebrow="Manfaat" title="Lebih cepat menemukan yang benar-benar cocok." body="MyProperty merapikan proses yang biasanya panjang agar pembeli dan seller bisa fokus pada keputusan yang penting." /><Button className="mt-8" asChild><a href="#preview">Mulai cari properti <ArrowRight className="size-4" /></a></Button></div>
          <div className="grid gap-3 sm:grid-cols-2">{benefits.map((benefit) => <div key={benefit} className="flex min-h-20 items-center gap-3 border-b border-border py-4"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-secondary text-primary"><Check className="size-4" strokeWidth={3} /></span><span className="text-sm font-bold">{benefit}</span></div>)}</div>
        </div>
      </section>

      <section id="harga" className="border-y border-border bg-card px-5 py-24 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <SectionHeading eyebrow="Paket harga" title="Mulai gratis, berkembang saat kamu siap." body="Paket premium masih berupa konsep masa depan dan belum tersedia pada versi MVP." align="center" />
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            <article className="rounded-md border-2 border-primary bg-background p-7"><div className="flex items-center justify-between"><h3 className="text-2xl font-bold">Gratis</h3><span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-primary">Aktif di MVP</span></div><p className="mt-4 text-4xl font-extrabold">Rp0</p><p className="mt-2 text-sm text-muted-foreground">Untuk mulai mencari atau memasang properti.</p><ul className="mt-7 space-y-3 text-sm">{["Cari dan filter properti", "Simpan properti favorit", "Hubungi seller langsung", "Pasang listing dasar"].map((item) => <li key={item} className="flex gap-2"><Check className="size-4 text-primary" />{item}</li>)}</ul><Button className="mt-8 w-full">Mulai gratis</Button></article>
            <article className="rounded-md border border-border bg-muted p-7"><div className="flex items-center justify-between"><h3 className="text-2xl font-bold">Premium</h3><span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-bold text-muted-foreground">Konsep</span></div><p className="mt-4 text-4xl font-extrabold text-muted-foreground">Segera hadir</p><p className="mt-2 text-sm text-muted-foreground">Konsep fitur tambahan untuk seller profesional.</p><ul className="mt-7 space-y-3 text-sm text-muted-foreground">{["Eksposur listing tambahan", "Insight performa listing", "Profil seller profesional", "Dukungan prioritas"].map((item) => <li key={item} className="flex gap-2"><Sparkles className="size-4" />{item}</li>)}</ul><Button className="mt-8 w-full" variant="secondary" disabled>Belum tersedia di MVP</Button></article>
          </div>
        </div>
      </section>

      <section id="faq" className="px-5 py-24 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.7fr_1.3fr]">
          <SectionHeading eyebrow="FAQ" title="Pertanyaan yang sering ditanyakan." body="Temukan jawaban singkat sebelum mulai mencari atau memasang properti." />
          <div className="divide-y divide-border border-y border-border">{faqs.map(([question, answer], index) => <details key={question} className="group py-2" open={index === 0}><summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-bold"><span>{question}</span><ChevronDown className="size-5 shrink-0 text-primary transition-transform group-open:rotate-180" /></summary><p className="max-w-2xl pb-5 pr-8 text-sm leading-7 text-muted-foreground">{answer}</p></details>)}</div>
        </div>
      </section>

      <section className="bg-primary px-5 py-20 text-primary-foreground lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 lg:flex-row lg:items-end lg:justify-between"><div className="max-w-3xl"><p className="mb-3 text-xs font-extrabold uppercase text-accent">Mulai sekarang</p><h2 className="font-display text-4xl leading-tight sm:text-6xl">Properti yang Kamu Cari Bisa Dimulai dari Sini.</h2><p className="mt-5 text-primary-foreground/70">Cari, bandingkan, simpan, dan hubungi penjual dalam satu marketplace.</p></div><div className="flex shrink-0 flex-wrap gap-3"><Button variant="hero" size="lg" asChild><a href="#preview">Cari Properti</a></Button><Button variant="heroOutline" size="lg" asChild><a href="#harga">Pasang Properti</a></Button></div></div>
      </section>

      <footer className="bg-foreground px-5 py-16 text-background lg:px-8">
        <div className="mx-auto max-w-7xl"><div className="grid gap-10 border-b border-background/15 pb-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]"><div><Logo inverse /><p className="mt-5 max-w-xs text-sm leading-6 text-background/60">Marketplace properti untuk mencari, membandingkan, dan terhubung langsung dengan seller.</p></div>{[["Jelajahi", ["Rumah", "Tanah", "Apartemen", "Ruko", "Kost", "Villa"]], ["Untuk Seller", ["Pasang Properti", "Kelola Listing"]], ["Bantuan", ["Cara Kerja", "Pusat Bantuan", "Hubungi Kami"]]].map(([title, items]) => <div key={title as string}><h3 className="text-sm font-bold">{title as string}</h3><ul className="mt-5 space-y-3">{(items as string[]).map((item) => <li key={item}><a href="#top" className="text-sm text-background/60 hover:text-background">{item}</a></li>)}</ul></div>)}</div><div className="flex flex-col gap-4 pt-7 text-xs text-background/50 sm:flex-row sm:items-center sm:justify-between"><p>© 2026 MyProperty. Hak cipta dilindungi.</p><div className="flex gap-5"><a href="#top" className="hover:text-background">Privacy Policy</a><a href="#top" className="hover:text-background">Terms</a></div></div></div>
      </footer>
    </main>
  );
}
