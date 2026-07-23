import type { Metadata } from "next";
import { Manrope, Sora } from "next/font/google";
import { MotionConfig } from "framer-motion";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { PageTransition } from "@/components/animations/page-transition";
import "./globals.css";

const sora = Sora({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const manrope = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const title = "LlamaEats — Reserva tu mesa en Puno";
const description =
  "¿Cansado de hacer fila para comer en Puno? LlamaEats te asegura tu mesa en minutos.";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: title,
    template: "%s — LlamaEats",
  },
  description,
  openGraph: {
    title,
    description,
    url: appUrl,
    siteName: "LlamaEats",
    locale: "es_PE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${sora.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-body">
        <MotionConfig reducedMotion="user">
          <TooltipProvider>
            <PageTransition>{children}</PageTransition>
            <WhatsAppButton />
            <Toaster richColors position="top-center" />
          </TooltipProvider>
        </MotionConfig>
      </body>
    </html>
  );
}
