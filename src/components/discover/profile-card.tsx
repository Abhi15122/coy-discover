import { MapPin } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import type { PointerEvent } from "react";
import type { Profile, SwipeAction } from "@/lib/types";

interface ProfileCardProps {
  profile: Profile;
  disabled: boolean;
  exiting: SwipeAction | null;
  onSwipe: (action: SwipeAction) => void;
}

const SWIPE_THRESHOLD = 75;

export function ProfileCard({ profile, disabled, exiting, onSwipe }: ProfileCardProps) {
  const start = useRef<{ pointerId: number; x: number } | null>(null);
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);

  function begin(event: PointerEvent<HTMLElement>) {
    if (disabled || !event.isPrimary || event.button !== 0) return;
    start.current = { pointerId: event.pointerId, x: event.clientX };
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
  }

  function move(event: PointerEvent<HTMLElement>) {
    if (start.current?.pointerId === event.pointerId) {
      setOffset(event.clientX - start.current.x);
    }
  }

  function end(event: PointerEvent<HTMLElement>) {
    if (start.current?.pointerId !== event.pointerId) return;
    const distance = event.clientX - start.current.x;
    cancel();
    if (Math.abs(distance) >= SWIPE_THRESHOLD) onSwipe(distance > 0 ? "like" : "pass");
  }

  function cancel() {
    start.current = null;
    setDragging(false);
    setOffset(0);
  }

  const x = exiting === "like" ? 450 : exiting === "pass" ? -450 : offset;
  const feedback = exiting ?? (Math.abs(offset) > 18 ? (offset > 0 ? "like" : "pass") : null);

  return (
    <article data-dragging={dragging} data-testid="profile-card"
      className="profile-card overflow-hidden rounded-panel border border-ink/15 bg-white shadow-card"
      onPointerDown={begin} onPointerMove={move} onPointerUp={end}
      onPointerCancel={cancel} onLostPointerCapture={cancel}
      style={{ transform: `translateX(${x}px) rotate(${x / 24}deg)`, opacity: exiting ? 0 : 1 }}>
      <div className="profile-photo relative aspect-[1.2] w-full bg-lilac">
        <Image src={profile.photo} alt={`Portrait of ${profile.name}`} fill unoptimized
          draggable={false} sizes="(max-width: 465px) 90vw, 416px"
          className="object-cover object-[center_42%]" />
        {feedback && (
          <span aria-hidden="true" className={`absolute top-4 rounded-full border border-ink px-4 py-2 text-sm font-extrabold ${feedback === "like" ? "left-4 bg-mint" : "right-4 bg-lilac"}`}>
            {feedback === "like" ? "Like" : "Pass"}
          </span>
        )}
      </div>
      <div className="px-4 pt-3.5 pb-4 sm:px-5">
        <h2 className="text-[1.7rem] leading-tight font-extrabold tracking-[-0.055em]">{profile.name}, {profile.age}</h2>
        <p className="mt-0.5 flex items-center gap-1.5 text-sm font-medium text-muted">
          <MapPin size={14} aria-hidden="true" /> {profile.city}
        </p>
        <p className="mt-2.5 text-base leading-snug text-ink">{profile.bio}</p>
        <ul aria-label="Interests" className="mt-3 flex flex-wrap gap-1.5">
          {profile.interests.map((interest) => (
            <li key={interest} className="rounded-full bg-lilac-soft px-2.5 py-1 text-xs font-semibold text-muted">{interest}</li>
          ))}
        </ul>
      </div>
    </article>
  );
}
