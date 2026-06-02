import { useEffect, useState } from "react";
import { Settings2, X } from "lucide-react";

/** Dev-only floating panel to live-tune hero scrim/blur/position on mobile. */
const KEYS = {
  top: "--hero-scrim-top",
  bottom: "--hero-scrim-bottom",
  glow: "--hero-glow-opacity",
  blur: "--hero-blur",
  posX: "--hero-pos-x",
} as const;

type State = { top: number; bottom: number; glow: number; blur: number; posX: number };

const DEFAULTS: State = { top: 60, bottom: 100, glow: 60, blur: 0, posX: 70 };
const STORE = "nova-hero-tuner";

function load(): State {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(STORE);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch { return DEFAULTS; }
}

function apply(s: State) {
  if (typeof document === "undefined") return;
  const r = document.documentElement.style;
  r.setProperty(KEYS.top, String(s.top / 100));
  r.setProperty(KEYS.bottom, String(s.bottom / 100));
  r.setProperty(KEYS.glow, String(s.glow / 100));
  r.setProperty(KEYS.blur, `${s.blur}px`);
  r.setProperty(KEYS.posX, `${s.posX}%`);
}

export function HeroTuner() {
  if (!import.meta.env.DEV) return null;
  const [open, setOpen] = useState(false);
  const [s, setS] = useState<State>(DEFAULTS);

  useEffect(() => { const v = load(); setS(v); apply(v); }, []);

  const update = (k: keyof State) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = { ...s, [k]: Number(e.target.value) };
    setS(next);
    apply(next);
    try { window.localStorage.setItem(STORE, JSON.stringify(next)); } catch {}
  };

  const reset = () => { setS(DEFAULTS); apply(DEFAULTS); try { window.localStorage.removeItem(STORE); } catch {} };

  return (
    <div className="fixed bottom-4 right-4 z-[100]">
      {!open ? (
        <button onClick={() => setOpen(true)} className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-lg backdrop-blur" title="Hero tuner (dev only)">
          <Settings2 className="h-5 w-5" />
        </button>
      ) : (
        <div className="w-72 rounded-2xl border border-border/60 bg-background/95 p-4 shadow-2xl backdrop-blur">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Hero Tuner · dev</p>
            <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
          </div>
          {([
            ["top", "Top scrim", 0, 100],
            ["bottom", "Bottom scrim", 0, 100],
            ["glow", "Glow", 0, 100],
            ["blur", "Blur (px)", 0, 12],
            ["posX", "Image X (%)", 0, 100],
          ] as const).map(([k, label, min, max]) => (
            <label key={k} className="mb-3 block text-xs text-foreground">
              <span className="mb-1 flex justify-between text-muted-foreground">
                <span>{label}</span><span>{s[k]}</span>
              </span>
              <input type="range" min={min} max={max} value={s[k]} onChange={update(k)} className="w-full accent-primary" />
            </label>
          ))}
          <button onClick={reset} className="w-full rounded-full bg-primary/15 px-3 py-1.5 text-xs text-primary hover:bg-primary/25">Reset</button>
        </div>
      )}
    </div>
  );
}

export default HeroTuner;