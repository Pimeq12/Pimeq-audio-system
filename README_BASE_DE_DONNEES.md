# PIMEQ Audio System — Ajout d'une base de données

## Pourquoi

Aujourd'hui, `api/send-order.js` et `api/send-contact.js` envoient uniquement un
email via Resend. Si l'email échoue, se perd, ou passe en spam, la commande ou
le message est perdu — rien n'est conservé ailleurs.

Cette mise à jour ajoute une vraie base de données (Supabase, gratuite) : chaque
commande et chaque message de contact sont d'abord enregistrés en base, puis un
email de notification est toujours envoyé en plus. Tu obtiens aussi une petite
page d'administration pour consulter l'historique complet, même sans Gmail.

Architecture mise à jour :

```
GitHub Pages → Vercel /api/send-order → Supabase (enregistrement) → Resend (email)
                                      ↘ /api/list-commandes → admin.html
```

## 1. Créer le projet Supabase

1. Va sur [supabase.com](https://supabase.com) → crée un compte gratuit.
2. "New project" → choisis un nom (ex. `pimeq-audio-system`) et un mot de passe
   de base de données (à conserver de côté).
3. Une fois le projet créé, va dans **SQL Editor** → **New query**, colle le
   contenu de `schema.sql` fourni ici, puis **Run**. Cela crée les tables
   `commandes` et `messages_contact`.
4. Va dans **Project Settings > API**. Note deux valeurs :
   - `Project URL` → ce sera `SUPABASE_URL`
   - `service_role` key (⚠️ pas la clé `anon` — la clé secrète) → ce sera
     `SUPABASE_SERVICE_ROLE_KEY`

## 2. Ajouter les fichiers au projet

Copie dans ton dépôt GitHub (`Pimeq12/Pimeq-audio-system`) :
- `schema.sql` → à la racine, pour référence (déjà exécuté à l'étape 1)
- `api/send-order.js` → remplace le fichier existant
- `api/send-contact.js` → remplace le fichier existant
- `api/list-commandes.js` → nouveau fichier
- `api/list-contact.js` → nouveau fichier
- `admin.html` → à la racine (page d'administration)

Ajoute la dépendance Supabase au projet Vercel :

```
npm install @supabase/supabase-js
```

(Ajoute `@supabase/supabase-js` dans `package.json` si tu gères tes dépendances
manuellement.)

## 3. Variables d'environnement Vercel

Dans Vercel > Settings > Environment Variables, ajoute (en plus des variables
déjà existantes `RESEND_API_KEY`, `ORDER_EMAIL`, `ORDER_FROM`) :

| Variable | Valeur |
|---|---|
| `SUPABASE_URL` | l'URL de ton projet Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | la clé `service_role` (jamais exposée au navigateur) |
| `ADMIN_KEY` | un mot de passe que tu choisis, pour protéger `admin.html` |

Redéploie le projet Vercel après avoir ajouté ces variables.

## 4. Utiliser le tableau de bord admin

Ouvre `https://TON-SITE.com/admin.html` (ou en local), saisis la valeur
choisie pour `ADMIN_KEY`. Tu verras la liste des commandes et des messages de
contact, les plus récents en premier.

⚠️ Pense à bloquer l'indexation de cette page — elle est déjà exclue via
`robots.txt` en ajoutant la ligne :

```
Disallow: /admin.html
```

## 5. Important — sécurité

- Ne mets **jamais** `SUPABASE_SERVICE_ROLE_KEY` ni `ADMIN_KEY` dans le code
  JavaScript du site GitHub Pages : elles ne doivent exister que côté serveur
  (Vercel), exactement comme `RESEND_API_KEY`.
- La base est protégée par Row Level Security : sans la clé `service_role`,
  personne ne peut lire ou écrire dans `commandes` ni `messages_contact`.
- Le frontend GitHub Pages continue de fonctionner sans changement — seuls les
  fichiers `api/*.js` évoluent.
