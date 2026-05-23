export function renderErrorPage() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>Application Error</title>
      <style>
        body { font-family: system-ui, sans-serif; background: #0B0F14; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
        .card { background: #1e293b; padding: 2rem; border-radius: 0.875rem; text-align: center; max-width: 400px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3); }
        h1 { color: #f43f5e; margin-top: 0; font-size: 1.5rem; }
        p { color: #94a3b8; font-size: 0.875rem; line-height: 1.5; }
        a { display: inline-block; margin-top: 1.5rem; color: #3b82f6; text-decoration: none; font-weight: 500; }
        a:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>An Error Occurred</h1>
        <p>Something went wrong on our end. Please refresh the page or try again later.</p>
        <a href="/">Go Home</a>
      </div>
    </body>
    </html>
  `;
}
