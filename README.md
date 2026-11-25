# TRENCH

Training app for a high school lineman, built around YMCA equipment. Open `index.html` in a browser to use it; it works offline once loaded.

## Project layout

- `index.html` — the built app (single file)
- `src/` — source: HTML, CSS and JavaScript modules
- `build.py` — joins `src/` into `index.html`
- `qa/` — tests (engine, coaching, nutrition, meal plans, end-to-end)

## Build and test

```
npm install
npm run build   # rebuilds index.html from src/
npm test        # rebuilds, then runs the unit tests
python3 qa/e2e.py   # end-to-end test (needs Playwright + Chrome)
```

Edit files in `src/`, then run the build. Don't edit `index.html` by hand.
