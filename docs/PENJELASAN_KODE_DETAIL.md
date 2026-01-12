# 🔧 Penjelasan Kode Detail

> Dokumentasi teknis untuk setiap file penting di projek Ehefin Frontend

---

## 📋 Daftar Isi

1. [File Konfigurasi Utama](#1-file-konfigurasi-utama)
2. [Core Services (Layanan Inti)](#2-core-services-layanan-inti)
3. [Guards (Penjaga Akses)](#3-guards-penjaga-akses)
4. [Interceptors (Pengolah Request)](#4-interceptors-pengolah-request)
5. [Models (Template Data)](#5-models-template-data)
6. [Features (Halaman-Halaman)](#6-features-halaman-halaman)

---

## 1. File Konfigurasi Utama

### 1.1 `app.routes.ts` - Peta Navigasi Aplikasi

**Lokasi:** `src/app/app.routes.ts`

**Fungsi:** Menentukan halaman mana yang bisa diakses dari URL tertentu.

**Isi nya seperti ini:**

| URL          | Halaman           | Siapa yang Boleh Akses                                    |
| ------------ | ----------------- | --------------------------------------------------------- |
| `/`          | Landing Page      | Semua orang                                               |
| `/login`     | Halaman Login     | Semua orang                                               |
| `/workplace` | Dashboard Kerja   | Staff (Marketing, Branch Manager, Backoffice, Superadmin) |
| `/admin`     | Dashboard Admin   | Hanya Superadmin                                          |
| `/forbidden` | Halaman Terlarang | Ketika akses ditolak                                      |

**Cara Kerjanya:**

```
User ketik URL → Angular cek routes → Ada guard?
                                         │
                      ┌──────────────────┴──────────────────┐
                      ▼                                     ▼
                   Ada guard                           Tidak ada guard
                      │                                     │
                      ▼                                     │
                Cek izin akses                              │
                ┌────┴────┐                                 │
                ▼         ▼                                 │
             Lulus     Gagal                                │
                │         │                                 │
                ▼         ▼                                 ▼
         Tampil halaman   Redirect              Langsung tampil halaman
```

---

### 1.2 `app.config.ts` - Pengaturan Aplikasi

**Lokasi:** `src/app/app.config.ts`

**Fungsi:** Mengatur "bahan-bahan" yang dibutuhkan aplikasi untuk berjalan.

**Yang Diatur:**

- Router (sistem navigasi)
- HttpClient (penghubung ke server)
- Interceptors (pengolah request)
- Animasi & transisi

---

## 2. Core Services (Layanan Inti)

### 2.1 `auth.service.ts` - Layanan Login/Logout

**Lokasi:** `src/app/core/services/auth.service.ts`

**Fungsi:** Mengelola semua hal terkait login, logout, dan informasi user yang sedang login.

**Kemampuan:**

| Method                      | Fungsi                              |
| --------------------------- | ----------------------------------- |
| `login(email, password)`    | Mengirim data login ke server       |
| `logout()`                  | Keluar dari sistem                  |
| `getToken()`                | Mengambil token autentikasi         |
| `hasRole(role)`             | Cek apakah user punya role tertentu |
| `hasPermission(permission)` | Cek apakah user punya izin tertentu |

**Data yang Disimpan (dalam memori & localStorage):**

- Token autentikasi
- Nama user
- Email user
- Daftar role
- Daftar permission

**Cara Kerjanya:**

```
Login berhasil
      │
      ▼
Simpan ke localStorage ──► Token + Data User
      │
      ▼
Update Signal ──► isAuthenticated = true
      │           user = {nama, email, roles...}
      │
      ▼
Redirect ke halaman yang sesuai
```

---

### 2.2 `approval.service.ts` - Layanan Persetujuan

**Lokasi:** `src/app/core/services/approval.service.ts`

**Fungsi:** Menghubungkan aplikasi dengan API persetujuan pinjaman.

**Kemampuan:**

| Method                   | Fungsi                             | URL API                     |
| ------------------------ | ---------------------------------- | --------------------------- |
| `getPendingLoans()`      | Ambil daftar pinjaman yang pending | GET /approval/pending       |
| `getMyApprovalHistory()` | Ambil riwayat persetujuan saya     | GET /approval/my-history    |
| `getLoanById(id)`        | Ambil detail pinjaman              | GET /loans/{id}             |
| `getLoanHistory(id)`     | Ambil riwayat status pinjaman      | GET /loans/{id}/history     |
| `approve(id, request)`   | Setujui pinjaman                   | POST /approval/{id}/approve |
| `reject(id, request)`    | Tolak pinjaman                     | POST /approval/{id}/reject  |

---

### 2.3 `admin.service.ts` - Layanan Admin

**Lokasi:** `src/app/core/services/admin.service.ts`

**Fungsi:** Menghubungkan aplikasi dengan API admin untuk kelola user, role, dan cabang.

**Kemampuan Utama:**

**Untuk User:**
| Method | Fungsi |
|--------|--------|
| `getUsers()` | Ambil daftar semua user |
| `getUser(id)` | Ambil detail satu user |
| `createUser(request)` | Buat user baru |
| `updateUser(id, data)` | Update data user |
| `updateUserStatus(id, isActive)` | Aktifkan/nonaktifkan user |
| `assignRole(userId, roleId)` | Tambah role ke user |
| `removeRole(userId, roleId)` | Hapus role dari user |

**Untuk Role:**
| Method | Fungsi |
|--------|--------|
| `getRoles()` | Ambil daftar semua role |
| `updateRolePermissions(roleId, permissionIds)` | Update permission role |

**Untuk Branch:**
| Method | Fungsi |
|--------|--------|
| `getBranches()` | Ambil daftar semua cabang |
| `createBranch(data)` | Buat cabang baru |
| `updateBranch(id, data)` | Update cabang |
| `deleteBranch(id)` | Hapus cabang |

---

## 3. Guards (Penjaga Akses)

### 3.1 `auth.guard.ts` - Penjaga Login

**Lokasi:** `src/app/core/guards/auth.guard.ts`

**Fungsi:** Memastikan user sudah login sebelum bisa mengakses halaman tertentu.

**Logika:**

```
User mau akses halaman yang di-protect
            │
            ▼
     Sudah login?
      ┌────┴────┐
      ▼         ▼
     Ya       Tidak
      │         │
      ▼         ▼
  Boleh      Redirect
  masuk      ke /login
```

---

### 3.2 `role.guard.ts` - Penjaga Role

**Lokasi:** `src/app/core/guards/role.guard.ts`

**Fungsi:** Memastikan user punya role yang tepat untuk mengakses halaman.

**Logika:**

```
User mau akses halaman dengan role tertentu
            │
            ▼
   Punya role yang sesuai?
      ┌────┴────┐
      ▼         ▼
     Ya       Tidak
      │         │
      ▼         ▼
  Boleh      Redirect
  masuk      ke /forbidden
```

**Contoh Penggunaan:**

```typescript
// Di app.routes.ts
{
  path: 'workplace',
  canActivate: [authGuard, roleGuard(['MARKETING', 'BRANCH_MANAGER', 'BACKOFFICE'])],
  ...
}
```

Artinya: Halaman `/workplace` hanya bisa diakses oleh user yang:

1. Sudah login (authGuard)
2. Punya role MARKETING, BRANCH_MANAGER, atau BACKOFFICE (roleGuard)

---

## 4. Interceptors (Pengolah Request)

### 4.1 `jwt.interceptor.ts` - Penambah Token

**Lokasi:** `src/app/core/interceptors/jwt.interceptor.ts`

**Fungsi:** Otomatis menambahkan token autentikasi ke setiap permintaan ke server.

**Cara Kerjanya:**

```
Aplikasi mau kirim data ke server
            │
            ▼
    JWT Interceptor menangkap
            │
            ▼
     Ada token tersimpan?
      ┌────┴────┐
      ▼         ▼
     Ya       Tidak
      │         │
      ▼         ▼
 Tambahkan    Kirim
 header:      seperti
 "Bearer xxx" biasa
      │         │
      └────┬────┘
           ▼
    Kirim ke server
```

**Sebelum Interceptor:**

```
Request tanpa token
GET /api/approval/pending
```

**Setelah Interceptor:**

```
Request dengan token
GET /api/approval/pending
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 5. Models (Template Data)

### 5.1 `user.model.ts` - Template Data User

**Lokasi:** `src/app/core/models/user.model.ts`

**Isi:**

| Interface           | Kegunaan                              |
| ------------------- | ------------------------------------- |
| `AuthResponse`      | Format data setelah login berhasil    |
| `User`              | Format data user lengkap              |
| `UserProfile`       | Format profil user (NIK, alamat, dll) |
| `UserBranch`        | Format data cabang                    |
| `Role`              | Format data role                      |
| `Permission`        | Format data permission                |
| `CreateUserRequest` | Format untuk membuat user baru        |

**Contoh Struktur User:**

```
User
├── id: 1
├── name: "John Doe"
├── email: "john@example.com"
├── userType: "INTERNAL"
├── isActive: true
├── roles: ["MARKETING"]
├── branch:
│   ├── id: 1
│   ├── code: "JKT001"
│   └── location: "Jakarta Pusat"
└── profile:
    ├── nik: "3174012345678901"
    ├── birthdate: "1990-01-15"
    ├── phone: "08123456789"
    └── address: "Jl. Sudirman No. 1"
```

---

### 5.2 `loan.model.ts` - Template Data Pinjaman

**Lokasi:** `src/app/core/models/loan.model.ts`

**Isi:**

| Interface             | Kegunaan                        |
| --------------------- | ------------------------------- |
| `LoanStatus`          | Daftar status yang mungkin      |
| `LoanApplication`     | Format data pengajuan pinjaman  |
| `LoanHistory`         | Format riwayat perubahan status |
| `Product`             | Format data produk pinjaman     |
| `Branch`              | Format data cabang              |
| `ApprovalRequest`     | Format untuk approve/reject     |
| `ApprovalHistoryItem` | Format riwayat approval staff   |

**Contoh Struktur LoanApplication:**

```
LoanApplication
├── id: 101
├── customerId: 50
├── customerName: "Jane Smith"
├── customerEmail: "jane@email.com"
├── customerNik: "3171234567890123"
├── customerPhone: "08987654321"
├── customerAddress: "Jl. Thamrin No. 2"
├── productId: 2
├── productName: "SILVER"
├── branchId: 1
├── branchName: "Jakarta Pusat"
├── requestedAmount: 5000000
├── requestedTenor: 12
├── requestedRate: 10
├── status: "SUBMITTED"
└── createdAt: "2024-01-15T10:30:00"
```

---

## 6. Features (Halaman-Halaman)

### 6.1 `landing.ts` - Halaman Utama

**Lokasi:** `src/app/features/landing/landing.ts`

**Fungsi:**

- Menampilkan halaman depan yang bisa diakses publik
- Memuat daftar produk pinjaman dari server
- Menampilkan informasi produk dalam format yang menarik

**Proses saat halaman dibuka:**

```
Halaman dibuka (ngOnInit)
        │
        ▼
Panggil API: GET /products
        │
        ▼
Simpan data produk ke signal
        │
        ▼
Tampilkan di halaman
```

---

### 6.2 `login.ts` - Halaman Login

**Lokasi:** `src/app/features/auth/login/login.ts`

**Fungsi:**

- Menampilkan form login (email & password)
- Memproses login dan mengarahkan ke halaman yang sesuai

**Alur Login:**

```
User isi email & password
        │
        ▼
Klik tombol Login
        │
        ▼
Validasi input (tidak boleh kosong)
        │
    ┌───┴───┐
    ▼       ▼
  Error   Lanjut
    │       │
    ▼       ▼
Tampil    Panggil authService.login()
pesan           │
          ┌─────┴─────┐
          ▼           ▼
      Berhasil      Gagal
          │           │
          ▼           ▼
    Cek role      Tampil error
    ┌───┴───┐
    ▼       ▼
SUPERADMIN  Role lain
    │         │
    ▼         ▼
  /admin  /workplace
```

---

### 6.3 `workplace.ts` - Dashboard Kerja

**Lokasi:** `src/app/features/workplace/workplace.ts`

**Fungsi:**

- Menampilkan daftar pinjaman yang perlu diproses
- Menampilkan detail pinjaman yang dipilih
- Memungkinkan approve/reject pinjaman
- Menampilkan riwayat approval yang pernah dilakukan

**State (Data yang Dikelola):**

| Signal            | Isi                     | Tipe                     |
| ----------------- | ----------------------- | ------------------------ |
| `activeTab`       | Tab yang aktif          | 'pending' atau 'history' |
| `loans`           | Daftar pinjaman pending | Array                    |
| `selectedLoan`    | Pinjaman yang dipilih   | Object                   |
| `history`         | Riwayat status pinjaman | Array                    |
| `loading`         | Status loading          | Boolean                  |
| `approvalHistory` | Riwayat approval staff  | Array                    |

**Proses Approve/Reject:**

```
User pilih pinjaman
        │
        ▼
Detail pinjaman ditampilkan
        │
        ▼
User tulis catatan (wajib untuk reject)
        │
        ▼
User klik Approve/Reject
        │
    ┌───┴───┐
    ▼       ▼
Approve   Reject
    │         │
    ▼         ▼
POST      POST
/approve  /reject
    │         │
    └────┬────┘
         ▼
Refresh daftar pending
```

---

### 6.4 Folder `admin/` - Dashboard Admin

**Lokasi:** `src/app/features/admin/`

**Struktur:**

```
admin/
├── admin-layout.ts    ← Kerangka halaman admin
├── admin.routes.ts    ← Routing khusus admin
├── users/             ← Manajemen user
│   ├── user-list.ts   ← Daftar user
│   └── user-form.ts   ← Form tambah/edit user
├── roles/             ← Manajemen role
│   └── role-list.ts   ← Daftar role & permission
└── branches/          ← Manajemen cabang
    └── branch-list.ts ← Daftar cabang
```

**Fungsi Tiap Sub-Halaman:**

| Halaman       | Fungsi                                             |
| ------------- | -------------------------------------------------- |
| `user-list`   | Menampilkan daftar user, filter, aktif/nonaktifkan |
| `user-form`   | Form untuk tambah atau edit user                   |
| `role-list`   | Menampilkan role dan edit permission               |
| `branch-list` | Menampilkan, tambah, edit, hapus cabang            |

---

## 📊 Ringkasan Hubungan Antar File

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     BAGAIMANA SEMUANYA TERHUBUNG                        │
└─────────────────────────────────────────────────────────────────────────┘

                        app.routes.ts
                    (Peta semua halaman)
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
    ┌────▼────┐      ┌──────▼──────┐    ┌──────▼──────┐
    │ Landing │      │   Login     │    │  Workplace  │
    │ Page    │      │   Page      │    │  Dashboard  │
    └────┬────┘      └──────┬──────┘    └──────┬──────┘
         │                  │                  │
         │                  │                  │
         │           ┌──────▼──────┐    ┌──────▼──────┐
         │           │ AuthService │    │ ApprovalSvc │
         │           └──────┬──────┘    └──────┬──────┘
         │                  │                  │
         │                  └────────┬─────────┘
         │                           │
         │                    ┌──────▼──────┐
         │                    │  JWT        │
         │                    │ Interceptor │
         │                    └──────┬──────┘
         │                           │
         └───────────────────────────┼───────────────
                                     │
                              ┌──────▼──────┐
                              │   Backend   │
                              │   Server    │
                              └─────────────┘
```

---

_Dokumentasi dibuat: 2026-01-12_
