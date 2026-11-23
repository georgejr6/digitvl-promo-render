import React from "react";

/** Clean product mockups drawn as SVG (flat, soft-shaded). NOT 3D renders. The logo shown is a made-up EXAMPLE brand ("STATIC HALO"). */
export type Kind = "tee" | "hoodie" | "mug" | "tote" | "cap" | "poster";
export const RED = "#EF4444";

export const ExLogo: React.FC<{ w: number; ink?: string; accent?: string; stack?: boolean }> = ({ w, ink = "#fff", accent = RED, stack = true }) => {
  const h = stack ? w * 1.1 : w * 0.5;
  return (
    <svg width={w} height={h} viewBox={stack ? "0 0 200 220" : "0 0 200 100"} style={{ overflow: "visible" }}>
      {stack ? (
        <>
          <circle cx="100" cy="74" r="56" fill="none" stroke={accent} strokeWidth="13" />
          <circle cx="100" cy="74" r="30" fill="none" stroke={ink} strokeWidth="7" />
          <circle cx="156" cy="74" r="8" fill={ink} />
          <text x="100" y="178" textAnchor="middle" fontFamily="'DV Anton', Impact, sans-serif" fontSize="44" fill={ink} letterSpacing="3">STATIC HALO</text>
          <rect x="52" y="192" width="96" height="5" fill={accent} />
        </>
      ) : (
        <>
          <circle cx="40" cy="50" r="28" fill="none" stroke={accent} strokeWidth="9" />
          <circle cx="40" cy="50" r="14" fill="none" stroke={ink} strokeWidth="5" />
          <text x="82" y="64" fontFamily="'DV Anton', Impact, sans-serif" fontSize="34" fill={ink} letterSpacing="2">STATIC HALO</text>
        </>
      )}
    </svg>
  );
};

const Shade: React.FC<{ id: string }> = ({ id }) => (
  <defs>
    <linearGradient id={`${id}-sh`} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#fff" stopOpacity="0.16" />
      <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
      <stop offset="1" stopColor="#000" stopOpacity="0.28" />
    </linearGradient>
    <filter id={`${id}-blur`}><feGaussianBlur stdDeviation="9" /></filter>
  </defs>
);

type Props = { size?: number; color?: string; logoOpacity?: number; logoScale?: number; id?: string };

const Wrap: React.FC<{ size: number; id: string; children: React.ReactNode; logo: React.ReactNode }> = ({ size, id, children, logo }) => (
  <svg width={size} height={size} viewBox="0 0 400 400" style={{ overflow: "visible" }}>
    <Shade id={id} />
    <ellipse cx="200" cy="378" rx="125" ry="12" fill="#000" opacity="0.55" filter={`url(#${id}-blur)`} />
    {children}
    {logo}
  </svg>
);

const Print: React.FC<{ x: number; y: number; w: number; o: number; ink?: string; stack?: boolean }> = ({ x, y, w, o, ink, stack }) => (
  <g transform={`translate(${x - w / 2} ${y})`} opacity={o}>
    <ExLogo w={w} ink={ink} stack={stack} />
  </g>
);

export const Product: React.FC<{ kind: Kind } & Props> = ({ kind, size = 400, color, logoOpacity = 1, logoScale = 1, id }) => {
  const k = id ?? `p-${kind}`;
  const dark = (c?: string) => c ?? "#17191d";
  if (kind === "tee") {
    const c = dark(color);
    return (
      <Wrap size={size} id={k} logo={<Print x={200} y={118} w={104 * logoScale} o={logoOpacity} />}>
        <path d="M122 54 L160 44 Q200 82 240 44 L278 54 L362 108 L326 166 L292 142 L292 348 Q292 360 280 360 L120 360 Q108 360 108 348 L108 142 L74 166 L38 108 Z" fill={c} />
        <path d="M122 54 L160 44 Q200 82 240 44 L278 54 L362 108 L326 166 L292 142 L292 348 Q292 360 280 360 L120 360 Q108 360 108 348 L108 142 L74 166 L38 108 Z" fill={`url(#${k}-sh)`} />
        <path d="M160 44 Q200 96 240 44 Q200 70 160 44Z" fill="#0b0c0e" />
        <path d="M108 142 Q150 150 160 112 M292 142 Q250 150 240 112" stroke="#000" strokeOpacity="0.25" strokeWidth="3" fill="none" />
      </Wrap>
    );
  }
  if (kind === "hoodie") {
    const c = dark(color);
    return (
      <Wrap size={size} id={k} logo={<Print x={200} y={150} w={92 * logoScale} o={logoOpacity} />}>
        <path d="M132 70 Q146 18 200 14 Q254 18 268 70 Q262 112 232 126 Q200 138 168 126 Q138 112 132 70Z" fill="#0d0e11" />
        <path d="M128 100 Q200 142 272 100 L336 134 L372 306 L330 318 L302 196 L302 350 Q302 362 290 362 L110 362 Q98 362 98 350 L98 196 L70 318 L28 306 L64 134Z" fill={c} />
        <path d="M128 100 Q200 142 272 100 L336 134 L372 306 L330 318 L302 196 L302 350 Q302 362 290 362 L110 362 Q98 362 98 350 L98 196 L70 318 L28 306 L64 134Z" fill={`url(#${k}-sh)`} />
        <path d="M150 112 Q200 150 250 112 Q250 84 200 76 Q150 84 150 112Z" fill="#0b0c0e" />
        <path d="M178 128 L174 196 M222 128 L226 196" stroke="#cfd2d6" strokeWidth="5" strokeLinecap="round" />
        <path d="M128 262 L272 262 L288 334 L112 334Z" fill="#000" fillOpacity="0.22" />
        <path d="M128 262 L272 262" stroke="#000" strokeOpacity="0.4" strokeWidth="3" />
      </Wrap>
    );
  }
  if (kind === "mug") {
    const c = color ?? "#f4f4f2";
    return (
      <Wrap size={size} id={k} logo={<Print x={196} y={150} w={88 * logoScale} o={logoOpacity} ink="#111" />}>
        <path d="M290 160 Q352 158 352 214 Q352 270 290 268" stroke={c} strokeWidth="24" fill="none" />
        <path d="M290 160 Q352 158 352 214 Q352 270 290 268" stroke="#000" strokeOpacity="0.12" strokeWidth="24" fill="none" />
        <path d="M106 112 L106 330 Q106 362 140 362 L252 362 Q286 362 286 330 L286 112Z" fill={c} />
        <path d="M106 112 L106 330 Q106 362 140 362 L252 362 Q286 362 286 330 L286 112Z" fill={`url(#${k}-sh)`} />
        <ellipse cx="196" cy="112" rx="90" ry="22" fill="#e3e3e0" />
        <ellipse cx="196" cy="114" rx="80" ry="16" fill="#2a2a2c" />
      </Wrap>
    );
  }
  if (kind === "tote") {
    const c = color ?? "#16181b";
    return (
      <Wrap size={size} id={k} logo={<Print x={200} y={196} w={110 * logoScale} o={logoOpacity} />}>
        <path d="M138 150 C138 34 262 34 262 150" stroke="#2b2e33" strokeWidth="15" fill="none" />
        <path d="M82 138 L318 138 L334 356 Q334 366 324 366 L76 366 Q66 366 66 356Z" fill={c} />
        <path d="M82 138 L318 138 L334 356 Q334 366 324 366 L76 366 Q66 366 66 356Z" fill={`url(#${k}-sh)`} />
        <path d="M82 138 L318 138" stroke="#000" strokeOpacity="0.5" strokeWidth="4" />
      </Wrap>
    );
  }
  if (kind === "cap") {
    const c = dark(color);
    return (
      <Wrap size={size} id={k} logo={<Print x={200} y={150} w={64 * logoScale} o={logoOpacity} stack={false} />}>
        <path d="M78 246 Q78 96 200 92 Q322 96 322 246 Q200 226 78 246Z" fill={c} />
        <path d="M78 246 Q78 96 200 92 Q322 96 322 246 Q200 226 78 246Z" fill={`url(#${k}-sh)`} />
        <path d="M70 246 Q200 222 330 246 Q392 286 232 322 Q70 322 70 246Z" fill="#0c0d0f" />
        <circle cx="200" cy="92" r="9" fill="#2b2e33" />
        <path d="M200 96 L200 232" stroke="#000" strokeOpacity="0.25" strokeWidth="2" />
      </Wrap>
    );
  }
  // poster
  return (
    <Wrap size={size} id={k} logo={<Print x={200} y={118} w={150 * logoScale} o={logoOpacity} />}>
      <rect x="82" y="40" width="236" height="320" rx="6" fill="#0d0e10" stroke="#e7e7e7" strokeWidth="10" />
      <rect x="96" y="54" width="208" height="292" fill="#171a20" />
      <rect x="96" y="54" width="208" height="292" fill={`url(#${k}-sh)`} />
      <rect x="96" y="54" width="208" height="292" fill="none" stroke={RED} strokeOpacity="0.5" strokeWidth="2" />
    </Wrap>
  );
};

export const LABEL: Record<Kind, string> = { tee: "T-shirt", hoodie: "Hoodie", mug: "Mug", tote: "Tote bag", cap: "Dad hat", poster: "Poster" };

export const Icon: React.FC<{ k: string; s?: number; c?: string }> = ({ k, s = 64, c = "#fff" }) => {
  const p = { fill: "none", stroke: c, strokeWidth: 4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg width={s} height={s} viewBox="0 0 48 48">
      {k === "cart" && <><path {...p} d="M5 8h6l4 22h22l4-16H13" /><circle cx="19" cy="39" r="3" fill={c} /><circle cx="34" cy="39" r="3" fill={c} /></>}
      {k === "print" && <><rect {...p} x="10" y="6" width="28" height="12" /><rect {...p} x="6" y="18" width="36" height="16" rx="3" /><rect {...p} x="14" y="28" width="20" height="14" /></>}
      {k === "box" && <><path {...p} d="M6 15 24 6l18 9v18L24 42 6 33Z" /><path {...p} d="M6 15 24 24l18-9M24 24v18" /></>}
      {k === "chat" && <><path {...p} d="M7 9h34v24H20l-9 8v-8H7Z" /><path {...p} d="M15 18h18M15 25h11" /></>}
      {k === "ai" && <><path {...p} d="M24 5l4 13 13 4-13 4-4 13-4-13-13-4 13-4Z" /><path {...p} d="M38 6v8M34 10h8" /></>}
      {k === "globe" && <><circle {...p} cx="24" cy="24" r="18" /><path {...p} d="M6 24h36M24 6c-9 9-9 27 0 36M24 6c9 9 9 27 0 36" /></>}
      {k === "check" && <path {...p} d="M8 25l10 10L40 12" />}
    </svg>
  );
};
