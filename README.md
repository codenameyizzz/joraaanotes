# Joraaa Notes ✦ Aesthetic Digital Keepsake & Letters

> Web aplikasi catatan dan potret polaroid estetik di dalam amplop digital dengan segel lilin (*wax seal*) 3D, animasi buka amplop 60fps, musik latar ambient synth, serta link sharing yang abadi dan **100% gratis di-host di Vercel**.

---

## ✨ Fitur & Keunggulan Estetik

1. **Anti-AI Design Language**:
   - Memadukan tekstur kertas katun (*organic paper grain*), stempel perangko vintage, dan selotip kertas (*washi tape*) dengan ujung bergerigi nyata.
   - Pilihan tipografi editorial: **Instrument Serif** untuk headline puitis, **Plus Jakarta Sans** untuk kenyamanan membaca, **Caveat** untuk coretan tangan di balik foto, dan **Space Mono** untuk stempel tanggal kamera film.
2. **Foto Polaroid Interaktif 3D**:
   - Upload 1–4 foto dengan kompresi WebP otomatis.
   - Kartu polaroid memiliki efek *spring 3D tilt* mengikuti gerakan kursor.
   - Dapat di-klik/tap untuk **membalik kartu (3D Flip)** dan membaca catatan rahasia di baliknya.
3. **Amplop 3D & Segel Lilin (Wax Seal)**:
   - Amplop dengan lipatan segitiga realistis dan stempel lilin dengan pilihan ikon (*Heart, Star, Flower, Crescent, Envelope, Sparkles*).
   - Saat segel di-klik: Suara pecah segel lilin, hujan konfeti keemasan, lipatan amplop terbuka, dan surat meluncur keluar dengan animasi 60fps yang memuaskan.
4. **Sentuhan Reaksi Puitis**:
   - Penerima dapat mengirimkan reaksi instan: 🤍 *Pelukan Hangat*, ✨ *Senyuman*, 🌸 *Kelopak Bunga*, atau ☕ *Secangkir Rindu* disertai efek denting nada pentatonik dan partikel melayang.
5. **Zero-Config Instant Sharing (Vercel Ready)**:
   - Data catatan dikompresi langsung ke dalam URL hash (`#data=...`) menggunakan LZ-String, sehingga tautan dapat langsung dibagikan dan dibuka **tanpa perlu database server sama sekali**!
   - Juga dilengkapi API Route serverless bawaan Next.js dan penyimpanan riwayat lokal (*My Memory Vault*).
6. **Pure Web Audio Synth**:
   - Suara klik kayu halus, suara pecah segel lilin, suara kertas berdesir, denting reaksi, dan suara ambient gerimis hujan dihasilkan langsung oleh browser Web Audio API murni (tanpa file mp3 eksternal, bebas error CORS dan hemat bandwidth).

---

## 🎨 Palet Nuansa & Tema Warna

- 📜 **Warm Linen & Cotton**: `#FBF8F3` (Alabaster Warm Cream), aksen merah marun segel `#964332`.
- 🌙 **Midnight Film Slate**: `#151518` (Dark Charcoal), aksen emas sampanye `#D4AF37`.
- 🌸 **Petal & Pressed Blush**: `#FAF2F2` (Soft Blush Pink), aksen terracotta `#B85D6B`.
- 🌿 **Matcha Moss & Driftwood**: `#F4F7F2` (Matcha Fog), aksen daun sage `#5C7A54`.
- ☕ **Vintage 1970s Sepia**: `#F8F1E7` (Warm Sepia), aksen kayu tua `#A86232`.

---

## 🚀 Cara Menjalankan Secara Lokal

```bash
# 1. Jalankan development server
npm run dev

# 2. Buka di browser
# http://localhost:3000
```

---

## 🌐 Cara Deploy Gratis ke Vercel (Hanya 1 Menit)

### Opsi A: Melalui Vercel CLI
```bash
npx vercel
```
Ikuti instruksi singkat di terminal (tekan `Enter` untuk pilihan default).

### Opsi B: Melalui GitHub
1. Upload folder project ini ke repository GitHub Anda (`git push`).
2. Masuk ke [vercel.com](https://vercel.com) dan klik **"Add New Project"**.
3. Pilih repository GitHub Anda, lalu klik **"Deploy"**.
4. Website Anda langsung online dengan HTTPS gratis (contoh: `joraaa-notes.vercel.app`)!
