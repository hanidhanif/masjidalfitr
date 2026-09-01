# Masjid AL-FITR — Digital Signage

Aplikasi display digital masjid modern, minimalis, dan responsif.  
Dibuat khusus untuk **Masjid AL-FITR, Bandaneira**.

## Warna Tema
- **Ivory** `#FFFEF7`
- **Cream** `#F7F1E3`
- **Navy** `#0A1F44`
- Aksen emas lembut

## Fitur

- Jadwal sholat akurat (Adhan.js + pendekatan Kemenag / Muslim World League)
- Deteksi lokasi otomatis (Geolocation) + fallback ke koordinat Bandaneira
- Countdown besar menuju sholat berikutnya
- Jam digital real-time
- Tanggal Masehi + Hijriyah
- Grid 6 waktu sholat (Subuh, Syuruq, Dzuhur, Ashar, Maghrib, Isya)
- Highlight waktu sholat aktif
- Running text pengumuman (bisa diubah via JSON)
- Quote / Hadits / Ayat berganti otomatis
- Desain light (ivory/cream) + navy, modern & fluid
- Fully responsive (TV, tablet, HP)
- 100% static — cocok untuk **GitHub Pages**

## Cara Deploy ke GitHub Pages

1. Buat repository baru di GitHub
2. Upload semua file di folder ini
3. Settings → Pages → Source: Deploy from branch `main` / folder root
4. Tunggu beberapa menit, lalu buka URL Pages-nya

Atau buka `index.html` langsung di browser untuk testing lokal.

## Struktur File

```
masjid-al-fitr/
├── index.html
├── css/
│   └── styles.css
├── js/
│   └── app.js
├── data/
│   └── config.json      ← edit running text & quotes di sini
└── README.md
```

## Kustomisasi

Edit `data/config.json` untuk mengubah:
- Teks berjalan (runningText)
- Daftar quote/hadits

Warna utama ada di CSS variables di `css/styles.css`.

## Teknologi

- HTML5 + CSS3 (Flexbox/Grid, CSS Variables)
- Vanilla JavaScript
- [Adhan.js](https://github.com/batoulapps/adhan-js) untuk perhitungan waktu sholat
- JSON untuk konfigurasi

---

Dibuat untuk Masjid AL-FITR • Bandaneira  
Semoga bermanfaat, *insyaAllah*.
