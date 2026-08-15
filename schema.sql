-- ============================================================
-- PIMEQ AUDIO SYSTEM — Base de données
-- À exécuter dans Supabase : Project > SQL Editor > New query
-- ============================================================

-- Table des commandes (formulaires commande-basic / standard / premium)
create table if not exists commandes (
  id              bigint generated always as identity primary key,
  created_at      timestamptz not null default now(),
  offre           text not null check (offre in ('Basic', 'Standard', 'Premium')),
  nom             text not null,
  telephone       text not null,
  email           text not null,
  adresse         text not null,
  date_evenement  date,
  details         text,
  statut          text not null default 'nouvelle'
                    check (statut in ('nouvelle', 'confirmee', 'annulee', 'terminee'))
);

comment on table commandes is 'Commandes passées via les formulaires offre-basic/standard/premium';

-- Table des messages de contact (formulaire contact.html)
create table if not exists messages_contact (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  nom         text not null,
  telephone   text not null,
  email       text not null,
  sujet       text,
  message     text not null,
  statut      text not null default 'nouveau'
                check (statut in ('nouveau', 'traite'))
);

comment on table messages_contact is 'Messages envoyés via le formulaire de contact.html';

-- Index utiles pour trier/filtrer dans le futur tableau de bord admin
create index if not exists idx_commandes_created_at on commandes (created_at desc);
create index if not exists idx_commandes_statut on commandes (statut);
create index if not exists idx_messages_created_at on messages_contact (created_at desc);

-- Sécurité : on active RLS et on ne crée AUCUNE policy publique.
-- Résultat : ni les visiteurs du site ni la clé "anon" ne peuvent lire/écrire.
-- Seule la clé "service_role" (utilisée côté serveur, jamais exposée au navigateur)
-- peut accéder à ces tables — c'est celle qu'utilisent les fonctions api/*.js.
alter table commandes enable row level security;
alter table messages_contact enable row level security;
