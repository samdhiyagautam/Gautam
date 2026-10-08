-- Constrain the portfolio-assets bucket: 5 MB max per file, images + PDF only.
-- Matches the application-level resume validation (PDF, 5 MB) so storage
-- enforces the same limits server-side. Safe to re-run.

update storage.buckets
set
  file_size_limit = 5242880,
  allowed_mime_types = array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
where id = 'portfolio-assets';
