-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Organizations (Tenants)
create table organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  branding_settings jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Users (Profiles)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  org_id uuid references organizations(id) on delete set null,
  role text check (role in ('SUPER_ADMIN', 'CLINIC_ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PHARMACIST')),
  name text,
  email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table organizations enable row level security;
alter table profiles enable row level security;

-- Simple RLS Policies (Draft for multi-tenancy)
create policy "Users can view their own organization"
  on organizations for select
  using ( id in (select org_id from profiles where profiles.id = auth.uid()) );

create policy "Users can view profiles in their organization"
  on profiles for select
  using ( org_id in (select org_id from profiles where profiles.id = auth.uid()) );

-- Patients
create table patients (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references organizations(id) on delete cascade not null,
  name text not null,
  phone text,
  age integer,
  gender text check (gender in ('Male', 'Female', 'Other')),
  blood_group text,
  allergies text,
  medical_history text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table patients enable row level security;

-- Appointments
create table appointments (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references organizations(id) on delete cascade not null,
  patient_id uuid references patients(id) on delete cascade not null,
  doctor_id uuid references profiles(id) on delete set null,
  status text check (status in ('waiting', 'in-progress', 'completed', 'cancelled')) default 'waiting',
  source text check (source in ('online', 'call', 'manual')),
  appointment_date timestamp with time zone not null,
  duration integer default 30,
  reason text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table appointments enable row level security;

-- Consultations (Detailed Medical History)
create table consultations (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references organizations(id) on delete cascade not null,
  appointment_id uuid references appointments(id) on delete cascade not null,
  patient_id uuid references patients(id) on delete cascade not null,
  doctor_id uuid references profiles(id) on delete set null,
  ayurvedic_history jsonb default '{}'::jsonb,
  modern_history jsonb default '{}'::jsonb,
  diagnosis text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table consultations enable row level security;

-- Inventory
create table inventory (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references organizations(id) on delete cascade not null,
  medicine_name text not null,
  stock_count integer default 0,
  price numeric(10,2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table inventory enable row level security;

-- Prescriptions
create table prescriptions (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references organizations(id) on delete cascade not null,
  appointment_id uuid references appointments(id) on delete set null,
  patient_id uuid references patients(id) on delete cascade not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table prescriptions enable row level security;

-- Prescription Items
create table prescription_items (
  id uuid primary key default uuid_generate_v4(),
  prescription_id uuid references prescriptions(id) on delete cascade not null,
  inventory_id uuid references inventory(id) on delete restrict not null,
  dosage text not null,
  duration text not null,
  quantity integer not null default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table prescription_items enable row level security;

