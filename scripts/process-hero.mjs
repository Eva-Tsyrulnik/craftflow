import sharp from "sharp";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const heroDir = path.join(root, "public", "hero");
const source = path.join(heroDir, "source-hires.jpg");

if (!existsSync(source)) {
  console.error("Missing public/hero/source-hires.jpg — download the hi-res source first.");
  process.exit(1);
}

/** Пайплайн: приглушённые тёплые тона, high-key, лёгкая мягкость (как отредактированный hero-bg) */
function buildPipeline(width) {
  return sharp(source)
    .rotate()
    .resize(width, null, { fit: "inside", withoutEnlargement: true })
    .modulate({ brightness: 1.14, saturation: 0.42 })
    .linear(0.92, 18)
    .blur(0.6)
    .webp({ quality: 88, effort: 6 });
}

const widths = [768, 1280, 1920, 2560];

for (const w of widths) {
  const out = path.join(heroDir, `hero-bg-${w}.webp`);
  await buildPipeline(w).toFile(out);
  console.log(`Wrote ${out}`);
}

await buildPipeline(1920).toFile(path.join(heroDir, "hero-bg.webp"));

console.log("Done.");
