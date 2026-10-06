# Daftar Tugas ✅

Aplikasi web **to-do list** sederhana berbahasa Indonesia. Dibuat hanya dengan
HTML, CSS, dan JavaScript murni — tanpa framework, tanpa instalasi apa pun.

Cocok sebagai proyek belajar: kodenya pendek, diberi komentar, dan logikanya
dipisah dari tampilan sehingga mudah diuji.

## Fitur

- Tambah, centang (selesai), ubah, dan hapus tugas
- Saring tugas: **Semua**, **Aktif**, atau **Selesai**
- Hitungan tugas yang tersisa dan tombol **Hapus yang selesai**
- Data **tersimpan otomatis** di browser (`localStorage`), tetap ada setelah halaman ditutup
- Sinkron otomatis kalau aplikasi dibuka di beberapa tab
- Mode gelap otomatis mengikuti pengaturan perangkat
- Nyaman di ponsel dan bisa dipakai penuh dengan keyboard

> **Catatan:** data hanya tersimpan di browser dan perangkat yang kamu pakai.
> Membuka aplikasi di HP atau browser lain akan menampilkan daftar yang berbeda.

## Cara menjalankan

Cukup buka berkas `index.html` di browser (klik dua kali). Selesai!

Kalau ingin lewat server lokal:

```bash
python3 -m http.server 8000
# lalu buka http://localhost:8000
```

### Pintasan keyboard

| Tombol | Fungsi |
| --- | --- |
| `Enter` di kolom tugas baru | Menambah tugas |
| `Spasi` pada kotak centang | Menandai selesai / belum |
| `Enter` saat mengubah tugas | Menyimpan perubahan |
| `Esc` saat mengubah tugas | Membatalkan perubahan |

## Menjalankan tes

Butuh [Node.js](https://nodejs.org/) versi 20 atau lebih baru. Tidak ada
dependensi yang perlu dipasang.

```bash
npm test
```

Tes juga berjalan otomatis di GitHub Actions setiap kali ada push atau pull request.

## Struktur proyek

```
.
├── index.html          # Kerangka halaman
├── style.css           # Tampilan (termasuk mode gelap & layar kecil)
├── src/
│   ├── todo.js         # Logika inti: tambah, ubah, hapus, saring, simpan
│   └── app.js          # Menghubungkan logika dengan tampilan & localStorage
├── test/
│   └── todo.test.js    # Tes untuk src/todo.js
└── .github/workflows/
    └── test.yml        # Menjalankan tes otomatis di GitHub
```

## Mempublikasikan dengan GitHub Pages

Supaya aplikasinya bisa dibuka siapa saja lewat link:

1. Buka repo ini di GitHub → **Settings** → **Pages**.
2. Di bagian **Build and deployment**, pilih **Source: Deploy from a branch**.
3. Pilih branch yang berisi kode ini dan folder **`/ (root)`**, lalu klik **Save**.
4. Tunggu sekitar satu menit; link aplikasimu akan muncul di halaman yang sama
   (biasanya `https://<username>.github.io/nee/`).

## Ide pengembangan

Mau belajar lebih lanjut? Coba tambahkan salah satu fitur ini:

- Tenggat waktu (tanggal) untuk tiap tugas
- Urutkan tugas dengan seret-dan-lepas (drag and drop)
- Kategori atau label warna
- Ekspor/impor daftar tugas ke berkas JSON
