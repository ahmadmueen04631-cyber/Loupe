import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", background: "#0c0e13", color: "#eceef3",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ width: 84, height: 84, borderRadius: 9999, border: "7px solid #eceef3", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "#8592ff" }} />
          </div>
          <div style={{ fontSize: 88, fontWeight: 700, letterSpacing: -3, display: "flex" }}>PicFix</div>
        </div>
        <div style={{ marginTop: 28, fontSize: 34, color: "#9aa2b1", display: "flex" }}>Fast, simple image tools for everyone.</div>
      </div>
    ),
    { ...size }
  );
}
