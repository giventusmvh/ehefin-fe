# Frontend Pages & User Flow

## Daftar Halaman

| Path               | Nama            | Akses                     | Deskripsi                 |
| ------------------ | --------------- | ------------------------- | ------------------------- |
| `/`                | Landing Page    | Public                    | Info produk, download app |
| `/login`           | Login           | Public                    | Staff login               |
| `/workplace`       | Workplace       | Marketing, BM, Backoffice | Approval dashboard        |
| `/admin`           | Admin Dashboard | Superadmin                | User management           |
| `/admin/users`     | User List       | Superadmin                | Daftar semua user         |
| `/admin/users/new` | Create User     | Superadmin                | Buat user internal baru   |
| `/admin/roles`     | Role List       | Superadmin                | Daftar role & permission  |

---

## User Flow

### 1. Landing Page (Public)

```
Buka website → Lihat info produk → Klik "Download di Play Store"
                                 → Atau klik "Staff Login" → /login
```

### 2. Staff Login

```
/login → Input email & password → Submit
       ↓
       Marketing/BM/Backoffice → Redirect ke /workplace
       Superadmin → Redirect ke /admin
```

### 3. Approval Flow (Marketing/BM/Backoffice)

```
Login → /workplace → Lihat pending loans → Pilih loan
                                         ↓
                                   Lihat detail customer
                                         ↓
                              Approve (optional note) → Loan naik ke level berikutnya
                              Reject (required note) → Loan ditolak
```

**Status Flow:**

```
SUBMITTED → Marketing approve → MARKETING_APPROVED
         → Marketing reject  → MARKETING_REJECTED (end)

MARKETING_APPROVED → BM approve → BRANCH_MANAGER_APPROVED
                   → BM reject  → BRANCH_MANAGER_REJECTED (end)

BRANCH_MANAGER_APPROVED → Backoffice approve → APPROVED (end)
                        → Backoffice reject  → REJECTED (end)
```

### 4. Admin Flow (Superadmin)

```
Login → /admin → Sidebar: Users | Roles

Users:
  /admin/users → Lihat semua user → Klik "Create User"
              ↓
  /admin/users/new → Isi form (name, email, password, role, branch)
                   → Submit → Redirect ke /admin/users

Roles:
  /admin/roles → Lihat semua role dengan permission-nya
```

---

## Test Accounts

| Role           | Email                  | Password      |
| -------------- | ---------------------- | ------------- |
| Marketing      | marketing.jkt@loan.com | marketing123  |
| Branch Manager | bm.jkt@loan.com        | bm123         |
| Backoffice     | backoffice@loan.com    | backoffice123 |
| Superadmin     | admin@loan.com         | admin123      |
