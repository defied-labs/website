"use client";

/**
 * Word-by-word reveal for the hero headline.
 *
 * Each word emerges out of focus and settles: blur and a few pixels of drift,
 * with a glow that peaks while it lands and then leaves. No per-character
 * splitting, so ligatures and kerning stay intact.
 *
 * The animation uses `backwards` fill so a word holds its hidden state during
 * the delay and reverts to plain styles once it finishes — nothing lingers on
 * the compositor afterwards.
 */

const WORD_MS = 900;

type RevealTextProps = {
  text: string;
  /** Bump to (re)start. 0 renders the plain text, which is what the server sends. */
  runId: number;
  /** ms before the first word starts */
  delay?: number;
  /** ms between two consecutive words */
  stagger?: number;
  className?: string;
};

export default function RevealText({
  text,
  runId,
  delay = 0,
  stagger = 90,
  className,
}: RevealTextProps) {
  const parts = text.split(/(\s+)/).filter(Boolean);
  let word = 0;

  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (/^\s+$/.test(part)) return <span key={i}>{part}</span>;
        const at = delay + word++ * stagger;
        return (
          <span
            key={`${runId}:${i}`}
            className="inline-block whitespace-nowrap"
            style={
              runId
                ? {
                    animation: `aurora-word ${WORD_MS}ms cubic-bezier(.22,.9,.24,1) ${at}ms backwards`,
                  }
                : undefined
            }
          >
            {part}
          </span>
        );
      })}
    </span>
  );
}
