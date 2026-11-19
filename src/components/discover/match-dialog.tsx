import { Heart, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { ActionButton } from "@/components/ui/action-button";
import type { Profile } from "@/lib/types";

export function MatchDialog({ profile, onClose }: { profile: Profile; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);

  return (
    <dialog ref={dialog} aria-labelledby="match-title"
      className="match-dialog fixed inset-x-0 top-auto bottom-0 mx-auto w-full max-w-[26rem] rounded-t-[2rem] bg-white p-0 text-ink sm:inset-y-0 sm:my-auto sm:w-[calc(100%-2rem)] sm:rounded-[2rem]"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="relative p-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <span className="mx-auto mb-5 block h-1 w-10 rounded-full bg-line" aria-hidden="true" />
        <button type="button" aria-label="Close match" onClick={onClose}
          className="absolute top-4 right-4 grid size-10 place-items-center rounded-full bg-lilac-soft hover:bg-lilac">
          <X size={19} aria-hidden="true" />
        </button>
        <div className="flex flex-col items-center rounded-panel bg-mint px-4 py-7 text-center">
          <div className="relative">
            <Image src={profile.photo} alt="" width={104} height={104} unoptimized className="size-[104px] rounded-full border-4 border-white object-cover" />
            <span className="absolute right-0 bottom-0 grid size-8 place-items-center rounded-full bg-petal text-ink">
              <Heart size={16} fill="currentColor" aria-hidden="true" />
            </span>
          </div>
          <h2 id="match-title" className="mt-4 text-3xl font-extrabold tracking-[-0.05em]">It’s a match!</h2>
          <p className="mt-1 text-base">You and {profile.name} liked each other.</p>
        </div>
        <ActionButton tone="primary" onClick={onClose} className="mt-4 w-full">Keep discovering</ActionButton>
      </div>
    </dialog>
  );
}
