# MyDietChef

![Screenshot](https://i.ibb.co/MDqyYg28/Screenshot-From-2026-04-10-14-43-10.png)




Le projet couvre le suivi des repas, l'analyse nutritionnelle assistee par IA, la gestion de recettes et un espace coach pour accompagner les utilisateurs.

## Fonctionnalites

- Scan de repas a partir d'une photo avec estimation nutritionnelle.
- Analyse IA avec prise en charge de `Gemini` et `OpenAI` selon les flux.
- Tableau de bord utilisateur : profil, repas, recettes, evolution.
- Tableau de bord coach : utilisateurs suivis, recettes, suivi et commentaires.
- Jeu de donnees de demo pour accelerer les tests locaux.

## Stack technique

- Frontend : `Next.js 16`, `React 19`, `Tailwind CSS 4`, `Apollo Client`
- Backend : `TypeScript`, `Fastify`, `Apollo Server`, `TypeGraphQL`, `TypeORM`
- Base de donnees : `PostgreSQL`
- Tests : `Jest`, `Testing Library`, `Playwright`
- Infra : `Docker Compose`, `Nginx` (gateway en prod)

## Architecture

```text
.
├── frontend/   # application Next.js
├── backend/    # API GraphQL + logique metier + acces DB
├── gateway/    # reverse proxy Nginx pour la prod
├── docker-compose.yml
└── docker-compose.prod.yml
```

## Demarrage rapide avec Docker

### 1. Initialiser les fichiers d'environnement

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Les fichiers d'exemple contiennent deja des valeurs locales de base. Si vous voulez tester l'analyse IA, remplacez les valeurs `CHANGEME` par de vraies cles API.

### 2. Lancer la stack locale

```bash
docker compose up --build
```

Services exposes :

- Frontend : `http://localhost:3000`
- API GraphQL : `http://localhost:4000`
- PostgreSQL : `localhost:5432`

### 3. Charger des donnees de demo

Dans un second terminal :

```bash
docker compose exec backend npm run seed
```

Cette commande reinitialise la base puis injecte un jeu de donnees de demo.
Le backend synchronise aussi le schema automatiquement en environnement de developpement.

## Demarrage manuel

Si vous preferez lancer frontend et backend hors Docker :

### 1. Demarrer uniquement la base

```bash
docker compose up -d db
```

### 2. Installer et lancer le backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### 3. Installer et lancer le frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### 4. Optionnel : injecter des donnees de demo

```bash
cd backend
npm run seed
```

La commande de seed reinitialise la base avant de la repeupler.

## Comptes de demo

En developpement, un coach de demo est cree automatiquement au demarrage du backend :

- `coach@app.com` / `SuperP@ssW0rd!`

Apres execution du seed (`npm run seed`), vous obtenez aussi :

- `dave.lopper@app.com` / `SuperP@ssW0rd!`
- `jane.doe@app.com` / `SuperP@ssW0rd!`
- `janette.doe@app.com` / `SuperP@ssW0rd!`
- `admin@app.com` / `SuperP@ssW0rd!`

## Variables d'environnement

### Backend

Fichier : `backend/.env`

- `GRAPHQL_SERVER_PORT` : port de l'API
- `JWT_SECRET` : secret de signature des tokens
- `CORS_ALLOWED_ORIGINS` : origines autorisees pour le frontend
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME` : connexion PostgreSQL
- `GEMINI_API_KEY` : cle API utilisee par les services IA du backend
- `OPENAI_API_KEY` : optionnelle selon les flux
- `OPENAI_MEAL_SCAN_MODEL` : optionnelle
- `TEST_DB_PORT` : optionnelle pour les tests d'integration

### Frontend

Fichier : `frontend/.env`

- `NEXT_PUBLIC_GRAPHQL_API_URL` : URL de l'API GraphQL
- `OPENAI_API_KEY` : cle utilisee par certaines routes API Next.js
- `OPENAI_MEAL_SCAN_MODEL` : modele OpenAI a utiliser
- `GEMINI_API_KEY` : cle Gemini pour les routes locales d'analyse

## Commandes utiles

### Racine du projet

```bash
docker compose up --build
docker compose down
./build.sh
./start.sh
```

- `./build.sh` construit et pousse les images Docker de production.
- `./start.sh` redeploie la stack de production via `docker-compose.prod.yml` et `.env.production`.

### Backend

```bash
cd backend
npm run dev
npm run seed
npm run seed:massive
npm run resetDB
npm run build
npm run test
npm run lint
npm run format
```

- `npm run seed` charge un petit jeu de donnees de demo pour demarrer rapidement.
- `npm run seed:massive` reinitialise la base et genere un dataset plus important, pratique pour tester les tableaux, la charge visuelle, la pagination et les parcours coach a plus grande echelle.
- Le seed massif cree actuellement environ `100` utilisateurs, `250` recettes et jusqu'a `90` jours d'historique de repas.

### Frontend

```bash
cd frontend
npm run dev
npm run codegen
npm run build
npm run test
npm run test:e2e
npm run lint
npm run format
```

## Notes

- L'API GraphQL est montee sur `/` cote backend.
- Le backend active `TypeORM synchronize` hors production.
- Le gateway Nginx n'est utilise que dans la configuration de production.
