// ==========================================================================
// --- GRAND ENGINE DASHBOARD ADMIN - MANAJEMEN LINK & REKAP RSVP -----------
// ==========================================================================

// 1. INISIALISASI UTAMA SAAT HALAMAN SELESAI DIMUAT
document.addEventListener("DOMContentLoaded", function() {
    // Sinkronisasi data nama mempelai dari data.js untuk judul dashboard
    if (typeof configUndangan !== 'undefined') {
        const adminJudul = document.getElementById('admin-nama-mempelai');
        if (adminJudul) {
            adminJudul.innerText = `${configUndangan.sectionSplash.namaPriaSingkat} & ${configUndangan.sectionSplash.namaWanitaSingkat}`;
        }
    }
    
    // Set default template teks pengantar di awal buka halaman
    setTemplate('umum');
    
    // Tarik data ucapan/doa restu live dari Google Sheets klien
    loadRekapUcapan();
    
    // Jalankan mesin penghitung nomor baris pada textarea nama tamu
    initLineCounter();
});

// 2. DATABASE TEMPLATE TEKS PENGANTAR CHAT WHATSAPP
const templatePengantar = {
    umum: `Tanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i\n\n*[nama]*\n\nuntuk menghadiri acara kami.\n\n*Berikut link undangan kami*, untuk info lengkap dari acara bisa kunjungi :\n\n[link-undangan]\n\nMerupakan suatu kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan untuk hadir dan memberikan doa restu. Terima kasih.`,
    muslim: `_Assalamualaikum Warahmatullahi Wabarakatuh_\n\nDengan memohon rahmat Allah SWT, perkenankan kami mengundang Bapak/Ibu/Saudara/i *[nama]* untuk menghadiri acara kami\n\n*Berikut link undangan kami*, untuk info lengkap dari acara bisa kunjungi :\n\n[link-undangan]\n\nMerupakan suatu kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan untuk hadir dan memberikan doa restu.\n\nWassalamu'alaikum Wr. Wb.`,
    kristen: `Shalom, salam damai Sejahtera.\n\nPuji syukur kepada Tuhan Yesus Kristus.\nAtas perkenanan-Nya kami dipertemukan, dan akan mengikat Janji Suci dalam Pernikahan Kami.\nOleh Karena itu, Kami mengundang Bapak/Ibu/Saudara/i :\n\n*[nama]*\n\nuntuk turut serta menjadi saksi kebahagiaan dalam acara pernikahan kami.\n\nSilakan akses informasi lengkap mengenai lokasi dan jadwal acara melalui link berikut:\n\n[link-undangan]\n\nKehadiran dan doa restu Bapak/Ibu/Saudara/i sangat berarti bagi kami.\nTerima kasih.\nTuhan Yesus Memberkati.`
};

// Fungsi untuk mengganti isi teks pengantar berdasarkan pilihan tombol
// Fungsi untuk mengganti isi teks pengantar berdasarkan pilihan tombol
// Fungsi untuk mengganti isi teks pengantar (Kini menggunakan parameter elemenTombol)
function setTemplate(jenis, elemenTombol = null) {
    const txtPengantar = document.getElementById('input-pengantar');
    if (txtPengantar && templatePengantar[jenis]) {
        txtPengantar.value = templatePengantar[jenis];
    }
    
    // Atur kembali visual feedback pada tombol-tombol template
    document.querySelectorAll('.btn-group-template .btn-copy').forEach(btn => {
        btn.classList.remove('aktif');
    });
    
    // Jika dipicu oleh KLIK FISIK (parameter elemenTombol terisi)
    if (elemenTombol) {
        elemenTombol.classList.add('aktif');
    } else {
        // Jika dipicu otomatis oleh sistem di awal load halaman
        const tombolPertama = document.querySelector('.btn-group-template .btn-copy');
        if (tombolPertama) {
            tombolPertama.classList.add('aktif');
        }
    }
}
// 3. LOGIKA INTEGRASI BARIS NOMOR OTOMATIS (LINED TEXTAREA)
function initLineCounter() {
    const textarea = document.getElementById('input-massal-nama');
    const lineNumbers = document.getElementById('line-numbers');
    
    if (textarea && lineNumbers) {
        // Deteksi setiap ketikan atau tombol Enter (\n) yang ditekan admin
        textarea.addEventListener('input', () => {
            const lines = textarea.value.split('\n').length;
            let numHTML = '';
            for (let i = 1; i <= lines; i++) {
                numHTML += `<div>${i}</div>`;
            }
            lineNumbers.innerHTML = numHTML;
        });
        
        // Sinkronisasi posisi scroll baris nomor mengikuti gerakan scroll textarea
        textarea.addEventListener('scroll', () => {
            lineNumbers.scrollTop = textarea.scrollTop;
        });
    }
}

// 4. ALGORITMA INTI: GENERATOR DAFTAR TAMU & REKAYASA LINK URL
function generateDaftarTamu() {
    const rawInput = document.getElementById('input-massal-nama').value;
    const templateTeks = document.getElementById('input-pengantar').value;
    const tbody = document.getElementById('render-tabel-admin');
    
    if (!rawInput.trim()) {
        alert("Silakan isi daftar nama tamu terlebih dahulu!");
        return;
    }
    
    // Pecah teks berdasarkan karakter baris baru (\n) dan buang baris kosong akibat ketidaksengajaan
    const daftarNama = rawInput.split('\n').map(nama => nama.trim()).filter(nama => nama !== "");
    
    // Deteksi basis URL proyek Anda secara dinamis dari Live Server/Hosting asli
    const baseUrl = window.location.origin + window.location.pathname.replace('admin.html', 'index.html');
    
    let htmlTabel = '';
    
    daftarNama.forEach((nama, index) => {
        // Kalibrasi nama tamu ke format URL aman (spasi otomatis dikonversi menjadi tanda +)
        const namaEncoded = encodeURIComponent(nama).replace(/%20/g, '+');
        const linkUndanganUnik = `${baseUrl}?to=${namaEncoded}`;
        
        // Suntik data ke placeholder [nama] dan [link-undangan] di dalam draf teks chat
        let teksWhatsApp = templateTeks.split('[nama]').join(nama).split('[link-undangan]').join(linkUndanganUnik); // ganti SEMUA placeholder
        const waEncoded = encodeURIComponent(teksWhatsApp);
        
        // Jahit baris tabel untuk dimasukkan ke kolom kanan dashboard
        // Jahit baris tabel
        htmlTabel += `
            <tr>
                <td style="text-align: center;"><b>${index + 1}</b></td>
                <td><span class="nama-tamu-bold">${nama}</span></td>
                <td>
                    <div class="aksi-buttons">
                        <a href="https://api.whatsapp.com/send?text=${waEncoded}" target="_blank" style="text-decoration: none;">
                            <button class="btn-share-wa">
                                <i class="fab fa-whatsapp"></i> WA
                            </button>
                        </a>
                        <button class="btn-copy-admin" onclick="salinLinkTamu('${linkUndanganUnik}', this)">Copy</button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = htmlTabel;
}

// Fungsi menyalin tautan spesifik per baris tamu
function salinLinkTamu(link, tombol) {
    navigator.clipboard.writeText(link).then(() => {
        const teksAsli = tombol.innerText;
        tombol.innerText = "Copied! ✓";
        tombol.style.background = "#5cb85c"; // Beri feedback hijau sukses
        
        setTimeout(() => {
            tombol.innerText = teksAsli;
            tombol.style.background = ""; // Kembalikan ke warna tema awal
        }, 1500);
    });
}

// =================================================================
// --- FITUR UTAMA: MEMUAT ULANG DATA UCAPAN LIVE DARI SPREADSHEET -
// =================================================================
// 5. PENARIK DATA UCAPAN (READ-ONLY) LIVE DARI GOOGLE SHEETS KLIEN
async function loadRekapUcapan() {
    const display = document.getElementById('rekap-ucapan-list');
    if (!display || typeof configUndangan === 'undefined' || !configUndangan.wishes.googleSheetAppUrl) return;
    
    const url = configUndangan.wishes.googleSheetAppUrl;

    try {
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.length === 0) {
            display.innerHTML = "<p class='text-center' style='opacity:0.5; padding: 20px;'>Belum ada doa atau ucapan masuk dari tamu.</p>";
            return;
        }
        
        // Gambar list rekap doa restu ke dalam kartu nomor 3
        display.innerHTML = data.map((c, index) => `
            <div class="comment-item" style="background: rgba(255,255,255,0.03); margin-bottom: 10px; padding: 15px; border-radius: 8px; border-left: 3px solid #e5cc8a;">
                <h4 style="margin: 0; color: #e5cc8a;"><b>${index + 1}. ${c.nama || 'Anonim'}</b> <span style="font-weight:normal; opacity:0.6; font-size:11px; color: #fff;">(${c.kehadiran || '-'})</span></h4>
                <p style="margin: 8px 0 0 0; font-style: italic; opacity: 0.85; line-height: 1.4;">"${c.ucapan || ''}"</p>
            </div>
        `).join('');
        
    } catch (e) {
        display.innerHTML = "<p class='text-center' style='color:#ff4d4d; padding: 20px;'>Gagal menghubungkan ke data Google Sheets. Periksa kembali konfigurasi App URL Anda.</p>";
    }
}

// =================================================================
// --- FITUR SELESAI: EKSPOR DATA RSVP LANGSUNG KE EXCEL / CSV -----
// =================================================================
async function cetakRekapPDF() {
    const url = configUndangan.wishes.googleSheetAppUrl;
    
    if (!url) {
        alert("API URL Spreadsheet tidak ditemukan dalam konfigurasi!");
        return;
    }

    // Ambil elemen tombol untuk memberikan feedback visual loading
    const btnCetak = document.querySelector('.btn-maps');
    if (btnCetak) {
        btnCetak.disabled = true;
        btnCetak.innerText = "Mengekspor ke Excel...";
    }

    try {
        // 1. Ambil data JSON bersih langsung dari jembatan API Spreadsheet Anda
        const respon = await fetch(url);
        const daftarUcapan = await respon.json();

        if (!daftarUcapan || daftarUcapan.length === 0) {
            alert("Belum ada data ucapan masuk yang bisa diexport saat ini!");
            if (btnCetak) { btnCetak.disabled = false; btnCetak.innerText = "UNDUH REKAP DATA"; }
            return;
        }

        // 2. Susun Kepala Judul Kolom Tabel Excel (Header)
        // Gunakan tanda koma sebagai pemisah kolom standar internasional
        let kontenCSV = "No,Nama Tamu,Konfirmasi Kehadiran,Isi Doa / Ucapan\n";

        // 3. Iterasi Data: Masukkan seluruh data ucapan tamu ke baris Excel
        daftarUcapan.forEach((item, index) => {
            // Bersihkan teks dari tanda koma atau kutip ganda agar struktur kolom tidak rusak/bergeser di Excel
            const nama = (item.nama || 'Anonim').replace(/,/g, ' ').replace(/"/g, '""');
            const kehadiran = (item.kehadiran || '-').replace(/,/g, ' ');
            const ucapan = (item.ucapan || '').replace(/,/g, ' ').replace(/"/g, '""').replace(/\n/g, ' ');

            // Gabungkan menjadi format baris CSV resmi dengan membungkus teks di dalam kutip ganda ("")
            kontenCSV += `${index + 1},"${nama}","${kehadiran}","${ucapan}"\n`;
        });

        // 4. SUNTIKAN FORMAT MANTRA (BOM): Memaksa Microsoft Excel langsung membaca 
        // format bahasa dan tanda baca khusus Indonesia secara rapi tanpa berantakan
        const bom_bahasa = new Uint8Array([0xEF, 0xBB, 0xBF]);
        const blob = new Blob([bom_bahasa, kontenCSV], { type: 'text/csv;charset=utf-8;' });
        
        // 5. MEMBUAT ELEMEN DOUNLOAD GAIB DI BROWSER
        const linkUnduh = document.createElement("a");
        const namaPria = typeof configUndangan !== 'undefined' ? configUndangan.namaPria : 'Pria';
        const namaWanita = typeof configUndangan !== 'undefined' ? configUndangan.namaWanita : 'Wanita';

        // Set nama file otomatis yang rapi saat diunduh
        linkUnduh.href = URL.createObjectURL(blob);
        linkUnduh.setAttribute("download", `Rekap_Ucapan_${namaPria}_&_${namaWanita}.csv`);
        document.body.appendChild(linkUnduh);
        
        // Eksekusi trigger klik download otomatis
        linkUnduh.click();
        
        // Bersihkan kembali elemen gaib dari DOM browser
        document.body.removeChild(linkUnduh);
        console.log("Arsip rekapitulasi sukses diunduh dalam format Excel/CSV.");

    } catch (error) {
        console.error("Gagal memproses ekspor data teks:", error);
        alert("Sistem mendeteksi gangguan jaringan saat menarik data dari Spreadsheet.");
    } finally {
        // Kembalikan tombol ke kondisi aktif semula
        if (btnCetak) {
            btnCetak.disabled = false;
            btnCetak.innerText = "UNDUH REKAP EXCEL"; // Kita sesuaikan teks tombol agar lebih akurat
        }
    }
}

// =================================================================
// --- ENGINE SENSOR TAUTAN RAHASIA (ANTI-INTIP TANPA LOGIN) -------
// =================================================================
function proteksiAdminTanpaLogin() {
    // 1. Tentukan kata kunci rahasia Anda (Bebas diganti, gunakan huruf/angka tanpa spasi)
    const kunciRahasia = "LgnAbe05"; 

    // 2. Baca parameter di URL browser (?auth=...)
    const urlParams = new URLSearchParams(window.location.search);
    const tokenAkses = urlParams.get('auth');

    // 3. Validasi Gerbang Otomatis
    if (tokenAkses === kunciRahasia) {
        // JIKA KUNCI COCOK: Panggil fungsi rekap data live Anda
        console.log("Otoritas terverifikasi via URL Token.");
        loadRekapUcapan(); 
    } else {
        // JIKA KUNCI SALAH/TIDAK ADA: Hancurkan DOM asli dan ganti dengan tampilan 404 palsu
        document.body.innerHTML = `
            <div style="background:#111111; color:#ffffff; height:100vh; display:flex; justify-content:center; align-items:center; font-family:'Arial', sans-serif; flex-direction:column; text-align:center; padding:20px; box-sizing:border-box;">
                <h1 style="font-size: 50px; margin: 0 0 10px 0; color: #ff4d4d;">404</h1>
                <h3 style="margin: 0 0 10px 0; font-weight: 500;">Halaman Tidak Ditemukan</h3>
                <p style="color:#666666; font-size: 13px; max-width: 350px; margin: 0; line-height: 1.6;">
                    Maaf, tautan yang Anda tuju salah atau telah kedaluwarsa. Silakan kembali ke halaman utama undangan.
                </p>
            </div>
        `;
    }
}

// JALANKAN GERBANG PROTEKSI SAAT HALAMAN DIMUAT
proteksiAdminTanpaLogin();