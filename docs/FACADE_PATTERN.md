# Facade Pattern di Ehefin Frontend

## Apa itu Facade Pattern?

**Facade Pattern** adalah design pattern yang menyediakan interface sederhana untuk subsystem yang kompleks. Pattern ini menyembunyikan kompleksitas internal dan memberikan satu titik akses yang mudah digunakan.

```
┌─────────────────────────────────────────────┐
│              Component (UI)                 │
│  - Menangani interaksi user                 │
│  - Menampilkan data                         │
└────────────────────┬────────────────────────┘
                     │ inject
                     ▼
┌─────────────────────────────────────────────┐
│              FACADE                         │
│  - Menyediakan state (signals)              │
│  - Menyediakan methods untuk operasi        │
│  - Menyembunyikan kompleksitas              │
└────────────────────┬────────────────────────┘
                     │ inject
                     ▼
┌─────────────────────────────────────────────┐
│              Services                       │
│  - HTTP calls ke API                        │
│  - Low-level operations                     │
└─────────────────────────────────────────────┘
```

---

## Mengapa Menggunakan Facade Pattern?

### Sebelum Facade (Tanpa Facade)

```typescript
// Component langsung inject banyak services
export class UserListComponent {
  private adminService = inject(AdminService);
  private confirmDialog = inject(ConfirmDialogService);

  // State tersebar di component
  users = signal<User[]>([]);
  roles = signal<Role[]>([]);
  branches = signal<Branch[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  // Logic API call di component
  loadUsers() {
    this.loading.set(true);
    this.adminService.getUsers().subscribe({
      next: (res) => {
        this.users.set(res.data ?? []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  // ... banyak logic lainnya
}
```

**Masalah:**

- Component terlalu besar (245+ baris)
- Logic tercampur dengan UI
- Sulit di-test
- Tidak reusable

### Sesudah Facade

```typescript
// Component hanya inject Facade
export class UserListComponent {
  private facade = inject(UserFacade);

  // Expose signals dari facade
  users = this.facade.users;
  loading = this.facade.loading;

  ngOnInit() {
    this.facade.loadUsers();
  }

  async saveUser() {
    await this.facade.updateUser(userId, data);
  }
}
```

**Keuntungan:**

- Component lebih kecil (~100 baris)
- Separation of concerns
- Mudah di-test
- State bisa di-share antar component

---

## Facade di Ehefin

### Daftar Facade

| Facade            | Lokasi                     | Fungsi                       |
| ----------------- | -------------------------- | ---------------------------- |
| `UserFacade`      | `features/admin/users/`    | User CRUD, role assignment   |
| `RoleFacade`      | `features/admin/roles/`    | Role & permission management |
| `BranchFacade`    | `features/admin/branches/` | Branch CRUD                  |
| `WorkplaceFacade` | `features/workplace/`      | Loan approval workflow       |

### Struktur Facade

Setiap facade memiliki struktur yang sama:

```typescript
@Injectable({ providedIn: 'root' })
export class ExampleFacade {
  // 1. Inject services
  private service = inject(SomeService);

  // 2. State signals (readonly untuk keamanan)
  readonly items = signal<Item[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  // 3. Computed signals (derived state)
  readonly hasItems = computed(() => this.items().length > 0);

  // 4. Methods untuk operasi
  loadItems(): void { ... }
  createItem(data: ItemData): Promise<Item | null> { ... }
  updateItem(id: number, data: ItemData): Promise<Item | null> { ... }
  deleteItem(id: number): Promise<boolean> { ... }

  // 5. Helper methods
  clearError(): void { this.error.set(null); }
}
```

---

## Contoh Penggunaan

### UserFacade

```typescript
// Di user-list.ts
export class UserListComponent {
  private facade = inject(UserFacade);

  // Expose signals
  users = this.facade.users;
  loading = this.facade.loading;

  ngOnInit() {
    this.facade.loadUsers();
  }

  async toggleStatus(user: User) {
    await this.facade.toggleUserStatus(user);
  }
}

// Di user-form.ts (facade yang sama, state di-share)
export class UserFormComponent {
  private facade = inject(UserFacade);

  roles = this.facade.roles;
  branches = this.facade.branches;

  ngOnInit() {
    this.facade.loadSupportingData();
  }

  async onSubmit() {
    await this.facade.createUser(formData);
  }
}
```

---

## Best Practices

1. **Satu Facade per Feature Module** - Jangan buat facade yang terlalu besar
2. **Readonly Signals** - Gunakan `readonly` untuk mencegah mutasi langsung
3. **Promise untuk Operasi Async** - Return Promise agar component bisa await
4. **Caching Data** - Load data sekali, simpan di signal
5. **Clear Error Method** - Sediakan method untuk reset error state

---

## Referensi

- [Angular Signals](https://angular.dev/guide/signals)
- [Facade Pattern - Refactoring Guru](https://refactoring.guru/design-patterns/facade)
