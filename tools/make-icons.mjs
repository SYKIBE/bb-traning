// Genererar PNG-ikoner (utan beroenden) till icons/. Kör: npm run icons
// Motivet: en ljus cirkel (bäckenbotten som knips ihop) inuti en ring, på teal.
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'icons');
mkdirSync(outDir, { recursive: true });

const BG = [15, 118, 110];
const RING = [255, 255, 255];
const ORB = [94, 234, 212];

// u, v i [-0.5, 0.5] från mitten. `scale` = hur stort motivet är (1 = inom maskable-säkerhetszonen).
function colorAt(u, v, scale) {
  const r = Math.hypot(u, v) / scale;
  if (r <= 0.2) return ORB;
  if (r >= 0.3 && r <= 0.36) return RING;
  return BG;
}

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

function png(size, scale) {
  const samples = 3; // 3×3 supersampling för mjuka kanter
  const raw = Buffer.alloc((size * 3 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 3 + 1)] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      let r = 0;
      let g = 0;
      let b = 0;
      for (let sy = 0; sy < samples; sy++) {
        for (let sx = 0; sx < samples; sx++) {
          const u = (x + (sx + 0.5) / samples) / size - 0.5;
          const v = (y + (sy + 0.5) / samples) / size - 0.5;
          const [cr, cg, cb] = colorAt(u, v, scale);
          r += cr;
          g += cg;
          b += cb;
        }
      }
      const n = samples * samples;
      const offset = y * (size * 3 + 1) + 1 + x * 3;
      raw[offset] = Math.round(r / n);
      raw[offset + 1] = Math.round(g / n);
      raw[offset + 2] = Math.round(b / n);
    }
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8; // bitdjup
  header[9] = 2; // RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const files = {
  'icon-192.png': png(192, 1.15),
  'icon-512.png': png(512, 1.15),
  'icon-maskable-512.png': png(512, 1),
};
for (const [name, data] of Object.entries(files)) {
  writeFileSync(join(outDir, name), data);
  console.log(`icons/${name} (${data.length} byte)`);
}

// SVG med samma motiv (scale 1.15) för webbläsarflikar.
const s = 1.15;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="rgb(${BG})"/>
  <circle cx="256" cy="256" r="${(0.33 * s * 512).toFixed(1)}" fill="none" stroke="rgb(${RING})" stroke-width="${(0.06 * s * 512).toFixed(1)}"/>
  <circle cx="256" cy="256" r="${(0.2 * s * 512).toFixed(1)}" fill="rgb(${ORB})"/>
</svg>
`;
writeFileSync(join(outDir, 'icon.svg'), svg);
console.log('icons/icon.svg');
