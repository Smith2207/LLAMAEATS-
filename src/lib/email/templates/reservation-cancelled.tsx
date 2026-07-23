import { Body, Container, Head, Heading, Html, Preview, Text } from "@react-email/components";

export function ReservationCancelledEmail({
  restaurantName,
  date,
  timeSlot,
  code,
  refunded,
}: {
  restaurantName: string;
  date: string;
  timeSlot: string;
  code: string;
  refunded: boolean;
}) {
  return (
    <Html>
      <Head />
      <Preview>Tu reserva {code} fue cancelada</Preview>
      <Body style={{ backgroundColor: "#071A2C", fontFamily: "sans-serif", padding: "32px 0" }}>
        <Container
          style={{
            backgroundColor: "#0E2A44",
            borderRadius: "16px",
            padding: "32px",
            maxWidth: "480px",
            color: "#F5EFE6",
          }}
        >
          <Heading style={{ color: "#F5EFE6", fontSize: "22px" }}>Reserva cancelada</Heading>
          <Text style={{ fontSize: "16px" }}>
            Tu reserva <strong>{code}</strong> en <strong>{restaurantName}</strong> ({date} ·{" "}
            {timeSlot}) fue cancelada.
          </Text>
          <Text style={{ fontSize: "14px", color: "#9FB3C8" }}>
            {refunded
              ? "Se procesó el reembolso total de la tarifa de servicio."
              : "Según la política de cancelación, esta reserva no calificó para reembolso."}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
