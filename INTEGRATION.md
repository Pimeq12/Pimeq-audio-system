# Intégration du formulaire de contact — PIMEQ Audio System

## Ce qui a été ajouté

1. **`api/send-contact.js`** — nouvelle fonction serverless Vercel, calquée sur `send-order.js`, qui envoie le contenu du formulaire de contact vers Resend.
2. **`assets/js/contact-form.js`** — script front qui intercepte la soumission du formulaire, envoie les données en JSON à l'API, et affiche un message de succès ou d'erreur.

Les formulaires de commande (`commande-basic.html`, `commande-standard.html`, `commande-premium.html`) continuent d'utiliser `api/send-order.js` sans changement.

## 1. Ajouter le fichier à ton dépôt

Copie `api/send-contact.js` dans le dossier `api/` existant de ton repo GitHub. Vercel le détectera et l'exposera automatiquement sur :
`https://TON-PROJET.vercel.app/api/send-contact`

## 2. Adapter `contact.html`

Ton formulaire doit avoir cette structure minimale (adapte les classes CSS à ta charte graphique) :

```html
<form id="contact-form">
  <input type="text" name="name" placeholder="Nom complet" required>
  <input type="tel" name="phone" placeholder="Téléphone">
  <input type="email" name="email" placeholder="E-mail" required>
  <input type="text" name="subject" placeholder="Sujet">
  <textarea name="message" placeholder="Votre message" required></textarea>

  <!-- Anti-spam : champ invisible, ne pas retirer -->
  <input type="text" name="website" style="display:none" tabindex="-1" autocomplete="off">

  <button type="submit">Envoyer</button>
</form>
<p id="contact-form-status"></p>

<script src="assets/js/contact-form.js"></script>
```

Si tes champs existants portent d'autres noms, ajuste soit le HTML, soit les clés lues dans `send-contact.js` (`body.name`, `body.email`, `body.message`, etc.).

## 3. Vérifier l'URL de l'API dans le script

Dans `assets/js/contact-form.js`, la constante :
```js
const CONTACT_API_URL = "https://pimeq-audio-system.vercel.app/api/send-contact";
```
doit correspondre exactement au nom de ton projet Vercel (le même que celui utilisé pour `send-order`).

## 4. Variables d'environnement Vercel

Aucune nouvelle variable obligatoire : `send-contact.js` réutilise `RESEND_API_KEY` et `ORDER_FROM` déjà configurées pour les commandes.

Optionnel : si tu veux que les messages de contact arrivent sur une adresse différente des commandes, ajoute dans Vercel :
`CONTACT_EMAIL` = l'adresse e-mail de réception des messages de contact

Sinon, `send-contact.js` utilisera automatiquement la même adresse que les commandes (`ORDER_EMAIL`, par défaut `pimeqaudiosystem@gmail.com`).

## 5. Style du message de statut (optionnel)

Ajoute dans ta feuille de style commune :

```css
.form-status { margin-top: 10px; font-size: 0.9rem; }
.form-status--success { color: #1a7f37; }
.form-status--error { color: #c62828; }
```

## 6. Anti-spam

Le champ caché `website` est un piège à robots (honeypot) : les vrais visiteurs ne le remplissent jamais, un bot le fait souvent. Si ce champ arrive rempli, l'API renvoie un succès factice sans envoyer d'e-mail — inutile de le retirer.

## 7. Redéploiement

Après avoir poussé les fichiers sur GitHub, Vercel redéploiera automatiquement l'API. GitHub Pages n'a rien à faire de spécial : il continue de servir le HTML/CSS/JS statique normalement.
