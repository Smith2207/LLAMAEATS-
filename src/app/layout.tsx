import type { Metadata } from "next";
import { Manrope, Sora } from "next/font/google";
import { MotionConfig } from "framer-motion";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
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

export const metadata: Metadata = {
  title: "LlamaEats — Reserva tu mesa en Puno",
  description:
    "¿Cansado de hacer fila para comer en Puno? LlamaEats te asegura tu mesa en minutos.",
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
            {children}
            <WhatsAppButton />
            <Toaster richColors position="top-center" />
          </TooltipProvider>
        </MotionConfig>
      </body>
    </html>
  );
}
