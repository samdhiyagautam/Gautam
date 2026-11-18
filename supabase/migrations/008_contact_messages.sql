-- Contact Messages Table
-- Stores inbound messages from the portfolio contact form.

create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  ip_address text,
  status text not null default 'unread',
  created_at timestamptz not null default now()
);

-- Row Level Security
alter table contact_messages enable row level security;

-- Allow public / anon users to submit contact messages
create policy "Anyone can submit a contact message"
  on contact_messages for insert
  to anon, authenticated
  with check (true);

-- Only authenticated admins can view messages
create policy "Admins can view contact messages"
  on contact_messages for select
  to authenticated
  using (is_admin());

-- Only authenticated admins can update status (e.g. mark read/archived)
create policy "Admins can update contact messages"
  on contact_messages for update
  to authenticated
  using (is_admin())
  with check (is_admin());
