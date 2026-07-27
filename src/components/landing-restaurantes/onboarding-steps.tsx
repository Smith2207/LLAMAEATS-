import { RevealItem } from "@/components/animations/reveal-item";

const STEPS = [
  {
    title: "Regístrate con Google",
    description: "Inicia sesión y elige que eres un restaurante. Sin formularios largos ni contraseñas.",
  },
  {
    title: "Completa el perfil de tu local",
    description: "Datos, horario, tus mesas por zona y fotos. Lo controlas tú desde tu panel en cualquier momento.",
  },
  {
    title: "Sube tu licencia y certificado sanitario",
    description: "Licencia municipal y certificado sanitario vigentes — así verificamos que eres un local real.",
  },
  {
    title: "Revisión y período de prueba",
    description: "El equipo de LlamaEats revisa tu alta. Empiezas con un período de prueba con reservas limitadas antes de quedar activo sin tope.",
  },
];

export function OnboardingSteps() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-16">
      <h2 className="text-center font-display text-2xl font-bold text-foreground sm:text-3xl">
        Cómo es darte de alta
      </h2>
      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {STEPS.map((step, i) => (
          <RevealItem
            key={step.title}
            index={i}
            className="rounded-2xl border border-border/60 bg-card p-6"
          >
            <span className="font-display text-sm font-bold text-terracota-400">0{i + 1}</span>
            <h3 className="mt-2 font-display font-semibold text-foreground">{step.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
          </RevealItem>
        ))}
      </div>
    </section>
  );
}
