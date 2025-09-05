# Pembayaran — Bubble Modern (React + Tailwind + Supabase)

Fitur:
- Modern UI
- Responsive (mobile → desktop)
- Toast notifications (custom provider)
- Confirm modal sebelum hapus
- Loading bubble animation

## Cara Pakai
1. Install deps:
   ```bash
   npm install
   ```
2. `.env.local` dan isi:
   ```env
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_KEY=...
   ```
3. Buat table di Supabase (SQL):
   ```sql
   create table if not exists pembayaran (
     id uuid primary key default gen_random_uuid(),
     nama text not null,
     jumlah int not null,
     keterangan text,
     tanggal date not null,
     metode text not null check (metode in ('Cash','Transfer','QRIS')),
     created_at timestamp with time zone default now()
   );
   ```
4. (Opsional RLS untuk demo public)
   ```sql
   alter table pembayaran enable row level security;
   create policy "allow select for anon" on pembayaran for select to anon using (true);
   create policy "allow insert for anon" on pembayaran for insert to anon with check (true);
   ```
5. Jalankan:
   ```bash
   npm run dev
   ```

## Notes
- Untuk production: tambahin autentikasi, batasi RLS, dan validasi server-side.
- Komponen toast/modal custom supaya nggak butuh setup shadcn yang lebih panjang.
