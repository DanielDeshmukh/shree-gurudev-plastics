import { ImageResponse } from "next/og";

export const runtime = "edge";

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ fontSize: 64, background: "linear-gradient(135deg, #f97316, #ea580c)", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontFamily: "sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 72, fontWeight: "bold" }}>Shree Gurudev</div>
          <div style={{ fontSize: 72, fontWeight: "bold" }}>Plastics</div>
          <div style={{ fontSize: 28, marginTop: 20, opacity: 0.9 }}>Premium Plastic Products for Every Need</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
