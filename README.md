# Masjid AL-FITR — GitHub Pages

Aplikasi statis berbasis **HTML + CSS + JavaScript + JSON** untuk Masjid AL-FITR, Bandaneira.

## Fitur
- Jadwal Subuh, Dzuhur, Ashar, Maghrib, Isya
- Countdown menuju sholat terdekat
- Jam real-time
- Tanggal Masehi + Hijriah
- Lokasi perangkat dengan fallback Bandaneira
- Arah kiblat berbasis koordinat
- Cache jadwal terakhir untuk kondisi offline
- Dark mode
- Responsive dan fluid untuk HP/tablet/desktop
- Tidak membutuhkan backend

## Akurasi waktu
Aplikasi mengambil jadwal dari AlAdhan API menggunakan koordinat dan **method 20 (Kementerian Agama Republik Indonesia)**. AlAdhan menyediakan beberapa metode kalkulasi dan menjelaskan bahwa hasil dapat berbeda menurut metode/otoritas. Untuk jadwal resmi Masjid AL-FITR, pengurus tetap sebaiknya mencocokkan hasil dengan jadwal lokal yang digunakan masjid.

## Deploy ke GitHub Pages
1. Buat repository baru di GitHub.
2. Upload seluruh isi folder ini.
3. Pastikan `index.html` berada di root repository.
4. Buka **Settings → Pages**.
5. Pilih **Deploy from a branch**, branch `main`, folder `/root`.
6. Simpan dan tunggu GitHub Pages menerbitkan situs.

## Catatan
Browser biasanya hanya mengizinkan geolocation melalui HTTPS; GitHub Pages sudah menggunakan HTTPS. Jika pengguna menolak izin lokasi, aplikasi memakai koordinat fallback Bandaneira.

Sumber API: https://aladhan.com/
