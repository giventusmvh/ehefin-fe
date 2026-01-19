# 🔧 Penjelasan Kode Detail

> Dokumentasi teknis untuk setiap file penting di projek Ehefin Frontend

---

## 📋 Daftar Isi

1. [File Konfigurasi Utama](#1-file-konfigurasi-utama)
2. [Core Services (Layanan Inti)](#2-core-services-layanan-inti)
3. [Guards (Penjaga Akses)](#3-guards-penjaga-akses)
4. [Interceptors (Pengolah Request)](#4-interceptors-pengolah-request)
5. [Models (Template Data)](#5-models-template-data)
6. [Facades (Pengelola State)](#6-facades-pengelola-state)
7. [Features (Halaman-Halaman)](#7-features-halaman-halaman)

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

## 6. Facades (Pengelola State)

> **INFO:** Facade Pattern adalah arsitektur yang digunakan di projek ini untuk mengelola state dan menyembunyikan kompleksitas interaksi dengan services. Setiap feature utama memiliki Facade sendiri.

### 6.1 `workplace.facade.ts` - Facade Loan Approval

**Lokasi:** `src/app/features/workplace/workplace.facade.ts`

**Fungsi:** Mengelola state dan operasi untuk workflow approval pinjaman.

**State Signals:**

| Signal            | Tipe                    | Fungsi                             |
| ----------------- | ----------------------- | ---------------------------------- |
| `loans`           | `LoanApplication[]`     | Daftar pinjaman pending            |
| `selectedLoan`    | `LoanApplication\|null` | Pinjaman yang sedang dipilih       |
| `loanHistory`     | `LoanHistory[]`         | Riwayat status pinjaman            |
| `approvalHistory` | `ApprovalHistoryItem[]` | Riwayat approval yang user lakukan |
| `loading`         | `boolean`               | Loading saat load pending loans    |
| `historyLoading`  | `boolean`               | Loading saat load history          |
| `actionLoading`   | `boolean`               | Loading saat approve/reject        |

**Computed Signals:**

| Signal     | Fungsi                                         |
| ---------- | ---------------------------------------------- |
| `userName` | Mengambil nama user dari AuthService           |
| `roleName` | Mengambil dan format nama role user yang aktif |

**Methods:**

| Method                  | Fungsi                               |
| ----------------------- | ------------------------------------ |
| `loadPendingLoans()`    | Memuat daftar pinjaman pending       |
| `loadApprovalHistory()` | Memuat riwayat approval staff        |
| `selectLoan(loan)`      | Memilih pinjaman dan load detail     |
| `clearSelection()`      | Menghapus pilihan pinjaman           |
| `approve(note?)`        | Menyetujui pinjaman (return Promise) |
| `reject(note)`          | Menolak pinjaman (return Promise)    |

---

### 6.2 `user.facade.ts` - Facade User Management

**Lokasi:** `src/app/features/admin/users/user.facade.ts`

**Fungsi:** Mengelola state dan operasi CRUD untuk user management.

**State Signals:**

| Signal             | Tipe           | Fungsi                        |
| ------------------ | -------------- | ----------------------------- |
| `users`            | `User[]`       | Daftar semua user             |
| `roles`            | `Role[]`       | Daftar roles (cached)         |
| `branches`         | `UserBranch[]` | Daftar cabang (cached)        |
| `loading`          | `boolean`      | Loading saat load users       |
| `saving`           | `boolean`      | Loading saat create/update    |
| `error`            | `string\|null` | Pesan error                   |
| `togglingStatusId` | `number\|null` | ID user yang sedang di-toggle |

**Computed Signals:**

| Signal        | Fungsi                             |
| ------------- | ---------------------------------- |
| `hasUsers`    | Cek apakah ada user dalam list     |
| `hasRoles`    | Cek apakah roles sudah ter-load    |
| `hasBranches` | Cek apakah branches sudah ter-load |

**Methods:**

| Method                       | Fungsi                                    |
| ---------------------------- | ----------------------------------------- |
| `loadUsers()`                | Memuat daftar users                       |
| `loadRoles()`                | Memuat daftar roles (dengan caching)      |
| `loadBranches()`             | Memuat daftar branches (dengan caching)   |
| `loadSupportingData()`       | Memuat roles & branches untuk form        |
| `createUser(request)`        | Membuat user baru                         |
| `updateUser(id, data)`       | Update data user                          |
| `toggleUserStatus(user)`     | Aktifkan/nonaktifkan user (dengan dialog) |
| `assignRole(userId, roleId)` | Menambah role ke user                     |
| `removeRole(user, roleName)` | Menghapus role dari user (dengan dialog)  |
| `clearError()`               | Menghapus pesan error                     |
| `getUserById(id)`            | Mendapatkan user dari local state         |

---

### 6.3 `role.facade.ts` - Facade Role & Permission

**Lokasi:** `src/app/features/admin/roles/role.facade.ts`

**Fungsi:** Mengelola state dan operasi untuk role & permission management.

**State Signals:**

| Signal        | Tipe           | Fungsi                   |
| ------------- | -------------- | ------------------------ |
| `roles`       | `Role[]`       | Daftar roles             |
| `permissions` | `Permission[]` | Daftar semua permissions |
| `loading`     | `boolean`      | Loading saat load roles  |
| `saving`      | `boolean`      | Loading saat update      |
| `error`       | `string\|null` | Pesan error              |

**Methods:**

| Method                                         | Fungsi                      |
| ---------------------------------------------- | --------------------------- |
| `loadRoles()`                                  | Memuat daftar roles         |
| `loadPermissions()`                            | Memuat permissions (cached) |
| `updateRolePermissions(roleId, permissionIds)` | Update permissions role     |
| `clearError()`                                 | Menghapus pesan error       |

---

### 6.4 `branch.facade.ts` - Facade Branch Management

**Lokasi:** `src/app/features/admin/branches/branch.facade.ts`

**Fungsi:** Mengelola state dan operasi CRUD untuk branch (cabang).

**State Signals:**

| Signal     | Tipe           | Fungsi            |
| ---------- | -------------- | ----------------- |
| `branches` | `UserBranch[]` | Daftar cabang     |
| `loading`  | `boolean`      | Loading saat load |
| `saving`   | `boolean`      | Loading saat save |
| `error`    | `string\|null` | Pesan error       |

**Methods:**

| Method                   | Fungsi                                    |
| ------------------------ | ----------------------------------------- |
| `loadBranches()`         | Memuat daftar cabang                      |
| `createBranch(data)`     | Membuat cabang baru                       |
| `updateBranch(id, data)` | Update data cabang                        |
| `deleteBranch(branch)`   | Hapus cabang (dengan confirmation dialog) |
| `clearError()`           | Menghapus pesan error                     |

---

### 6.5 Cara Kerja Facade Pattern

```
┌─────────────────────────────────────────────────────────────┐
│                   ARSITEKTUR FACADE                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────┐
│     Component       │   ← Hanya inject Facade
│   (workplace.ts)    │   ← Tidak tahu detail services
└──────────┬──────────┘
           │ inject
           ▼
┌─────────────────────┐
│      FACADE         │   ← Mengelola State (signals)
│ (WorkplaceFacade)   │   ← Menyediakan Methods
│                     │   ← Menyembunyikan kompleksitas
└──────────┬──────────┘
           │ inject
           ▼
┌─────────────────────┐
│     Services        │   ← HTTP calls ke API
│ (ApprovalService)   │   ← Low-level operations
└─────────────────────┘
```

**Keuntungan Menggunakan Facade:**

| Aspek                | Tanpa Facade          | Dengan Facade        |
| -------------------- | --------------------- | -------------------- |
| Component Size       | 200+ baris            | ~80 baris            |
| State Management     | Tersebar di component | Terpusat di Facade   |
| Testability          | Sulit                 | Mudah                |
| State Sharing        | Tidak bisa            | Bisa antar component |
| Service Dependencies | Banyak inject         | Satu inject (Facade) |

---

## 7. Features (Halaman-Halaman)

### 7.1 `landing.ts` - Halaman Utama

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

### 7.2 `login.ts` - Halaman Login

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

### 7.3 `workplace.ts` - Dashboard Kerja

**Lokasi:** `src/app/features/workplace/workplace.ts`

**Menggunakan:** `WorkplaceFacade` (lihat [Section 6.1](#61-workplacefacadets---facade-loan-approval))

**Fungsi:**

- Menampilkan daftar pinjaman yang perlu diproses
- Menampilkan detail pinjaman yang dipilih
- Memungkinkan approve/reject pinjaman
- Menampilkan riwayat approval yang pernah dilakukan

**Arsitektur dengan Facade:**

```typescript
// Component hanya perlu inject Facade
export class WorkplaceComponent {
  private facade = inject(WorkplaceFacade);

  // Expose signals dari Facade
  loans = this.facade.loans;
  loading = this.facade.loading;
  selectedLoan = this.facade.selectedLoan;

  ngOnInit() {
    this.facade.loadPendingLoans();
  }

  async onApprove(note: string) {
    await this.facade.approve(note);
  }
}
```

**State yang dikelola Facade:**

| Signal            | Isi                     | Tipe                     |
| ----------------- | ----------------------- | ------------------------ |
| `activeTab`       | Tab yang aktif          | 'pending' atau 'history' |
| `loans`           | Daftar pinjaman pending | Array                    |
| `selectedLoan`    | Pinjaman yang dipilih   | Object                   |
| `loanHistory`     | Riwayat status pinjaman | Array                    |
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

### 7.4 Folder `admin/` - Dashboard Admin

**Lokasi:** `src/app/features/admin/`

**Struktur dengan Facades:**

```
admin/
├── admin-layout.ts        ← Kerangka halaman admin
├── admin.routes.ts        ← Routing khusus admin
├── users/                 ← Manajemen user
│   ├── user-list.ts       ← Daftar user (inject UserFacade)
│   ├── user-form.ts       ← Form tambah/edit user (inject UserFacade)
│   └── user.facade.ts     ← STATE & LOGIC untuk user management
├── roles/                 ← Manajemen role
│   ├── role-list.ts       ← Daftar role (inject RoleFacade)
│   └── role.facade.ts     ← STATE & LOGIC untuk role management
└── branches/              ← Manajemen cabang
    ├── branch-list.ts     ← Daftar cabang (inject BranchFacade)
    └── branch.facade.ts   ← STATE & LOGIC untuk branch management
```

**Facade per Sub-Halaman:**

| Halaman       | Facade         | Fungsi                                        |
| ------------- | -------------- | --------------------------------------------- |
| `user-list`   | `UserFacade`   | CRUD user, toggle status, assign/remove role  |
| `user-form`   | `UserFacade`   | Create user (state di-share dengan user-list) |
| `role-list`   | `RoleFacade`   | Load roles, update permissions                |
| `branch-list` | `BranchFacade` | CRUD branch dengan confirmation dialog        |

---

## 📊 Ringkasan Hubungan Antar File

```
┌─────────────────────────────────────────────────────────────────────────┐
│                  ARSITEKTUR DENGAN FACADE PATTERN                        │
└─────────────────────────────────────────────────────────────────────────┘

                        app.routes.ts
                    (Peta semua halaman)
                            │
     ┌──────────────────────┼──────────────────────────┐
     │                      │                          │
┌────▼────┐          ┌──────▼──────┐            ┌──────▼──────┐
│ Landing │          │   Login     │            │    Admin    │
│  Page   │          │   Page      │            │  Dashboard  │
└────┬────┘          └──────┬──────┘            └──────┬──────┘
     │                      │                          │
     │                      │               ┌──────────┼──────────┐
     │                      │               │          │          │
     │                      │          ┌────▼────┐┌────▼────┐┌────▼────┐
     │                      │          │UserFacd ││RoleFacd ││BrchFacd │
     │                      │          └────┬────┘└────┬────┘└────┬────┘
     │                      │               └──────────┼──────────┘
     │                      │                          │
     │               ┌──────▼──────┐            ┌──────▼──────┐
     │               │ AuthService │            │ AdminService│
     │               └──────┬──────┘            └──────┬──────┘
     │                      │                          │
     │                      │           ┌──────────────┘
     │                      │           │
┌────▼────────┐      ┌──────▼──────┐    │
│  Workplace  │      │  JWT        │    │
│  Dashboard  │      │ Interceptor │    │
└──────┬──────┘      └──────┬──────┘    │
       │                    │           │
┌──────▼──────┐             │           │
│ Workplace   │             │           │
│  Facade     │             │           │
└──────┬──────┘             │           │
       │                    │           │
┌──────▼──────┐             │           │
│ ApprovalSvc │             │           │
└──────┬──────┘             │           │
       │                    │           │
       └────────────────────┼───────────┘
                            │
                     ┌──────▼──────┐
                     │   Backend   │
                     │   Server    │
                     └─────────────┘
```

### Daftar Semua Facades

| Facade            | Lokasi                                     | Fungsi                       |
| ----------------- | ------------------------------------------ | ---------------------------- |
| `WorkplaceFacade` | `features/workplace/workplace.facade.ts`   | Loan approval workflow       |
| `UserFacade`      | `features/admin/users/user.facade.ts`      | User CRUD, role assignment   |
| `RoleFacade`      | `features/admin/roles/role.facade.ts`      | Role & permission management |
| `BranchFacade`    | `features/admin/branches/branch.facade.ts` | Branch CRUD                  |

---

_Dokumentasi diupdate: 2026-01-19_
