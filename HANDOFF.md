# Handoff: Proyek Produk

Tanggal: 2026-11-23
Lokasi: `D:\Aun\web\htdocs\produk` (XAMPP, Apache 2.4.58, PHP 8.1.25, MySQL)

## Ringkasan proyek
Aplikasi CRUD data produk.
- **Backend:** `api/products.php` (REST: GET, POST, PUT, DELETE, PDO prepared statements, validasi input, kode duplikat -> 409). Koneksi DB dan helper `db()`/`json_response()` ada di `api/config.php`.
- **Database:** `database.sql` membuat `produk_db` dan tabel `products` (kode UNIQUE, harga DECIMAL(15,2), stok INT, created_at, updated_at) plus 3 data contoh.
- **Frontend:** `frontend/` memakai React 18, Vite 5, dan DataTables (jQuery).
  - `src/App.jsx`: state, tabel DataTables, tombol Ubah/Hapus.
  - `src/ProductModal.jsx`: form modal tambah/ubah dengan validasi dan animasi keluar.
  - `src/api.js`: pembungkus fetch.
  - `src/styles.css`: gaya dan animasi.
- **Konfigurasi dev:** proxy Vite meneruskan `/api` ke `http://localhost/produk/api/...` (port 5173). Mode produksi memakai path relatif `../../api/products.php` dari `frontend/dist`.

## Pekerjaan yang dilakukan
1. **Membaca seluruh proyek** (tanpa perubahan).
2. **Uji CRUD API langsung dengan curl:**
   - GET -> 200, POST -> 201, PUT -> 200, DELETE -> 200.
   - Memakai baris sementara `TMP-CRUD-CHECK` (id 5) yang sudah dihapus lagi.
   - Verifikasi akhir: id 1 sampai 4 utuh. Baris `TEST-001` (id 4) bukan dibuat sesi ini dan tidak disentuh.
   - Kesimpulan: API berfungsi penuh. Kode frontend memanggil keempat operasi dengan benar.
3. **Animasi React** (permintaan "kurang animasi reactnya"):
   - `frontend/src/styles.css`: blok animasi ditambahkan tanpa menghapus aturan lama.
     - Masuk: header, kartu, backdrop, modal (pop), toast, alert, pesan error, baris tabel.
     - Interaksi: hover/tekan tombol, tombol tutup berputar, input invalid bergetar.
     - Keluar modal: `fade-out`, `pop-out`, kelas `.closing`.
     - Aksesibilitas: `prefers-reduced-motion` mematikan animasi.
   - `frontend/src/ProductModal.jsx`: state `render`/`closing` dan `lastProduct` (ref) agar modal memutar animasi keluar 200 ms sebelum dilepas. Judul tidak berubah selama animasi. Semua hook dipanggil sebelum `if (!render) return null`.
4. **Git:** repositori diinisialisasi, `.gitignore` mengecualikan `node_modules/` dan `frontend/dist/`. Commit awal `79916c6` di branch `master` berisi 14 file sumber.

## Status verifikasi
- API CRUD: **diuji langsung** (curl), berfungsi.
- Animasi dan build frontend: **dilaporkan berhasil oleh pengguna** setelah dicoba sendiri. Tidak diverifikasi langsung oleh asisten karena tidak ada akses browser. Jika yang dicoba hanya `npm run dev`, `frontend/dist` mungkin masih versi lama; jalankan `npm run build` untuk memperbaruinya.
- Tidak ada script test atau lint di `package.json` (hanya `dev`, `build`, `preview`).

## Catatan dan koreksi
- Dugaan awal bahwa string `paginate` di `App.jsx` rusak encoding **dicabut**. Pencarian karakter `Ã‚` di `frontend/src` tidak menemukan apa pun, jadi itu hanya artefak saat membaca.
- Permintaan "git selain folder apk": **tidak ada folder `apk`** di proyek ini. Asisten sempat menduga maksudnya `api/`, tetapi pengguna mengoreksi bahwa folder `apk` memang belum ada. Tidak ada perubahan yang dibuat terkait ini. `api/` tetap ter-commit.
- `App.jsx`, `api.js`, `api/*.php`, dan `database.sql` **tidak diubah** oleh asisten.

## Cara menjalankan
- Dev: `cd frontend && npm run dev`, lalu buka `http://localhost:5173`.
- Produksi: `cd frontend && npm run build`, lalu buka `http://localhost/produk/frontend/dist/`.
- Database: impor `database.sql` (database `produk_db`, user `root`, tanpa password).

## Risiko keamanan (aman untuk XAMPP lokal, tidak untuk publik)
- CORS `Access-Control-Allow-Origin: *`.
- API tanpa autentikasi (siapa pun bisa tambah/ubah/hapus).
- Koneksi DB memakai `root` tanpa password, dan `api/config.php` ikut ter-commit. Jangan push ke repositori publik tanpa memindahkan kredensial.

## Masih terbuka
1. Jika folder `apk/` nanti dibuat dan tidak ingin masuk Git, tambahkan `apk/` ke `.gitignore`.
2. Putuskan apakah baris `TEST-001` (id 4) di database dihapus atau dipertahankan.
3. Perketat keamanan API sebelum dipublikasikan.
4. Perubahan `HANDOFF.md` ini belum di-commit.
