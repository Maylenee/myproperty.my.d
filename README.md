# Property Finder Pro

Berikut versi prompt untuk Lovable — dibuat sebagai satu prompt utuh yang siap paste (Lovable bekerja lebih baik dengan instruksi naratif dan spesifik ketimbang format RTC bertingkat seperti sebelumnya):

Buatkan landing page untuk MyProperty, sebuah marketplace properti yang mempertemukan pembeli/penyewa dengan penjual, pemilik, atau agen properti — konsepnya seperti e-commerce, tapi produk yang dijual atau disewakan adalah properti (rumah, tanah, apartemen, ruko, villa, kost, gudang, gedung/tempat usaha).

Gunakan React + Tailwind CSS. Desain harus terasa seperti produk marketplace modern dan premium — bukan template dashboard generik. Gaya visual: clean, minimalis, banyak whitespace, foto properti jadi fokus utama, mobile-first. Warna: hijau tua gelap sebagai primary/aksen, putih/off-white sebagai background, hitam/abu gelap untuk teks, abu-abu untuk secondary text. Hindari gradient berlebihan, glassmorphism, glow, ikon robot/AI, dan card dengan rounded corner berlebihan.

Buat section-section berikut secara berurutan:

Navbar — logo "MyProperty", menu (Cari Properti, Cara Kerja, Bantuan), tombol "Masuk" dan CTA utama "Pasang Properti".

Hero — headline besar "Temukan Properti yang Tepat untukmu.", subheadline yang menjelaskan bisa cari rumah/tanah/apartemen/ruko/kost/villa dalam satu marketplace. Sertakan search bar besar dengan 4 field: Lokasi, Tipe Properti (dropdown), Transaksi (Dijual/Disewa), dan Rentang Harga, plus tombol "Cari". Dua CTA: "Cari Properti" (primary) dan "Pasang Properti" (secondary).

Value strip — bukan statistik pengguna palsu, tapi indikator singkat: jumlah kategori properti, jenis transaksi yang didukung, dan info "listing terverifikasi sebelum tayang".

Masalah — 4 card yang menjelaskan pain point pencarian properti saat ini: tersebar di banyak platform/grup chat, foto & info listing tidak lengkap, harga sulit dibandingkan, lokasi dan status listing tidak jelas.

Kenapa Memilih MyProperty — 4 value card dengan icon sederhana: pencarian mudah, filter lengkap, informasi terstruktur, simpan & hubungi seller langsung.

Fitur Unggulan — daftar fitur dalam grid/list rapi: Search Property, Filter (transaksi, tipe, harga, lokasi, kamar tidur, kamar mandi, luas tanah, luas bangunan, jumlah lantai), Property Card, Property Detail, Property Gallery, Lokasi & Map, Seller Profile, Favorite Property, Contact Seller (chat/WhatsApp/telepon), Property Inquiry.

Cara Kerja — 4 langkah bernomor: Cari → Filter → Temukan → Hubungi, masing-masing dengan deskripsi singkat.

Preview Aplikasi — mockup UI yang menampilkan grid property card (foto, badge Dijual/Disewa, harga, lokasi) di satu sisi, dan mockup halaman detail properti (harga besar, spesifikasi, status tersimpan, profil seller dengan badge terverifikasi) di sisi lain. Buat ini terlihat seperti screenshot aplikasi nyata, bukan placeholder kosong.

Use Case — dua kolom: "Untuk Pembeli/Penyewa" (mahasiswa, pasangan muda, keluarga, pekerja, investor, pengusaha, pencari tanah, pencari tempat usaha) dan "Untuk Penjual/Agen" (pemilik rumah, tanah, apartemen, kost, ruko, developer, agen properti) — tampilkan sebagai tag/chip.

Manfaat — checklist 2 kolom: hemat waktu, mudah membandingkan, info terstruktur, lokasi jelas lewat map, bisa disimpan, langsung hubungi seller, seller mudah kelola listing, listing direview sebelum tayang.

Paket Harga — tampilkan sebagai opsional/konsep masa depan, beri label jelas "belum tersedia di MVP", jangan seolah-olah ini requirement final. Satu paket "Gratis" (aktif) dan satu paket "Premium" (ditandai konsep).

FAQ — accordion dengan 7 pertanyaan: apa itu MyProperty, properti apa saja yang tersedia, bisa disewa atau tidak, cara mencari properti, cara menghubungi seller, cara memasang listing, bisa mengubah status listing atau tidak.

CTA akhir — background hijau tua, headline "Properti yang Kamu Cari Bisa Dimulai dari Sini.", subheadline "Cari, bandingkan, simpan, dan hubungi penjual dalam satu marketplace.", dua tombol CTA (Cari Properti / Pasang Properti).

Footer — logo & tagline, kolom Jelajahi (Rumah, Tanah, Apartemen, Ruko, Kost, Villa), kolom Untuk Seller (Pasang Properti, Kelola Listing), kolom Bantuan (Cara Kerja, Pusat Bantuan, Hubungi Kami), link Privacy Policy & Terms, copyright.

Pastikan seluruh halaman responsive penuh (desktop, tablet, mobile), CTA utama mudah terlihat di setiap section yang relevan, dan property card konsisten formatnya di semua tempat (foto → nama → lokasi → harga → spesifikasi) layaknya product card e-commerce.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d14c3ccb-cbd3-418c-98b7-7f7be7ba2d34).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
