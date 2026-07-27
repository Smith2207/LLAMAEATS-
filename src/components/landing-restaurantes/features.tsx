import {
  Inbox,
  PhoneCall,
  LayoutGrid,
  WifiOff,
  UserCheck,
  BellRing,
  DoorClosed,
  BarChart3,
  ShieldCheck,
} from "lucide-react";

const FEATURES = [
  {
    icon: Inbox,
    title: "Bandeja del día en vivo",
    description: "Todas las reservas confirmadas de hoy, actualizándose solas, sin recargar nada.",
  },
  {
    icon: PhoneCall,
    title: "Reservas por teléfono, en el sistema",
    description: "Anota una reserva de mostrador o telefónica directo en tu panel — queda en la misma agenda.",
  },
  {
    icon: LayoutGrid,
    title: "Agenda visual con arrastre",
    description: "Mueve una reserva a otra mesa u horario arrastrándola, sin perder el control de choques.",
  },
  {
    icon: WifiOff,
    title: "Sigue funcionando sin internet",
    description: "Si se cae la conexión del local, tu agenda del día no desaparece y sincroniza al reconectar.",
  },
  {
    icon: UserCheck,
    title: "Ficha del comensal",
    description: "Historial de visitas, no-shows y notas internas por cliente — sin apuntar nada en papel.",
  },
  {
    icon: BellRing,
    title: "Aviso instantáneo de cada reserva",
    description: "Un correo apenas se confirma una reserva nueva, con nombre, teléfono y horario.",
  },
  {
    icon: DoorClosed,
    title: "Cierre rápido del día",
    description: "Marca el local cerrado por un evento privado o imprevisto en un clic, sin tocar mesa por mesa.",
  },
  {
    icon: BarChart3,
    title: "Métricas de ocupación",
    description: "Cuántas reservas, cancelaciones y no-shows tuviste, por semana y por horario.",
  },
  {
    icon: ShieldCheck,
    title: "Nunca tocamos tu dinero",
    description: "Solo cobramos una tarifa de servicio al comensal (S/3–5). La cuenta se paga en tu local, como siempre.",
  },
];

export function FeaturesRestaurantes() {
  return (
    <section id="como-funciona" className="mx-auto max-w-5xl px-4 py-16">
      <h2 className="text-center font-display text-2xl font-bold text-foreground sm:text-3xl">
        Todo lo que necesitas para tu agenda, en un solo panel
      </h2>
      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <div key={feature.title} className="rounded-2xl border border-border/60 bg-card p-6">
            <feature.icon className="size-7 text-terracota-400" />
            <h3 className="mt-4 font-display font-semibold text-foreground">{feature.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
