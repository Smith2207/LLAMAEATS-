import { ExternalLink } from "lucide-react";
import { googleMapsEmbedUrl, googleMapsUrl } from "@/lib/restaurants/location";

export function LocationMap({
  lat,
  lng,
  address,
  district,
}: {
  lat: number | null;
  lng: number | null;
  address: string | null;
  district: string;
}) {
  if (lat == null || lng == null) return null;

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-border/60">
      <iframe
        title="Ubicación en el mapa"
        src={googleMapsEmbedUrl(lat, lng)}
        className="h-64 w-full"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <a
        href={googleMapsUrl({ lat, lng, address, district })}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-1.5 border-t border-border/60 bg-secondary/40 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary/70"
      >
        Abrir en Google Maps
        <ExternalLink className="size-3.5" />
      </a>
    </div>
  );
}
