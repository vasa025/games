# TileFlow

TileFlow is a mobile-friendly number-merging puzzle inspired by classic merging games, built with Vite + vanilla JavaScript.

## Features

- 4x4 responsive board
- Arrow-key and swipe controls
- Merge-once-per-turn logic
- Score, best score, win and game-over states
- Undo, save/restore, daily seeded board
- Theme toggle, sound toggle, help/settings panel
- Progressive Web App support with offline cache

## Install on a phone

TileFlow is a Progressive Web App, so it can be installed from its browser without an app store. Open the live game on your phone and tap **Install app**. On iPhone, open the page in Safari, tap **Share**, then choose **Add to Home Screen**. After the first load, the game can also run offline.

Regenerate the PWA icons after changing the app mark with:

```bash
npm run icons
```

## Local development

```bash
npm install
npm run dev
```

Open the local URL shown in the terminal (typically http://localhost:5173).

## Testing

```bash
npm run test
```

## Production build

```bash
npm run build
```

## Preview production build

```bash
npm run preview
```

## Git

```bash
git init
git add .
git commit -m "Initial TileFlow implementation"
git branch -M main
git remote add origin <your-repository-url>
git push -u origin main
```
