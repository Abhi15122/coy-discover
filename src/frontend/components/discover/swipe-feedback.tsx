import { Heart } from "lucide-react";
import type { SwipeAction } from "@/shared/types";

export const SWIPE_EXIT_MS: Record<SwipeAction, number> = { like: 280, pass: 600 };
export const REDUCED_MOTION_EXIT_MS: Record<SwipeAction, number> = { like: 0, pass: 250 };

interface SwipeFeedbackProps {
  action: SwipeAction;
  progress: number;
  committed: boolean;
}

export function SwipeFeedback({ action, progress, committed }: SwipeFeedbackProps) {
  const isLike = action === "like";
  const placement = isLike ? "justify-items-start pl-2 sm:pl-3" : "justify-items-end pr-2 sm:pr-3";
  const color = isLike ? "text-petal" : "text-pass";
  const breaking = !isLike && committed;

  return (
    <div aria-hidden="true" data-swipe-action={action} data-committed={committed}
      className={`swipe-feedback pointer-events-none absolute inset-0 grid items-center motion-reduce:animate-none motion-reduce:transition-none ${placement} ${color}`}
      style={{ opacity: progress ** 0.65, animationDuration: `${SWIPE_EXIT_MS[action]}ms` }}>
      <div className="swipe-feedback-icon relative grid size-[4.25rem] place-items-center sm:size-20 motion-reduce:animate-none"
        style={{ scale: 0.76 + progress * 0.24 }}>
        {breaking ? (
          <>
            <Heart className="heart-piece heart-piece-left absolute size-full motion-reduce:animate-none" fill="currentColor" strokeWidth={1.3} />
            <Heart className="heart-piece heart-piece-right absolute size-full motion-reduce:animate-none" fill="currentColor" strokeWidth={1.3} />
          </>
        ) : (
          <>
            <Heart className="absolute size-full opacity-40" strokeWidth={1.3} />
            <Heart className="absolute size-full" fill="currentColor" strokeWidth={1.3}
              style={{ clipPath: `inset(${(1 - progress) * 100}% 0 0)` }} />
          </>
        )}
      </div>
    </div>
  );
}
