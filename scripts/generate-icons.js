import { mkdirSync, writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const iconDirectory = resolve(projectRoot, 'public');
const polygon = [
    [156, 344], [156, 168], [224, 168], [284, 244], [344, 168], [412, 168],
    [412, 344], [344, 344], [344, 248], [272, 328], [200, 248], [200, 344]
];
const crcTable = new Uint32Array(256);

for (let value = 0; value < 256; value += 1) {
    let crc = value;
    for (let bit = 0; bit < 8; bit += 1) {
        crc = (crc & 1) ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    }
    crcTable[value] = crc >>> 0;
}

function crc32(buffer) {
    let crc = 0xffffffff;
    for (const byte of buffer) {
        crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
    const name = Buffer.from(type, 'ascii');
    const content = Buffer.concat([name, data]);
    const chunk = Buffer.alloc(12 + data.length);
    chunk.writeUInt32BE(data.length, 0);
    content.copy(chunk, 4);
    chunk.writeUInt32BE(crc32(content), 8 + data.length);
    return chunk;
}

function insidePolygon(x, y, points) {
    let inside = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i, i += 1) {
        const [xi, yi] = points[i];
        const [xj, yj] = points[j];
        const crosses = (yi > y) !== (yj > y)
            && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
        if (crosses) inside = !inside;
    }
    return inside;
}

function roundedRectContains(x, y, left, top, right, bottom, radius) {
    const dx = Math.max(left + radius - x, 0, x - (right - radius));
    const dy = Math.max(top + radius - y, 0, y - (bottom - radius));
    return dx * dx + dy * dy <= radius * radius;
}

function renderIcon(size) {
    const scale = size / 512;
    const rowLength = 1 + size * 4;
    const pixels = Buffer.alloc(rowLength * size);
    const scaledPolygon = polygon.map(([x, y]) => [x * scale, y * scale]);
    const left = 64 * scale;
    const top = 64 * scale;
    const right = 448 * scale;
    const bottom = 448 * scale;
    const radius = 84 * scale;

    for (let y = 0; y < size; y += 1) {
        const rowOffset = y * rowLength;
        pixels[rowOffset] = 0;
        for (let x = 0; x < size; x += 1) {
            let red = 15;
            let green = 23;
            let blue = 42;

            if (roundedRectContains(x + 0.5, y + 0.5, left, top, right, bottom, radius)) {
                const blend = Math.max(0, Math.min(1, ((x + y) / 2 - left) / (right - left)));
                red = Math.round(124 + (34 - 124) * blend);
                green = Math.round(58 + (211 - 58) * blend);
                blue = Math.round(237 + (238 - 237) * blend);
            }

            if (insidePolygon(x + 0.5, y + 0.5, scaledPolygon)) {
                red = 248;
                green = 250;
                blue = 252;
            }

            const pixelOffset = rowOffset + 1 + x * 4;
            pixels[pixelOffset] = red;
            pixels[pixelOffset + 1] = green;
            pixels[pixelOffset + 2] = blue;
            pixels[pixelOffset + 3] = 255;
        }
    }

    const header = Buffer.alloc(13);
    header.writeUInt32BE(size, 0);
    header.writeUInt32BE(size, 4);
    header[8] = 8;
    header[9] = 6;
    const image = Buffer.concat([
        Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
        pngChunk('IHDR', header),
        pngChunk('IDAT', deflateSync(pixels)),
        pngChunk('IEND', Buffer.alloc(0))
    ]);

    writeFileSync(resolve(iconDirectory, `tileflow-icon-${size}.png`), image);
}

mkdirSync(iconDirectory, { recursive: true });
renderIcon(192);
renderIcon(512);
console.log('Generated TileFlow PWA icons in public/.');
