export const websiteKnowledge = `
# MyProperty - Marketplace Properti Indonesia

## Tentang MyProperty
MyProperty adalah marketplace properti yang mempertemukan pembeli/penyewa dengan pemilik, penjual, dan agen dalam satu tempat. Platform ini dirancang untuk mempermudah pencarian properti dengan informasi terstruktur dan konsisten.

## Kategori Properti yang Tersedia
- **Rumah** - Berbagai tipe rumah dijual/disewa
- **Tanah** - Kavling, sawah, tanah kosong
- **Apartemen** - Studio, 1-3 kamar tidur
- **Ruko** - Ruko 1-2 lantai untuk usaha
- **Kost** - Kost putra/putri, dengan AC/full furnished
- **Villa** - Villa dengan halaman luas, tepi sawah
- **Gudang** - Gudang di jalur pantura
- **Gedung/Tempat Usaha** - Gedung kantor multi-lantai

## Jenis Transaksi
- **Dijual** - Properti untuk dibeli (SHM/HGB)
- **Disewa** - Properti untuk disewakan (bulanan/tahunan)

## Lokasi Coverage
**Provinsi: Jawa Barat**
- Indramayu (Indramayu, Jatibarang, Lohbener, Sindang, Karangampel, Haurgeulis)
- Cirebon (Kejaksan, Harjamukti, Sumber)
- Bandung (Coblong, Antapani, Buahbatu)
- Bekasi (Bekasi Barat, Tambun)

**Provinsi: DKI Jakarta**
- Jakarta Selatan (Tebet, Kebayoran Baru)
- Jakarta Timur (Cakung, Duren Sawit)

**Provinsi: Jawa Tengah**
- Semarang (Tembalang, Banyumanik)
- Solo (Laweyan, Jebres)

## Fitur Utama
1. **Pencarian Mudah** - Mulai dari lokasi atau kebutuhan
2. **Filter Lengkap** - Transaksi, tipe, harga, luas, kamar, lantai
3. **Informasi Terstruktur** - Format konsisten untuk perbandingan mudah
4. **Hubungi Langsung** - Chat, WhatsApp, atau telepon ke seller
5. **Simpan Favorit** - Bookmark properti yang diminati
6. **Kelola Listing** - Dashboard seller untuk CRUD properti
7. **Inquiry Management** - Kelola pertanyaan masuk dari pembeli
8. **Verifikasi Seller** - Admin memverifikasi seller sebelum listing tayang

## Alur Kerja (4 Langkah)
1. **Cari** - Mulai dari kota, area, atau tipe properti
2. **Filter** - Sesuaikan hasil berdasarkan anggaran & kebutuhan
3. **Temukan** - Bandingkan detail & simpan pilihan
4. **Hubungi** - Terhubung langsung dengan pemilik/agen terverifikasi

## Untuk Pembeli/Penyewa
- Mahasiswa, Pasangan muda, Keluarga, Pekerja, Investor, Pengusaha, Pencari tanah, Pencari tempat usaha

## Untuk Penjual/Agen
- Pemilik rumah, tanah, apartemen, kost, ruko, Developer, Agen properti

## Manfaat
- Hemat waktu pencarian
- Mudah membandingkan properti
- Informasi tersusun rapi
- Lokasi jelas melalui map
- Simpan properti favorit
- Langsung hubungi seller
- Seller mudah kelola listing
- Listing direview sebelum tayang

## Paket Harga
### Gratis (Aktif di MVP) - Rp0
- Cari dan filter properti
- Simpan properti favorit
- Hubungi seller langsung
- Pasang listing dasar

### Premium (Konsep) - Segera hadir
- Eksposur listing tambahan
- Insight performa listing
- Profil seller profesional
- Dukungan prioritas

## FAQ Umum
**Q: Apa itu MyProperty?**
A: Marketplace properti yang mempertemukan pembeli/penyewa dengan pemilik, penjual, dan agen dalam satu tempat.

**Q: Properti apa saja yang tersedia?**
A: Rumah, tanah, apartemen, ruko, villa, kost, gudang, gedung, dan tempat usaha.

**Q: Apakah properti bisa disewa?**
A: Bisa. Pilih transaksi "Disewa" pada pencarian atau filter.

**Q: Bagaimana cara mencari properti?**
A: Masukkan lokasi, pilih tipe properti dan transaksi, tentukan rentang harga, lalu gunakan filter lanjutan.

**Q: Bagaimana cara menghubungi seller?**
A: Buka detail properti lalu hubungi seller melalui chat, WhatsApp, atau telepon yang tersedia pada profilnya.

**Q: Bagaimana cara memasang listing?**
A: Pilih "Pasang Properti", lengkapi informasi dan foto, lalu kirim untuk proses review sebelum ditayangkan.

**Q: Apakah status listing bisa diubah?**
A: Bisa. Seller dapat mengubah status menjadi tersedia, terjual, tersewa, atau nonaktif melalui halaman kelola listing.

## Data Contoh (Mock Data)
- 28 properti contoh di berbagai lokasi
- 4 user seller (2 terverifikasi, 1 belum)
- 2 user buyer
- 1 admin
- 4 inquiry contoh
- 2 report contoh

## Sertifikat
- SHM (Sertifikat Hak Milik)
- HGB (Hak Guna Bangunan)

## Fasilitas Umum
Garasi, Carport, Taman, Listrik, Air PDAM, AC, Internet

## Role Pengguna
1. **Buyer** - Mencari properti untuk dibeli/disewa
2. **Seller** - Memasang dan mengelola listing properti
3. **Admin** - Mengelola platform, verifikasi seller, review listing
`;

export function getKnowledgeContext(): string {
  return websiteKnowledge;
}

export function searchKnowledge(query: string): string[] {
  const lowerQuery = query.toLowerCase();
  const sections = websiteKnowledge.split("\n## ").filter((s) => s.trim());

  return sections
    .filter((section) => {
      const lowerSection = section.toLowerCase();
      return lowerQuery.split(" ").some((word) => word.length > 2 && lowerSection.includes(word));
    })
    .slice(0, 3);
}
