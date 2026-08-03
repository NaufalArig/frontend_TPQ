# TPQ Administration System - Frontend

Frontend untuk sistem administrasi Taman Pendidikan Al-Qur'an (TPQ) yang dibangun menggunakan Next.js dan TypeScript.

Aplikasi ini digunakan untuk mengelola data administrasi TPQ melalui antarmuka web, mulai dari data santri, guru, kelas, absensi, keuangan SPP, aset, hingga monitoring melalui dashboard.

Backend aplikasi menggunakan Laravel REST API dan database MySQL.

## Tech Stack

* Next.js
* React
* TypeScript
* Tailwind CSS
* Lucide React
* REST API

## Features

* Login dan autentikasi pengguna
* Dashboard
* Manajemen santri
* Manajemen guru
* Manajemen kelas
* Absensi santri
* Rekap dan monitoring absensi
* Keuangan SPP
* Manajemen aset
* Notifikasi
* Laporan
* Pencarian dan filter data
* Hak akses berdasarkan role

## Project Structure

Struktur utama frontend:

```text
tpq-frontend/
├── app/
├── components/
├── services/
├── types/
├── public/
├── package.json
└── ...
```

`app/` digunakan untuk halaman dan routing aplikasi.

`components/` berisi komponen UI yang digunakan kembali pada beberapa halaman.

`services/` digunakan untuk komunikasi dengan REST API backend.

`types/` berisi definisi tipe TypeScript yang digunakan dalam aplikasi.

## Requirements

Sebelum menjalankan project, pastikan sudah tersedia:

* Node.js
* npm
* Git

Backend Laravel juga harus sudah berjalan karena frontend mengambil data melalui API.

## Installation

Clone repository:

```bash
git clone https://github.com/USERNAME/tpq-frontend.git
cd tpq-frontend
```

Install dependency:

```bash
npm install
```

Buat file `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

Sesuaikan URL dengan alamat backend yang digunakan.

Jalankan aplikasi:

```bash
npm run dev
```

Kemudian buka:

```text
http://localhost:3000
```

## Backend

Frontend ini membutuhkan backend Laravel untuk menyediakan data dan proses bisnis.

Repository backend:

```text
tpq-backend
```

Komunikasi antara frontend dan backend dilakukan melalui REST API.

```text
Next.js
   │
   │ HTTP Request
   ▼
Laravel API
   │
   ▼
MySQL
```

Authentication pada aplikasi menggunakan mekanisme yang disediakan oleh backend Laravel.

## Production Build

Untuk membuat build production:

```bash
npm run build
```

Menjalankan hasil build:

```bash
npm start
```

## Environment

File `.env.local` digunakan untuk konfigurasi environment lokal.

Jangan memasukkan credential, token, atau informasi sensitif ke repository.

## Author

Wong Sepele
