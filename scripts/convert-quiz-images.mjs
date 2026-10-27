// scripts/convert-quiz-images.mjs
//
// Converts quiz-diagram PNG/JPG files to WebP (resized + compressed) so
// they're ready to drop into src/assets/images/quiz/<slug>/. This machine
// doesn't have cwebp/ImageMagick installed, so this uses the `sharp`
// devDependency instead — no other tools needed.
//
// Usage:
//   node scripts/convert-quiz-images.mjs <file-or-dir> [...more] [options]
//   npm run convert-images -- <file-or-dir> [...more] [options]
//
// Options:
//   --out <dir>        Write .webp files here instead of alongside the input
//   --width <px>       Max width to resize to (default 1200; never upscales)
//   --quality <0-100>  WebP quality (default 82)
//
// Examples:
//   npm run convert-images -- "Quizes/Quiz_Diagrams/Week3_LinearEquations" --out src/assets/images/quiz/week3
//   npm run convert-images -- diagram1.png diagram2.jpg --out src/assets/images/quiz/week3

import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg"]);

function parseArgs(argv) {
  const opts = { width: 1200, quality: 82, out: null, inputs: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--out") opts.out = argv[(i += 1)];
    else if (arg === "--width") opts.width = Number(argv[(i += 1)]);
    else if (arg === "--quality") opts.quality = Number(argv[(i += 1)]);
    else opts.inputs.push(arg);
  }
  return opts;
}

// Directories are walked recursively since the diagram folders this feeds
// from (Quizes/Quiz_Diagrams/<quiz>/<level>/*) are nested per level.
function collectFiles(inputPath) {
  const stat = fs.statSync(inputPath);
  if (!stat.isDirectory()) return [inputPath];

  const files = [];
  for (const entry of fs.readdirSync(inputPath, { withFileTypes: true })) {
    const full = path.join(inputPath, entry.name);
    if (entry.isDirectory()) files.push(...collectFiles(full));
    else if (IMAGE_EXT.has(path.extname(entry.name).toLowerCase())) files.push(full);
  }
  return files;
}

function formatSize(bytes) {
  return bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(2)} MB`
    : `${(bytes / 1024).toFixed(1)} KB`;
}

async function convertOne(file, opts) {
  const outDir = opts.out || path.dirname(file);
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${path.basename(file, path.extname(file))}.webp`);

  const image = sharp(file);
  const meta = await image.metadata();
  const pipeline = meta.width > opts.width ? image.resize({ width: opts.width }) : image;
  await pipeline.webp({ quality: opts.quality }).toFile(outPath);

  const before = fs.statSync(file).size;
  const after = fs.statSync(outPath).size;
  const savedPct = (100 * (1 - after / before)).toFixed(0);
  console.log(
    `${path.relative(process.cwd(), file)} -> ${path.relative(process.cwd(), outPath)}  ` +
      `(${formatSize(before)} -> ${formatSize(after)}, -${savedPct}%)`
  );
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.inputs.length === 0) {
    console.error(
      "Usage: node scripts/convert-quiz-images.mjs <file-or-dir> [...] [--out <dir>] [--width 1200] [--quality 82]"
    );
    process.exit(1);
  }

  const files = opts.inputs.flatMap(collectFiles);
  if (files.length === 0) {
    console.error("No PNG/JPG files found under the given path(s).");
    process.exit(1);
  }

  for (const file of files) {
    await convertOne(file, opts);
  }
}

main();
