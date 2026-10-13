# Undangan Digital Donahu — Panduan Sistem Tema

Satu kode, banyak desain. Isi undangan (nama, acara, foto) tetap di **`js/data.js`**,
sedangkan **gaya tampilan** dipilih lewat tema.

## Cara cepat

| Kebutuhan klien | Yang diubah |
|---|---|
| Ganti desain total | `data.js` → `tampilan.tema: "sinematik"` |
| Kirim beberapa pilihan desain ke klien | tambahkan `?tema=sinematik` di link (tanpa edit file) |
| Ganti warna / font saja | `tampilan.warna` / `tampilan.font` |
| Ubah urutan section | `tampilan.urutanSection` |
| Susunan acara berbeda (Siraman, Ngunduh Mantu, dll) | `sectionAcara.daftarAcara` |
| Ada siaran langsung | `sectionLiveStreaming.tampilkan: true` |
| Menu ikon di bawah layar | `tampilan.navigasiBawah: true` |

Setelah link final dibagikan, set `tampilan.izinkanPreviewTema: false` agar tamu tidak bisa mengganti tema lewat URL.

## Tema yang tersedia

- **klasik** — desain asli (terang, ornamen bunga, layer per section). Bawaan.
- **sinematik** — foto penuh layar gelap yang berganti, monogram besar di sampul, kartu kaca bergaris tipis,
  kartu acara berbentuk kubah, foto polaroid, nama berwarna emas. Foto latar & sampul otomatis diambil dari galeri.

## Contoh pengaturan

```js
tampilan: {
    tema: "sinematik",
    warna: { aksen: "#E8B4B8" },              // emas -> rose gold
    font:  { script: "'Allura', cursive" },
    urutanSection: ["sectionHero", "sectionMempelai", "sectionAcara", "sectionGaleri", "wishes", "footer"],
    navigasiBawah: true,
    fotoSampul: "img/Gallery/foto3.webp",
},
```

Token yang bisa diubah di tema sinematik: `aksen`, `aksen-tombol`, `latar`, `overlay`, `teks`, `teks-redup`,
`garis`, `kaca`, `blur`; font: `display`, `judul`, `script`, `teks`.
Untuk tema klasik pakai nama variabel langsung, contoh `warna: { "--warna-utama": "#8a6d3b" }`.

## Membuat tema baru (misal meniru desain kompetitor lain)

1. Salin `css/themes/_template-tema-baru.css` → `css/themes/<nama>.css`
2. Ganti `NAMA-TEMA` dengan nama tema, atur token warna & font
3. Tambahkan gaya per section (contoh lengkap: `css/themes/sinematik.css`, urutannya sama dengan `main.html`)
4. Preview: `index.html?tema=<nama>`

Aturan emas: **jangan ubah `theme.css` untuk klien baru** — buat/ubah file tema. Dengan begitu undangan lama tidak ikut berubah.

## Struktur file

```
index.html              sampul depan (gerbang)
main.html               isi undangan (semua section)
js/data.js              DATA KLIEN + pengaturan tampilan
js/theme-loader.js      memilih tema, memuat CSS tema, preset tema, override warna/font
js/layer-engine.js      latar global, on/off section, urutan section, navigasi bawah
js/script.js            mengisi konten, hitung mundur, RSVP, musik
css/layout.css          kerangka layout + komponen opsional
css/theme.css           gaya tema klasik
css/themes/*.css        tema lain
```

## Catatan perubahan (Oktober 2026)

- Sistem tema + tema **sinematik**
- Komponen opsional: monogram sampul, "Personalized for <nama tamu>", nama panggilan & kota asal mempelai,
  live streaming, navigasi bawah, daftar acara bebas
- Perbaikan: error saat kartu peminangan dimatikan (`cardPinang` tidak terdefinisi)
- Keamanan: ucapan tamu dari Google Sheet kini ditampilkan sebagai teks biasa (sebelumnya HTML/skrip dari tamu bisa ikut dijalankan)
- Admin: placeholder `[nama]` / `[link-undangan]` diganti di semua kemunculan, bukan hanya yang pertama
- Tombol Instagram mempelai otomatis hilang jika akun kosong; tombol peta hilang jika link kosong
- Tema klasik tetap identik dengan tampilan sebelumnya (sudah dibandingkan piksel per piksel)
