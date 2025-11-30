import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import bootstrap from './src/main.server';

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');

  const commonEngine = new CommonEngine();

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  // Example Express Rest API endpoints
  // server.get('/api/**', (req, res) => { });
  // Serve static files from /browser
  server.get('*.*', express.static(browserDistFolder, {
    maxAge: '1y'
  }));

  // All regular routes use the Angular engine
  server.get('*', (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;

    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: `${protocol}://${headers.host}${originalUrl}`,
        publicPath: browserDistFolder,
        providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
      })
      .then((html) => {
        // Log the route for debugging
        console.log(`✅ Rendered route: ${originalUrl}`);
        
        // Check if it's a 404 page (optional: you can set status code)
        if (html.includes('not found page') || html.includes('undraw_page-not-found')) {
          console.log(`⚠️  404 Page rendered for: ${originalUrl}`);
          res.status(404); // Set proper HTTP status
        }
        
        res.send(html);
      })
      .catch((err) => {
        console.error(`❌ Error rendering ${originalUrl}:`, err);
        next(err);
      });
  });

  return server;
}

function run(): void {
  const port = process.env['PORT'] || 4000;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
    console.log(`\nTest these URLs:`);
    console.log(`  ✓ http://localhost:${port}/`);
    console.log(`  ✓ http://localhost:${port}/about`);
    console.log(`  ✗ http://localhost:${port}/fsdfsd (should show 404)`);
    console.log(`  ✗ http://localhost:${port}/random-path (should show 404)`);
  });
}

run();
