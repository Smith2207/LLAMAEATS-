import sharp from "sharp";

const TARGET_WIDTH = 1600;
const TARGET_HEIGHT = 900; // 16:9, misma proporción que las tarjetas de portada y galería

export async function normalizeRestaurantPhoto(file: File): Promise<File> {
  const buffer = Buffer.from(await file.arrayBuffer());

  const output = await sharp(buffer)
    .rotate() // corrige orientación según EXIF antes de recortar
    .resize(TARGET_WIDTH, TARGET_HEIGHT, { fit: "cover", position: sharp.strategy.attention })
    .normalize() // estira contraste/balance de blancos automáticamente
    .sharpen({ sigma: 0.6 })
    .webp({ quality: 82 })
    .toBuffer();

  const filename = file.name.replace(/\.[^.]+$/, "") + ".webp";
  return new File([new Uint8Array(output)], filename, { type: "image/webp" });
}
