# 🚀 Déploiement du Backend Google Apps Script (GQ Store)

Votre script est prêt dans [`apps-script/Code.gs`](./Code.gs) avec :
- **ID Google Sheets** : `1eNJkAd_cpSeIwWeaBwy-K7aXn13tjZaq0h5JqMpw6Cc`
- **ID Dossier Google Drive** : `1Mwl1G3GDPBq7miwZRnxTrRoYS7CLwEzq`

---

## Étape 1 : Ouvrir Google Apps Script

1. Ouvrez votre Google Sheets : [Accéder au classeur](https://docs.google.com/spreadsheets/d/1eNJkAd_cpSeIwWeaBwy-K7aXn13tjZaq0h5JqMpw6Cc/edit)
2. Dans le menu du haut, cliquez sur **Extensions** > **Apps Script**.

---

## Étape 2 : Coller le code

1. Dans l'éditeur Apps Script, effacez tout le contenu du fichier `Code.gs` par défaut.
2. Copiez l'intégralité du fichier [`apps-script/Code.gs`](./Code.gs) et collez-le.
3. Cliquez sur l'icône **Enregistrer** 💾 (ou `Ctrl + S` / `Cmd + S`).

---

## Étape 3 : (Optionnel mais recommandé) Initialiser les colonnes

1. Dans la barre d'outils d'Apps Script, à côté de "Exécuter", sélectionnez la fonction **`setupDatabase`** dans le menu déroulant.
2. Cliquez sur **Exécuter**.
3. Google vous demandera d'**Autoriser l'accès** (compte Google) :
   - Cliquez sur *Vérifier les autorisations*.
   - Choisissez votre compte Google.
   - Cliquez sur *Paramètres avancés* > *Accéder à Projet sans titre (non sécurisé)*.
   - Cliquez sur *Autoriser*.
4. Cette fonction garantit que les 5 onglets (`categories`, `products`, `product_images`, `product_specs`, `product_reviews`) ont exactement les en-têtes nécessaires en gras.

---

## Étape 4 : Déployer en Application Web (Web App)

1. En haut à droite, cliquez sur le bouton bleu **Déployer** > **Nouveau déploiement**.
2. Cliquez sur la roue dentée ⚙️ à gauche de *Sélectionner un type*, puis choisissez **Application Web**.
3. Remplissez les paramètres :
   - **Description** : `GQ Store API v1`
   - **Exécuter en tant que** : **Moi** (`votre.email@gmail.com`)
   - **Qui a accès** : **Tous le monde** (Très important ! Sinon le site ne pourra pas lire les produits).
4. Cliquez sur **Déployer**.
5. Copiez l'**URL de l'application Web** générée (qui ressemble à : `https://script.google.com/macros/s/AKfycbx.../exec`).

---

## Étape 5 : Coller l'URL dans `.env`

Dans le projet boutique, collez l'URL obtenue dans votre fichier `.env` :
```env
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/VOTRE_ID_DEPLOIEMENT/exec
```
