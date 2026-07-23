import { Body, Container, Head, Heading, Html, Preview, Text } from "@react-email/components";

export function DocumentExpiryWarningEmail({
  restaurantName,
  documents,
}: {
  restaurantName: string;
  documents: { label: string; expiresAt: string }[];
}) {
  return (
    <Html>
      <Head />
      <Preview>Documentos de {restaurantName} por vencer</Preview>
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
          <Heading style={{ color: "#F5EFE6", fontSize: "22px" }}>
            Documentos por vencer — {restaurantName}
          </Heading>
          <Text style={{ fontSize: "16px" }}>
            Actualiza estos documentos desde tu perfil de restaurante antes de que venzan, o tu
            local se suspenderá automáticamente y dejará de recibir reservas:
          </Text>
          {documents.map((d) => (
            <Text key={d.label} style={{ fontSize: "14px", color: "#9FB3C8" }}>
              • {d.label}: vence el {d.expiresAt}
            </Text>
          ))}
        </Container>
      </Body>
    </Html>
  );
}
