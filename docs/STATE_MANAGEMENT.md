# State Management di Ehefin Frontend

## Overview

Ehefin Frontend menggunakan **Angular Signals** dengan **Facade Pattern** untuk state management. Kombinasi ini memberikan reactive state yang simple tanpa perlu library eksternal seperti NgRx atau Akita.

---

## Arsitektur State Management

```
┌─────────────────────────────────────────────────────────────┐
│                     COMPONENTS (UI Layer)                    │
│   user-list.ts │ role-list.ts │ branch-list.ts │ workplace.ts│
└───────┬─────────────┬──────────────┬───────────────┬────────┘
        │             │              │               │
        ▼             ▼              ▼               ▼
┌─────────────────────────────────────────────────────────────┐
│                     FACADES (State Layer)                    │
│   UserFacade   │ RoleFacade │ BranchFacade │ WorkplaceFacade │
│   ┌─────────┐  │ ┌────────┐ │ ┌──────────┐ │ ┌─────────────┐ │
│   │ signals │  │ │signals │ │ │ signals  │ │ │   signals   │ │
│   │ methods │  │ │methods │ │ │ methods  │ │ │   methods   │ │
│   └─────────┘  │ └────────┘ │ └──────────┘ │ └─────────────┘ │
└───────┬─────────────┬──────────────┬───────────────┬────────┘
        │             │              │               │
        ▼             ▼              ▼               ▼
┌─────────────────────────────────────────────────────────────┐
│                     SERVICES (API Layer)                     │
│           AdminService           │       ApprovalService     │
└─────────────────────────────────────────────────────────────┘
```

---

## Angular Signals

### Apa itu Signals?

Signal adalah reactive primitive bawaan Angular yang menyimpan nilai dan memberi tahu consumers ketika nilai berubah.

```typescript
// Membuat signal
const count = signal(0);

// Membaca nilai
console.log(count()); // 0

// Mengubah nilai
count.set(5); // set langsung
count.update((n) => n + 1); // update berdasarkan nilai sebelumnya

// Computed signal (derived state)
const doubled = computed(() => count() * 2);
```

### Signals vs Observables

| Aspect         | Signals              | Observables        |
| -------------- | -------------------- | ------------------ |
| Syntax         | `signal()`           | `subscribe()`      |
| Memory         | Auto cleanup         | Manual unsubscribe |
| Template       | Langsung di template | Perlu `async` pipe |
| Learning curve | Mudah                | Kompleks           |

---

## State Signals di Facades

Setiap facade mengelola state dengan pattern yang konsisten:

### 1. Data State

```typescript
// Data utama
readonly users = signal<User[]>([]);
readonly roles = signal<Role[]>([]);
readonly selectedItem = signal<Item | null>(null);
```

### 2. Loading State

```typescript
readonly loading = signal(false);      // Loading utama
readonly saving = signal(false);       // Saat save/update
readonly actionLoading = signal(false); // Saat action spesifik
```

### 3. Error State

```typescript
readonly error = signal<string | null>(null);

// Method untuk clear error
clearError(): void {
  this.error.set(null);
}
```

### 4. Computed State (Derived)

```typescript
readonly hasUsers = computed(() => this.users().length > 0);
readonly availableRoles = computed(() =>
  this.roles().filter(r => !this.selectedRoles().includes(r))
);
```

---

## State Flow

### Load Data

```
Component.ngOnInit()
    │
    ▼
facade.loadUsers()
    │
    ├─► loading.set(true)
    │
    ▼
adminService.getUsers().subscribe()
    │
    ├─► users.set(data)
    ├─► loading.set(false)
    │
    ▼
Component template auto-update (signal reactivity)
```

### Update Data

```
Component.saveUser()
    │
    ▼
await facade.updateUser(id, data)
    │
    ├─► saving.set(true)
    │
    ▼
adminService.updateUser().subscribe()
    │
    ├─► users.update(list => list.map(...))
    ├─► saving.set(false)
    │
    ▼
Return Promise<User | null>
```

---

## Penggunaan di Template

### Tanpa Signals (Old Way)

```html
<!-- Perlu async pipe -->
<div *ngIf="users$ | async as users">
  @for (user of users; track user.id) {
  <div>{{ user.name }}</div>
  }
</div>
```

### Dengan Signals (Ehefin Way)

```html
<!-- Langsung panggil signal sebagai function -->
@if (loading()) {
<div>Loading...</div>
} @for (user of users(); track user.id) {
<div>{{ user.name }}</div>
}
```

---

## State Sharing Antar Component

Karena facades adalah singleton (`providedIn: 'root'`), state bisa di-share:

```typescript
// user-list.ts
export class UserListComponent {
  private facade = inject(UserFacade);
  users = this.facade.users; // State dari facade
}

// user-form.ts (berbeda component, sama facade)
export class UserFormComponent {
  private facade = inject(UserFacade);
  users = this.facade.users; // State yang SAMA!

  async onSubmit() {
    await this.facade.createUser(data);
    // users signal otomatis update di SEMUA component!
  }
}
```

---

## Daftar State per Facade

### UserFacade

| Signal     | Type             | Purpose                  |
| ---------- | ---------------- | ------------------------ |
| `users`    | `User[]`         | Daftar users             |
| `roles`    | `Role[]`         | Daftar roles (cached)    |
| `branches` | `UserBranch[]`   | Daftar branches (cached) |
| `loading`  | `boolean`        | Loading state            |
| `saving`   | `boolean`        | Save operation state     |
| `error`    | `string \| null` | Error message            |

### RoleFacade

| Signal        | Type           | Purpose              |
| ------------- | -------------- | -------------------- |
| `roles`       | `Role[]`       | Daftar roles         |
| `permissions` | `Permission[]` | Daftar permissions   |
| `loading`     | `boolean`      | Loading state        |
| `saving`      | `boolean`      | Save operation state |

### BranchFacade

| Signal     | Type             | Purpose              |
| ---------- | ---------------- | -------------------- |
| `branches` | `UserBranch[]`   | Daftar branches      |
| `loading`  | `boolean`        | Loading state        |
| `saving`   | `boolean`        | Save operation state |
| `error`    | `string \| null` | Error message        |

### WorkplaceFacade

| Signal            | Type                      | Purpose                  |
| ----------------- | ------------------------- | ------------------------ |
| `loans`           | `LoanApplication[]`       | Pending loans            |
| `selectedLoan`    | `LoanApplication \| null` | Selected loan            |
| `loanHistory`     | `LoanHistory[]`           | History of selected loan |
| `approvalHistory` | `ApprovalHistoryItem[]`   | User's approval history  |
| `loading`         | `boolean`                 | Loading state            |
| `historyLoading`  | `boolean`                 | Approval history loading |
| `actionLoading`   | `boolean`                 | Approve/reject loading   |

**Computed Signals:**

| Signal     | Type     | Purpose                    |
| ---------- | -------- | -------------------------- |
| `userName` | `string` | Nama user dari AuthService |
| `roleName` | `string` | Nama role yang diformat    |

---

## Best Practices

1. **Jangan mutasi signal langsung dari component** - Gunakan methods facade
2. **Gunakan `readonly`** - Untuk mencegah reassignment
3. **Update atomic** - Satu operasi = satu state update
4. **Handle loading & error** - Selalu manage loading dan error state
5. **Computed untuk derived state** - Jangan duplikasi logic

---

## Referensi

- [Angular Signals Guide](https://angular.dev/guide/signals)
- [FACADE_PATTERN.md](./FACADE_PATTERN.md)
- [PENJELASAN_KODE_DETAIL.md](./PENJELASAN_KODE_DETAIL.md)

---

_Dokumentasi diupdate: 2026-01-19_
