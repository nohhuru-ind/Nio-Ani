// =========================================================================
// ATUR POSISI FOTO (atur-foto.js)
//
// 1. SELALU: menerapkan posisi/zoom foto dari data.js -> tampilan.posisiFoto
// 2. MODE ATUR (hanya untuk owner): buka link dengan ?atur=1
//      - geser foto dengan mouse / jari untuk memilih bagian yang tampil
//      - foto galeri & foto berjalan: zoom dengan scroll mouse atau slider
//      - tombol "Salin kode" -> tempel ke data.js di dalam tampilan: { ... }
//
// Format di data.js:
//   posisiFoto: {
//       "img/Gallery/Foto3.webp@galeri": "50% 20%",              // posisi saja
//       "img/Gallery/Foto1.webp@sampul": { posisi: "62% 30%" },
//       "img/Gallery/Foto5.webp@galeri": { posisi: "40% 10%", zoom: 1.3 },
//       "img/pria.webp": "50% 15%"     // tanpa @konteks = berlaku di semua tempat foto itu muncul
//   }
// Konteks: sampul, latar, galeri, berjalan, mempelai, cerita, hero, kutipan
// =========================================================================

(function () {
    if (typeof configUndangan === "undefined") return;
    var tampilan = configUndangan.tampilan = configUndangan.tampilan || {};
    var params = new URLSearchParams(location.search);
    var MODE_ATUR = params.get("atur") === "1";
    var KUNCI_SIMPAN = "donahuAturFoto:" + location.pathname.replace(/[^/]*$/, "");

    // ----- Daftar tempat foto & konteksnya -----
    var TARGET = [
        { sel: ".splash-bg-image", konteks: "sampul", bg: true },
        { sel: ".donahu-global-slide", konteks: "latar", bg: true },
        { sel: "#global-layer-1", konteks: "latar", bg: true, hanyaJikaAdaGambar: true },
        { sel: "#gallery-grid-wrapper .gallery-item img", konteks: "galeri", zoom: true },
        { sel: ".marquee-track img", konteks: "berjalan", zoom: true },
        { sel: "#foto-mempelai-pria, #foto-mempelai-wanita", konteks: "mempelai" },
        { sel: ".story-simple-img", konteks: "cerita" },
        { sel: ".hero-photo", konteks: "hero" },
        { sel: ".quote-photo", konteks: "kutipan" }
    ];

    // ----- Data posisi: data.js (+ perubahan sementara di mode atur) -----
    var posisi = {};
    Object.keys(tampilan.posisiFoto || {}).forEach(function (k) { posisi[k] = normal(tampilan.posisiFoto[k]); });
    if (MODE_ATUR) {
        try {
            var sementara = JSON.parse(localStorage.getItem(KUNCI_SIMPAN) || "{}");
            Object.keys(sementara).forEach(function (k) { posisi[k] = sementara[k]; });
        } catch (e) {}
    }

    function normal(v) {
        if (typeof v === "string") v = { posisi: v };
        var p = (v.posisi || "50% 50%").split(/\s+/);
        return { x: parseFloat(p[0]), y: parseFloat(p[1] != null ? p[1] : p[0]), zoom: v.zoom || 1 };
    }
    function srcDari(el, bg) {
        if (!bg) return el.getAttribute("src") || "";
        var m = (el.style.backgroundImage || "").match(/url\(["']?(.*?)["']?\)/);
        return m ? m[1] : "";
    }
    function kunci(src, konteks) { return src + "@" + konteks; }
    function ambil(src, konteks) { return posisi[kunci(src, konteks)] || posisi[src] || null; }

    function terapkan(el, t) {
        var src = srcDari(el, t.bg);
        if (!src) return;
        var p = ambil(src, t.konteks);
        var nilai = p ? (p.x + "% " + p.y + "%") : "";
        if (t.bg) {
            el.style.backgroundPosition = nilai || "center";
        } else {
            el.style.objectPosition = nilai;
            if (t.zoom) {
                var z = p ? p.zoom : 1;
                el.style.scale = z !== 1 ? String(z) : "";
                el.style.transformOrigin = z !== 1 ? nilai : "";
            }
        }
    }
    function semuaTarget(cb) {
        TARGET.forEach(function (t) {
            document.querySelectorAll(t.sel).forEach(function (el) {
                if (t.hanyaJikaAdaGambar && !srcDari(el, true)) return;
                cb(el, t);
            });
        });
    }
    function terapkanSemua() { semuaTarget(terapkan); }

    function mulai() {
        terapkanSemua();
        if (MODE_ATUR) siapkanModeAtur();
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mulai);
    else mulai();

    // =====================================================================
    // MODE ATUR
    // =====================================================================
    function siapkanModeAtur() {
        document.documentElement.classList.add("mode-atur");
        var ukuranAsli = {};   // cache ukuran asli gambar (untuk menghitung jarak geser)
        var aktif = null;      // { el, t, src }

        // ---------- gaya tampilan mode atur ----------
        var gaya = document.createElement("style");
        gaya.textContent = [
            "html.mode-atur .atur-target{cursor:grab;outline:2px dashed rgba(255,196,0,.9);outline-offset:-2px;touch-action:none;-webkit-user-drag:none;user-select:none}",
            "html.mode-atur .atur-target.atur-pilih{outline:3px solid #ffc400}",
            "html.mode-atur .atur-target:active{cursor:grabbing}",
            "html.mode-atur .splash-content-wrapper{pointer-events:none}",
            "html.mode-atur .splash-content-wrapper a{pointer-events:auto}",
            "html.atur-latar #donahu-scroll-wrapper{pointer-events:none;opacity:.12;transition:opacity .3s}",
            "html.atur-latar #global-layer-1{z-index:5}",
            "html.atur-latar .donahu-global-slide:not(.active-slide){pointer-events:none}",
            "html.atur-latar #global-layer-1::after{display:none}",
            "#panel-atur{position:fixed;left:8px;right:8px;bottom:8px;z-index:200000;background:#fff;color:#222;border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,.35);font:12px/1.4 system-ui,sans-serif;padding:10px 12px;max-width:560px;margin:0 auto;text-shadow:none}",
            "#panel-atur b{font-size:13px}#panel-atur .baris{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-top:6px}",
            "#panel-atur button{font:inherit;border:1px solid #ccc;background:#f6f6f6;border-radius:6px;padding:5px 9px;cursor:pointer}",
            "#panel-atur button.utama{background:#8E0F24;border-color:#8E0F24;color:#fff}",
            "#panel-atur .nama{font-family:ui-monospace,monospace;font-size:11px;color:#8E0F24;word-break:break-all}",
            "#panel-atur input[type=range]{flex:1;min-width:120px}",
            "#panel-atur.kecil .isi{display:none}",
            "#panel-atur textarea{width:100%;height:120px;font:11px ui-monospace,monospace;margin-top:6px}"
        ].join("\n");
        document.head.appendChild(gaya);

        // ---------- panel ----------
        var panel = document.createElement("div");
        panel.id = "panel-atur";
        panel.innerHTML =
            '<div class="baris" style="margin:0;justify-content:space-between"><b>Mode Atur Foto</b>' +
            '<span><button data-a="kecil">_</button> <button data-a="keluar">Keluar</button></span></div>' +
            '<div class="isi">' +
            '<div style="margin-top:4px;color:#666">Geser foto untuk memilih bagian yang tampil. Foto galeri: scroll mouse untuk zoom.</div>' +
            '<div class="baris"><span>Dipilih:</span><span class="nama" id="atur-nama">— klik / geser sebuah foto —</span></div>' +
            '<div class="baris"><span id="atur-nilai">posisi: -</span></div>' +
            '<div class="baris" id="atur-baris-zoom" style="display:none"><span>Zoom</span><input type="range" id="atur-zoom" min="1" max="2.5" step="0.05" value="1"><span id="atur-zoom-n">1.00x</span></div>' +
            '<div class="baris">' +
            '<button data-a="reset">Reset foto ini</button>' +
            (document.getElementById("global-layer-1") ? '<button data-a="latar">Atur foto latar</button><button data-a="latar-geser" style="display:none">Foto latar berikutnya ›</button>' : "") +
            '<button class="utama" data-a="salin">Salin kode</button>' +
            '<button data-a="hapus">Hapus semua perubahan</button>' +
            '</div><div id="atur-kode"></div></div>';
        document.body.appendChild(panel);
        var elNama = panel.querySelector("#atur-nama"), elNilai = panel.querySelector("#atur-nilai");
        var barisZoom = panel.querySelector("#atur-baris-zoom"), inZoom = panel.querySelector("#atur-zoom"), elZoomN = panel.querySelector("#atur-zoom-n");

        // Bawa ?atur=1 ke halaman dalam saat tombol Buka Undangan ditekan
        var btnBuka = document.getElementById("btn-gateway-buka");
        if (btnBuka) btnBuka.href = "main.html" + location.search;

        // ---------- tandai semua foto yang bisa diatur ----------
        function tandai() {
            semuaTarget(function (el, t) {
                if (el.__atur) return;
                el.__atur = t;
                el.classList.add("atur-target");
                el.addEventListener("pointerdown", function (e) { mulaiGeser(e, el, t); });
                el.addEventListener("dragstart", function (e) { e.preventDefault(); });
                if (t.zoom) el.addEventListener("wheel", function (e) {
                    e.preventDefault(); pilih(el, t);
                    ubahZoom(aktifData().zoom * (e.deltaY < 0 ? 1.05 : 1 / 1.05));
                }, { passive: false });
            });
        }
        tandai();
        setTimeout(tandai, 1500);

        // Galeri: jangan buka lightbox saat mode atur
        document.addEventListener("click", function (e) {
            if (e.target.closest && e.target.closest(".atur-target")) { e.preventDefault(); e.stopPropagation(); }
        }, true);

        function aktifData() {
            if (!aktif) return { x: 50, y: 50, zoom: 1 };
            var k = kunci(aktif.src, aktif.t.konteks);
            if (!posisi[k]) {
                var lama = ambil(aktif.src, aktif.t.konteks);
                posisi[k] = lama ? { x: lama.x, y: lama.y, zoom: lama.zoom } : { x: 50, y: 50, zoom: 1 };
            }
            return posisi[k];
        }

        function pilih(el, t) {
            document.querySelectorAll(".atur-pilih").forEach(function (x) { x.classList.remove("atur-pilih"); });
            el.classList.add("atur-pilih");
            aktif = { el: el, t: t, src: srcDari(el, t.bg) };
            elNama.textContent = kunci(aktif.src, t.konteks);
            barisZoom.style.display = t.zoom ? "" : "none";
            perbaruiInfo();
        }

        function perbaruiInfo() {
            var d = aktifData();
            elNilai.textContent = "posisi: " + d.x.toFixed(0) + "% " + d.y.toFixed(0) + "%" + (aktif && aktif.t.zoom ? "   zoom: " + d.zoom.toFixed(2) + "x" : "");
            inZoom.value = d.zoom; elZoomN.textContent = d.zoom.toFixed(2) + "x";
        }

        function simpanSementara() {
            var ubah = {};
            Object.keys(posisi).forEach(function (k) { ubah[k] = posisi[k]; });
            try { localStorage.setItem(KUNCI_SIMPAN, JSON.stringify(ubah)); } catch (e) {}
        }

        // Terapkan ke SEMUA elemen yang menampilkan foto & konteks yang sama (mis. foto berjalan ganda)
        function terapkanSeKelompok() {
            semuaTarget(function (el, t) {
                if (t.konteks === aktif.t.konteks && srcDari(el, t.bg) === aktif.src) terapkan(el, t);
            });
        }

        function ukuran(src, cb) {
            if (ukuranAsli[src]) return cb(ukuranAsli[src]);
            var im = new Image();
            im.onload = function () { ukuranAsli[src] = { w: im.naturalWidth, h: im.naturalHeight }; cb(ukuranAsli[src]); };
            im.src = src;
        }

        function mulaiGeser(e, el, t) {
            if (e.button !== undefined && e.button !== 0) return;
            e.preventDefault();
            pilih(el, t);
            var d = aktifData();
            var awal = { x: e.clientX, y: e.clientY, px: d.x, py: d.y };
            ukuran(aktif.src, function (asli) {
                var r = el.getBoundingClientRect();
                var lebar = r.width, tinggi = r.height;
                if (!t.bg) {   // area isi gambar (tanpa padding polaroid)
                    var cs = getComputedStyle(el);
                    lebar -= parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
                    tinggi -= parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
                }
                var skala = Math.max(lebar / asli.w, tinggi / asli.h) * (t.zoom ? d.zoom : 1);
                var lebihX = asli.w * skala - lebar, lebihY = asli.h * skala - tinggi;
                el.setPointerCapture && el.setPointerCapture(e.pointerId);
                function gerak(ev) {
                    var dx = ev.clientX - awal.x, dy = ev.clientY - awal.y;
                    if (lebihX > 1) d.x = Math.max(0, Math.min(100, awal.px - dx / lebihX * 100));
                    if (lebihY > 1) d.y = Math.max(0, Math.min(100, awal.py - dy / lebihY * 100));
                    terapkanSeKelompok(); perbaruiInfo();
                }
                function selesai() {
                    el.removeEventListener("pointermove", gerak);
                    el.removeEventListener("pointerup", selesai);
                    el.removeEventListener("pointercancel", selesai);
                    simpanSementara();
                }
                el.addEventListener("pointermove", gerak);
                el.addEventListener("pointerup", selesai);
                el.addEventListener("pointercancel", selesai);
            });
        }

        function ubahZoom(z) {
            if (!aktif || !aktif.t.zoom) return;
            aktifData().zoom = Math.max(1, Math.min(2.5, z));
            terapkanSeKelompok(); perbaruiInfo(); simpanSementara();
        }
        inZoom.addEventListener("input", function () { ubahZoom(parseFloat(inZoom.value)); });

        function buatKode() {
            var baris = Object.keys(posisi).sort().filter(function (k) {
                // lewati foto yang hanya diklik (masih di tengah & tanpa zoom)
                var d = posisi[k];
                return !(Math.round(d.x) === 50 && Math.round(d.y) === 50 && Math.abs((d.zoom || 1) - 1) < 0.001);
            }).map(function (k) {
                var d = posisi[k], p = Math.round(d.x) + "% " + Math.round(d.y) + "%";
                var v = (d.zoom && Math.abs(d.zoom - 1) > 0.001) ? '{ posisi: "' + p + '", zoom: ' + (+d.zoom.toFixed(2)) + " }" : '"' + p + '"';
                return '            "' + k + '": ' + v + ",";
            });
            return "        posisiFoto: {\n" + baris.join("\n") + "\n        },";
        }

        panel.addEventListener("click", function (e) {
            var a = e.target.getAttribute && e.target.getAttribute("data-a");
            if (!a) return;
            if (a === "kecil") panel.classList.toggle("kecil");
            if (a === "keluar") { params.delete("atur"); location.search = params.toString(); }
            if (a === "reset" && aktif) {
                delete posisi[kunci(aktif.src, aktif.t.konteks)];
                terapkanSeKelompok(); perbaruiInfo(); simpanSementara();
            }
            if (a === "hapus" && confirm("Hapus semua perubahan posisi yang belum disalin ke data.js?")) {
                try { localStorage.removeItem(KUNCI_SIMPAN); } catch (x) {}
                location.reload();
            }
            if (a === "latar") {
                var on = document.documentElement.classList.toggle("atur-latar");
                window.donahuJedaSlider = on;
                e.target.textContent = on ? "Selesai atur latar" : "Atur foto latar";
                var g = panel.querySelector('[data-a="latar-geser"]'); if (g) g.style.display = on ? "" : "none";
                if (on) { var s = document.querySelector(".donahu-global-slide.active-slide") || document.getElementById("global-layer-1"); if (s && s.__atur) pilih(s, s.__atur); }
            }
            if (a === "latar-geser") {
                var sl = Array.prototype.slice.call(document.querySelectorAll(".donahu-global-slide"));
                if (sl.length) {
                    var i = sl.findIndex(function (s) { return s.classList.contains("active-slide"); });
                    sl[i].classList.remove("active-slide");
                    var n = sl[(i + 1) % sl.length]; n.classList.add("active-slide"); pilih(n, n.__atur);
                }
            }
            if (a === "salin") {
                var kode = buatKode();
                var box = panel.querySelector("#atur-kode");
                box.innerHTML = '<div style="margin-top:6px">Tempel di <b>js/data.js</b>, di dalam <b>tampilan: { ... }</b> (ganti baris posisiFoto yang lama):</div><textarea readonly></textarea>';
                var ta = box.querySelector("textarea"); ta.value = kode; ta.select();
                if (navigator.clipboard) navigator.clipboard.writeText(kode).then(function () {
                    e.target.textContent = "Tersalin ✓"; setTimeout(function () { e.target.textContent = "Salin kode"; }, 1500);
                }).catch(function () {});
            }
        });
    }
})();
