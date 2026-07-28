// El dueño no tiene un mapa interactivo para marcar su local (no hay API
// key de Google Maps configurada) — en su lugar pega coordenadas "lat, lng"
// o el link de Google Maps de su ubicación, y las extraemos de ahí.
const LOCATION_PATTERNS = [
  /[?&]q=(-?\d{1,3}(?:\.\d+)?),\s*(-?\d{1,3}(?:\.\d+)?)/,
  /@(-?\d{1,3}(?:\.\d+)?),(-?\d{1,3}(?:\.\d+)?)/,
  /^(-?\d{1,3}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)$/,
];

export function parseLocationInput(value: string): { lat: number; lng: number } | null {
  for (const pattern of LOCATION_PATTERNS) {
    const match = value.match(pattern);
    if (!match) continue;
    const lat = Number(match[1]);
    const lng = Number(match[2]);
    if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) return { lat, lng };
  }
  return null;
}

type LocationInput = {
  lat: number | null;
  lng: number | null;
  address: string | null;
  district: string;
};

/** Link a Google Maps: coordenadas exactas si existen, si no busca por dirección/distrito. */
export function googleMapsUrl({ lat, lng, address, district }: LocationInput): string {
  if (lat != null && lng != null) {
    return `https://www.google.com/maps?q=${lat},${lng}`;
  }
  const query = encodeURIComponent(`${address ? `${address}, ` : ""}${district}, Puno, Perú`);
  return `https://www.google.com/maps?q=${query}`;
}

/** Iframe embebible sin API key (a diferencia de la Maps Embed API oficial). */
export function googleMapsEmbedUrl(lat: number, lng: number): string {
  return `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
}
