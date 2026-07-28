import { config } from "dotenv";
config({ path: ".env.local" });

import sharp from "sharp";
import { eq } from "drizzle-orm";
import { db } from "../src/db";
import { restaurants } from "../src/db/schema";
import { uploadImage } from "../src/lib/blob/upload";

// Portadas de marca (SVG → imagen) para los restaurantes de prueba del seed
// que todavía no tienen una foto real subida por su dueño. No se usan fotos
// reales de ningún negocio: son ilustraciones con los mismos tokens de color
// del sistema, para que cada restaurante se distinga en /buscar sin romper
// el estilo visual.
const COVERS: Record<
  string,
  { gradient: [string, string, string]; angle: number; icon: "waves" | "show" | "bowl" }
> = {
  "uros-lounge": { gradient: ["#133b5c", "#3e7cb1", "#5fa8d3"], angle: 45, icon: "waves" },
  "pena-kantuta": { gradient: ["#a83e22", "#c1502e", "#e08152"], angle: 135, icon: "show" },
  "la-chacra-punena": { gradient: ["#0e2a44", "#1b4965", "#e7ddcb"], angle: 20, icon: "bowl" },
  "sabores-del-altiplano": { gradient: ["#071a2c", "#275f80", "#f5efe6"], angle: 200, icon: "bowl" },
};

function iconMarkup(icon: "waves" | "show" | "bowl"): string {
  if (icon === "waves") {
    return `
      <g stroke="white" stroke-width="6" stroke-linecap="round" opacity="0.85" fill="none">
        <path d="M700 420 Q 750 390 800 420 T 900 420" />
        <path d="M700 460 Q 750 430 800 460 T 900 460" />
        <path d="M700 500 Q 750 470 800 500 T 900 500" />
      </g>`;
  }
  if (icon === "show") {
    return `
      <g fill="white" opacity="0.9">
        <path d="M800 380 L818 435 L876 435 L829 468 L847 524 L800 490 L753 524 L771 468 L724 435 L782 435 Z" />
        <circle cx="700" cy="500" r="7" />
        <circle cx="905" cy="470" r="5" />
        <circle cx="890" cy="540" r="6" />
      </g>`;
  }
  return `
    <g stroke="white" stroke-width="6" stroke-linecap="round" opacity="0.85">
      <path d="M770 400 Q 765 380 775 365" fill="none" />
      <path d="M800 400 Q 795 375 805 358" fill="none" />
      <path d="M830 400 Q 825 380 835 365" fill="none" />
    </g>
    <ellipse cx="800" cy="470" rx="90" ry="34" fill="white" opacity="0.9" />
    <path d="M712 470 a88 30 0 0 0 176 0" fill="none" stroke="white" stroke-width="8" opacity="0.9" />`;
}

async function buildCover(name: string, district: string, cfg: (typeof COVERS)[string]): Promise<Buffer> {
  const [c1, c2, c3] = cfg.gradient;
  const svg = `
    <svg width="1600" height="900" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" gradientTransform="rotate(${cfg.angle})">
          <stop offset="0%" stop-color="${c1}" />
          <stop offset="55%" stop-color="${c2}" />
          <stop offset="100%" stop-color="${c3}" />
        </linearGradient>
        <linearGradient id="overlay" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stop-color="#071a2c" stop-opacity="0.75" />
          <stop offset="45%" stop-color="#071a2c" stop-opacity="0" />
        </linearGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#bg)" />
      ${iconMarkup(cfg.icon)}
      <rect width="1600" height="900" fill="url(#overlay)" />
      <text x="240" y="780" font-family="sans-serif" font-weight="700" font-size="56" fill="white">${name}</text>
      <text x="240" y="826" font-family="sans-serif" font-weight="500" font-size="28" fill="#e7ddcb">${district} · LlamaEats</text>
    </svg>`;

  return sharp(Buffer.from(svg)).webp({ quality: 85 }).toBuffer();
}

const FORCE = process.argv.includes("--force");

async function main() {
  for (const [slug, cfg] of Object.entries(COVERS)) {
    const restaurant = await db.query.restaurants.findFirst({ where: eq(restaurants.slug, slug) });
    if (!restaurant) {
      console.log(`  (omitido) ${slug}: no existe en la base de datos`);
      continue;
    }
    if (restaurant.coverBlobUrl && !FORCE) {
      console.log(`  (omitido) ${restaurant.name}: ya tiene portada`);
      continue;
    }

    const buffer = await buildCover(restaurant.name, restaurant.district, cfg);
    const file = new File([new Uint8Array(buffer)], `${slug}-cover.webp`, { type: "image/webp" });
    const url = await uploadImage(file, `restaurants/${restaurant.id}/cover`);

    await db.update(restaurants).set({ coverBlobUrl: url }).where(eq(restaurants.id, restaurant.id));
    console.log(`  ✓ ${restaurant.name} -> ${url}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
