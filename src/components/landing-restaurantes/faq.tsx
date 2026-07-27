import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ_ITEMS = [
  {
    question: "¿Cómo gana dinero LlamaEats?",
    answer:
      "Solo cobramos una tarifa de servicio al comensal (S/3–5 según categoría) por asegurar la mesa. Nunca procesamos ni tocamos el pago de la cuenta — eso se sigue pagando en tu local, como siempre.",
  },
  {
    question: "¿Necesito una pasarela de pago propia?",
    answer:
      "No. Lo único que se paga dentro de la plataforma es la tarifa de servicio del comensal. Tu forma de cobrar la cuenta en el local no cambia en nada.",
  },
  {
    question: "¿Qué documentos necesito para darme de alta?",
    answer: "Licencia municipal y certificado sanitario vigentes, para verificar que eres un local real.",
  },
  {
    question: "¿Cuánto tarda la aprobación?",
    answer:
      "El equipo de LlamaEats revisa tu alta manualmente. Empiezas en un período de prueba con un límite de reservas simultáneas, y pasas a estar activo sin tope una vez que se confirma que todo funciona bien.",
  },
  {
    question: "¿Puedo seguir tomando reservas por teléfono?",
    answer:
      "Sí. Desde tu panel puedes anotar una reserva de mostrador o telefónica directamente — queda en la misma agenda que las reservas hechas por la plataforma, sin choques de horario.",
  },
  {
    question: "¿Qué pasa si se cae la conexión de mi local?",
    answer:
      "La agenda del día sigue visible y puedes marcar llegada, no-shows o liberar una mesa sin conexión — se sincroniza solo al reconectar. Crear una reserva nueva sí necesita conexión, para no arriesgar una doble reserva.",
  },
];

export function FaqRestaurantes() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <h2 className="text-center font-display text-2xl font-bold text-foreground sm:text-3xl">
        Preguntas frecuentes
      </h2>
      <Accordion type="single" collapsible className="mt-8">
        {FAQ_ITEMS.map((item) => (
          <AccordionItem key={item.question} value={item.question}>
            <AccordionTrigger className="text-left font-medium text-foreground">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
