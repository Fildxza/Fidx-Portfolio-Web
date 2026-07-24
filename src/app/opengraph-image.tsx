import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/constants";

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
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "80px",
          background: "linear-gradient(135deg, #0a0a0a 0%, #111827 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 22,
            color: "#818cf8",
            fontWeight: 600,
            letterSpacing: 2,
            textTransform: "uppercase",
            display: "flex",
          }}
        >
          Portfolio
        </div>
        <div style={{ fontSize: 72, fontWeight: 700, marginTop: 20, display: "flex" }}>
          {siteConfig.name}
        </div>
        <div style={{ fontSize: 32, color: "#a1a1aa", marginTop: 24, display: "flex" }}>
          IT Support · Computer Forensics · Cybersecurity
        </div>
      </div>
    ),
    { ...size }
  );
}
