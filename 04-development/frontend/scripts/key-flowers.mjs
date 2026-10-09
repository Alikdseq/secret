import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve("public/images/flowers");
const sources = [
  ["c:/Users/Алихан/Desktop/ALIHAN-AI-OFFICE/projects/demo-secret/4cf38b5c-461a-4987-9c65-14ea8341f429.png", "rose/rose-01.png"],
  ["C:/Users/Алихан/.cursor/projects/c-Users-Desktop-ALIHAN-AI-OFFICE/assets/rose-02.jpg", "rose/rose-02.png"],
  ["C:/Users/Алихан/.cursor/projects/c-Users-Desktop-ALIHAN-AI-OFFICE/assets/rose-03.jpg", "rose/rose-03.png"],
  ["C:/Users/Алихан/.cursor/projects/c-Users-Desktop-ALIHAN-AI-OFFICE/assets/peony-01.jpg", "peony/peony-01.png"],
  ["C:/Users/Алихан/.cursor/projects/c-Users-Desktop-ALIHAN-AI-OFFICE/assets/tulip-01.jpg", "tulip/tulip-01.png"],
  ["C:/Users/Алихан/.cursor/projects/c-Users-Desktop-ALIHAN-AI-OFFICE/assets/eustoma-01.jpg", "eustoma/eustoma-01.png"],
  ["C:/Users/Алихан/.cursor/projects/c-Users-Desktop-ALIHAN-AI-OFFICE/assets/chrysanthemum-01.jpg", "chrysanthemum/chrysanthemum-01.png"],
  ["C:/Users/Алихан/.cursor/projects/c-Users-Desktop-ALIHAN-AI-OFFICE/assets/hydrangea-01.jpg", "hydrangea/hydrangea-01.png"],
  ["C:/Users/Алихан/.cursor/projects/c-Users-Desktop-ALIHAN-AI-OFFICE/assets/eucalyptus-01.jpg", "eucalyptus/eucalyptus-01.png"],
];

function isBackground(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max < 32 && max - min < 14;
}

async function keyFile(input, output) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const visited = new Uint8Array(width * height);
  const stack = [];
  const at = (x, y) => (y * width + x) * channels;

  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const p = y * width + x;
    if (visited[p]) return;
    const i = at(x, y);
    if (!isBackground(data[i], data[i + 1], data[i + 2])) return;
    visited[p] = 1;
    data[i + 3] = 0;
    stack.push(x, y);
  };

  for (let x = 0; x < width; x += 1) {
    push(x, 0);
    push(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    push(0, y);
    push(width - 1, y);
  }

  while (stack.length) {
    const y = stack.pop();
    const x = stack.pop();
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }

  const opaque = new Uint8Array(width * height);
  const seen = new Uint8Array(width * height);
  let bestCount = 0;
  let bestId = 0;
  let component = 0;
  const labels = new Int32Array(width * height);
  const grow = [];
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const start = y * width + x;
      if (seen[start] || data[at(x, y) + 3] < 40) continue;
      component += 1;
      let count = 0;
      grow.push(x, y);
      seen[start] = 1;
      while (grow.length) {
        const cy = grow.pop();
        const cx = grow.pop();
        const cp = cy * width + cx;
        labels[cp] = component;
        count += 1;
        for (const [dx, dy] of [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ]) {
          const nx = cx + dx;
          const ny = cy + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          const np = ny * width + nx;
          if (seen[np] || data[at(nx, ny) + 3] < 40) continue;
          seen[np] = 1;
          grow.push(nx, ny);
        }
      }
      if (count > bestCount) {
        bestCount = count;
        bestId = component;
      }
    }
  }
  for (let i = 0; i < width * height; i += 1) {
    if (labels[i] !== bestId) data[i * channels + 3] = 0;
    else opaque[i] = 1;
  }

  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  let cutX = Math.floor(width / 2);
  let cutY = 0;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = at(x, y);
      const alpha = data[i + 3];
      if (alpha < 16) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
      if (y >= cutY) {
        cutY = y;
        cutX = x;
      }
    }
  }

  if (maxX < minX) throw new Error(`no flower pixels in ${input}`);

  for (let y = Math.max(1, minY - 2); y <= Math.min(height - 2, maxY + 2); y += 1) {
    for (let x = Math.max(1, minX - 2); x <= Math.min(width - 2, maxX + 2); x += 1) {
      const p = y * width + x;
      if (visited[p] || data[at(x, y) + 3] < 16) continue;
      let edge = false;
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        if (visited[(y + dy) * width + (x + dx)]) edge = true;
      }
      if (!edge) continue;
      const i = at(x, y);
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const max = Math.max(r, g, b);
      if (max > 90) continue;
      const alpha = Math.max(0.08, max / 90);
      data[i] = Math.min(255, Math.round(r / alpha));
      data[i + 1] = Math.min(255, Math.round(g / alpha));
      data[i + 2] = Math.min(255, Math.round(b / alpha));
      data[i + 3] = Math.round(alpha * 255);
    }
  }

  const contentW = maxX - minX + 1;
  const contentH = maxY - minY + 1;
  const cutLocalX = cutX - minX;
  const extraLeft = Math.max(0, contentW - cutLocalX * 2);
  const extraRight = Math.max(0, cutLocalX * 2 - contentW);
  const pad = Math.round(contentW * 0.06);

  fs.mkdirSync(path.dirname(output), { recursive: true });
  await sharp(data, { raw: { width, height, channels: 4 } })
    .extract({ left: minX, top: minY, width: contentW, height: contentH })
    .extend({
      left: extraLeft + pad,
      right: extraRight + pad,
      top: Math.round(contentH * 0.04),
      bottom: Math.round(contentH * 0.03),
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .resize({ height: 1400, fit: "inside" })
    .png({ compressionLevel: 9 })
    .toFile(output);

  const out = await sharp(output).metadata();
  console.log(path.basename(output), out.width, out.height);
}

for (const [input, name] of sources) {
  await keyFile(input, path.join(root, name));
}
