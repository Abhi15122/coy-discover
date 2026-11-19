import { Heart } from "lucide-react";
import Image from "next/image";
import { ActionButton } from "@/components/ui/action-button";
import type { Profile } from "@/lib/types";

export function MatchesList({ profiles, onBack }: { profiles: Profile[]; onBack: () => void }) {
  if (profiles.length === 0) {
    return (
      <section className="rounded-panel border border-line bg-white p-5">
        <div className="grid size-10 place-items-center rounded-xl bg-lilac text-petal-dark"><Heart size={19} aria-hidden="true" /></div>
        <h2 className="mt-3 text-xl font-extrabold tracking-tight">No matches yet</h2>
        <p className="mt-1 text-muted">When you and someone else like each other, they’ll appear here.</p>
        <ActionButton className="mt-4" onClick={onBack}>Back to Discover</ActionButton>
      </section>
    );
  }

  return (
    <ul className="space-y-2.5" aria-label="Mutual matches">
      {profiles.map((profile) => (
        <li key={profile.id} className="flex items-center gap-3 rounded-2xl border border-line bg-white px-3 py-2.5">
          <Image src={profile.photo} alt="" width={56} height={56} unoptimized className="size-14 rounded-xl object-cover" />
          <div className="min-w-0 flex-1">
            <p className="font-bold">{profile.name}, {profile.age}</p>
            <p className="text-sm text-muted">{profile.city}</p>
          </div>
          <span className="grid size-8 place-items-center rounded-full bg-mint" aria-label="Mutual match">
            <Heart size={15} fill="currentColor" aria-hidden="true" />
          </span>
        </li>
      ))}
    </ul>
  );
}
