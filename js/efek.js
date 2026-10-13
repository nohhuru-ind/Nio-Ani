// =========================================================================
// MESIN EFEK SCROLL PER TEMA (efek.js)
// Dimuat SETELAH script.js (agar galeri, love story, kartu acara sudah dirender).
//
// Cara kerja:
//   1. Ambil "peta efek" milik tema aktif (EFEK_TEMA di bawah)
//   2. Tempelkan kelas efek (fx-muncul, fx-zoom, ...) ke elemen yang cocok,
//      sekaligus melepas animasi lama tema klasik pada elemen itu agar tidak bentrok
//   3. Jalankan animasi saat elemen masuk layar
//
// Pengaturan di data.js -> tampilan:
//   efek: true | false        -> matikan semua efek tema
//   efekUlang: true | false   -> true = animasi diulang setiap kali elemen masuk layar lagi
//
// Daftar efek (gaya di css/animations.css bagian "EFEK TEMA"):
//   muncul       naik dari bawah sambil membesar halus
//   muncul-atas  turun dari atas (jeda 0.5 dtk)
//   muncul-kiri  masuk dari kiri
//   muncul-kanan masuk dari kanan
//   zoom         membesar dari 50%
//   galeri       membesar dari 50% + memudar, berurutan per foto
//   pudar        hanya memudar
//   polos        lepaskan animasi lama tanpa efek baru
// =========================================================================

(function () {
    // [selector, efek, jeda (ms), jeda bertahap per item (ms)]
    var EFEK_TEMA = {
        sinematik: [
            // Hero
            ["#section-hero .hero-personal", "pudar", 200],
            ["#section-hero .sub-title", "muncul", 300],
            ["#section-hero h1", "muncul", 500],
            ["#section-hero .Tanggal-acara", "muncul", 700],

            // Hitung mundur, kutipan, foto berjalan
            ["#section-quote .countdown-box-wrapper", "muncul", 0],
            ["#section-quote .quote-card-box", "muncul", 150],
            ["#section-quote .marquee-container", "muncul", 250],

            // Mempelai
            ["#section-mempelai .mempelai-container-shadow", "polos"],
            ["#section-mempelai .pembuka-salam", "muncul", 0],
            ["#section-mempelai .pembuka-teks", "muncul", 150],
            ["#section-mempelai .avatar-wrapper img", "muncul-atas", 0],
            ["#section-mempelai .mempelai-panggilan", "muncul", 0],
            ["#section-mempelai .mempelai-card h2", "muncul", 100],
            ["#section-mempelai .mempelai-asal", "muncul", 200],
            ["#section-mempelai .ortu-info", "muncul", 250],
            ["#section-mempelai .btn-insta", "muncul", 300],
            ["#section-mempelai .wedding-separator", "muncul", 0],

            // Acara
            ["#section-acara .event-tittle", "muncul", 0],
            ["#acara-list .event-card-info", "zoom", 0],
            ["#acara-list .event-card-info h3", "muncul-atas", 0],
            ["#acara-list .ev-ikon", "muncul", 300],
            ["#acara-list .event-time", "zoom", 350],
            ["#acara-list i.fa-map-location-dot", "muncul", 400],
            ["#acara-list .event-place", "muncul", 450],
            ["#acara-list .btn-action-link", "muncul", 550],

            // Live streaming
            ["#section-live .title-section-global", "muncul", 0],
            ["#section-live .live-teks", "muncul", 150],
            ["#section-live .btn-live", "zoom", 300],

            // Galeri: judul lalu foto satu per satu
            ["#section-galeri .title-section-global", "muncul", 0],
            ["#section-galeri .subtitle-galeri", "muncul", 150],
            ["#gallery-grid-wrapper", "polos"],
            ["#gallery-grid-wrapper .gallery-item", "galeri", 0, 90],

            // Love story
            ["#section-love-story .title-section-global", "muncul", 0],
            ["#story-timeline-wrapper", "muncul", 0],
            ["#story-timeline-wrapper .story-simple-img", "zoom", 0],
            ["#story-timeline-wrapper .story-simple-date", "muncul", 150],
            ["#story-timeline-wrapper .story-simple-title", "muncul", 250],
            ["#story-timeline-wrapper .story-simple-desc", "muncul", 350],

            // RSVP & ucapan
            ["#section-rsvp .title-section-global", "muncul", 0],
            ["#section-rsvp .rsvp-subtitle", "muncul", 150],
            ["#section-rsvp .rsvp-form-box", "muncul", 250],
            ["#section-rsvp .comments-display-wrapper", "muncul", 0],

            // Hadiah
            ["#section-gift .title-section-global", "muncul", 0],
            ["#section-gift .gift-caption", "muncul", 150],
            ["#section-gift .btn-kirim-gift", "muncul", 300],

            // Turut mengundang & penutup
            ["#section-turut-mengundang .turut-container-shadow", "muncul", 0],
            ["#section-turut-mengundang .turut-title", "polos"],
            ["#section-turut-mengundang .turut-column", "polos"],
            ["#section-footer .teks-thanks", "muncul", 0],
            ["#section-footer .donahu-splash__divider", "pudar", 200],
            ["#section-footer .footer-mempelai-nama", "muncul", 300]
        ]
    };

    function jalankan() {
        if (typeof configUndangan === "undefined") return;
        var tampilan = configUndangan.tampilan || {};
        var peta = EFEK_TEMA[tampilan.tema];
        if (!peta || tampilan.efek === false) return;
        if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        var daftar = [];
        peta.forEach(function (baris) {
            var sel = baris[0], efek = baris[1], jeda = baris[2] || 0, bertahap = baris[3] || 0;
            document.querySelectorAll(sel).forEach(function (el, i) {
                // lepas animasi lama (tema klasik) agar tidak bertabrakan
                el.classList.remove("on-scroll", "is-visible");
                Array.prototype.slice.call(el.classList).forEach(function (c) {
                    if (/^(anim-|delay-|speed-)/.test(c)) el.classList.remove(c);
                });
                if (efek === "polos") return;
                el.classList.add("fx", "fx-" + efek);
                // jeda bertahap dibatasi agar foto ke-20 tidak menunggu terlalu lama
                var total = jeda + Math.min(i, 8) * bertahap;
                if (total) el.style.setProperty("--fx-jeda", total + "ms");
                daftar.push(el);
            });
        });

        var ulang = tampilan.efekUlang === true;
        var pengamat = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (en.isIntersecting) {
                    en.target.classList.add("fx-aktif");
                    if (!ulang) pengamat.unobserve(en.target);
                } else if (ulang) {
                    en.target.classList.remove("fx-aktif");
                }
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });

        daftar.forEach(function (el) { pengamat.observe(el); });
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", jalankan);
    else jalankan();
})();
