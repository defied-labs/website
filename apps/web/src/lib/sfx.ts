/**
 * Synthesized ambience for the hero headline. No audio files, no deps.
 *
 * Browsers block audio until the visitor has interacted with the page, so both
 * voices no-op while the AudioContext is not running. That is intentional: the
 * headline is silent on first load and only gains sound once it is clicked.
 */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    try {
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.9;
      master.connect(ctx.destination);
    } catch {
      ctx = null;
      return null;
    }
  }
  return ctx;
}

function live(): { c: AudioContext; out: GainNode } | null {
  const c = audio();
  if (!c || !master || c.state !== "running") return null;
  return { c, out: master };
}

/**
 * Try to get the AudioContext running and report whether it worked.
 *
 * Called from a real user gesture this always succeeds. Called on page load it
 * succeeds only where the browser's autoplay policy allows it (Chrome grants it
 * once the site has enough media engagement, or if the visitor has allowed
 * sound for the site); otherwise it resolves false and the caller should wait
 * for a gesture.
 */
export async function primeSfx(): Promise<boolean> {
  const c = audio();
  if (!c) return false;
  if (c.state === "suspended") {
    try {
      await c.resume();
    } catch {
      return false;
    }
  }
  return c.state === "running";
}

/**
 * A slow swell: a fifth, slightly detuned, behind a filter that opens over the
 * attack. Sits under the reveal without ever asking for attention.
 */
let lastPad = -1;

export function pad() {
  const a = live();
  if (!a) return;
  const { c, out } = a;
  const now = c.currentTime;
  // Load and first-gesture can both ask for the pad within a few ms of each
  // other; a second swell on top of the first just sounds loud.
  if (now - lastPad < 0.5) return;
  lastPad = now;
  const attack = 1.2;
  const release = 2.0;

  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.Q.value = 0.7;
  filter.frequency.setValueAtTime(300, now);
  filter.frequency.exponentialRampToValueAtTime(1800, now + 1.6);

  const gain = c.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.045, now + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + attack + release);

  filter.connect(gain).connect(out);

  for (const [freq, detune] of [
    [220, -5],
    [330, 4],
    [440, 7],
  ] as const) {
    const osc = c.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = freq;
    osc.detune.value = detune;
    osc.connect(filter);
    osc.start(now);
    osc.stop(now + attack + release + 0.1);
  }
}
