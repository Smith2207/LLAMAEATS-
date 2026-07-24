import { Body, Container, Head, Heading, Html, Preview, Text } from "@react-email/components";

export function NewReservationNotificationEmail({
  restaurantName,
  customerName,
  customerPhone,
  date,
  timeSlot,
  guests,
  code,
  appUrl,
}: {
  restaurantName: string;
  customerName: string;
  customerPhone: string | null;
  date: string;
  timeSlot: string;
  guests: number;
  code: string;
  appUrl: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>Nueva reserva confirmada — {code}</Preview>
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
          <Heading style={{ color: "#F5EFE6", fontSize: "22px" }}>Nueva reserva confirmada</Heading>
          <Text style={{ fontSize: "16px" }}>
            <strong>{restaurantName}</strong> tiene una mesa reservada para {date} a las {timeSlot} ·{" "}
            {guests} personas.
          </Text>
          <Text style={{ fontSize: "14px", color: "#9FB3C8" }}>
            Comensal: <strong style={{ color: "#F5EFE6" }}>{customerName}</strong>
            {customerPhone && <> · {customerPhone}</>}
            <br />
            Código de reserva: <strong style={{ color: "#F5EFE6" }}>{code}</strong>
          </Text>
          <Text style={{ fontSize: "13px", color: "#9FB3C8" }}>
            Revisa la agenda del día en {appUrl}/restaurante/reservas
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
