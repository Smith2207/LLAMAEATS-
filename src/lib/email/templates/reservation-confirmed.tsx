import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Text,
} from "@react-email/components";

export function ReservationConfirmedEmail({
  restaurantName,
  date,
  timeSlot,
  guests,
  code,
  qrDataUrl,
}: {
  restaurantName: string;
  date: string;
  timeSlot: string;
  guests: number;
  code: string;
  qrDataUrl: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>Tu reserva en {restaurantName} está confirmada</Preview>
      <Body style={{ backgroundColor: "#071A2C", fontFamily: "sans-serif", padding: "32px 0" }}>
        <Container
          style={{
            backgroundColor: "#0E2A44",
            borderRadius: "16px",
            padding: "32px",
            maxWidth: "480px",
            color: "#F5EFE6",
            textAlign: "center" as const,
          }}
        >
          <Heading style={{ color: "#F5EFE6", fontSize: "22px" }}>¡Reserva confirmada!</Heading>
          <Text style={{ fontSize: "16px" }}>
            <strong>{restaurantName}</strong>
            <br />
            {date} · {timeSlot} · {guests} personas
          </Text>
          <Img src={qrDataUrl} alt="Código QR" width={200} height={200} style={{ margin: "16px auto" }} />
          <Text style={{ fontSize: "20px", letterSpacing: "2px", fontWeight: "bold" }}>{code}</Text>
          <Text style={{ color: "#9FB3C8", fontSize: "13px" }}>
            Muestra este código o el QR al llegar al restaurante.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
