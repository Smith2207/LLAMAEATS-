import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from "@react-email/components";

export function MagicLinkEmail({ url }: { url: string }) {
  return (
    <Html>
      <Head />
      <Preview>Tu enlace para iniciar sesión en LlamaEats</Preview>
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
          <Heading style={{ color: "#F5EFE6", fontSize: "22px" }}>LlamaEats</Heading>
          <Text style={{ color: "#F5EFE6", fontSize: "16px" }}>
            Haz clic en el botón para iniciar sesión. Este enlace expira en 24 horas y
            solo puede usarse una vez.
          </Text>
          <Button
            href={url}
            style={{
              backgroundColor: "#C1502E",
              color: "#F5EFE6",
              padding: "12px 24px",
              borderRadius: "8px",
              fontWeight: "bold",
              textDecoration: "none",
              display: "inline-block",
              marginTop: "16px",
            }}
          >
            Iniciar sesión
          </Button>
          <Text style={{ color: "#9FB3C8", fontSize: "13px", marginTop: "24px" }}>
            Si no solicitaste este correo, puedes ignorarlo.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
