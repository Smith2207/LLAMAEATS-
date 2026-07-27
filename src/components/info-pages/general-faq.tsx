import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ_ITEMS = [
  {
    question: "¿Cómo reservo una mesa?",
    answer:
      "Busca el restaurante, elige fecha, hora y número de personas, selecciona tu mesa en el plano y paga la tarifa de servicio. Recibes un código y un QR para mostrar al llegar.",
  },
  {
    question: "¿Cuánto cuesta reservar?",
    answer:
      "Solo pagas una tarifa de servicio de S/3 a S/5 según el tipo de restaurante, para asegurar tu mesa. El precio de tu comida se paga en el local, como siempre — LlamaEats no cobra comisión sobre tu consumo.",
  },
  {
    question: "¿Tengo un plazo para pagar la tarifa?",
    answer:
      "Sí, 10 minutos desde que creas la reserva. Si no completas el pago en ese tiempo, la mesa se libera automáticamente para otra persona.",
  },
  {
    question: "¿Qué pasa si cancelo mi reserva?",
    answer:
      "Si cancelas con más de 2 horas de anticipación, recibes el reembolso completo de la tarifa de servicio. Con menos de 2 horas, la tarifa no se reembolsa.",
  },
  {
    question: "¿Qué pasa si no llego a la reserva?",
    answer:
      "El restaurante puede marcar la reserva como no-asistencia pasados 15 minutos de tolerancia desde la hora reservada.",
  },
  {
    question: "¿Puedo reprogramar mi reserva?",
    answer: "Sí, hasta 2 veces por reserva, siempre con más de 2 horas de anticipación al horario original.",
  },
  {
    question: "¿Con cuánta anticipación puedo reservar?",
    answer: "Desde 15 minutos hasta 60 días antes de la fecha que quieras.",
  },
  {
    question: "¿Qué pasa si el horario que quiero está lleno?",
    answer:
      "Puedes anotarte en la lista de espera de ese restaurante, fecha y hora. Si se libera un cupo, te avisamos por email para que reserves.",
  },
  {
    question: "¿Cómo verifican a los restaurantes?",
    answer:
      "Cada restaurante sube su licencia municipal y certificado sanitario vigentes, y pasa por una revisión del equipo de LlamaEats antes de aparecer en la plataforma.",
  },
];

export function GeneralFaq() {
  return (
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
  );
}
