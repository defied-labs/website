"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import RevealText from "./RevealText";
import { pad, primeSfx } from "@/lib/sfx";

/**
 * The hero headline.
 *
 * A band of aurora light crosses the block while the words surface out of focus
 * in reading order. Once the last word has landed, "a ceiling" recedes and
 * "defied" keeps a slow breathing glow. One sound only: a pad under the reveal.
 *
 * Runs once on mount, replays on click (always) or on hover (at most once every
 * few seconds, so brushing past it does nothing). The pad tries to play on every
 * load and falls back to the first gesture on the page when the browser's
 * autoplay policy refuses.
 */

const RESOLVE_AT = 2300;
const REPLAY_AFTER = 2700;
const HOVER_COOLDOWN = 4000;

const AURORA_VIOLET = "#8b7bff";

export default function AnimatedHeadline() {
  const [runId, setRunId] = useState(0);
  const [resolved, setResolved] = useState(false);
  const [reduced, setReduced] = useState(false);

  const playing = useRef(false);
  const lastRun = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Also releases the replay guard: React re-runs effects in StrictMode, and a
  // cleanup that dropped the timers while leaving `playing` set would strand it
  // at true forever, killing every later replay.
  const clearTimers = useCallback(() => {
    for (const t of timers.current) clearTimeout(t);
    timers.current = [];
    playing.current = false;
  }, []);

  const start = useCallback(() => {
    if (playing.current) return;
    clearTimers();
    playing.current = true;
    lastRun.current = Date.now();

    setResolved(false);
    setRunId((n) => n + 1);
    pad();

    timers.current.push(
      setTimeout(() => setResolved(true), RESOLVE_AT),
      setTimeout(() => {
        playing.current = false;
      }, REPLAY_AFTER),
    );
  }, [clearTimers]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReduced(true);
      setResolved(true);
      return;
    }
    start();

    // Browsers block audio on a freshly loaded document until the visitor has
    // interacted with it. Ask anyway — Chrome grants it once the site has built
    // up media engagement, or if sound is allowed for the site — and fall back
    // to the first gesture that lands anywhere on the page.
    let done = false;
    const gestures = ["pointerdown", "keydown", "touchstart"] as const;
    const stopListening = () => {
      for (const g of gestures) window.removeEventListener(g, onGesture);
    };
    const onGesture = () => {
      stopListening();
      void primeSfx().then((ok) => {
        if (ok && !done) pad();
      });
    };

    void primeSfx().then((ok) => {
      if (done) return;
      if (ok) pad();
      else for (const g of gestures) window.addEventListener(g, onGesture);
    });

    return () => {
      done = true;
      stopListening();
      clearTimers();
    };
  }, [start, clearTimers]);

  const onClick = useCallback(() => {
    primeSfx();
    start();
  }, [start]);

  const onPointerEnter = useCallback(() => {
    if (Date.now() - lastRun.current < HOVER_COOLDOWN) return;
    start();
  }, [start]);

  return (
    <h1
      onClick={reduced ? undefined : onClick}
      onPointerEnter={reduced ? undefined : onPointerEnter}
      className="font-serif relative isolate cursor-default text-3xl tracking-tight select-none sm:text-5xl"
      style={
        {
          "--aurora-glow":
            "color-mix(in oklab, var(--color-primary) 60%, transparent)",
        } as React.CSSProperties
      }
    >
      {runId > 0 && !reduced && (
        <span
          key={runId}
          aria-hidden="true"
          className="pointer-events-none absolute top-[-12%] left-0 -z-10 h-[124%] w-[38%] animate-[aurora-sweep_2600ms_cubic-bezier(.4,0,.2,1)_both] blur-[22px]"
          style={{
            background: `linear-gradient(90deg, transparent, var(--aurora-glow) 35%, color-mix(in oklab, ${AURORA_VIOLET} 45%, transparent) 70%, transparent)`,
          }}
        />
      )}

      <RevealText text="The industry standard was" runId={runId} delay={150} />{" "}
      <span
        className="text-primary inline-block italic transition-opacity duration-[1600ms] ease-out"
        style={{ opacity: resolved ? 0.55 : 1 }}
      >
        <RevealText text="a ceiling" runId={runId} delay={480} />
      </span>
      .
      <br />
      <RevealText text="Until we" runId={runId} delay={900} />{" "}
      <span className="text-primary relative inline-block">
        {resolved && (
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute inset-[-0.35em] -z-10 rounded-full blur-xl ${
              reduced
                ? "opacity-50"
                : "animate-[aurora-breathe_8s_ease-in-out_infinite]"
            }`}
            style={{
              background:
                "radial-gradient(closest-side, color-mix(in oklab, var(--color-primary) 45%, transparent), transparent)",
            }}
          />
        )}
        <RevealText text="defied" runId={runId} delay={1250} />
      </span>{" "}
      <RevealText text="it." runId={runId} delay={1500} />
    </h1>
  );
}
