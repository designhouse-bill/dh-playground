# vendor — real PrimeNG Aura theme CSS

`aura.css` = static build of the REAL Aura theme (common vars + base + theme
CSS for the PrimeNG surface this proto uses). Generated from the ISC
`node_modules` (`@primeuix/themes` / `@primeuix/styles` — the exact versions
the Angular port renders with, PrimeNG 20.4.0), mirroring ISC's
`providePrimeNG({ theme: { preset: Aura, options: { darkModeSelector: false } } })`.

- Regenerate: `node generate-aura.mjs` (re-run after ISC PrimeNG upgrades).
- Add components to the `COMPONENTS` list as carves need them.
- Load `aura.css` BEFORE proto CSS so local rules keep cascade priority.
- Do not hand-edit `aura.css`.
