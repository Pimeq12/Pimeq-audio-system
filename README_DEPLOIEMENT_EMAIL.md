# PIMEQ Audio System — version avec envoi d'e-mails

## Architecture

Le site peut rester hébergé sur GitHub Pages. L'envoi des commandes passe par une fonction serverless Vercel qui appelle Resend.

GitHub Pages → Vercel `/api/send-order` → Resend → pimeqaudiosystem@gmail.com

## 1. Déployer l'API sur Vercel

Importe le dépôt GitHub contenant ce projet dans Vercel.

Le fichier `api/send-order.js` sera automatiquement exposé comme :
`https://TON-PROJET.vercel.app/api/send-order`

## 2. Variables d'environnement Vercel

Dans Vercel > Settings > Environment Variables, ajoute :

`RESEND_API_KEY` = ta clé API Resend

`ORDER_EMAIL` = `pimeqaudiosystem@gmail.com`

`ORDER_FROM` = `PIMEQ Audio System <onboarding@resend.dev>`

Pour une utilisation en production, vérifie ton propre domaine dans Resend et remplace ORDER_FROM par une adresse de ton domaine.

## 3. Point à modifier

Dans `assets/js/main.js`, la constante d'URL appelle actuellement :

`https://pimeq-audio-system.vercel.app/api/send-order`

Si ton projet Vercel porte un autre nom, remplace cette URL par celle de ton déploiement.

## 4. Important

Ne mets jamais `RESEND_API_KEY` dans les fichiers JavaScript du site GitHub Pages.

Le formulaire affiche maintenant un succès uniquement lorsque l'API confirme que l'e-mail a été accepté par Resend.

## 5. GitHub Pages

Le frontend peut continuer à être publié normalement depuis GitHub Pages. Le backend Vercel est indépendant du domaine GitHub Pages.
