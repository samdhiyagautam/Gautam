-- Code and text attachments for projects (.sql, .py, .txt).
-- Run after 001–005. Safe to re-run.
-- Bucket cap stays 50 MB (videos); datasets/code are capped lower in code.

update storage.buckets
set allowed_mime_types = array[
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv',
  'text/plain',
  'application/sql',
  'text/x-sql',
  'text/x-python',
  'video/mp4',
  'video/webm'
]
where id = 'portfolio-assets';
