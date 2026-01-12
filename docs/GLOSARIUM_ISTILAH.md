# 📚 Glosarium Istilah Pemrograman

> Kamus istilah teknis yang digunakan dalam projek Ehefin
> Dibuat untuk membantu memahami kode tanpa background programming

---

## A

### **Angular**

Framework JavaScript buatan Google untuk membuat aplikasi web. Seperti "cetakan rumah" yang sudah punya struktur jadi, tinggal kita isi kontennya.

### **API (Application Programming Interface)**

Cara dua sistem berkomunikasi. Seperti pelayan restoran - kita (frontend) memesan ke pelayan (API), pelayan meneruskan ke dapur (backend), lalu mengantar makanan ke kita.

### **Authentication (Autentikasi)**

Proses memverifikasi "siapa kamu". Seperti menunjukkan KTP saat mau masuk gedung.

### **Authorization (Otorisasi)**

Proses menentukan "apa yang boleh kamu lakukan". Seperti kartu akses yang hanya bisa buka pintu tertentu.

---

## B

### **Backend**

Bagian aplikasi yang jalan di server. Seperti "dapur" restoran - tempat semua proses berat terjadi, tapi tidak terlihat oleh pengunjung.

### **Branch (Cabang)**

Dalam konteks bisnis ini: lokasi/kantor cabang perusahaan. Setiap user internal bisa ditugaskan ke cabang tertentu.

---

## C

### **Component (Komponen)**

Bagian-bagian kecil dari halaman web yang bisa dipakai ulang. Seperti bata-bata yang menyusun rumah.

### **CRUD**

Singkatan dari Create, Read, Update, Delete. Empat operasi dasar untuk mengelola data.

---

## D

### **DTO (Data Transfer Object)**

Format/template untuk mengirim data antar sistem. Seperti "formulir" yang sudah ada kolom-kolomnya.

---

## E

### **Endpoint**

Alamat URL spesifik di server yang melayani fungsi tertentu. Seperti nomor ekstensi telepon yang langsung ke bagian tertentu.

**Contoh:**

- `/api/auth/login` → Endpoint untuk login
- `/api/approval/pending` → Endpoint untuk ambil daftar pending

---

## F

### **Frontend**

Bagian aplikasi yang dilihat dan digunakan langsung oleh user. Seperti "ruang makan" restoran yang diakses tamu.

---

## G

### **Guard (Penjaga)**

Kode yang mengecek apakah user boleh mengakses halaman tertentu. Seperti satpam yang memeriksa kartu akses.

---

## H

### **HTTP Methods**

Jenis-jenis permintaan ke server:

| Method | Kegunaan                       | Analogi                     |
| ------ | ------------------------------ | --------------------------- |
| GET    | Mengambil data                 | "Tolong ambilkan..."        |
| POST   | Mengirim data baru             | "Tolong simpan ini..."      |
| PUT    | Mengupdate data yang sudah ada | "Tolong ganti dengan..."    |
| DELETE | Menghapus data                 | "Tolong hapus..."           |
| PATCH  | Mengupdate sebagian data       | "Tolong ubah bagian ini..." |

---

## I

### **Interceptor**

Kode yang "menghadang" setiap permintaan atau respons untuk menambahkan sesuatu. Seperti petugas yang menempel stempel di setiap surat keluar.

### **Interface**

Template yang mendefinisikan struktur data. Seperti formulir kosong yang menunjukkan kolom apa saja yang harus diisi.

---

## J

### **JWT (JSON Web Token)**

Token keamanan untuk autentikasi. Seperti tiket konser yang berisi informasi siapa kamu dan apa yang boleh kamu lakukan.

**Struktur:**

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4ifQ.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

Terlihat acak, tapi sebenarnya berisi data user yang terenkripsi.

---

## L

### **Lazy Loading**

Teknik memuat halaman hanya ketika dibutuhkan. Seperti buku yang halamannya baru dibuka saat mau dibaca, bukan semua sekaligus.

### **localStorage**

Tempat penyimpanan data di browser. Seperti laci di komputer user yang bisa menyimpan informasi.

---

## M

### **Model**

Template/cetakan untuk struktur data. Menentukan data apa saja yang harus ada dan tipe datanya.

### **Module**

Kelompok kode yang berhubungan. Seperti bab dalam buku.

---

## N

### **Navigate (Navigasi)**

Berpindah dari satu halaman ke halaman lain dalam aplikasi.

---

## O

### **Observable**

Cara Angular menangani data yang datang secara tidak langsung (asinkron). Seperti memesan makanan - kamu tidak langsung dapat, tapi akan "diberitahu" saat siap.

---

## P

### **Permission**

Izin spesifik untuk melakukan sesuatu. Contoh: `USER_READ` = boleh lihat user, `LOAN_APPROVE` = boleh approve pinjaman.

### **Plafond**

Batas kredit/pinjaman maksimal yang diberikan ke customer.

---

## R

### **RBAC (Role-Based Access Control)**

Sistem akses berdasarkan role. User dengan role tertentu punya akses tertentu.

### **Request**

Permintaan data dari frontend ke backend. Seperti "pesanan" ke restoran.

### **Response**

Balasan dari backend ke frontend. Seperti "hidangan" yang diantar ke meja.

### **Role**

Peran/jabatan user. Contoh: MARKETING, BRANCH_MANAGER, SUPERADMIN.

### **Route**

Alamat/path halaman di aplikasi. Contoh: `/login`, `/workplace`, `/admin/users`.

---

## S

### **Service**

Kelas yang menyediakan fungsi-fungsi tertentu yang bisa dipakai di banyak tempat. Seperti "departemen" yang melayani kebutuhan tertentu.

### **Signal**

Fitur Angular terbaru untuk mengelola data yang berubah. Ketika data berubah, tampilan otomatis terupdate.

### **SSR (Server-Side Rendering)**

Teknik di mana halaman dibuat di server terlebih dahulu sebelum dikirim ke browser. Lebih cepat untuk tampilan pertama.

### **Standalone Component**

Komponen Angular yang mandiri, tidak perlu dideklarasikan di module. Lebih simpel dan modern.

### **Status**

Kondisi/keadaan saat ini. Dalam konteks pinjaman: SUBMITTED, APPROVED, REJECTED, dll.

---

## T

### **Template**

File HTML yang menentukan tampilan komponen.

### **Token**

Kode unik yang membuktikan identitas user. Seperti "gelang VIP" yang menunjukkan status khusus.

### **TypeScript**

Versi JavaScript yang lebih ketat dan terstruktur. Seperti "resep masak" dengan takaran yang lebih presisi.

---

## U

### **URL (Uniform Resource Locator)**

Alamat halaman web. Contoh: `https://ehefin.com/workplace`

---

## V

### **Validation**

Proses memeriksa apakah data yang dimasukkan sudah benar. Seperti memeriksa formulir sebelum diproses.

---

## W

### **Workflow**

Alur kerja atau proses. Contoh: "workflow approval" = alur persetujuan pinjaman dari submitted → approved.

---

## 🔤 Simbol & Notasi

| Simbol | Arti                              |
| ------ | --------------------------------- |
| `=>`   | Arrow function (fungsi pendek)    |
| `()`   | Parameter fungsi atau method call |
| `{}`   | Object atau blok kode             |
| `[]`   | Array (daftar)                    |
| `<T>`  | Generic type (template tipe data) |
| `?`    | Optional (boleh kosong)           |
| `!`    | Non-null assertion                |
| `$`    | Observable (konvensi penamaan)    |
| `_`    | Private variable (konvensi)       |
| `...`  | Spread operator                   |

---

## 📁 Ekstensi File

| Ekstensi   | Isi                          |
| ---------- | ---------------------------- |
| `.ts`      | TypeScript - kode logika     |
| `.html`    | Template - struktur tampilan |
| `.css`     | Stylesheet - desain tampilan |
| `.json`    | Data dalam format JSON       |
| `.md`      | Markdown - dokumentasi       |
| `.spec.ts` | Unit test - tes otomatis     |

---

_Glosarium dibuat: 2026-01-12_
