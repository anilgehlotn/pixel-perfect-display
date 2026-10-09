// Standalone HTML for when server rendering fails before React can render. It cannot use
// Tailwind or styles.css, so the site's tokens are inlined here. Keep in sync with styles.css.
export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>This page didn't load | SkinFusion</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500&display=swap" />
    <style>
      body { font: 17px/1.6 "Jost", system-ui, sans-serif; background: #fbf7f2; color: #1f1f1f; display: grid; place-items: center; min-height: 100dvh; margin: 0; padding: 1.5rem; -webkit-font-smoothing: antialiased; }
      .card { max-width: 28rem; width: 100%; text-align: center; }
      h1 { font-size: 1.25rem; font-weight: 400; text-transform: uppercase; letter-spacing: 0.2em; line-height: 1.25; margin: 0 0 1.25rem; }
      p { color: #6b635c; margin: 0 0 2rem; }
      .actions { display: flex; flex-direction: column; gap: 0.75rem; justify-content: center; }
      a, button { display: inline-flex; align-items: center; justify-content: center; min-height: 48px; padding: 1rem 2.5rem; border-radius: 0; font: inherit; font-size: 0.75rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.22em; cursor: pointer; text-decoration: none; border: 1px solid transparent; transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1); }
      a:active, button:active { transform: scale(0.98); }
      .primary { background: #e8807a; color: #fff; }
      .primary:hover { background: #d96e68; }
      .secondary { background: transparent; color: #1f1f1f; border-color: #1f1f1f; }
      @media (min-width: 640px) { h1 { font-size: 1.875rem; } .actions { flex-direction: row; } }
    </style>
  </head>
  <body>
    <main class="card">
      <h1>This page didn't load</h1>
      <p>Something went wrong on our end. You can try refreshing or head back home.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Try again</button>
        <a class="secondary" href="/">Go home</a>
      </div>
    </main>
  </body>
</html>`;
}
