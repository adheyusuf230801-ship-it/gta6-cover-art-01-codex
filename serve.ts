import { createServer } from 'node:http';
import { createReadStream, statSync, realpathSync } from 'node:fs';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const publicDirectory = realpathSync(fileURLToPath(new URL('app', import.meta.url)));
const portArgument = process.argv.indexOf('--port');
const port = Number(portArgument >= 0 ? process.argv[portArgument + 1] : process.env.PORT || 8080);
if (!Number.isInteger(port) || port <= 0 || port > 65535) throw new Error('Supply a port from 1 to 65535.');
const contentTypes = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json',
};
const server = createServer((request, response) => {
  try {
    const path = decodeURIComponent(new URL(request.url || '/', 'http://localhost').pathname);
    const candidate = resolve(publicDirectory, './' + path.replace(/^\/+/, '') + (path.endsWith('/') ? 'index.html' : ''));
    const file = realpathSync(candidate);
    if (!file.startsWith(publicDirectory + sep)) {
      response.writeHead(403).end('Outside the app directory');
      return;
    }
    const details = statSync(file);
    if (!details.isFile()) throw new Error('Not a file');
    response.writeHead(200, {
      'Content-Type': contentTypes[extname(file).toLowerCase()] || 'application/octet-stream',
      'Content-Length': details.size, 'Cache-Control': 'no-store',
    });
    if (request.method === 'HEAD') { response.end(); return; }
    const stream = createReadStream(file);
    stream.on('error', () => response.destroy());
    stream.pipe(response);
  } catch {
    response.writeHead(404).end('This file is not available.');
  }
});
server.listen(port, '127.0.0.1', () => console.log(`Neon Coast is ready at http://127.0.0.1:${port}`));
