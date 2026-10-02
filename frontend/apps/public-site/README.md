# Gym Park public site

React + TypeScript + Vite. Start from `frontend` with `npm run dev:public`.

Public routes: `/`, `/le-club`, `/cours`, `/abonnements`, `/offres`, `/contact`, `/fidelite`, `/connexion`, `/rejoindre`, `/legal`.

The current member prototype is `/espace-membre` and its subroutes. All member records and local actions are demonstrations; see the root README for boundaries and production requirements.

Business data lives in `config/gym-park.json`. Public pricing is not populated from the existing SQL membership-plan endpoint. Update the shared configuration and rebuild to publish business-data changes.

`npm run test -w apps/public-site` from `frontend` runs Playwright using installed Chrome. `npm run build -w apps/public-site` validates TypeScript and builds production assets.
