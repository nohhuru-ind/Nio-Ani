// =========================================================================
// SCRIPT INTERAKSI & INJEKSI DATA (script.js)
// Tugas: Memasukkan teks konten, Hitung Mundur, Pemutar Musik, & Live RSVP
// =========================================================================

document.addEventListener("DOMContentLoaded", function () {
    
    // Keamanan: Cek apakah database tersedia
    if (typeof configUndangan === "undefined") {
        console.error("CRITICAL ERROR: data.js tidak terbaca.");
        return;
    }

    // Pengaman teks: mencegah data (terutama ucapan tamu) dieksekusi sebagai HTML/skrip
    const esc = (v) => String(v == null ? "" : v)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    const setTeks = (id, teks) => { const el = document.getElementById(id); if (el) el.innerText = teks || ""; return el; };

    // =========================================================================
    // 1. INJEKSI TEKS KONTEN (Quote, Mempelai, Acara)
    // =========================================================================

    // --- A. Section Quote ---
    if (configUndangan.sectionQuote && configUndangan.sectionQuote.tampilkan) {
        document.getElementById("text-quote-ayat").innerText = configUndangan.sectionQuote.isiKutipan;
        document.getElementById("sumber-quote-ayat").innerText = configUndangan.sectionQuote.sumberKutipan;
    }

    // --- B. Section Mempelai ---
    if (configUndangan.sectionMempelai && configUndangan.sectionMempelai.tampilkan) {
        const isiMempelai = (data, g, label) => {
            if (!data) return;
            setTeks(`nama-mempelai-${g}`, data.namaLengkap);
            setTeks(`panggilan-${g}`, data.namaPanggilan);   // kosong -> otomatis tersembunyi (CSS :empty)
            setTeks(`asal-${g}`, data.asal);

            // Keterangan orang tua (kompatibel dengan format lama):
            //  - keteranganOrtu diisi        -> dipakai apa adanya
            //  - namaAyah & namaIbu diisi    -> "Putra dari Bapak X & Ibu Y"
            //  - hanya namaIbu (format lama) -> dipakai apa adanya
            let ortu = data.keteranganOrtu || "";
            if (!ortu && data.namaAyah && data.namaIbu) ortu = `${label} dari Bapak ${data.namaAyah} & Ibu ${data.namaIbu}`;
            if (!ortu) ortu = data.namaIbu || data.namaAyah || "";
            setTeks(`ortu-mempelai-${g}`, ortu);

            const foto = document.getElementById(`foto-mempelai-${g}`);
            if (foto && data.foto) foto.src = data.foto;

            const insta = document.getElementById(`insta-${g}`);
            if (insta) {
                if (data.linkInstagram) {
                    insta.href = `https://instagram.com/${data.linkInstagram.replace('@', '')}`;
                    insta.target = "_blank";
                    insta.querySelector('.insta-text').innerText = data.linkInstagram;
                } else {
                    insta.remove();
                }
            }
        };
        isiMempelai(configUndangan.sectionMempelai.pria, "pria", "Putra");
        isiMempelai(configUndangan.sectionMempelai.wanita, "wanita", "Putri");
    }

    // --- C. Section Acara ---
    if (configUndangan.sectionAcara && configUndangan.sectionAcara.tampilkan) {
        const acara = configUndangan.sectionAcara;

        // Format waktu: <tanggal> / <jam>. Pemisah "|" tetap tampil di tema klasik, tema lain bisa menyembunyikannya.
        const htmlWaktu = (ev) =>
            `<i class="fa-regular fa-calendar ev-ikon komponen-tema"></i>` +
            `<span class="ev-tanggal">${esc(ev.tanggal)}</span><br>` +
            `<span class="ev-jam"><span class="ev-sep">| </span>${esc(ev.jam)}<span class="ev-sep"> |</span></span>`;
        const htmlTempat = (ev) =>
            `<span class="ev-lokasi">${esc(ev.lokasi)}</span>` + (ev.alamat ? `<br><span class="ev-alamat">${esc(ev.alamat)}</span>` : "");

        const labelMaps = esc(acara.labelTombolMaps || "Lihat Link");
        const daftar = Array.isArray(acara.daftarAcara) ? acara.daftarAcara.filter(e => e && e.tampilkan !== false) : [];
        const list = document.getElementById("acara-list");

        if (daftar.length && list) {
            // MODE BARU: daftar acara bebas (jumlah & nama acara sesuai klien)
            list.innerHTML = daftar.map((ev, i) => `
                <div class="event-card-info">
                    <h3><i class="${esc(ev.ikon || "fa-solid fa-calendar-check")}"></i> ${esc(ev.judul)}</h3>
                    <p class="event-time anim-zoom-in delay-200 speed-slow on-scroll">${htmlWaktu(ev)}</p>
                    <i class="fa-solid fa-map-location-dot anim-float-in-up delay-300 speed-slow on-scroll"></i>
                    <p class="event-place anim-zoom-in delay-200 speed-slow on-scroll">${htmlTempat(ev)}</p>
                    ${ev.linkGoogleMaps ? `<a href="${esc(ev.linkGoogleMaps)}" target="_blank" rel="noopener" class="btn-action-link"><span class="label-maps">${labelMaps}</span></a>` : ""}
                </div>`).join("");
        } else {
            // MODE LAMA: 3 kartu tetap (pinang / akad / resepsi)
            ["pinang", "akad", "resepsi"].forEach(k => {
                const card = document.getElementById(`card-${k}`);
                const ev = acara[k];
                if (!card) return;
                if (!ev || !ev.tampilkan) { card.style.display = "none"; return; }   // (bug lama: variabel cardPinang tidak terdefinisi)
                document.getElementById(`waktu-${k}`).innerHTML = htmlWaktu(ev);
                document.getElementById(`lokasi-${k}`).innerHTML = htmlTempat(ev);
                const btn = document.getElementById(`btn-maps-${k}`);
                if (btn) {
                    if (ev.linkGoogleMaps) { btn.href = ev.linkGoogleMaps; btn.innerHTML = `<span class="label-maps">${labelMaps}</span>`; }
                    else btn.remove();
                }
            });
        }

        // =========================================================================
        // 2. LOGIKA HITUNG MUNDUR (COUNTDOWN)
        // =========================================================================
        const countDownDate = new Date(acara.waktuCountdown).getTime();
        
        if (countDownDate && document.getElementById("cd-hari")) {
            const timerInterval = setInterval(function() {
                const now = new Date().getTime();
                const distance = countDownDate - now;

                if (distance < 0) {
                    clearInterval(timerInterval);
                    document.getElementById("cd-hari").innerText = "00";
                    document.getElementById("cd-jam").innerText = "00";
                    document.getElementById("cd-menit").innerText = "00";
                    document.getElementById("cd-detik").innerText = "00";
                    return;
                }

                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);

                document.getElementById("cd-hari").innerText = days < 10 ? "0" + days : days;
                document.getElementById("cd-jam").innerText = hours < 10 ? "0" + hours : hours;
                document.getElementById("cd-menit").innerText = minutes < 10 ? "0" + minutes : minutes;
                document.getElementById("cd-detik").innerText = seconds < 10 ? "0" + seconds : seconds;
            }, 1000); 
        }
    }

    // =========================================================
    // --- SISTEM RENDER MARQUEE (FOTO BERJALAN DI OPENING) ---
    // =========================================================
    const marqueeTrack = document.getElementById('quote-marquee-track');
    const marqueeData = configUndangan.sectionGaleri && configUndangan.sectionGaleri.foto; // Mengambil dari data.js yang sama!

    if (marqueeData && marqueeTrack) {
        let imagesHTML = '';
        
        // 1. Kumpulkan semua foto menjadi satu baris kode HTML
        marqueeData.forEach(item => {
            // Kita tidak memasukkan class gallery-item agar tidak bentrok dengan CSS Galeri Utama
            imagesHTML += `<img src="${item.src}" alt="${item.title}" loading="lazy">`;
        });

        // 2. Trik Infinite Loop: Suntikkan foto tersebut 2 KALI (Duplikasi) ke dalam track
        marqueeTrack.innerHTML = imagesHTML + imagesHTML;
    }



    // --- Live Streaming (opsional) ---
    const live = configUndangan.sectionLiveStreaming;
    if (live && live.tampilkan === true) {
        setTeks("live-teks", live.teks);
        setTeks("live-label", live.labelTombol || "Tonton");
        const ikon = document.getElementById("live-ikon");
        if (ikon && live.ikon) ikon.className = live.ikon;
        const a = document.getElementById("live-link");
        if (a) { if (live.link) a.href = live.link; else a.remove(); }
    }

    // =========================================================================
    // 4. POPULASI DATA SEGMEN AKHIR (Story, Galeri, Kado, Turut Mengundang)
    // =========================================================================

    // --- A. Render Linimasa Kisah Cinta ---
    if (configUndangan.sectionLoveStory && configUndangan.sectionLoveStory.tampilkan) {
        const storyWrapper = document.getElementById("story-timeline-wrapper");
        let storyHTML = "";
        configUndangan.sectionLoveStory.cerita.forEach((item, index) => {
            let stringTanggal = item.tanggal ? `${item.tanggal} ` : "";
            let fullDate = `${stringTanggal}${item.bulan} ${item.tahun}`;
            storyHTML += `
                <div class="story-simple-item">
                    <img src="${item.foto}" alt="${item.judul}" class="story-simple-img anim-zoom-in delay-200 speed-slow on-scroll" loading="lazy">
                    <div class="story-simple-date">${fullDate}</div>
                    <h3 class="story-simple-title">${item.judul}</h3>
                    <div class="story-divider"></div>
                    <p class="story-simple-desc">${item.cerita}</p>
                </div>
            `;
        });
        if (storyWrapper) storyWrapper.innerHTML = storyHTML;
    }
    
    // --- B. Render Grid Galeri Foto ---
    if (configUndangan.sectionGaleri && configUndangan.sectionGaleri.tampilkan) {
        const galleryWrapper = document.getElementById("gallery-grid-wrapper");
        let galleryHTML = "";
        configUndangan.sectionGaleri.foto.forEach((item, index) => {
            let layoutClass = item.isLandscape ? "gallery-item landscape" : "gallery-item";
            galleryHTML += `
                <div class="${layoutClass}" data-index="${index}">
                    <img src="${item.src}" alt="${item.title || 'Foto Prewedding'}" loading="lazy">
                </div>
            `;
        });
        if (galleryWrapper) galleryWrapper.innerHTML = galleryHTML;
    }

    // --- C. Render Rekening Dompet Digital & Kado ---
    if (configUndangan.sectionGift && configUndangan.sectionGift.tampilkan) {
        const giftWrapper = document.getElementById("gift-accounts-wrapper");
        let giftHTML = "";
        configUndangan.sectionGift.rekening.forEach((rek, idx) => {
            giftHTML += `
                <div class="card-rekening-item">
                    <div class="bank-name">${rek.bank}</div>
                    <div class="bank-number" id="num-rek-${idx}">${rek.nomor}</div>
                    <div class="bank-holder">An. ${rek.atasNama}</div>
                    <button class="btn-copy-data" onclick="salinNomorRekening('num-rek-${idx}')">
                        <i class="fa-regular fa-copy"></i> Salin Rek
                    </button>
                </div>
            `;
        });
        if (giftWrapper) giftWrapper.innerHTML = giftHTML;

        if (configUndangan.sectionGift.alamatKado) {
            const elAlamatBox = document.getElementById("gift-address-box");
            const elAlamatText = document.getElementById("gift-text-alamat");
            if (elAlamatBox && elAlamatText) {
                elAlamatText.innerText = configUndangan.sectionGift.alamatKado;
                elAlamatBox.style.display = "block";
            }
        }
    }

    // --- D. Render Segmen Turut Mengundang ---
    if (configUndangan.turutMengundang) {
        const turutData = configUndangan.turutMengundang;
        const sectionTurut = document.getElementById("section-turut-mengundang");
        
        if (turutData.enabled && sectionTurut) {
            const priaWrapper = document.getElementById("turut-pria-wrapper");
            const wanitaWrapper = document.getElementById("turut-wanita-wrapper");
            
            let priaHTML = "";
            if (turutData.pria && turutData.pria.length > 0) {
                priaHTML += `<h3>Keluarga Mempelai Pria:</h3>`;
                turutData.pria.forEach(nama => {
                    priaHTML += `<p class="turut-nama-item">${nama}</p>`;
                });
            }
            if (priaWrapper) priaWrapper.innerHTML = priaHTML;
            
            let wanitaHTML = "";
            if (turutData.wanita && turutData.wanita.length > 0) {
                wanitaHTML += `<h3>Keluarga Mempelai Wanita:</h3>`;
                turutData.wanita.forEach(nama => {
                    wanitaHTML += `<p class="turut-nama-item">${nama}</p>`;
                });
            }
            if (wanitaWrapper) wanitaWrapper.innerHTML = wanitaHTML;
            
        } else if (sectionTurut) {
            sectionTurut.remove();
        }
    }

    // --- E. Injeksi Data ke Footer ---

    if (configUndangan.footer && configUndangan.footer.tampilkan) {
        const footData = configUndangan.footer;
        
        if(document.getElementById("footer-thanks")) document.getElementById("footer-thanks").innerText = footData.thanks;
        if(document.getElementById("footer-quote")) document.getElementById("footer-quote").innerText = footData.quote;
        if(document.getElementById("footer-salam")) document.getElementById("footer-salam").innerText = footData.salamPenutup;
        
        // Perbaikan link brand jika ingin diarahkan ke donahu.com
        const brandEl = document.getElementById("footer-brand");
        if(brandEl) {
            brandEl.innerText = footData.brandTag;
            brandEl.href = "https://donahu.com/"; // Memastikan link brand aktif
            brandEl.target = "_blank";
        }
        
        const logoEl = document.getElementById("footer-logo");
        if (logoEl && footData.logo !== "") {
            logoEl.src = footData.logo;
            logoEl.style.display = "block";
        }

        // Nama mempelai di footer
        if (configUndangan.sectionSplash && document.getElementById("footer-nama-kita")) {
            document.getElementById("footer-nama-kita").innerHTML = 
                `${configUndangan.sectionSplash.namaPriaSingkat} <span>&</span> ${configUndangan.sectionSplash.namaWanitaSingkat}`;
        }
    }

// =========================================================================
    // 5. LIVE RSVP ENGINE (LOGIKA ADVANCED & TAMPILAN TEMPLATE BARU)
    // =========================================================================
    // Membaca object 'wishes' atau 'sectionRsvp' di data.js
    const rsvpData = configUndangan.wishes || configUndangan.sectionRsvp;

    if (rsvpData && rsvpData.tampilkan) {
        const urlGAS = rsvpData.googleSheetAppUrl;
        const formRSVP = document.getElementById("donahu-form-buku-tamu");
        const btnSubmit = document.getElementById("btn-submit-rsvp");
        const commentList = document.getElementById("donahu-comments-list");
        const countUcapan = document.getElementById("count-ucapan");

        // ---------------------------------------------------------------------
        // LOGIKA 1: CEK STATUS MENGGUNAKAN LOCAL STORAGE (Sekali Kirim)
        // ---------------------------------------------------------------------
        const sudahKirim = localStorage.getItem("donahu_rsvp_done") === "true";

        if (sudahKirim) {
            // Jika tamu sudah pernah mengirim, buang form dan tampilkan tanda terima kasih
            if (formRSVP) {
                formRSVP.innerHTML = `
                    <div style="text-align:center; padding: 30px 10px;">
                        <i class="fa-solid fa-circle-check" style="font-size: 45px; color: #15803d; margin-bottom:15px;"></i>
                        <h3 style="font-family: var(--font-judul); color: var(--warna-teks-gelap, #fff); margin-bottom: 5px;">Pesan Terkirim</h3>
                        <p style="font-family: var(--font-Helvetica); font-size: 13px; color: #ccc; line-height: 1.5;">Terima kasih, konfirmasi kehadiran dan doa restu Anda telah kami terima.</p>
                    </div>
                `;
                formRSVP.style.border = "none";
                formRSVP.style.boxShadow = "none";
                formRSVP.style.background = "transparent";
            }
        } else {
            // ---------------------------------------------------------------------
            // LOGIKA 2: JIKA BELUM KIRIM (Membaca URL & Interaksi Form)
            // ---------------------------------------------------------------------
            const inputGrup = document.getElementById("rsvp-input-grup");
            const inputPersonal = document.getElementById("rsvp-input-nama-personal");
            
            // BACA NAMA DARI URL
            const urlParams = new URLSearchParams(window.location.search);
            const namaTamuDariURL = urlParams.get('to'); 
            
            if (inputGrup && namaTamuDariURL) {
                inputGrup.value = namaTamuDariURL;
            } else if (inputGrup) {
                inputGrup.value = "Tamu Undangan"; 
            }

            // ---- "Kirim ucapan sebagai": nama di link (keluarga/kelompok) atau nama pribadi ----
            // data.js -> tampilan.pilihNamaPribadi: "otomatis" (bawaan) | "selalu" | "tidak"
            //   otomatis = muncul jika link untuk kelompok (Keluarga, Kel., &, dan, Bersama, Rombongan, ...)
            //              atau link umum tanpa nama tamu
            const grupPersonal = document.getElementById("grup-nama-personal");
            const boxPribadi = document.getElementById("rsvp-box-pribadi");
            const opsiRadio = document.querySelectorAll('input[name="rsvp-sebagai"]');
            const modePilih = (configUndangan.tampilan || {}).pilihNamaPribadi || "otomatis";
            const namaLink = inputGrup ? inputGrup.value : "";
            const polaKelompok = /(^|\s)(kel\.?|keluarga|klg|fam(ily)?|bersama|rombongan|grup|group|teman|sahabat|rekan|warga|jemaat|staf|staff|tim|team)(\s|$)|&|\s(dan|beserta|\+)\s/i;
            const tampilkanPilihan = modePilih === "selalu" ||
                (modePilih === "otomatis" && (!namaTamuDariURL || polaKelompok.test(namaLink)));

            const elOpsiGrup = document.getElementById("rsvp-opsi-grup");
            if (elOpsiGrup) elOpsiGrup.textContent = namaLink;
            const elPrevNama = document.getElementById("rsvp-prev-nama");
            const elPrevDari = document.getElementById("rsvp-prev-dari");
            if (elPrevDari) elPrevDari.textContent = "dari " + namaLink;

            if (grupPersonal && !tampilkanPilihan) grupPersonal.style.display = "none";

            const modePribadi = () => {
                const r = document.querySelector('input[name="rsvp-sebagai"]:checked');
                return tampilkanPilihan && r && r.value === "pribadi";
            };
            const perbaruiPratinjau = () => {
                if (elPrevNama) elPrevNama.textContent = (inputPersonal && inputPersonal.value.trim()) || "Nama Anda";
            };
            opsiRadio.forEach(r => r.addEventListener("change", () => {
                const pribadi = modePribadi();
                if (boxPribadi) boxPribadi.hidden = !pribadi;
                if (inputPersonal) {
                    inputPersonal.required = pribadi;   // wajib diisi jika memilih nama sendiri
                    if (pribadi) setTimeout(() => inputPersonal.focus(), 50);
                }
                grupPersonal && grupPersonal.classList.toggle("pilih-pribadi", pribadi);
            }));
            if (inputPersonal) inputPersonal.addEventListener("input", perbaruiPratinjau);

            // Kompatibel dengan template lama yang masih memakai tombol "Tambah"
            window.tampilkanInputPersonal = function () {
                const r = document.querySelector('input[name="rsvp-sebagai"][value="pribadi"]');
                if (r) { r.checked = true; r.dispatchEvent(new Event("change")); }
            };

            // Interaksi Form: Munculkan input jumlah orang HANYA jika "Hadir"
            const selectHadir = document.getElementById("rsvp-select-hadir");
            const boxJumlah = document.getElementById("grup-input-jumlah");
            if (selectHadir && boxJumlah) {
                selectHadir.addEventListener("change", function() {
                    if(this.value === "Hadir") {
                        boxJumlah.style.display = "block";
                        boxJumlah.style.animation = "fadeIn 0.5s forwards"; 
                    } else {
                        boxJumlah.style.display = "none";
                    }
                });
            }

            // ---------------------------------------------------------------------
            // LOGIKA 3: PROSES KIRIM DATA KE GOOGLE SHEETS (POST)
            // ---------------------------------------------------------------------
            if (formRSVP && urlGAS !== "") {
                formRSVP.addEventListener("submit", async function(e) {
                    e.preventDefault(); 
                    
                    let teksAsli = btnSubmit.innerHTML;
                    btnSubmit.innerHTML = "<i class='fa-solid fa-spinner fa-spin'></i> Mengirim...";
                    btnSubmit.disabled = true;

                    // TANGKAP NAMA GRUP DAN PERSONAL
                    let valGrup = inputGrup ? inputGrup.value : "";
                    let valPersonal = "";
                    
                    // Nama pribadi dipakai hanya jika tamu memilih "Nama saya sendiri"
                    if (inputPersonal && modePribadi() && inputPersonal.value.trim() !== "") {
                        valPersonal = inputPersonal.value.replace(/\|/g, "/").trim();
                    }

                    // Gabungkan hanya jika nama personal diisi, jika tidak kirim nama grup saja
                    let namaFinal = valPersonal ? `${valGrup} | ${valPersonal}` : valGrup;

                    let valHadir = document.getElementById("rsvp-select-hadir").value;
                    let valJumlah = (valHadir === "Hadir" && document.getElementById("rsvp-input-jumlah")) 
                                    ? parseInt(document.getElementById("rsvp-input-jumlah").value) 
                                    : 0;

                    let payloadData = JSON.stringify({
                        nama: namaFinal,
                        ucapan: document.getElementById("rsvp-textarea-pesan").value,
                        kehadiran: valHadir,
                        jumlah: valJumlah
                    });

                    try {
                        await fetch(urlGAS, { method: "POST", body: payloadData });
                        localStorage.setItem("donahu_rsvp_done", "true");
                        location.reload(); 
                    } catch (err) {
                        localStorage.setItem("donahu_rsvp_done", "true");
                        location.reload();
                    }
                });
            }
        }

        // ---------------------------------------------------------------------
        // LOGIKA 4: MENARIK DATA UCAPAN (GET) & MEMECAH NAMA GRUP
        // ---------------------------------------------------------------------
        async function loadKomentar() {
            if (!urlGAS || urlGAS === "") return;
            if (commentList) commentList.innerHTML = "<p style='text-align:center; font-size:12px; margin-top:20px;'>Memuat doa restu...</p>";

            try {
                let res = await fetch(urlGAS);
                let data = await res.json();

                if (data && data.length > 0) {
                    if (countUcapan) countUcapan.innerText = data.length;
                    let html = "";
                    
                    data.forEach(item => {
                        if (!item.nama && !item.ucapan) return; 

                        let badgeClass = "badge-ragu"; 
                        let teksKehadiran = item.kehadiran ? item.kehadiran.toLowerCase() : "";
                        
                        if (teksKehadiran.includes("tidak") || teksKehadiran.includes("maaf")) {
                            badgeClass = "badge-tidak"; 
                        } else if (teksKehadiran.includes("hadir") || teksKehadiran.includes("ya")) {
                            badgeClass = "badge-hadir"; 
                        }

                        let teksJumlah = (item.jumlah && item.jumlah > 0) ? ` - ${item.jumlah} Org` : '';

                        // ENGINE PEMISAH NAMA
                        let namaRender = item.nama || 'Tamu Undangan';
                        let subNamaRender = "";

                        // Cek apakah data mengandung tanda pipa "|"
                        if (namaRender.includes("|")) {
                            let splitNama = namaRender.split("|");
                            namaRender = (splitNama[1] || "").trim() || splitNama[0].trim(); // Menjadi Nama Utama (Personal)
                            subNamaRender = `<span class="comment-dari" style="display:block; font-size:10px; opacity:0.6; margin-top:2px; font-weight:normal;">Dari: ${esc(splitNama[0].trim())}</span>`; // Sub-teks Grup
                        }

                        html += `
                            <div class="comment-card-item">
                                <div class="comment-user-info">
                                    <span class="comment-name">${esc(namaRender)} ${subNamaRender}</span>
                                    <span class="comment-badge ${badgeClass}">${esc(item.kehadiran || '-')}${esc(teksJumlah)}</span>
                                </div>
                                <p class="comment-text">${esc(item.ucapan || '')}</p>
                            </div>
                        `;
                    });
                    
                    if (commentList) commentList.innerHTML = html;
                } else {
                    if (commentList) commentList.innerHTML = "<p style='text-align:center; font-size:12px; margin-top:20px;'>Belum ada ucapan. Jadilah yang pertama!</p>";
                    if (countUcapan) countUcapan.innerText = "0";
                }
            } catch (err) {
                console.error("Gagal memuat ucapan:", err);
                if (commentList) commentList.innerHTML = "<p style='text-align:center; font-size:12px; color: red; margin-top:20px;'>Gagal terhubung ke server.</p>";
            }
        }

        loadKomentar();
    }

});

// =========================================================================
// 6. UTILITY GLOBAL FUNCTIONS (Fungsi Salin Data)
// =========================================================================

function copyTeksKeClipboard(teks, namaItem) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(teks).then(() => {
            alert(namaItem + " berhasil disalin:\n" + teks);
        }).catch(() => {
            alert("Gagal menyalin " + namaItem);
        });
    } else {
        let textArea = document.createElement("textarea");
        textArea.value = teks;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy'); 
            alert(namaItem + " berhasil disalin (Mode Lokal):\n" + teks);
        } catch (err) {
            alert("Browser Anda tidak mendukung fitur salin otomatis.");
        }
        textArea.remove();
    }
}

function salinNomorRekening(elementId) {
    const teksRekening = document.getElementById(elementId).innerText;
    copyTeksKeClipboard(teksRekening, "Nomor rekening");
}

function salinTeksAlamat() {
    const teksAlamat = document.getElementById("gift-text-alamat").innerText;
    copyTeksKeClipboard(teksAlamat, "Alamat pengiriman");
}

// =========================================================================
// LOGIKA KHUSUS MUSIK (AUTOPLAY & RANJAU SENTUH REUSABLE)
// =========================================================================

window.addEventListener('load', function() {
    const music = document.getElementById("bg-music");
    const musicControlBox = document.getElementById("music-control");
    const musicIcon = document.getElementById("music-icon");

    if (!music) return;

    // Fungsi mengubah tampilan UI Ikon
    function updateIconUI(isPlaying) {
        if (!musicIcon) return;
        if (isPlaying) {
            musicIcon.className = "fa-solid fa-pause"; 
            musicIcon.classList.add("spin-animation");
            if(musicControlBox) musicControlBox.classList.remove("paused");
        } else {
            musicIcon.className = "fa-solid fa-play";
            musicIcon.classList.remove("spin-animation");
            if(musicControlBox) musicControlBox.classList.add("paused");
        }
    }

    // FUNGSI INTI 1: Pasang Ranjau Sentuh
    function pasangRanjau() {
        console.warn("Browser memblokir musik. Ranjau Sentuh diaktifkan!");
        updateIconUI(false);
        
        const meledak = () => {
            music.play().then(() => {
                sessionStorage.setItem('musicPlaying', 'true');
                updateIconUI(true);
            }).catch(e => console.log("Menunggu interaksi fisik..."));
            
            // Cabut ranjau setelah berhasil meledak (musik nyala)
            document.removeEventListener('scroll', meledak);
            document.removeEventListener('touchstart', meledak);
            document.removeEventListener('click', meledak);
        };

        // Tanam ranjau di seluruh elemen layar
        document.addEventListener('scroll', meledak, { once: true });
        document.addEventListener('touchstart', meledak, { once: true });
        document.addEventListener('click', meledak, { once: true });
    }

    // FUNGSI INTI 2: Coba Putar Musik (Jika gagal -> Panggil Ranjau)
    function cobaPutarMusik() {
        let playPromise = music.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                // Berhasil menyala otomatis (Browser mengizinkan)
                sessionStorage.setItem('musicPlaying', 'true');
                updateIconUI(true);
            }).catch(error => {
                // Diblokir oleh browser! Segera pasang ranjau
                pasangRanjau();
            });
        }
    }

    // --- SKENARIO KEDATANGAN TAMU ---
    const mustAutoplay = localStorage.getItem('mustAutoplay');
    const statusMusikTerakhir = sessionStorage.getItem('musicPlaying');
    
    if (mustAutoplay === 'true') {
        // SKENARIO A: Tamu baru saja menekan tombol Buka di index.html
        localStorage.removeItem('mustAutoplay'); 
        cobaPutarMusik();

    } else if (statusMusikTerakhir === 'true' || statusMusikTerakhir === null) {
        // SKENARIO B: Tamu me-refresh main.html (dan sebelumnya musik sedang nyala)
        // Refresh menghapus izin browser, jadi cobaPutarMusik() pasti akan 
        // dicegat browser dan otomatis memanggil fungsi pasangRanjau().
        cobaPutarMusik();

    } else {
        // SKENARIO C: Tamu sengaja mem-pause musik, lalu me-refresh halaman.
        // Kita hormati privasi tamu. Jangan pasang ranjau, biarkan musik tetap mati.
        updateIconUI(false);
    }

    // --- TOMBOL TOGGLE MANUAL (Jika tamu mengklik ikon musik langsung) ---
    if(musicControlBox) {
        musicControlBox.addEventListener("click", function() {
            if (music.paused) {
                music.play();
                sessionStorage.setItem('musicPlaying', 'true');
                updateIconUI(true);
            } else {
                music.pause();
                sessionStorage.setItem('musicPlaying', 'false');
                updateIconUI(false);
            }
        });
    }
});

// =========================================================================
// CCTV ANIMASI SAAT PENGGUNA SCROLL/ Animate On Scroll (AOS)
// =========================================================================
document.addEventListener("DOMContentLoaded", function() {
    // 1. Cari semua elemen yang punya class 'on-scroll'
    const scrollElements = document.querySelectorAll(".on-scroll");

    // 2. Buat "Kamera Pengawas" (Intersection Observer)
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            // Jika elemen masuk ke dalam layar (viewport) tamu
            if (entry.isIntersecting) {
                // Berikan izin: Tambahkan class 'is-visible'
                entry.target.classList.add("is-visible");
                
                // KUNCI UX: Hentikan pengawasan di elemen ini agar animasi berjalan HANYA 1X
                observer.unobserve(entry.target); 
            } 
            // Bagian 'else' (remove class) kita hapus sepenuhnya di sini
            // agar elemen tidak kembali menghilang saat tamu scroll ke atas/bawah.
        });
    }, {
        threshold: 0.20 // Animasi akan jalan setelah 15% bagian elemen terlihat di layar
    });

    // 3. Pasang CCTV ini ke semua elemen yang kita tandai
    scrollElements.forEach((el) => observer.observe(el));
});
