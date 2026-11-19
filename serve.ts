import { createServer } from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const base = fileURLToPath(new URL('./app/', import.meta.url));
const flag = process.argv.indexOf('--port');
const port = Number(flag < 0 ? process.env.PORT ?? 8080 : process.argv[flag + 1]);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw Error('Port must be between 1 and 65535');
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.jpg': 'image/jpeg', '.png': 'image/png', '.json': 'application/json' };
createServer((req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url ?? '/', 'http://local').pathname);
    const target = resolve(base, '.' + (pathname.endsWith('/') ? pathname + 'index.html' : pathname));
    if (!target.startsWith(resolve(base) + sep)) { res.writeHead(403).end(); return; }
    const info = statSync(target);
    if (!info.isFile()) throw Error('Missing file');
    res.writeHead(200, { 'Content-Type': types[extname(target)] ?? 'application/octet-stream', 'Content-Length': info.size, 'Cache-Control': 'no-store' });
    const stream = createReadStream(target);
    stream.on('error', () => res.destroy());
    stream.pipe(res);
  } catch { res.writeHead(404).end('File not found'); }
}).listen(port, '127.0.0.1', () => console.log('Neon Coast: http://127.0.0.1:' + port));
