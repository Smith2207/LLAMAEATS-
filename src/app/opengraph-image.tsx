import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundImage:
            "radial-gradient(60% 50% at 50% 20%, rgba(95,168,211,0.35), transparent), radial-gradient(80% 60% at 80% 90%, rgba(193,80,46,0.28), transparent), linear-gradient(180deg, #071A2C 0%, #0E2A44 55%, #071A2C 100%)",
          padding: "80px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "10px 28px",
            borderRadius: 999,
            background: "rgba(245,239,230,0.1)",
            border: "1px solid rgba(245,239,230,0.25)",
            color: "#F5EFE6",
            fontSize: 28,
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          Campaña Tu Mesa Te Espera
        </div>
        <div
          style={{
            marginTop: 40,
            fontSize: 108,
            fontWeight: 800,
            color: "#F5EFE6",
            display: "flex",
          }}
        >
          LlamaEats
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 40,
            color: "#C1502E",
            fontWeight: 600,
            display: "flex",
            textAlign: "center",
          }}
        >
          Reserva tu mesa en Puno en minutos
        </div>
      </div>
    ),
    { ...size },
  );
}
