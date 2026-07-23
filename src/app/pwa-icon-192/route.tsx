import { ImageResponse } from "next/og";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#a83e22",
          fontFamily: "sans-serif",
        }}
      >
        <span style={{ fontSize: 108, fontWeight: 800, color: "#ffffff" }}>L</span>
      </div>
    ),
    { width: 192, height: 192 },
  );
}
