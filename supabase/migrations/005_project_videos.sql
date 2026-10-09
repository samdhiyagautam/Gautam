-- Project videos: YouTube/external embed URL + uploaded video files.
-- Run after 001–004. Safe to re-run.
--
-- Note: the bucket cap rises to 50 MB so videos fit. Resume uploads stay
-- capped at 5 MB by application-level validation in the upload action.

alter table public.projects
  add column if not exists video_url text not null default '',
  add column if not exists videos text[] not null default '{}';

update storage.buckets
set
  file_size_limit = 52428800,
  allowed_mime_types = array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv',
    'video/mp4',
    'video/webm'
  ]
where id = 'portfolio-assets';
