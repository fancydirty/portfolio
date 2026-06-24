import type { ReactElement } from "react";

/**
 * The portfolio's dark editorial OG card (1200×630). Built with the inline-style
 * flexbox subset `next/og`/satori supports — no Tailwind, no CSS variables; the
 * artifact has fixed brand colors regardless of viewer theme. `eyebrow` is a
 * small mono kicker, `title` the headline, `subtitle` one supporting line.
 */
export function ogCard({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}): ReactElement {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#161109",
        padding: "72px 80px",
        fontFamily: "Geist",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ width: 56, height: 5, background: "#e0a878", marginBottom: 40 }} />
        <div
          style={{
            display: "flex",
            fontFamily: "Geist Mono",
            fontSize: 22,
            letterSpacing: 4,
            color: "#7d7060",
            marginBottom: 24,
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            display: "flex",
            fontWeight: 900,
            fontSize: 84,
            color: "#f1e7d8",
            lineHeight: 1.05,
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            fontWeight: 500,
            fontSize: 34,
            color: "#cdbfad",
            marginTop: 28,
            maxWidth: 900,
            lineHeight: 1.3,
          }}
        >
          {subtitle}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1px solid #2c2318",
          paddingTop: 28,
          fontFamily: "Geist Mono",
          fontSize: 24,
        }}
      >
        <div style={{ display: "flex", color: "#e0a878", letterSpacing: 1 }}>
          portfolio.dirtyfancy.sbs
        </div>
        <div style={{ display: "flex", color: "#7d7060", letterSpacing: 1 }}>
          Zhou Le
        </div>
      </div>
    </div>
  );
}
