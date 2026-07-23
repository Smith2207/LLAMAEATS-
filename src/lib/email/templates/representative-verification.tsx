import { Body, Container, Head, Heading, Html, Preview, Text } from "@react-email/components";

export function RepresentativeVerificationEmail({
  restaurantName,
  code,
}: {
  restaurantName: string;
  code: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>Tu código de verificación: {code}</Preview>
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
          <Heading style={{ color: "#F5EFE6", fontSize: "22px" }}>Verifica tu correo</Heading>
          <Text style={{ fontSize: "16px" }}>
            Para confirmar que eres el representante de <strong>{restaurantName}</strong> en
            LlamaEats, ingresa este código:
          </Text>
          <Text
            style={{
              fontSize: "32px",
              fontWeight: 700,
              letterSpacing: "8px",
              textAlign: "center",
              color: "#C1502E",
              margin: "24px 0",
            }}
          >
            {code}
          </Text>
          <Text style={{ fontSize: "14px", color: "#9FB3C8" }}>
            Este código vence en 10 minutos. Si no solicitaste esto, ignora este correo.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
