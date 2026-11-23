import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, delayRender, continueRender } from "remotion";
import { ExLogo, Icon, Kind, LABEL, Product, RED } from "./art";

export const FPS = 30;
const BG = "#050505", WHITE = "#FFFFFF", DIM = "#A3A3A3", CARD = "rgba(255,255,255,0.06)", LINE = "rgba(255,255,255,0.15)";
const DISPLAY = "'DV Anton', Impact, sans-serif", SANS = "'DV Inter', Arial, sans-serif", BRAND = "'DV Brand', 'DV Inter', Arial, sans-serif";
const VIS_TOP = 300, VIS_H = 1010, CAP_Y = 1345;

type Word = [string, number, number];
type Sent = { text: string; scene: string; start: number; end: number; words: Word[] };
type Scene = { type: string; [k: string]: any };
export type Doc = { id: string; music: string; musicStart: number; scenes: Record<string, Scene>; sentences: Sent[]; voice: string; voiceEnd: number; totalFrames: number };
export type PromoProps = { ep: string; doc: Doc | null };

const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const eo = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
const useFonts = () => {
  const [h] = React.useState(() => delayRender("fonts"));
  React.useEffect(() => {
    const defs = [
      new FontFace("DV Anton", `url(${staticFile("fonts/Anton-Regular.ttf")})`),
      new FontFace("DV Inter", `url(${staticFile("fonts/Inter.ttf")})`, { weight: "100 900" }),
      new FontFace("DV Brand", `url(${staticFile("fonts/Montserrat-VF.ttf")})`, { weight: "100 900" }),
    ];
    Promise.all(defs.map((d) => d.load())).then((l) => { l.forEach((f) => document.fonts.add(f)); continueRender(h); }).catch(() => continueRender(h));
  }, [h]);
};

const Glass: React.FC<{ style?: React.CSSProperties; children?: React.ReactNode }> = ({ style, children }) => (
  <div style={{ background: CARD, border: `2px solid ${LINE}`, borderRadius: 28, boxShadow: "0 18px 60px rgba(0,0,0,0.5)", ...style }}>{children}</div>
);

type SceneCtx = { f: number; dur: number; spec: Scene; sFrames: number[] }; // f local frame, sFrames = local start frame of each sentence in this scene

/** reveal time (local frame) of item i of n: sentence starts when counts match, else evenly spread */
const revealAt = (c: SceneCtx, i: number, n: number) => (c.sFrames.length === n ? c.sFrames[i] : Math.round(c.dur * (0.06 + (0.7 * i) / Math.max(1, n))));

// ---------------------------------------------------------------- scenes
const Hook: React.FC<SceneCtx> = ({ f, spec }) => {
  const lines: string[] = spec.lines;
  const maxLen = Math.max(...lines.map((l) => l.length));
  const size = Math.min(180, 940 / (maxLen * 0.5));
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
      {lines.map((l, i) => {
        const e = eo((f - i * 4) / 7);
        const last = i === lines.length - 1;
        return (
          <div key={i} style={{ fontFamily: DISPLAY, fontSize: size, lineHeight: 1.04, textTransform: "uppercase", color: last ? RED : WHITE, textAlign: "center",
            opacity: i === 0 ? Math.max(0.85, e) : e, transform: `translateY(${(1 - e) * 36}px) scale(${0.86 + 0.14 * e})`, textShadow: "0 8px 40px rgba(0,0,0,0.7)", whiteSpace: "nowrap" }}>{l}</div>
        );
      })}
      <div style={{ marginTop: 44, width: 160 * eo((f - 14) / 12), height: 10, background: RED, borderRadius: 5 }} />
    </AbsoluteFill>
  );
};

const Steps: React.FC<SceneCtx> = (c) => {
  const steps: { t: string; s: string }[] = c.spec.steps;
  return (
    <AbsoluteFill style={{ justifyContent: "center", padding: "0 60px", gap: 34 }}>
      {steps.map((s, i) => {
        const at = revealAt(c, i, steps.length);
        const e = eo((c.f - at) / 10);
        const active = c.f >= at && (i === steps.length - 1 || c.f < revealAt(c, i + 1, steps.length));
        return (
          <Glass key={i} style={{ display: "flex", alignItems: "center", gap: 32, padding: "34px 40px", opacity: e * (active ? 1 : 0.62), transform: `translateX(${(1 - e) * 120}px) scale(${active ? 1.02 : 1})`, borderColor: active ? RED : LINE }}>
            <div style={{ width: 96, height: 96, borderRadius: 48, background: RED, color: WHITE, fontFamily: DISPLAY, fontSize: 60, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</div>
            <div>
              <div style={{ fontFamily: DISPLAY, fontSize: 68, textTransform: "uppercase", color: WHITE, lineHeight: 1.05 }}>{s.t}</div>
              <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 36, color: DIM, marginTop: 6 }}>{s.s}</div>
            </div>
          </Glass>
        );
      })}
    </AbsoluteFill>
  );
};

const MiniStore: React.FC<{ o: number }> = ({ o }) => (
  <div style={{ opacity: o, padding: 26 }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
      <ExLogo w={84} stack={false} />
      <div style={{ display: "flex", gap: 22, fontFamily: SANS, fontWeight: 700, fontSize: 22, color: DIM }}><span>Shop</span><span>About</span><span>Cart</span></div>
    </div>
    <div style={{ display: "flex", gap: 18 }}>
      {(["tee", "hoodie", "mug"] as Kind[]).map((k) => (
        <div key={k} style={{ flex: 1, background: "#0d0e10", borderRadius: 16, border: `1px solid ${LINE}`, padding: 8, display: "flex", justifyContent: "center" }}>
          <Product kind={k} size={190} id={`ms-${k}`} />
        </div>
      ))}
    </div>
  </div>
);

const Address: React.FC<SceneCtx> = ({ f, dur, spec }) => {
  const sub: string = spec.sub, url = `${sub}.digitvl.com`;
  const typed = Math.floor(clamp((f - 6) / (dur * 0.5)) * url.length);
  const big = !!spec.big;
  const caret = Math.floor(f / 8) % 2 === 0;
  const cus = spec.custom ? eo((f - dur * 0.45) / 12) : 0;
  return (
    <AbsoluteFill style={{ padding: "0 50px", justifyContent: "center", gap: 34 }}>
      <Glass style={{ overflow: "hidden", borderRadius: 30 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "20px 24px", background: "rgba(255,255,255,0.05)" }}>
          {[RED, "#F5B301", "#2ECC71"].map((c) => <div key={c} style={{ width: 18, height: 18, borderRadius: 9, background: c, opacity: 0.85 }} />)}
          <div style={{ flex: 1, marginLeft: 12, background: "#000", borderRadius: 16, padding: big ? "22px 26px" : "16px 22px", display: "flex", alignItems: "center", gap: 14, border: `2px solid ${typed >= url.length ? RED : LINE}` }}>
            <Icon k="globe" s={big ? 44 : 34} c={RED} />
            <div style={{ fontFamily: BRAND, fontWeight: 700, fontSize: big ? 50 : 40, color: WHITE, letterSpacing: "0.01em" }}>
              {url.slice(0, typed)}{caret && typed < url.length ? <span style={{ color: RED }}>|</span> : null}
            </div>
          </div>
        </div>
        <MiniStore o={eo((f - dur * 0.35) / 14)} />
      </Glass>
      {spec.custom && (
        <div style={{ opacity: cus, transform: `translateY(${(1 - cus) * 40}px)` }}>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 28, letterSpacing: "0.12em", color: DIM, marginBottom: 12, textAlign: "center" }}>OPTIONAL: YOUR OWN DOMAIN</div>
          <div style={{ border: `3px dashed ${RED}`, borderRadius: 20, padding: "22px 30px", display: "flex", alignItems: "center", gap: 16, justifyContent: "center", background: "rgba(239,68,68,0.08)" }}>
            <Icon k="globe" s={44} c={WHITE} />
            <div style={{ fontFamily: BRAND, fontWeight: 700, fontSize: 52, color: WHITE }}>{spec.custom}</div>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

const Bubble: React.FC<{ me?: boolean; children: React.ReactNode; o: number }> = ({ me, children, o }) => (
  <div style={{ alignSelf: me ? "flex-end" : "flex-start", maxWidth: 760, background: me ? RED : "rgba(255,255,255,0.1)", color: WHITE, fontFamily: SANS, fontWeight: 600, fontSize: 44, lineHeight: 1.25,
    padding: "26px 34px", borderRadius: me ? "34px 34px 8px 34px" : "34px 34px 34px 8px", opacity: o, transform: `translateY(${(1 - o) * 30}px)` }}>{children}</div>
);

const Chat: React.FC<SceneCtx> = ({ f, dur, spec }) => {
  const user: string = spec.user;
  const n = Math.floor(clamp((f - 4) / (dur * 0.36)) * user.length);
  const showUser = eo((f - 2) / 8);
  const dots = f > dur * 0.42 && f < dur * 0.58;
  const ai = eo((f - dur * 0.56) / 10);
  const chips: string[] = spec.chips ?? [];
  const kinds: Record<string, Kind> = { Hoodie: "hoodie", "T-shirt": "tee", Tee: "tee", Mug: "mug", Tote: "tote" };
  return (
    <AbsoluteFill style={{ padding: "0 44px", justifyContent: "center" }}>
      <Glass style={{ padding: "28px 34px 40px", display: "flex", flexDirection: "column", gap: 26, minHeight: 800 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, paddingBottom: 20, borderBottom: `2px solid ${LINE}` }}>
          <div style={{ width: 68, height: 68, borderRadius: 34, background: RED, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon k="ai" s={40} /></div>
          <div style={{ fontFamily: DISPLAY, fontSize: 44, color: WHITE, letterSpacing: "0.04em" }}>STORE SETUP CHAT</div>
        </div>
        <Bubble me o={showUser}>{user.slice(0, n)}{n < user.length ? <span style={{ opacity: 0.7 }}>|</span> : null}</Bubble>
        {dots && <Bubble o={1}><span style={{ letterSpacing: 6 }}>{".".repeat(1 + (Math.floor(f / 6) % 3))}</span></Bubble>}
        {f >= dur * 0.56 && <Bubble o={ai}>{spec.ai}</Bubble>}
        {chips.length > 0 && (
          <div style={{ display: "flex", gap: 20, marginTop: 6 }}>
            {chips.map((c, i) => {
              const e = eo((f - dur * 0.68 - i * 6) / 10);
              return (
                <div key={c} style={{ flex: 1, opacity: e, transform: `scale(${0.8 + 0.2 * e})`, background: "#0d0e10", border: `2px solid ${LINE}`, borderRadius: 22, padding: "10px 6px 18px", textAlign: "center" }}>
                  <Product kind={kinds[c] ?? "tee"} size={230} id={`ch-${c}`} />
                  <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 30, color: WHITE, marginTop: -8 }}>{c}</div>
                  <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 22, color: RED, letterSpacing: "0.12em" }}>DRAFT</div>
                </div>
              );
            })}
          </div>
        )}
      </Glass>
    </AbsoluteFill>
  );
};

const Hero: React.FC<SceneCtx> = ({ f, dur, spec }) => {
  const k: Kind = spec.item;
  const reveal = eo((f - dur * 0.28) / (dur * 0.3));
  const scan = clamp((f - dur * 0.22) / (dur * 0.4));
  const float = Math.sin(f / 18) * 8;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", top: 40, opacity: eo(f / 10) * (1 - reveal * 0.8), transform: `translateY(${eo((f - 6) / 40) * 190}px) scale(${1 - 0.45 * eo((f - 6) / 40)})` }}>
        <Glass style={{ padding: "16px 26px", display: "flex", alignItems: "center", gap: 18 }}>
          <ExLogo w={76} stack={false} />
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30, color: DIM }}>your-logo.png</div>
        </Glass>
      </div>
      <div style={{ position: "relative", transform: `translateY(${float}px)` }}>
        <Product kind={k} size={820} logoOpacity={reveal} logoScale={1 + (1 - reveal) * 0.25} id="hero" />
        <div style={{ position: "absolute", top: 110, bottom: 110, left: `${12 + scan * 76}%`, width: 6, background: RED, boxShadow: `0 0 40px 10px ${RED}`, opacity: scan > 0 && scan < 1 ? 0.9 : 0 }} />
      </div>
      <div style={{ position: "absolute", bottom: 30, fontFamily: SANS, fontWeight: 800, fontSize: 38, letterSpacing: "0.06em", color: WHITE, opacity: eo((f - dur * 0.5) / 12) }}>{spec.caption}</div>
    </AbsoluteFill>
  );
};

const Products: React.FC<SceneCtx> = (c) => {
  const items: Kind[] = c.spec.items;
  const cols = items.length >= 5 ? 3 : items.length === 4 ? 2 : items.length;
  const rows = Math.ceil(items.length / cols);
  const cw = cols === 3 ? 300 : cols === 2 ? 440 : 300, size = cols === 3 ? 250 : cols === 2 ? 340 : 270;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, ${cw}px)`, gap: 26, justifyContent: "center" }}>
        {items.map((k, i) => {
          const at = Math.round(6 + i * Math.min(8, (c.dur * 0.5) / items.length));
          const e = spring({ frame: c.f - at, fps: FPS, config: { damping: 12, stiffness: 140 } });
          return (
            <Glass key={k + i} style={{ width: cw, padding: "14px 6px 22px", textAlign: "center", opacity: clamp(e * 1.4), transform: `scale(${0.6 + 0.4 * e}) translateY(${(1 - e) * 40}px)`, height: rows > 1 ? 380 : 440 }}>
              <div style={{ display: "flex", justifyContent: "center" }}><Product kind={k} size={size} id={`pr-${k}-${i}`} /></div>
              <div style={{ fontFamily: DISPLAY, fontSize: 38, color: WHITE, letterSpacing: "0.05em", textTransform: "uppercase", marginTop: -6 }}>{LABEL[k]}</div>
              {c.spec.draft && <div style={{ display: "inline-block", marginTop: 6, fontFamily: SANS, fontWeight: 800, fontSize: 24, letterSpacing: "0.14em", color: RED, border: `2px solid ${RED}`, borderRadius: 8, padding: "2px 12px" }}>DRAFT</div>}
            </Glass>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Flow: React.FC<SceneCtx> = (c) => {
  const nodes: { i: string; t: string; s: string }[] = c.spec.nodes;
  const n = nodes.length, tall = n > 3 ? 138 : 210;
  return (
    <AbsoluteFill style={{ padding: "0 56px", justifyContent: "center", gap: n > 3 ? 20 : 12 }}>
      {nodes.map((nd, i) => {
        const at = revealAt(c, i, n);
        const e = eo((c.f - at) / 10);
        const active = c.f >= at && (i === n - 1 || c.f < revealAt(c, i + 1, n));
        return (
          <React.Fragment key={i}>
            <Glass style={{ height: tall, display: "flex", alignItems: "center", gap: 30, padding: "0 38px", opacity: e * (active ? 1 : 0.6), transform: `translateY(${(1 - e) * 50}px)`, borderColor: active ? RED : LINE }}>
              <div style={{ width: tall - 52, height: tall - 52, borderRadius: 26, background: active ? RED : "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon k={nd.i} s={tall > 150 ? 84 : 60} />
              </div>
              <div>
                <div style={{ fontFamily: DISPLAY, fontSize: tall > 150 ? 70 : 56, color: WHITE, textTransform: "uppercase", lineHeight: 1.05 }}>{nd.t}</div>
                <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: tall > 150 ? 38 : 32, color: DIM }}>{nd.s}</div>
              </div>
            </Glass>
            {i < n - 1 && n <= 3 && <div style={{ textAlign: "center", color: RED, fontSize: 56, lineHeight: "40px", opacity: eo((c.f - at - 8) / 8) }}>▼</div>}
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};

const Compare: React.FC<SceneCtx> = ({ f, dur, spec }) => {
  const col = (side: "left" | "right", x: number) => {
    const d = spec[side];
    const good = side === "right";
    const e = eo((f - (good ? dur * 0.3 : 0)) / 12);
    return (
      <Glass style={{ flex: 1, padding: "34px 26px", opacity: e * (good || f < dur * 0.3 ? 1 : 0.55), transform: `translateX(${(1 - e) * x}px)`, borderColor: good ? RED : LINE, minHeight: 640 }}>
        <div style={{ fontFamily: DISPLAY, fontSize: 48, color: good ? RED : DIM, letterSpacing: "0.04em", marginBottom: 30 }}>{d.t}</div>
        {d.l.map((l: string, i: number) => (
          <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 34, opacity: eo((f - (good ? dur * 0.3 : 0) - 8 - i * 7) / 8) }}>
            <div style={{ fontFamily: DISPLAY, fontSize: 52, color: good ? "#2ECC71" : RED, lineHeight: 1 }}>{good ? "✓" : "✕"}</div>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 40, color: WHITE, lineHeight: 1.2 }}>{l}</div>
          </div>
        ))}
      </Glass>
    );
  };
  return <AbsoluteFill style={{ padding: "0 40px", flexDirection: "row", gap: 24, alignItems: "center" }}>{col("left", -120)}{col("right", 120)}</AbsoluteFill>;
};

const Checklist: React.FC<SceneCtx> = (c) => {
  const items: string[] = c.spec.items;
  return (
    <AbsoluteFill style={{ padding: "0 56px", justifyContent: "center", gap: 26 }}>
      {items.map((t, i) => {
        const at = revealAt(c, i, items.length);
        const e = eo((c.f - at) / 9);
        const tick = eo((c.f - at - 6) / 8);
        return (
          <Glass key={i} style={{ display: "flex", alignItems: "center", gap: 28, padding: items.length > 4 ? "24px 34px" : "34px 38px", opacity: e, transform: `translateX(${(1 - e) * 100}px)`, borderColor: tick > 0.5 ? "rgba(239,68,68,0.6)" : LINE }}>
            <div style={{ width: 76, height: 76, borderRadius: 38, background: tick > 0.05 ? RED : "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${0.8 + 0.2 * tick})`, flexShrink: 0 }}>
              <Icon k="check" s={46} />
            </div>
            <div style={{ fontFamily: DISPLAY, fontSize: items.length > 4 ? 56 : 68, color: WHITE, textTransform: "uppercase", lineHeight: 1.05 }}>
              {c.spec.numbered && <span style={{ color: RED }}>{i + 1}. </span>}{t}
            </div>
          </Glass>
        );
      })}
    </AbsoluteFill>
  );
};

const PriceScene: React.FC<SceneCtx> = ({ f, dur }) => {
  const e = eo(f / 12);
  const slide = eo((f - dur * 0.15) / (dur * 0.3));
  const ok = eo((f - dur * 0.62) / 10);
  const x = 40 + slide * 56; // slider %
  return (
    <AbsoluteFill style={{ padding: "0 56px", justifyContent: "center" }}>
      <Glass style={{ padding: "40px 40px 46px", opacity: e, transform: `translateY(${(1 - e) * 40}px)` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Product kind="hoodie" size={190} id="pc" />
          <div>
            <div style={{ fontFamily: DISPLAY, fontSize: 60, color: WHITE, textTransform: "uppercase" }}>Hoodie</div>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 28, letterSpacing: "0.14em", color: RED }}>DRAFT PRICE</div>
          </div>
        </div>
        <div style={{ position: "relative", height: 16, background: "rgba(255,255,255,0.14)", borderRadius: 8, margin: "56px 0 20px" }}>
          <div style={{ position: "absolute", left: "38%", top: -26, width: 4, height: 68, background: WHITE, opacity: 0.8 }} />
          <div style={{ position: "absolute", left: 0, width: `${x}%`, height: 16, background: RED, borderRadius: 8 }} />
          <div style={{ position: "absolute", left: `${x}%`, top: -18, width: 52, height: 52, marginLeft: -26, borderRadius: 26, background: WHITE, boxShadow: "0 6px 20px rgba(0,0,0,0.6)" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: SANS, fontWeight: 700, fontSize: 30, color: DIM, marginBottom: 44 }}>
          <span style={{ marginLeft: "26%" }}>safe price floor</span><span>your price</span>
        </div>
        <div style={{ borderRadius: 20, padding: "26px 0", textAlign: "center", fontFamily: DISPLAY, fontSize: 56, letterSpacing: "0.05em", color: WHITE, background: ok > 0.5 ? "#1f9d57" : RED, transform: `scale(${1 + 0.04 * Math.sin(ok * Math.PI)})` }}>
          {ok > 0.5 ? "CONFIRMED ✓" : "CONFIRM PRICE"}
        </div>
        <div style={{ textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: 32, color: DIM, marginTop: 26 }}>Nothing goes live until you confirm.</div>
      </Glass>
    </AbsoluteFill>
  );
};

const Cta: React.FC<SceneCtx> = ({ f }) => {
  const e = eo(f / 12);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 26, top: -50 }}>
      <Img src={staticFile("brand/logo.png")} style={{ width: 560, opacity: e, transform: `scale(${0.9 + 0.1 * e})` }} />
      <div style={{ fontFamily: DISPLAY, fontSize: 78, color: RED, letterSpacing: "0.12em", opacity: eo((f - 6) / 10) }}>STORES</div>
      <div style={{ fontFamily: BRAND, fontWeight: 800, fontSize: 58, color: WHITE, letterSpacing: "0.08em", opacity: eo((f - 12) / 10), textTransform: "uppercase" }}>stores.digitvl.com</div>
      <div style={{ display: "flex", gap: 12, marginTop: 10, opacity: eo((f - 18) / 12) }}>
        {(["tee", "hoodie", "mug", "cap"] as Kind[]).map((k) => <Product key={k} kind={k} size={190} id={`cta-${k}`} />)}
      </div>
    </AbsoluteFill>
  );
};

const SCENES: Record<string, React.FC<SceneCtx>> = {
  hook: Hook, steps: Steps, address: Address, chat: Chat, hero: Hero, products: Products, flow: Flow, stack: Flow, compare: Compare, checklist: Checklist, price: PriceScene, cta: Cta,
};
const TOP_TITLE: Record<string, string> = { address: "YOUR OWN ADDRESS", chat: "AI STORE SETUP", hero: "PREVIEW BEFORE YOU PRINT", price: "YOU CONFIRM EVERY PRICE", compare: "PRINT ON DEMAND" };

// ---------------------------------------------------------------- captions + audio
const Captions: React.FC<{ sents: Sent[] }> = ({ sents }) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const s = sents.find((x) => t >= x.start - 0.05 && t <= x.end + 0.3);
  if (!s) return null;
  const lines: Word[][] = [];
  let cur: Word[] = [];
  for (const w of s.words) {
    const len = cur.reduce((a, b) => a + b[0].length + 1, 0) + w[0].length;
    if (cur.length && (len > 20 || cur.length >= 4)) { lines.push(cur); cur = []; }
    cur.push(w);
  }
  if (cur.length) lines.push(cur);
  const line = lines.find((l) => t <= l[l.length - 1][2] + 0.12) ?? lines[lines.length - 1];
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: CAP_Y, display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "0 22px", padding: "0 50px" }}>
      {line.map((w, i) => {
        const on = t >= w[1] - 0.02 && t <= w[2] + 0.06;
        const pop = on ? 1 + 0.08 * Math.sin(clamp((t - w[1]) / 0.18) * Math.PI) : 1;
        const shown = t >= w[1] - 0.12;
        return (
          <span key={i} style={{ fontFamily: DISPLAY, fontSize: 96, lineHeight: 1.12, textTransform: "uppercase", color: on ? RED : WHITE, opacity: shown ? 1 : 0.25, transform: `scale(${pop})`,
            textShadow: "0 0 0 #000, 0 6px 0 #000, 0 10px 30px rgba(0,0,0,0.9)", WebkitTextStroke: "3px #000", paintOrder: "stroke fill" }}>{w[0]}</span>
        );
      })}
    </div>
  );
};

const Audios: React.FC<{ doc: Doc }> = ({ doc }) => {
  const total = doc.totalFrames, vEnd = Math.round(doc.voiceEnd * FPS);
  const win = doc.sentences.map((s) => [s.start - 0.05, s.end + 0.05]);
  const bed = (frame: number) => {
    const t = frame / FPS;
    const d = Math.min(...win.map(([a, b]) => (t < a ? a - t : t > b ? t - b : 0)));
    const lvl = 0.11 + (0.3 - 0.11) * clamp(d / 0.4);
    const inEnd = interpolate(frame, [vEnd - 30, vEnd + 6], [1, 1.0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const fadeOut = interpolate(frame, [total - 27, total - 1], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const fadeIn = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });
    return lvl * inEnd * fadeOut * fadeIn * (frame > vEnd ? 0.8 : 1);
  };
  return (
    <>
      <Audio src={staticFile(doc.voice)} volume={1} />
      <Audio src={staticFile(`music/${doc.music}.mp3`)} startFrom={Math.round((doc.musicStart || 0) * FPS)} volume={bed} />
      <Audio src={staticFile("music/vastness.mp3")} volume={(fr) => interpolate(fr, [0, 4, 30, 60], [0, 0.5, 0.35, 0], { extrapolateRight: "clamp" })} />
      <Sequence from={Math.max(0, vEnd - 6)}>
        <Audio src={staticFile("music/vastness.mp3")} volume={(fr) => interpolate(fr, [0, 18, total - vEnd - 30, total - vEnd], [0, 0.5, 0.4, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
      </Sequence>
    </>
  );
};

// ---------------------------------------------------------------- composition
export const Promo: React.FC<PromoProps> = ({ doc }) => {
  useFonts();
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  if (!doc) return <AbsoluteFill style={{ background: BG }} />;
  // group consecutive sentences with the same scene
  type G = { key: string; from: number; to: number; sFrames: number[] };
  const groups: G[] = [];
  doc.sentences.forEach((s, i) => {
    const st = i === 0 ? 0 : Math.max(0, Math.round(s.start * FPS) - 3);
    const last = groups[groups.length - 1];
    if (last && last.key === s.scene) last.sFrames.push(st);
    else groups.push({ key: s.scene, from: st, to: durationInFrames, sFrames: [st] });
  });
  groups.forEach((g, i) => { g.to = i + 1 < groups.length ? groups[i + 1].from : durationInFrames; });
  const cur = groups.find((g) => frame >= g.from && frame < g.to) ?? groups[groups.length - 1];
  const spec = doc.scenes[cur.key];
  const title = spec.title ?? TOP_TITLE[spec.type] ?? "";
  const tIn = eo((frame - cur.from) / 8);
  return (
    <AbsoluteFill style={{ background: BG }}>
      <AbsoluteFill style={{ background: "radial-gradient(900px 700px at 50% 38%, rgba(239,68,68,0.16), rgba(5,5,5,0) 70%)" }} />
      <div style={{ position: "absolute", left: 50, top: 86 }}><Img src={staticFile("brand/logo.png")} style={{ height: 118 }} /></div>
      <div style={{ position: "absolute", right: 50, top: 100, textAlign: "right", fontFamily: SANS, fontWeight: 800, fontSize: 30, letterSpacing: "0.16em", color: DIM }}>STORES</div>
      {title && spec.type !== "cta" && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 222, textAlign: "center", fontFamily: DISPLAY, fontSize: 50, letterSpacing: "0.08em", color: RED, opacity: tIn }}>{title}</div>
      )}
      {groups.map((g, i) => {
        const sp = doc.scenes[g.key];
        const C = SCENES[sp.type];
        const dur = g.to - g.from;
        return (
          <Sequence key={i} from={g.from} durationInFrames={dur}>
            <SceneShell dur={dur}>
              <C f={frame - g.from} dur={dur} spec={sp} sFrames={g.sFrames.map((x) => x - g.from)} />
            </SceneShell>
            <Audio src={staticFile("sfx/pop.wav")} volume={0.35} />
          </Sequence>
        );
      })}
      <Captions sents={doc.sentences} />
      <Audios doc={doc} />
    </AbsoluteFill>
  );
};

const SceneShell: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const f = useCurrentFrame();
  const o = Math.min(eo(f / 6), 1 - eo((f - (dur - 4)) / 4));
  return <div style={{ position: "absolute", left: 0, top: VIS_TOP, width: 1080, height: VIS_H, opacity: Math.max(0, o), transform: `translateY(${(1 - eo(f / 8)) * 24}px)` }}>{children}</div>;
};
