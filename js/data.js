// =========================================================================
// DATABASE UTAMA KLIEN (data.js) 
// Satu-satunya file yang disentuh untuk memasukkan data dan mematikan fitur
// =========================================================================

const configUndangan = {

    // ==========================================
    // 0. TAMPILAN / TEMA  (BARU)
    // Ganti seluruh gaya desain tanpa menyentuh HTML.
    // Preview cepat tanpa edit file: tambahkan ?tema=sinematik di link undangan.
    // ==========================================
    tampilan: {
        tema: "sinematik",            // "klasik" (desain asli) | "sinematik" (gelap, foto penuh, aksen emas)
        varian: "terang",          // khusus sinematik: "gelap" (jas hitam, foto gelap) | "terang" (foto cerah, nuansa merah-putih) | "hangat"
        transisiBuka: "tirai",    // efek tombol "Buka Undangan": "cahaya" (elegan) | "tirai" | "amplop" (klasik)
        izinkanPreviewTema: true,  // false = parameter ?tema= di URL diabaikan (pakai saat link final disebar)

        // Urutan section. Kosongkan [] untuk memakai urutan bawaan tema.
        // Kunci yang tersedia: sectionHero, sectionQuote, sectionMempelai, sectionAcara, sectionLiveStreaming,
        // sectionLoveStory, sectionGaleri, sectionGift, turutMengundang, wishes, footer
        urutanSection: [],

        // Override warna/font TANPA edit CSS (opsional). Contoh:
        // warna: { aksen: "#E8C27A", latar: "#0f0f0f" }      -> token tema
        // warna: { "--warna-utama": "#8a6d3b" }               -> variabel tema klasik
        // font:  { script: "'Allura', cursive" }
        warna: {},
        font: {},
        googleFonts: [],           // contoh: ["Allura", "Cinzel:wght@400;700"]

        // Khusus tema berlatar foto (sinematik)
        fotoSampul: "",            // foto cover depan. Kosong = foto galeri pertama
        fotoLatar: [],             // foto latar berganti. Kosong = 6 foto galeri pertama
        latarDariTema: true,       // false = tetap pakai pengaturanGlobal.tipeBackground di bawah

        // Posisi/zoom foto agar tidak terpotong. Atur dengan menggeser foto: buka link + ?atur=1
        // lalu tekan "Salin kode" dan tempel hasilnya menggantikan baris di bawah ini.
        posisiFoto: {
            "img/Gallery/Foto1.webp@berjalan": "50% 24%",
            "img/Gallery/Foto1.webp@galeri": "50% 14%",
            "img/Gallery/Foto10.webp@berjalan": "50% 34%",
            "img/Gallery/Foto10.webp@galeri": { posisi: "50% 50%", zoom: 1.1 },
            "img/Gallery/Foto11.webp@berjalan": "50% 20%",
            "img/Gallery/Foto11.webp@galeri": "50% 24%",
            "img/Gallery/Foto13.webp@berjalan": "50% 42%",
            "img/Gallery/Foto13.webp@galeri": "50% 40%",
            "img/Gallery/Foto3.webp@galeri": "50% 100%",
            "img/Gallery/Foto4.webp@galeri": "50% 42%",
            "img/Gallery/Foto5.webp@galeri": { posisi: "42% 34%", zoom: 1.96 },
            "img/Gallery/Foto6.webp@berjalan": "50% 19%",
            "img/Gallery/Foto6.webp@galeri": "50% 24%",
            "img/Gallery/Foto7.webp@berjalan": "50% 14%",
            "img/Gallery/Foto8.webp@berjalan": "50% 24%",
            "img/Gallery/Foto8.webp@galeri": "50% 25%",
            "img/Gallery/Foto9.webp@galeri": "50% 39%",
            "img/lovestory2.webp@cerita": "50% 45%",
            "img/lovestory3.webp@cerita": "50% 49%",
        },
        
        navigasiBawah: false,      // true = tampilkan menu ikon di bawah layar (Mempelai, Acara, Galeri, Ucapan)
        teksPersonal: "UNDANGAN" // label di pojok sampul tema sinematik
    },

    // ==========================================
    // 1. PENGATURAN GLOBAL & LAYER 1 (BACKGROUND UTAMA)
    // ==========================================
    pengaturanGlobal: {
        // Kontrol Layer 1 Global
        tipeBackground: "statis", // Pilihan: "slider" | "video" | "statis"
        
        // Sumber Media Layer 1
        dataSlider: [
            "img/splash1.webp", 
            "img/splash2.webp", 
            "img/splash3.webp"
        ],
        dataVideo: "video/cinematic-wedding.mp4", // Dipanggil jika tipeBackground = "video"
        dataStatis: "img/latar-dasar.webp",       // Dipanggil jika tipeBackground = "statis"

        // Musik & Efek Visual
        fileMusik: "musik/musik.mp3",
        putarOtomatis: true,
        efekSalju: false // true or false
    },

    // ==========================================
    // 2. DATA SPLASHSCREEN (PINTU GERBANG)
    // ==========================================
    sectionSplash: {

        // --- KONTROL LAYER KHUSUS SECTION INI ---
        layerControl: {
            textureAktif: false,  // Layer 2 Menyala (Efek kertas)
            gambarStatis: "img/latar_statis.webp", // Layer 3 Menyala (Mengisi gambar khusus)
            overlayAktif: true,  // Layer 4 Menyala (Bisa diatur warnanya di theme.css)
            nilaiOverlay: 0.6,   // FITUR BARU: 0.0 (Bening) sampai 1.0 (Pekat)
            frameAktif: false    // Layer 5 Dimatikan (Tidak pakai bingkai di section ini)
        },

        namaPriaSingkat: "Nio",
        namaWanitaSingkat: "Ani",
        // Catatan: Nama Tamu otomatis diambil dari URL, tidak perlu ditulis di sini
    },

    // ==========================================
    // 3. SECTION HERO (SAMPUL DALAM)
    // ==========================================
    sectionHero: {
        tampilkan: true,
        
        // --- KONTROL LAYER KHUSUS SECTION INI ---
        layerControl: {
            textureAktif: false, // Mematikan Layer 2 (Tekstur)
            gambarStatis: "img/ornamen/texturekanan.png",    // Mematikan Layer 3 (Kosongkan jika tidak pakai gambar statis)
            overlayAktif: false,  // Menyalakan Layer 4 (Overlay)
            nilaiOverlay: 0.6,   // FITUR BARU: 0.0 (Bening) sampai 1.0 (Pekat)
            frameAktif: true     // Menyalakan Layer 5 (Ornamen Bingkai)
        },

        tanggalAcara: "Kamis, 22 Oktober 2026",
        teksSambutan: "Kami sangat menantikan kehadiran Anda"
    },

    // ==========================================
    // 4. SECTION QUOTE / AYAT (Opsional)
    // ==========================================
    sectionQuote: {
        tampilkan: true, // Ubah ke false jika klien tidak ingin ada ayat

        // --- KONTROL LAYER KHUSUS SECTION INI ---
        layerControl: {
            textureAktif: true,  // Layer 2 Menyala (Efek kertas)
            gambarStatis: "img/ornamen/texturekiriatas.png", // Layer 3 Menyala (Mengisi gambar khusus)
            overlayAktif: false,  // Layer 4 Menyala (Bisa diatur warnanya di theme.css)
            nilaiOverlay: 0.6,   // FITUR BARU: 0.0 (Bening) sampai 1.0 (Pekat)
            frameAktif: false    // Layer 5 Dimatikan (Tidak pakai bingkai di section ini)
        },

        isiKutipan: "Beberapa perjalanan membutuhkan waktu lebih lama dari yang dibayangkan, tetapi setiap langkahnya layak dijalani karena membawa kami ke momen ini, saat penantian berakhir dan selamanya di mulai.",
        sumberKutipan: "Nio & Ani"
    },

    // ==========================================
    // 5. SECTION MEMPELAI (Wajib)
    // ==========================================
    sectionMempelai: {
        tampilkan: true,
        
        // --- KONTROL LAYER KHUSUS SECTION INI ---
        layerControl: {
            textureAktif: true,  // Layer 2 Menyala (Efek kertas)
            gambarStatis: "img/ornamen/texturekanan.png", // Layer 3 Menyala (Mengisi gambar khusus)
            overlayAktif: false,  // Layer 4 Menyala (Bisa diatur warnanya di theme.css)
            nilaiOverlay: 0.6,   // FITUR BARU: 0.0 (Bening) sampai 1.0 (Pekat)
            frameAktif: true    // Layer 5 Dimatikan (Tidak pakai bingkai di section ini)
        },

        // Data Mempelai Pria
        pria: {
            namaLengkap: "Nimbrot Yufentus Foeh, S.TP",
            namaPanggilan: "",      // BARU (opsional): tulisan latin di atas nama, contoh "Albert"
            asal: "",               // BARU (opsional): kota asal, contoh "Kupang"
            namaAyah: "",
            namaIbu: "Anak ketiga dari lima bersaudara, pasangan Bapak Benyamin Foeh (alm.) & Ibu Elisabet Mooy (almh.)",
            foto: "img/pria.webp",
            linkInstagram: "@niofoeh"
        },
        
        // Data Mempelai Wanita
        wanita: {
            namaLengkap: "Anita Englin Henukh, S.Psi. Gr",
            namaPanggilan: "",
            asal: "",
            namaAyah: "",
            namaIbu: "Anak ketiga dari tiga bersaudara dari Bapak Mateos Henukh & Ibu Elisabet Ndun",
            foto: "img/wanita.webp",
            linkInstagram: "@anitahenukh"
        }
    },

    // ==========================================
    // 6. SECTION ACARA & MAPS (Wajib)
    // ==========================================
    sectionAcara: {
        tampilkan: true,

        // --- KONTROL LAYER KHUSUS SECTION INI ---
        layerControl: {
            textureAktif: true,  // Layer 2 Menyala (Efek kertas)
            gambarStatis: "img/latar_statis.webp", // Layer 3 Menyala (Mengisi gambar khusus)
            overlayAktif: true,  // Layer 4 Menyala (Bisa diatur warnanya di theme.css)
            nilaiOverlay: 0.6,   // FITUR BARU: 0.0 (Bening) sampai 1.0 (Pekat)
            frameAktif: false    // Layer 5 Dimatikan (Tidak pakai bingkai di section ini)
        },

        // Setup Hitung Mundur (Format: YYYY-MM-DDTHH:MM:SS)
        waktuCountdown: "2026-10-22T18:00:00",

        // BARU (opsional): daftar acara bebas. Jika diisi, kartu pinang/akad/resepsi di bawah DIABAIKAN.
        // Cocok untuk klien dengan susunan acara berbeda (Siraman, Ngunduh Mantu, dll).
        // Contoh:
        // daftarAcara: [
        //     { judul: "Akad", ikon: "fa-solid fa-ring", tanggal: "Rabu, 30 Desember 2026", jam: "10.00 - 11.00",
        //       lokasi: "Kediaman Mempelai Wanita", alamat: "Jl. ...", linkGoogleMaps: "https://maps.app.goo.gl/..." },
        // ],
        daftarAcara: [],

        // Data Akad Nikah / Pemberkatan
        pinang: {
            tampilkan: false, // true = tampilkan kartu pinang, false = hilangkan kartu pinang
            tanggal: "kamis, 09 Juli 2026",
            jam: "16:00 WITA - Selesai",
            lokasi: "Rumah Bapak Marthinus Adoe",
            alamat: "Jl. Tambur Nunbaun Delha ",
            linkGoogleMaps: "https://maps.app.goo.gl/tDcEU2pxVk9QGoj56?g_st=iwb",

        },

        akad: {
            tampilkan: true,
            tanggal: "Kamis, 22 Oktober 2026",
            jam: "10:00 WITA - Selesai",
            lokasi: "GMIT Eklesia Oehandi",
            alamat: "",
            linkGoogleMaps: "https://maps.app.goo.gl/RU2mvMuuEvFP5SyJ8",

        },

        
        // Data Resepsi
        resepsi: {
            tampilkan: true,
            tanggal: "Kamis, 22 Oktober 2026",
            jam: "18:00 WITA - Selesai",
            lokasi: "Rumah Bapak Mateos Henukh",
            alamat: "(Tekeme, Desa Mbokak, RBD)",
            linkGoogleMaps: "",

        },
        
        
    },

    // ==========================================
    // 6b. LIVE STREAMING (BARU, Opsional)
    // ==========================================
    sectionLiveStreaming: {
        tampilkan: false,
        teks: "Kami mengajak Anda yang tidak bisa hadir langsung untuk bergabung pada momen spesial kami melalui siaran langsung virtual dengan klik tombol berikut:",
        link: "",                 // link IG Live / YouTube / Zoom
        labelTombol: "Instagram",
        ikon: "fa-brands fa-instagram"
    },

    // ==========================================
    // 7. SECTION LOVE STORY (Opsional)
    // ==========================================
    sectionLoveStory: {
        tampilkan: true, // Contoh dimatikan. Mesin akan menghapus section ini.

        // --- KONTROL LAYER KHUSUS SECTION INI ---
        layerControl: {
            textureAktif: false,  // Layer 2 Menyala (Efek kertas)
            gambarStatis: "", // Layer 3 Menyala (Mengisi gambar khusus)
            overlayAktif: false,  // Layer 4 Menyala (Bisa diatur warnanya di theme.css)
            nilaiOverlay: 0.6,   // FITUR BARU: 0.0 (Bening) sampai 1.0 (Pekat)
            frameAktif: false    // Layer 5 Dimatikan (Tidak pakai bingkai di section ini)
        },

        cerita: [
            {
                tanggal: "",
                bulan: "",
                tahun: "",
                judul: "Cerita Awal Bertemu",
                cerita: "Diantara ribuan langkah dalam hidup, kami dipertemukan secara tak terduga di tahun 2021, sepertinya semesta memang sengaja merangkainya.",
                foto: "img/lovestory1.webp"
            },
            {
                tanggal: "",
                bulan: "",
                tahun: "",
                judul: "Sebuah Pengakuan",
                cerita: "Dihari-hari kami, tumbuhlah percakapan sederhana hadirlah kenyamanan, perlahan rasa itu tumbuh menjadi cinta. Kami berjalan bersama melewati segala cerita. Dalam perbedaan kami menemukan satu hal yang sama yaitu keinginan untuk terus melangkah bersama.",
                foto: "img/lovestory2.webp"
            },
            // {
            //     tanggal: "",
            //     bulan: "Agustus",
            //     tahun: "2025",
            //     judul: "Menjawab Petunjuk TUHAN",
            //     cerita: "Empat bulan lamanya hubungan kami hanya sekadar berteman dan menggantung. Namun, karena melihat ketulusan dan keseriusan calon suami, akhirnya pada bulan Agustus 2025 kami resmi menjalin hubungan. Dalam setiap kesempatan, ia menunjukkan kasih sayang kepada orang tua dan kerabat, serta memberikan diri melayani bersama sebagai pelayan TUHAN. Hal itu membuat saya semakin yakin bahwa inilah petunjuk dari TUHAN.",
            //     foto: "img/lovestory4.webp"
            // },
            {
                tanggal: "",
                bulan: "",
                tahun: "",
                judul: "Keputusan Mengikat Janji Suci",
                cerita: "Ditahun 2026 tepatnya hari ini, kami memulai babak baru. Bukanlah sekedar Aku dan kamu tapi Kita. Bukan sekedar cerita cinta tapi janji untuk seumur hidup. Dan inilah kisah kami yang kini berlanjut menjadi ikatan cinta.",
                foto: "img/lovestory3.webp"
            }
        ]
    },

    // ==========================================
    // 8. SECTION GALERI FOTO (Opsional)
    // ==========================================
    sectionGaleri: {
        tampilkan: true,

        // --- KONTROL LAYER KHUSUS SECTION INI ---
        layerControl: {
            textureAktif: true,  // Layer 2 Menyala (Efek kertas)
            gambarStatis: "", // Layer 3 Menyala (Mengisi gambar khusus)
            overlayAktif: false,  // Layer 4 Menyala (Bisa diatur warnanya di theme.css)
            nilaiOverlay: 0.6,   // FITUR BARU: 0.0 (Bening) sampai 1.0 (Pekat)
            frameAktif: false    // Layer 5 Dimatikan (Tidak pakai bingkai di section ini)
        },

        foto: [
            { src: "img/Gallery/Foto1.webp", title: "Moment 1", isLandscape: false }, // Ini akan memakan 2 kolom
            { src: "img/Gallery/Foto2.webp", title: "Moment 2", isLandscape: false }, 
            { src: "img/Gallery/Foto3.webp", title: "Moment 3", isLandscape: false },
            { src: "img/Gallery/Foto4.webp", title: "Moment 4", isLandscape: false },
            { src: "img/Gallery/Foto5.webp", title: "Moment 5", isLandscape: false },
            { src: "img/Gallery/Foto6.webp", title: "Moment 6", isLandscape: false },
            { src: "img/Gallery/Foto7.webp", title: "Moment 7", isLandscape: false },
            { src: "img/Gallery/Foto8.webp", title: "Moment 8", isLandscape: false },
            { src: "img/Gallery/Foto9.webp", title: "Moment 9", isLandscape: false },
            { src: "img/Gallery/Foto10.webp", title: "Moment 10", isLandscape: false },
            { src: "img/Gallery/Foto11.webp", title: "Moment 11", isLandscape: false },
            { src: "img/Gallery/Foto12.webp", title: "Moment 12", isLandscape: false },
            { src: "img/Gallery/Foto13.webp", title: "Moment 13", isLandscape: false },
        ]
    },

    
    // ==========================================
    // 9. SECTION WEDDING GIFT / REKENING (Opsional)
    // ==========================================
    sectionGift: {
        tampilkan: true,

        // --- KONTROL LAYER KHUSUS SECTION INI ---
        layerControl: {
            textureAktif: true,  // Layer 2 Menyala (Efek kertas)
            gambarStatis: "", // Layer 3 Menyala (Mengisi gambar khusus)
            overlayAktif: false,  // Layer 4 Menyala (Bisa diatur warnanya di theme.css)
            nilaiOverlay: 0.6,   // FITUR BARU: 0.0 (Bening) sampai 1.0 (Pekat)
            frameAktif: false    // Layer 5 Dimatikan (Tidak pakai bingkai di section ini)
        },

        rekening: [
            { bank: "BRI", nomor: "361801055055505", atasNama: "Anita Henukh" },
        ],
        alamatKado: "-"
    },

    // ==========================================
    // 10. TURUT MENGUNDANG
    // ==========================================
    turutMengundang: {
        enabled: true, // SETTING ADMIN: true (muncul), false (hilang total)

        // --- KONTROL LAYER KHUSUS SECTION INI ---
        layerControl: {
            textureAktif: true,  // Layer 2 Menyala (Efek kertas)
            gambarStatis: "", // Layer 3 Menyala (Mengisi gambar khusus)
            overlayAktif: false,  // Layer 4 Menyala (Bisa diatur warnanya di theme.css)
            nilaiOverlay: 0.6,   // FITUR BARU: 0.0 (Bening) sampai 1.0 (Pekat)
            frameAktif: true    // Layer 5 Dimatikan (Tidak pakai bingkai di section ini)
        },


        pria: [
            "Kel. Besar Foeh",
            "Kel. Besar Mooy",
            "Kel. Besar Haning",
            "Kel. Besar Pah",
            "Kel. Besar Adoe",
            "Kel. Besar Olla",
            "Kel. Besar Feosoru",
            "Kel. Besar Bapak  Bapak Jhoni A. Adu, S.T",
        ],

        wanita: [
            "Kel. Besar Henukh",
            "Kel. Besar Ndun",
            "Kel. Besar Bessie",
            "Kel. Besar Nappu",
            "Kel. Besar Messakh",
            "Kel. Besar Sanda",
            "Kel. Besar Manu",
            "Kel. Besar Foeh",
            "Kel. Bapak Bapak Mikael Manu",
            "Kel. Bapak Marsel Betharandy Wicherd Henukh"
        ]

    },

// ==========================================
    // 11. WISHES (RSVP & BUKU TAMU)
    // ==========================================
    wishes: {
        tampilkan: true, // Diubah agar seragam dengan engine

        layerControl: {
            textureAktif: true,
            gambarStatis: "",
            overlayAktif: false,
            nilaiOverlay: 0.6,
            frameAktif: true
        },

        displayType: "direct",
        // Link Google Script Anda
        googleSheetAppUrl: "https://script.google.com/macros/s/AKfycbw9gpdXIA4nk5Qto8CCMzBseNq6NGfykF0x7ICOz4TXDYbHZ_h9VpisLqU-ppBObXaT/exec" 
    },

    // ==========================================
    // 12. FOOTER (PENUTUP)
    // ==========================================
    footer: {
        tampilkan: true, // Tambahkan ini agar dikelola layer-engine

        layerControl: {
            textureAktif: true,
            gambarStatis: "img/footer.webp",
            overlayAktif: true,
            // nilaiOverlay:, // Footer biasanya agak gelap
            frameAktif: false
        },

        thanks: "Thank You", //
        quote: "", //Merupakan suatu kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu kepada kedua mempelai.
        salamPenutup: "", //Wassalamu'alaikum Wr. Wb.
        brandTag: "Made with love by Donahu Invitation",
        logo: "img/donahucreative.png" // Kosongkan jika tidak pakai logo
    }

};