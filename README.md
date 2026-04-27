# STOCK.OI MVP

STOCK.OI adalah prototype web untuk **inventory status control**, **anomaly detection**, dan **operational visibility** di area manufaktur.

## Revisi utama yang sudah diterapkan
- Brand aplikasi memakai nama **STOCK.OI**
- Sidebar dibuat **fixed di kiri** saat halaman di-scroll
- Searchbar global hanya muncul di **Dashboard**
- Tombol **notification** dan **help** berfungsi sebagai quick panel
- **Digital Receiving** tidak lagi menjadi flow utama dan diarahkan ke **Smart Capture**
- Dashboard hanya menampilkan **Receiving Activity**, tanpa tombol input manual
- **Smart Capture** mendukung dua alur upload:
  - **Single document**: PDF / JPG / JPEG / PNG
  - **Batch upload**: CSV / XLS / XLSX
- **Validation Queue**: 5 data per halaman + pagination + kolom **Source**
- **Alert & Anomaly**: 5 data per halaman + pagination
- **Status Board**:
  - panel distribusi dirapikan dan ditambah insight cards
  - tabel **Latest material by status** memakai pagination 10 data per halaman
- **Movement Timeline**:
  - pagination 7 data per halaman
  - filter **date range**
  - panel **Related transactions** dirapikan
- **Audit Trail**:
  - filter **date range**
  - pagination terpisah untuk Audit Log, Exception Report, dan Aging Hold Cases
- Format jam di seluruh aplikasi sudah memakai **titik dua**, misalnya `07:58:00 WIB`
- Ditambahkan page baru **Validation Report** untuk melihat snapshot status akhir material berdasarkan tanggal dan **Print / Save PDF**

## Page yang tersedia
- Dashboard
- Smart Capture
- Validation
- Status Board
- Alert & Anomaly
- Movement Timeline
- Audit Trail
- Validation Report
- Material Master
- Location Master
- User Management
- Logout
- Review Detail per transaction

## Stack
- Next.js App Router
- React
- Tailwind CSS v4
- CSV data source via `csv-parse`

## Jalankan lokal
Gunakan **Node.js 20+**.

```bash
npm install
npm run dev
```

Script `dev` sudah memakai **Webpack** secara default agar lebih aman di Windows.

Buka:

```bash
http://localhost:3000
```

## Catatan demo
- Prototype ini fokus ke demo hackathon, jadi submit form dan keputusan review masih berupa **demo/local UI flow**
- Validation Report memakai **browser print dialog** untuk ekspor PDF. Saat halaman print terbuka, pilih **Save as PDF**
- KPI, queue, anomaly feed, audit trail, status board, dan report memakai dataset CSV yang di-upload
- Route alias tetap dipertahankan:
  - `/intake` -> `/receiving/smart-capture`
  - `/validation` -> `/receiving/validation`
  - `/audit` -> `/tracking/audit-trail`

## Revisi Validation Report v3.1
- Filter tanggal di Validation Report sekarang bersifat **tanggal spesifik**, bukan running snapshot.
- Jika memilih `26/03/2026`, laporan dan halaman print hanya menampilkan material yang diperbarui pada `26/03/2026`, sehingga tanggal sebelumnya tidak ikut masuk ke PDF.
