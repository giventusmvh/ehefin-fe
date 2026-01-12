# 📱 Penjelasan Projek Ehefin Frontend

> Dokumentasi lengkap untuk memahami aplikasi Ehefin tanpa perlu mengerti coding

---

## 📋 Daftar Isi

1. [Apa Itu Aplikasi Ini?](#1-apa-itu-aplikasi-ini)
2. [Siapa Saja Penggunanya?](#2-siapa-saja-penggunanya)
3. [Struktur Folder Projek](#3-struktur-folder-projek)
4. [Halaman-Halaman Aplikasi](#4-halaman-halaman-aplikasi)
5. [Cara Kerja Login & Keamanan](#5-cara-kerja-login--keamanan)
6. [Cara Kerja Persetujuan Pinjaman](#6-cara-kerja-persetujuan-pinjaman)
7. [Cara Kerja Admin Dashboard](#7-cara-kerja-admin-dashboard)
8. [Teknologi yang Digunakan](#8-teknologi-yang-digunakan)

---

## 1. Apa Itu Aplikasi Ini?

**Ehefin** adalah aplikasi web untuk **manajemen pinjaman** (loan management). Aplikasi ini digunakan oleh **staff internal** perusahaan untuk:

- ✅ **Memproses pengajuan pinjaman** dari customer
- ✅ **Menyetujui atau menolak** pengajuan pinjaman secara bertahap
- ✅ **Mengelola user, role, dan cabang** (untuk admin)

### Analoginya Seperti Ini:

Bayangkan seperti **sistem antrian bank**, dimana:

1. Customer mengajukan pinjaman via aplikasi handphone
2. Staff Marketing memeriksa dan menyetujui tahap 1
3. Branch Manager memeriksa dan menyetujui tahap 2
4. Backoffice memeriksa dan memberikan persetujuan final

Aplikasi ini adalah **website yang dipakai staff internal** untuk memproses semua itu!

---

## 2. Siapa Saja Penggunanya?

Aplikasi ini memiliki **4 jenis pengguna** dengan kemampuan berbeda:

| Role                  | Tugas Utama                         | Akses                |
| --------------------- | ----------------------------------- | -------------------- |
| 🟢 **MARKETING**      | Menyetujui/menolak pinjaman tahap 1 | Hanya cabang sendiri |
| 🔵 **BRANCH_MANAGER** | Menyetujui/menolak pinjaman tahap 2 | Hanya cabang sendiri |
| 🟣 **BACKOFFICE**     | Persetujuan final pinjaman          | Semua cabang         |
| 🔴 **SUPERADMIN**     | Mengelola user, role, izin akses    | Seluruh sistem       |

### Diagram Hierarki:

```
                    🔴 SUPERADMIN
                    (Kuasa penuh)
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
   🟣 BACKOFFICE   🔵 BRANCH_MANAGER   🟢 MARKETING
   (Semua cabang)    (1 cabang)        (1 cabang)
```

---

## 3. Struktur Folder Projek

Folder projek disusun seperti lemari dengan rak-rak berbeda:

```
ehefin-fe/
├── 📁 src/                      ← Isi utama aplikasi
│   ├── 📁 app/                  ← Logika dan tampilan aplikasi
│   │   ├── 📁 core/             ← "Otak" aplikasi (layanan inti)
│   │   │   ├── 📁 guards/       ← Penjaga halaman (siapa boleh akses)
│   │   │   ├── 📁 interceptors/ ← Penambah otomatis token saat kirim data
│   │   │   ├── 📁 models/       ← Template/bentuk data
│   │   │   └── 📁 services/     ← Penghubung ke server backend
│   │   │
│   │   ├── 📁 features/         ← Halaman-halaman aplikasi
│   │   │   ├── 📁 admin/        ← Dashboard admin (kelola user)
│   │   │   ├── 📁 auth/         ← Halaman login
│   │   │   ├── 📁 landing/      ← Halaman depan (publik)
│   │   │   └── 📁 workplace/    ← Dashboard kerja staff
│   │   │
│   │   └── 📁 shared/           ← Komponen & alat yang dipakai bersama
│   │
│   └── 📄 index.html            ← Pintu masuk website
│
├── 📁 docs/                     ← Dokumentasi projek
└── 📄 package.json              ← Daftar "resep" dan dependensi
```

### Penjelasan Sederhana:

| Folder      | Fungsi                                 | Analoginya                              |
| ----------- | -------------------------------------- | --------------------------------------- |
| `core/`     | Layanan inti aplikasi                  | Seperti mesin mobil                     |
| `features/` | Halaman-halaman yang bisa dikunjungi   | Seperti ruangan-ruangan di rumah        |
| `shared/`   | Komponen yang dipakai di banyak tempat | Seperti perabotan yang bisa dipindahkan |

---

## 4. Halaman-Halaman Aplikasi

### 4.1 Halaman Landing (Publik)

**Lokasi:** `src/app/features/landing/`

**Fungsi:**

- Halaman depan yang bisa diakses siapa saja
- Menampilkan produk-produk pinjaman yang tersedia
- Ada tombol untuk masuk ke halaman login staff

**Yang Ditampilkan:**

- Daftar produk (BRONZE, SILVER, GOLD, PLATINUM)
- Besar pinjaman maksimal tiap produk
- Tenor (lama cicilan) maksimal
- Bunga pinjaman

---

### 4.2 Halaman Login

**Lokasi:** `src/app/features/auth/login/`

**Fungsi:**

- Tempat staff internal memasukkan email & password
- Setelah berhasil login, otomatis diarahkan ke halaman yang sesuai role

**Alur Login:**

```
Masukkan Email & Password
         ↓
   Ada validasi?
    ↙         ↘
  Gagal      Berhasil
   ↓            ↓
Tampil       Cek Role
Error            ↓
         ┌───────┴───────┐
         ↓               ↓
    SUPERADMIN      Role Lain
         ↓               ↓
   Ke /admin        Ke /workplace
```

---

### 4.3 Halaman Workplace (Dashboard Kerja)

**Lokasi:** `src/app/features/workplace/`

**Siapa yang Akses:** Marketing, Branch Manager, Backoffice

**Fungsi:**

- Melihat daftar pengajuan pinjaman yang perlu diproses
- Melihat detail lengkap pengajuan (data customer, dokumen)
- Menyetujui atau menolak pengajuan
- Melihat riwayat persetujuan yang pernah dilakukan

**2 Tab Utama:**

| Tab         | Isi                                   |
| ----------- | ------------------------------------- |
| **Pending** | Pengajuan yang menunggu diproses      |
| **History** | Riwayat pengajuan yang sudah diproses |

**Informasi yang Bisa Dilihat:**

- Nama customer
- Jumlah pinjaman yang diajukan
- Tenor (lama cicilan)
- Bunga
- Status saat ini
- Dokumen pendukung (KTP, KK, NPWP)

---

### 4.4 Halaman Admin

**Lokasi:** `src/app/features/admin/`

**Siapa yang Akses:** Hanya SUPERADMIN

**Fungsi:**

- Mengelola daftar user internal
- Menambah, mengedit, mengaktifkan/menonaktifkan user
- Mengelola role dan permission
- Mengelola cabang (branch)

**Sub-Halaman Admin:**

| Halaman           | Fungsi                                   |
| ----------------- | ---------------------------------------- |
| `/admin/users`    | Daftar semua user, bisa tambah/edit      |
| `/admin/roles`    | Daftar role dan permission masing-masing |
| `/admin/branches` | Daftar cabang, bisa tambah/edit/hapus    |

---

## 5. Cara Kerja Login & Keamanan

### 5.1 Proses Autentikasi

```
┌───────────────────────────────────────────────────────────┐
│                    ALUR LOGIN                              │
└───────────────────────────────────────────────────────────┘

     User                    Frontend                Backend
       │                        │                       │
       │   Ketik email/pass     │                       │
       │───────────────────────►│                       │
       │                        │   POST /auth/login    │
       │                        │──────────────────────►│
       │                        │                       │
       │                        │   {token, roles,      │
       │                        │    permissions}       │
       │                        │◄──────────────────────│
       │                        │                       │
       │                        │   Simpan token        │
       │                        │   di localStorage     │
       │                        │                       │
       │   Redirect ke halaman  │                       │
       │◄───────────────────────│                       │
```

### 5.2 Token JWT

**Apa itu Token?**

Token adalah seperti **"kartu pass"** yang membuktikan bahwa user sudah login. Setiap kali aplikasi mau mengambil data dari server, token ini dikirim bersama permintaan.

**File yang Mengatur:** `src/app/core/interceptors/jwt.interceptor.ts`

**Cara Kerjanya:**

1. Setelah login berhasil, server memberikan token
2. Token disimpan di browser (localStorage)
3. Setiap permintaan ke server, token otomatis ditempelkan
4. Server memeriksa token untuk memastikan user valid

---

### 5.3 Guards (Penjaga Halaman)

**Apa itu Guard?**

Guard adalah seperti **satpam digital** yang memeriksa apakah user boleh masuk ke halaman tertentu.

**Ada 2 Jenis Guard:**

| Guard       | Fungsi                            | Lokasi                      |
| ----------- | --------------------------------- | --------------------------- |
| `authGuard` | Cek apakah sudah login            | `core/guards/auth.guard.ts` |
| `roleGuard` | Cek apakah punya role yang sesuai | `core/guards/role.guard.ts` |

**Contoh Penggunaan:**

```
Halaman /workplace:
├── Cek authGuard → Sudah login?
│   └── Belum → Redirect ke /login
└── Cek roleGuard → Punya role yang sesuai?
    └── Tidak → Redirect ke /forbidden
```

---

## 6. Cara Kerja Persetujuan Pinjaman

### 6.1 Alur Multi-Level Approval

Persetujuan pinjaman membutuhkan **3 tahap** persetujuan:

```
┌─────────────────────────────────────────────────────────────┐
│                ALUR PERSETUJUAN PINJAMAN                     │
└─────────────────────────────────────────────────────────────┘

                    Customer Submit
                          │
                          ▼
         ┌───────────────────────────────┐
         │      Status: SUBMITTED         │
         └───────────────────────────────┘
                          │
               ┌──────────┴──────────┐
               │   LEVEL 1           │
               │   (MARKETING)       │
         ┌─────┴─────┐         ┌─────┴─────┐
         │  REJECT   │         │  APPROVE  │
         └─────┬─────┘         └─────┬─────┘
               │                     │
               ▼                     ▼
         [SELESAI]           MARKETING_APPROVED
                                   │
                    ┌──────────────┴──────────────┐
                    │   LEVEL 2                   │
                    │   (BRANCH MANAGER)          │
              ┌─────┴─────┐              ┌────────┴────────┐
              │  REJECT   │              │    APPROVE      │
              └─────┬─────┘              └────────┬────────┘
                    │                             │
                    ▼                             ▼
              [SELESAI]              BRANCH_MANAGER_APPROVED
                                              │
                               ┌──────────────┴──────────────┐
                               │   LEVEL 3                   │
                               │   (BACKOFFICE)              │
                         ┌─────┴─────┐              ┌────────┴────────┐
                         │  REJECT   │              │    APPROVE      │
                         └─────┬─────┘              └────────┬────────┘
                               │                             │
                               ▼                             ▼
                         [DITOLAK]                    [DISETUJUI]
                                                      Pinjaman Cair!
```

### 6.2 Status Pinjaman

| Status                    | Artinya         | Siapa yang Proses |
| ------------------------- | --------------- | ----------------- |
| `SUBMITTED`               | Baru diajukan   | Marketing         |
| `MARKETING_APPROVED`      | Lolos tahap 1   | Branch Manager    |
| `MARKETING_REJECTED`      | Ditolak tahap 1 | - (selesai)       |
| `BRANCH_MANAGER_APPROVED` | Lolos tahap 2   | Backoffice        |
| `BRANCH_MANAGER_REJECTED` | Ditolak tahap 2 | - (selesai)       |
| `APPROVED`                | Disetujui final | - (pinjaman cair) |
| `REJECTED`                | Ditolak final   | - (selesai)       |

### 6.3 Pembatasan Akses Cabang

Marketing dan Branch Manager **hanya bisa melihat dan memproses** pengajuan dari **cabang mereka sendiri**.

Backoffice bisa melihat pengajuan dari **semua cabang**.

---

## 7. Cara Kerja Admin Dashboard

### 7.1 Manajemen User

**File Terkait:** `src/app/features/admin/users/`

**Kemampuan:**

- ➕ Menambah user baru
- ✏️ Mengedit data user (nama, email, cabang)
- 🔄 Mengubah status aktif/non-aktif
- 🎭 Menambah/menghapus role user

### 7.2 Manajemen Role & Permission

**File Terkait:** `src/app/features/admin/roles/`

**Kemampuan:**

- 👁️ Melihat daftar semua role
- 🔐 Melihat permission yang dimiliki tiap role
- ✏️ Mengubah permission yang dimiliki role

**Contoh Permission:**

| Kode           | Artinya                   |
| -------------- | ------------------------- |
| `USER_READ`    | Boleh melihat daftar user |
| `USER_WRITE`   | Boleh menambah/edit user  |
| `LOAN_APPROVE` | Boleh menyetujui pinjaman |
| `LOAN_REJECT`  | Boleh menolak pinjaman    |

### 7.3 Manajemen Cabang

**File Terkait:** `src/app/features/admin/branches/`

**Kemampuan:**

- 👁️ Melihat daftar semua cabang
- ➕ Menambah cabang baru
- ✏️ Mengedit kode dan lokasi cabang
- 🗑️ Menghapus cabang

---

## 8. Teknologi yang Digunakan

### 8.1 Framework & Bahasa

| Teknologi       | Kegunaan                                                       |
| --------------- | -------------------------------------------------------------- |
| **Angular**     | Framework utama untuk membangun aplikasi web                   |
| **TypeScript**  | Bahasa pemrograman (seperti JavaScript yang lebih terstruktur) |
| **TailwindCSS** | Untuk styling/tampilan visual                                  |

### 8.2 Konsep Angular yang Dipakai

| Konsep                    | Penjelasan Sederhana                               |
| ------------------------- | -------------------------------------------------- |
| **Standalone Components** | Komponen mandiri tanpa perlu modul                 |
| **Signals**               | Cara modern untuk mengelola data yang berubah      |
| **Lazy Loading**          | Halaman dimuat hanya saat dibutuhkan (lebih cepat) |
| **Guards**                | Penjaga akses halaman                              |
| **Interceptors**          | Penambah otomatis data ke setiap permintaan        |
| **Services**              | Penghubung ke server backend                       |

### 8.3 Cara Aplikasi Berkomunikasi dengan Server

```
┌─────────────────────────────────────────────────────────────┐
│                    ALUR KOMUNIKASI                           │
└─────────────────────────────────────────────────────────────┘

   Frontend (Angular)                          Backend (Spring Boot)
         │                                              │
         │   1️⃣ Kirim permintaan data                   │
         │   (HTTP GET/POST/PUT/DELETE)                 │
         │──────────────────────────────────────────────►
         │                                              │
         │   2️⃣ JWT Interceptor menambahkan token       │
         │                                              │
         │   3️⃣ Backend memeriksa token                 │
         │                                              │
         │◄──────────────────────────────────────────────
         │   4️⃣ Kirim data response                     │
         │                                              │
```

---

## 📝 Ringkasan

| Komponen         | Fungsi                                      |
| ---------------- | ------------------------------------------- |
| **Landing Page** | Halaman publik untuk info produk            |
| **Login**        | Pintu masuk staff internal                  |
| **Workplace**    | Dashboard untuk proses persetujuan pinjaman |
| **Admin**        | Dashboard untuk kelola user, role, cabang   |
| **Guards**       | Penjaga akses halaman                       |
| **Interceptors** | Penambah token otomatis                     |
| **Services**     | Penghubung ke server backend                |

---

_Dokumentasi dibuat: 2026-01-12_
