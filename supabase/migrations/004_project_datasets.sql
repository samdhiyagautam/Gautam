-- Project datasets: spreadsheet attachments + Google Sheets links.
-- Run after 001–003. Safe to re-run.

alter table public.projects
  add column if not exists dataset_url text not null default '',
  add column if not exists attachments text[] not null default '{}';

-- Allow spreadsheet uploads in the portfolio-assets bucket (5 MB cap stays).
update storage.buckets
set allowed_mime_types = array[
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv'
]
where id = 'portfolio-assets';
