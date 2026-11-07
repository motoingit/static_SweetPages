# SweetShop

A lightweight React + TypeScript sweet shop billing app. Products are loaded from `public/sweetlist.json`; cart data is persisted in the browser's LocalStorage.

## Local development

```bash
npm install
npm run dev
```

Create a production build with `npm run build`.

## GitHub Pages

Push the repository's `main` branch to GitHub, enable **GitHub Actions** as the Pages source in repository settings, and the included workflow will build and deploy the app. Vite uses relative assets and the app uses `HashRouter`, so it works from a repository subpath.
