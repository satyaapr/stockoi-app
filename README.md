# STOCK.OI | STOCK OPERATIONAL INTELLIGENCE

STOCK.OI adalah prototype web untuk **inventory status control**, **anomaly detection**, dan **operational visibility** di area manufaktur.

## Alur/Cara Penggunaan Aplikasi
- User masuk ke Dashboard untuk melihat kondisi inventaris secara real-time
- User upload dokumen atau batch file di Receiving Automation 
- Sistem mengekstrak data dan mengirimkannya ke Validation Queue
- Sistem memberi rekomendasi status dan menandai anomaly
- Supervisor meninjau kasus penting di Review Detail
- Semua perubahan tercatat di Status Board, Movement Timeline, dan Audit Trail
- User membuat Validation Report berdasarkan rentang tanggal dan mengekspornya ke PDF

## Page yang tersedia
- Dashboard
- Receiving Automation
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

ATAU

npm.cmd install
npm.cmd run dev
```

Buka:

```bash
http://localhost:3000
```


## Revisi Validation Report v3.1
- Filter tanggal di Validation Report sekarang bersifat **tanggal spesifik**, bukan running snapshot.
- Jika memilih `26/03/2026`, laporan dan halaman print hanya menampilkan material yang diperbarui pada `26/03/2026`, sehingga tanggal sebelumnya tidak ikut masuk ke PDF.

## Update v3.2 - Validation Report Date Range

Validation Report sekarang memakai dua tanggal:

- **From Date**: tanggal awal report
- **To Date**: tanggal akhir report

Setelah apply date range, daftar status akhir material hanya mengambil data dalam rentang tanggal tersebut dan diurutkan dari update terbaru ke terlama. Fitur Print / Save PDF memakai rentang tanggal yang sama.
