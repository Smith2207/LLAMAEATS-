import { WHATSAPP_DEFAULT_MESSAGE, WHATSAPP_NUMBER } from "@/lib/constants";
import { WhatsAppIcon } from "./whatsapp-icon";

export function WhatsAppButton() {
  if (!WHATSAPP_NUMBER) return null;

  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_DEFAULT_MESSAGE)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar soporte por WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
    >
      <WhatsAppIcon className="size-7" />
    </a>
  );
}
