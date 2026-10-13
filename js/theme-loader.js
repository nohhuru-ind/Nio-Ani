// =========================================================================
// PEMUAT TEMA DONAHU (theme-loader.js)
// Dipanggil di <head>, TEPAT SETELAH data.js dan SETELAH semua file CSS dasar.
//
// Tugas:
//   1. Menentukan tema aktif   -> configUndangan.tampilan.tema (atau ?tema=xxx di URL untuk preview)
//   2. Memuat file CSS tema    -> css/themes/<tema>.css
//   3. Menerapkan preset tema  -> pengaturan bawaan tema (urutan section, latar, dll)
//   4. Menerapkan override     -> tampilan.warna & tampilan.font (tanpa menyentuh CSS)
//
// Menambah tema baru = buat file css/themes/<nama>.css (+ preset opsional di bawah).
// =========================================================================

(function () {
    // "const configUndangan" di data.js tidak menempel ke window, jadi dibaca langsung lewat namanya
    var cfg = (typeof configUndangan !== "undefined") ? configUndangan : null;
    if (!cfg) return;

    cfg.tampilan = cfg.tampilan || {};
    cfg.pengaturanGlobal = cfg.pengaturanGlobal || {};
    var tampilan = cfg.tampilan;

    // -------------------------------------------------------------------------
    // 1. TENTUKAN TEMA
    //    ?tema=sinematik di URL = mode preview (berguna untuk mengirim pilihan desain ke klien).
    //    Matikan dengan tampilan.izinkanPreviewTema = false saat undangan final dibagikan.
    // -------------------------------------------------------------------------
    var params = new URLSearchParams(window.location.search);
    var temaURL = params.get("tema");
    var tema = tampilan.tema || "klasik";
    if (temaURL && tampilan.izinkanPreviewTema !== false && /^[a-z0-9-]+$/i.test(temaURL)) {
        tema = temaURL.toLowerCase();
    }
    tampilan.tema = tema;
    document.documentElement.setAttribute("data-tema", tema);

    // Varian warna dalam satu tema (contoh sinematik: "gelap" | "terang" | "hangat")
    // Preview tanpa edit file: ?varian=terang
    var varianURL = params.get("varian");
    var varian = (varianURL && tampilan.izinkanPreviewTema !== false && /^[a-z0-9-]+$/i.test(varianURL))
        ? varianURL.toLowerCase() : (tampilan.varian || "");
    if (varian) document.documentElement.setAttribute("data-varian", varian);

    // Transisi saat tombol "Buka Undangan" ditekan: "amplop" | "cahaya" | "tirai"
    // Bawaan: tema klasik = amplop, tema lain = cahaya
    var transisi = tampilan.transisiBuka || (tema === "klasik" ? "amplop" : "cahaya");
    document.documentElement.setAttribute("data-transisi", transisi);
    // Di halaman dalam (main.html): lanjutkan transisi dari sampul
    try {
        var masuk = sessionStorage.getItem("donahuTransisi");
        if (masuk) {
            sessionStorage.removeItem("donahuTransisi");
            document.documentElement.classList.add("masuk-" + masuk);
            setTimeout(function () { document.documentElement.classList.remove("masuk-" + masuk); }, 2600);
        }
    } catch (x) {}

    // -------------------------------------------------------------------------
    // 2. MUAT CSS TEMA (klasik = gaya bawaan theme.css, tidak perlu file tambahan)
    //    document.write dipakai agar CSS tema ikut "render-blocking" -> tidak ada kedipan tampilan lama.
    // -------------------------------------------------------------------------
    if (tema !== "klasik") {
        var versi = tampilan.versiCSS || "1";
        document.write('<link rel="stylesheet" id="css-tema-aktif" href="css/themes/' + tema + '.css?v=' + versi + '">');
    }

    // -------------------------------------------------------------------------
    // 3. PRESET TEMA
    //    Hanya mengisi nilai yang BELUM diatur klien di data.js (data klien selalu menang).
    // -------------------------------------------------------------------------
    var fotoGaleri = (cfg.sectionGaleri && cfg.sectionGaleri.foto || []).map(function (f) { return f.src; });

    var PRESET_TEMA = {
        sinematik: function () {
            if (!tampilan.urutanSection || !tampilan.urutanSection.length) {
                tampilan.urutanSection = [
                    "sectionHero", "sectionQuote", "sectionMempelai", "sectionAcara",
                    "sectionLiveStreaming", "sectionGaleri", "sectionLoveStory",
                    "wishes", "sectionGift", "turutMengundang", "footer"
                ];
            }

            if (cfg.sectionAcara && !cfg.sectionAcara.labelTombolMaps) cfg.sectionAcara.labelTombolMaps = "Google Map";

            // Latar foto sinematik penuh layar yang berganti (slider)
            if (tampilan.latarDariTema !== false) {
                var fotoLatar = (tampilan.fotoLatar && tampilan.fotoLatar.length) ? tampilan.fotoLatar : fotoGaleri.slice(0, 6);
                if (fotoLatar.length) {
                    cfg.pengaturanGlobal.tipeBackground = "slider";
                    cfg.pengaturanGlobal.dataSlider = fotoLatar;
                }
                // Foto sampul (cover/splash)
                var sampul = tampilan.fotoSampul || fotoLatar[0] || "";
                if (sampul && cfg.sectionSplash) {
                    cfg.sectionSplash.layerControl = cfg.sectionSplash.layerControl || {};
                    cfg.sectionSplash.layerControl.gambarStatis = sampul;
                    cfg.sectionSplash.layerControl.overlayAktif = true;
                }
            }
        }
    };

    if (PRESET_TEMA[tema]) PRESET_TEMA[tema]();

    // -------------------------------------------------------------------------
    // 4. OVERRIDE WARNA & FONT TANPA EDIT CSS
    //    tampilan.warna = { aksen: "#FFD867" }            -> --t-aksen
    //    tampilan.warna = { "--warna-utama": "#8a6d3b" }  -> nama variabel CSS langsung
    //    tampilan.font  = { script: "'Allura', cursive" } -> --t-font-script
    // -------------------------------------------------------------------------
    function terapkanToken(obj, prefix) {
        if (!obj) return;
        Object.keys(obj).forEach(function (k) {
            var nama = k.indexOf("--") === 0 ? k : prefix + k;
            document.documentElement.style.setProperty(nama, obj[k]);
        });
    }
    terapkanToken(tampilan.warna, "--t-");
    terapkanToken(tampilan.font, "--t-font-");

    // Font Google tambahan yang diminta klien (opsional): tampilan.googleFonts = ["Allura", "Cinzel:wght@400;700"]
    if (tampilan.googleFonts && tampilan.googleFonts.length) {
        var fam = tampilan.googleFonts.map(function (f) { return "family=" + f.replace(/ /g, "+"); }).join("&");
        document.write('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?' + fam + '&display=swap">');
    }
})();
