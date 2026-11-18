-- Data fixes from the Nov 2026 QA pass:
--   1. Company spelling: the real company name is "Dhurina" — correct any
--      rows created with the old "Dhuri Na Venture Private Limited" text.
--   2. OG image: the shipped default /og-image.png is the only OG asset that
--      exists; reset any SEO row that points at a broken external URL.
--
-- Safe to run multiple times (guarded by LIKE filters).

update public.experiences
set company = 'Dhurina'
where company like '%Dhuri Na%';

update public.profiles
set about = replace(about, 'Dhuri Na Venture Private Limited', 'Dhurina')
where about like '%Dhuri Na%';

update public.seo_settings
set og_image = '/og-image.png'
where og_image like '%supabase.co%';
