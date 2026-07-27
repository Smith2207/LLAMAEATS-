import { Body, Button, Container, Head, Heading, Html, Preview, Text } from "@react-email/components";

export function WaitlistSlotAvailableEmail({
  restaurantName,
  date,
  timeSlot,
  guests,
  reserveUrl,
}: {
  restaurantName: string;
  date: string;
  timeSlot: string;
  guests: number;
  reserveUrl: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>Se liberó un cupo en {restaurantName}</Preview>
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
          <Heading style={{ color: "#F5EFE6", fontSize: "22px" }}>¡Se liberó un cupo!</Heading>
          <Text style={{ fontSize: "16px" }}>
            <strong>{restaurantName}</strong> tiene espacio para {guests}{" "}
            {guests === 1 ? "persona" : "personas"} el {date} a las {timeSlot}.
          </Text>
          <Text style={{ fontSize: "13px", color: "#9FB3C8" }}>
            Estabas en la lista de espera. Es por orden de llegada — puede que otra persona en la
            lista lo reserve primero, así que entra ahora si te sigue interesando.
          </Text>
          <Button
            href={reserveUrl}
            style={{
              backgroundColor: "#A83E22",
              color: "#ffffff",
              padding: "12px 24px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "bold",
              marginTop: "16px",
            }}
          >
            Reservar ahora
          </Button>
        </Container>
      </Body>
    </Html>
  );
}
