import { Heart, Sparkles } from "lucide-react";
import { useEffect } from "react";

const CELEBRATION_MS = 2400;

interface MatchOverlayProps {
  name: string;
  onComplete: () => void;
}

export function MatchOverlay({ name, onComplete }: MatchOverlayProps) {
  useEffect(() => {
    const timer = window.setTimeout(onComplete, CELEBRATION_MS);
    return () => window.clearTimeout(timer);
  }, [onComplete]);

  return (
    <div aria-hidden="true" className="match-overlay fixed inset-0 z-30 grid place-items-center px-5 text-center motion-reduce:animate-none"
      style={{ animationDuration: `${CELEBRATION_MS}ms` }}>
      <div className="match-message motion-reduce:animate-none">
        <div className="relative mx-auto mb-5 grid size-20 place-items-center rounded-full bg-mint text-ink shadow-xl">
          <Heart size={39} fill="currentColor" strokeWidth={1.5} />
          <Sparkles size={27} className="absolute -top-2 -right-4 text-white" />
          <Sparkles size={16} className="absolute right-auto -bottom-1 -left-4 text-white/80" />
        </div>
        <p className="text-[clamp(2.75rem,10vw,5rem)] leading-none font-extrabold tracking-[-0.075em]">
          It’s a match!
        </p>
        <p className="mt-3 text-base font-medium text-white/90">You and {name} liked each other.</p>
      </div>
    </div>
  );
}
