-- ============================================================
-- CANOPÉE 229 — Schéma Supabase
-- À exécuter dans Supabase : Dashboard > SQL Editor > New query
-- ============================================================

create table quartiers (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  ville text not null default 'Cotonou',
  superficie_km2 numeric not null,
  created_at timestamptz default now()
);

create table parrains (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  type text not null check (type in ('particulier', 'entreprise', 'ecole')),
  contact text not null,
  created_at timestamptz default now()
);

create table relais (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  telephone text not null,
  quartier_id uuid references quartiers(id),
  created_at timestamptz default now()
);

create table arbres (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  espece text not null,
  quartier_id uuid references quartiers(id) not null,
  lat double precision not null,
  lng double precision not null,
  statut text not null default 'bon' check (statut in ('bon', 'souffrance', 'disparu')),
  date_plantation date not null,
  photo_url text,
  parrain_id uuid references parrains(id),
  created_at timestamptz default now()
);

create table visites (
  id uuid primary key default gen_random_uuid(),
  arbre_id uuid references arbres(id) not null,
  parrain_id uuid references parrains(id),
  relais_id uuid references relais(id),
  date_visite date not null default current_date,
  statut_observe text not null check (statut_observe in ('bon', 'souffrance', 'disparu')),
  commentaire text,
  photo_url text,
  confirmee boolean not null default true,
  created_at timestamptz default now()
);

create table signalements (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('nouvel_arbre', 'danger', 'emplacement')),
  description text not null,
  contact text,
  lat double precision,
  lng double precision,
  photo_url text,
  statut text not null default 'nouveau' check (statut in ('nouveau', 'en_cours', 'traite')),
  created_at timestamptz default now()
);

create view arbres_avec_details as
select
  a.*,
  q.nom as quartier_nom,
  p.nom as parrain_nom,
  (select count(*) from visites v where v.arbre_id = a.id and v.confirmee) as nb_visites
from arbres a
left join quartiers q on q.id = a.quartier_id
left join parrains p on p.id = a.parrain_id;

create or replace function tsap_quartier(p_quartier_id uuid, p_mois int)
returns numeric
language sql stable
as $$
  with arbres_eligibles as (
    select id, date_plantation
    from arbres
    where quartier_id = p_quartier_id
      and date_plantation <= (current_date - (p_mois || ' months')::interval)
  ),
  etat_a_echeance as (
    select
      ae.id,
      exists (
        select 1 from visites v
        where v.arbre_id = ae.id
          and v.confirmee = true
          and v.date_visite >= ae.date_plantation + (p_mois || ' months')::interval - interval '15 days'
          and v.date_visite <= ae.date_plantation + (p_mois || ' months')::interval + interval '15 days'
          and v.statut_observe != 'disparu'
      ) as vivant
    from arbres_eligibles ae
  )
  select case when count(*) = 0 then null
    else round(100.0 * sum(case when vivant then 1 else 0 end) / count(*), 1)
  end
  from etat_a_echeance;
$$;

create or replace function icvq_quartier(p_quartier_id uuid)
returns numeric
language sql stable
as $$
  select round(
    (select count(*) from arbres where quartier_id = p_quartier_id and statut != 'disparu')::numeric
    / nullif((select superficie_km2 from quartiers where id = p_quartier_id), 0)
  , 1);
$$;

create view tableau_de_bord_quartiers as
select
  q.id as quartier_id,
  q.nom as quartier_nom,
  tsap_quartier(q.id, 3) as tsap_3_mois,
  tsap_quartier(q.id, 6) as tsap_6_mois,
  tsap_quartier(q.id, 12) as tsap_12_mois,
  icvq_quartier(q.id) as icvq
from quartiers q;

alter table quartiers enable row level security;
alter table arbres enable row level security;
alter table parrains enable row level security;
alter table visites enable row level security;
alter table signalements enable row level security;
alter table relais enable row level security;

create policy "lecture publique quartiers" on quartiers for select using (true);
create policy "lecture publique arbres" on arbres for select using (true);
create policy "lecture publique parrains" on parrains for select using (true);
create policy "lecture publique visites" on visites for select using (true);
create policy "lecture publique signalements" on signalements for select using (true);

create policy "creation publique parrains" on parrains for insert with check (true);
create policy "creation publique signalements" on signalements for insert with check (true);
create policy "creation publique visites" on visites for insert with check (true);
create policy "maj parrainage arbre" on arbres for update using (true) with check (true);

insert into quartiers (nom, ville, superficie_km2) values
  ('Akpakpa', 'Cotonou', 5.2),
  ('Fidjrossè', 'Cotonou', 3.8),
  ('Sainté', 'Cotonou', 2.9);
