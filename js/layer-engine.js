// =========================================================================
// MESIN PENGGERAK DONAHU (layer-engine.js)
// Tugas: Membaca data.js -> Merender Background Global -> Memfilter Section
// =========================================================================

document.addEventListener("DOMContentLoaded", function () {
    
    // 1. Keamanan: Pastikan data.js berhasil dimuat sebelum mesin berjalan
    if (typeof configUndangan === "undefined") {
        console.error("CRITICAL ERROR: File data.js tidak ditemukan atau gagal dimuat.");
        return;
    }

    const globalConfig = configUndangan.pengaturanGlobal;

    // =========================================================================
    // TAHAP A: EKSEKUSI LAYER 1 GLOBAL (BACKGROUND UTAMA)
    // =========================================================================
    const layer1Global = document.getElementById("global-layer-1");
    
    if (layer1Global && globalConfig) {
        const tipeBg = globalConfig.tipeBackground;

        if (tipeBg === "slider" && globalConfig.dataSlider.length > 0) {
            // 1. Render Mode Slider
            let sliderHTML = "";
            globalConfig.dataSlider.forEach((imgSrc, index) => {
                // Gambar pertama langsung aktif (opacity 1), sisanya sembunyi (opacity 0)
                let activeClass = index === 0 ? "active-slide" : "";
                sliderHTML += `<div class="donahu-global-slide ${activeClass}" style="background-image: url('${imgSrc}');"></div>`;
            });
            layer1Global.innerHTML = sliderHTML;

            // Logika Animasi Slider (Transisi Fade tiap 4 detik)
            let slides = layer1Global.querySelectorAll(".donahu-global-slide");
            let currentSlide = 0;
            if (slides.length > 1) {
                setInterval(() => {
                    if (window.donahuJedaSlider) return; // dijeda oleh Mode Atur Foto
                    currentSlide = [...slides].findIndex(s => s.classList.contains("active-slide"));
                    if (currentSlide < 0) currentSlide = 0;
                    slides[currentSlide].classList.remove("active-slide");
                    currentSlide = (currentSlide + 1) % slides.length;
                    slides[currentSlide].classList.add("active-slide");
                }, 4000);
            }

        } else if (tipeBg === "video" && globalConfig.dataVideo) {
            // 2. Render Mode Video
            layer1Global.innerHTML = `
                <video autoplay loop muted playsinline class="donahu-global-video">
                    <source src="${globalConfig.dataVideo}" type="video/mp4">
                </video>
            `;

        } else if (tipeBg === "statis" && globalConfig.dataStatis) {
            // 3. Render Mode Gambar Statis
            layer1Global.style.backgroundImage = `url('${globalConfig.dataStatis}')`;
            layer1Global.style.backgroundSize = "cover";
            layer1Global.style.backgroundPosition = "center";
        }
    }


    // =========================================================================
    // TAHAP B: SAKELAR ON/OFF SECTION & MANAJEMEN LAYER INTERNAL
    // =========================================================================
    const semuaSection = document.querySelectorAll(".donahu-section-layer, .donahu-section-layerPenutup");

    semuaSection.forEach(section => {
        const dataKey = section.getAttribute("data-key");

        // 0. SECTION OPSIONAL (fitur baru): hanya tampil jika ada datanya DAN tampilkan === true.
        //    Dengan begini data.js lama (yang belum punya kunci baru) tidak berubah tampilannya.
        if (section.getAttribute("data-opsional") === "true") {
            const d = configUndangan[dataKey];
            if (!d || d.tampilkan !== true) { section.remove(); return; }
        }
        
        if (dataKey && configUndangan[dataKey]) {
            const dataSection = configUndangan[dataKey];

            // 1. PEMUSNAHAN SECTION UTAMA: Jika klien matikan section
            if (dataSection.tampilkan === false) {
                section.remove(); // Hapus seluruh section dari memori
                return; // Langsung lompat ke section berikutnya
            }

            // 2. KONTROL LAYER INTERNAL (Fleksibilitas Absolut)
            if (dataSection.layerControl) {
                const kontrol = dataSection.layerControl;

                // LAYER 2: TEXTURE
                if (kontrol.textureAktif === false) {
                    let layer2 = section.querySelector(".layer-2-texture");
                    if (layer2) layer2.remove();
                }

                // LAYER 3: GAMBAR STATIS
                let layer3 = section.querySelector(".layer-3-static");
                if (layer3) {
                    if (kontrol.gambarStatis && kontrol.gambarStatis !== "") {
                        // Jika ada nama filenya, tempelkan sebagai background
                        layer3.style.backgroundImage = `url('${kontrol.gambarStatis}')`;
                    } else {
                        // Jika nilainya string kosong ("") atau false, hancurkan layer ini
                        layer3.remove();
                    }
                }

                // LAYER 4: OVERLAY SHADING
                let layer4 = section.querySelector(".layer-4-overlay");
                if (layer4) {
                    if (kontrol.overlayAktif === false) {
                        // Jika dimatikan, hancurkan layernya
                        layer4.remove();
                    } else if (kontrol.nilaiOverlay !== undefined) {
                        // Jika menyala dan ada nilainya, ubah kepekatannya!
                        layer4.style.opacity = kontrol.nilaiOverlay;
                    }
                }

                // LAYER 5: FRAME ORNAMEN
                if (kontrol.frameAktif === false) {
                    let layer5 = section.querySelector(".layer-5-frame");
                    if (layer5) layer5.remove();
                }
            }
        }
    });


    // =========================================================================
    // TAHAP B2: URUTAN SECTION (tampilan.urutanSection)
    //   Section yang disebut dipindah sesuai urutan; yang tidak disebut tetap
    //   di belakangnya dengan urutan aslinya (footer selalu paling akhir).
    // =========================================================================
    const tampilan = configUndangan.tampilan || {};
    const wrapper = document.getElementById("donahu-scroll-wrapper");
    if (wrapper && Array.isArray(tampilan.urutanSection) && tampilan.urutanSection.length) {
        const footer = wrapper.querySelector(":scope > [data-key='footer']");
        tampilan.urutanSection.forEach(key => {
            if (key === "footer") return;
            const el = wrapper.querySelector(`:scope > [data-key='${key}']`);
            if (el) wrapper.insertBefore(el, footer || null);
        });
        // sisa section yang tidak disebut: biarkan setelah yang terurut
        [...wrapper.children].forEach(el => {
            const key = el.getAttribute("data-key");
            if (key && key !== "footer" && !tampilan.urutanSection.includes(key)) {
                wrapper.insertBefore(el, footer || null);
            }
        });
    }

    // Penanda posisi untuk CSS tema (misal: section ganjil/genap beda gaya)
    if (wrapper) {
        [...wrapper.querySelectorAll(":scope > [data-key]")].forEach((el, i) => {
            el.setAttribute("data-urutan", i + 1);
        });
    }

    // =========================================================================
    // TAHAP B3: NAVIGASI BAWAH (tampilan.navigasiBawah)
    // =========================================================================
    const nav = document.getElementById("nav-bawah");
    if (nav) {
        if (tampilan.navigasiBawah === true) {
            nav.querySelectorAll("a").forEach(a => {
                const target = document.querySelector(a.getAttribute("href"));
                if (!target) a.remove(); // section dimatikan -> tombolnya ikut hilang
            });
            nav.hidden = false;
            document.body.classList.add("ada-nav-bawah");

            // Tandai tombol section yang sedang dilihat
            const tautan = [...nav.querySelectorAll("a")];
            const pengamat = new IntersectionObserver(entries => {
                entries.forEach(en => {
                    if (!en.isIntersecting) return;
                    tautan.forEach(a => a.classList.toggle("aktif", a.getAttribute("href") === "#" + en.target.id));
                });
            }, { rootMargin: "-45% 0px -50% 0px" });
            tautan.forEach(a => pengamat.observe(document.querySelector(a.getAttribute("href"))));
        } else {
            nav.remove();
        }
    }

    // =========================================================================
    // TAHAP C: POPULASI DATA SEDERHANA (INJEKSI TEKS)
    // =========================================================================
    // Menyuntikkan nama dan tanggal ke Hero Section
    if (configUndangan.sectionHero && configUndangan.sectionSplash) {
        const elNamaHero = document.getElementById("hero-nama-mempelai");
        const elTanggalHero = document.getElementById("hero-tanggal");
        
        if (elNamaHero) {
            elNamaHero.innerHTML = `${configUndangan.sectionSplash.namaPriaSingkat} <span>&</span> ${configUndangan.sectionSplash.namaWanitaSingkat}`;
        }
        if (elTanggalHero) {
            elTanggalHero.innerText = configUndangan.sectionHero.tanggalAcara;
        }

        // Komponen tema: "PERSONALIZED FOR ... <nama tamu>"
        const tamu = new URLSearchParams(window.location.search).get("to");
        const elTamuHero = document.getElementById("hero-nama-tamu");
        if (elTamuHero && tamu) elTamuHero.innerText = tamu;
        const elLabel = document.getElementById("hero-label-personal");
        if (elLabel && tampilan.teksPersonal) elLabel.innerText = tampilan.teksPersonal;
    }

    // =========================================================================
    // TAHAP D: ENGINE MODAL LIGHTBOX SLIDER (GALERI FOTO)
    // =========================================================================
    const lightboxModal = document.getElementById("gallery-lightbox-modal");
    const lightboxImg = document.getElementById("lightbox-main-img");
    const closeBtn = document.querySelector(".lightbox-close-btn");
    const prevBtn = document.querySelector(".prev-btn");
    const nextBtn = document.querySelector(".next-btn");
    
    let kumpulanDataFoto = [];
    let currentIndexFoto = 0;

    // Pastikan data galeri aman dan tersedia sebelum diikat
    if (configUndangan.sectionGaleri && configUndangan.sectionGaleri.foto) {
        kumpulanDataFoto = configUndangan.sectionGaleri.foto;
    }

    // Delegasi klik pada wrapper galeri agar mendeteksi item yang diklik secara dinamis
    const gridWrapper = document.getElementById("gallery-grid-wrapper");
    if (gridWrapper) {
        gridWrapper.addEventListener("click", function (e) {
            const itemKlik = e.target.closest(".gallery-item");
            if (itemKlik) {
                currentIndexFoto = parseInt(itemKlik.getAttribute("data-index"), 10);
                bukaLightbox(currentIndexFoto);
            }
        });
    }

    function bukaLightbox(index) {
        if (!lightboxModal || !lightboxImg || kumpulanDataFoto.length === 0) return;
        lightboxImg.src = kumpulanDataFoto[index].src;
        lightboxModal.style.display = "flex";
        document.body.style.overflow = "hidden"; // Kunci scroll layar belakang
    }

    function gantiFoto(arah) {
        if (kumpulanDataFoto.length === 0) return;
        if (arah === "next") {
            currentIndexFoto = (currentIndexFoto + 1) % kumpulanDataFoto.length;
        } else if (arah === "prev") {
            currentIndexFoto = (currentIndexFoto - 1 + kumpulanDataFoto.length) % kumpulanDataFoto.length;
        }
        lightboxImg.src = kumpulanDataFoto[currentIndexFoto].src;
    }

    function tutupLightbox() {
        if (lightboxModal) {
            lightboxModal.style.display = "none";
            document.body.style.overflow = "auto"; // Kembalikan scroll layar belakang
        }
    }

    // Penjaga Event Listener Navigasi & Aksi Keluar
    if (closeBtn) closeBtn.addEventListener("click", tutupLightbox);
    if (nextBtn) nextBtn.addEventListener("click", () => gantiFoto("next"));
    if (prevBtn) prevBtn.addEventListener("click", () => gantiFoto("prev"));

    // Menutup modal otomatis jika area hitam transparan di luar gambar diklik
    if (lightboxModal) {
        lightboxModal.addEventListener("click", function (e) {
            if (e.target === lightboxModal || e.target.classList.contains("lightbox-content-wrapper")) {
                tutupLightbox();
            }
        });
    }

    // Dukungan navigasi menggunakan keyboard panah komputer
    document.addEventListener("keydown", function (e) {
        if (lightboxModal && lightboxModal.style.display === "flex") {
            if (e.key === "Escape") tutupLightbox();
            if (e.key === "ArrowRight") gantiFoto("next");
            if (e.key === "ArrowLeft") gantiFoto("prev");
        }
    });

    // =========================================================================
    // TAHAP E: ENGINE BUKA MODAL GIFT (DENGAN PENGECEKAN KEAMANAN)
    // =========================================================================
    
    window.toggleGift = function() {
        const content = document.getElementById("konten-collapse-gift");
        const btn = document.getElementById("btn-toggle-gift");
        
        // Hapus inline display agar class CSS bisa mengambil alih
        if (content.style.display === "none") {
            content.style.display = ""; 
        }
        
        content.classList.toggle("show");
        
        const isOpen = content.classList.contains("show");
        
        if (isOpen) {
            btn.innerHTML = '<i class="fa-solid fa-gift"></i> Sembunyikan';
            setTimeout(() => {
                content.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 300);
        } else {
            btn.innerHTML = '<i class="fa-solid fa-gift"></i> Kirim Hadiah';
        }
    };


});