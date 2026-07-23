import Image from "next/image";
import { Download } from "lucide-react";

export function QrCodeCard({ code, qrDataUrl }: { code: string; qrDataUrl: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-border/60 bg-card p-5 text-center">
      <Image src={qrDataUrl} alt={`Código QR de la reserva ${code}`} width={200} height={200} unoptimized />
      <p className="font-display text-xl font-bold tracking-widest text-foreground">{code}</p>
      <p className="text-xs text-muted-foreground">
        Muestra este código o el QR al llegar al restaurante.
      </p>
      <a
        href={qrDataUrl}
        download={`llamaeats-${code}.png`}
        className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/50"
      >
        <Download className="size-4" />
        Descargar QR
      </a>
    </div>
  );
}
