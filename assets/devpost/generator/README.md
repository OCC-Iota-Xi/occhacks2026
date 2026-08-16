# Devpost asset generator

The PNGs in `assets/devpost/` are rendered from the real hero components
(`HeroAstronaut`, `AnimatedGradientText`, Bruno Ace SC / Space Grotesk) by a
headless Chrome, so they stay in sync with the site by construction.

To regenerate:

1. `cp export-page.tsx ../../../app/export/page.tsx` (create the dir first)
2. Start the dev server on port 3001 (`npm run dev -- -p 3001`)
3. `node shoot.mjs` — writes the four PNGs into `assets/devpost/`
4. `rm -rf ../../../app/export`

`shoot.mjs` needs `puppeteer-core` and a Chrome binary; it points at the
puppeteer cache under `~/.cache/puppeteer`. Update `CHROME` if that moves.

The route is kept out of `app/` between runs so it never ships to production.
