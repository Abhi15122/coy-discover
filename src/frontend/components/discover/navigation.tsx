import { Compass, House } from "lucide-react";

export type View = "home" | "discover" | "matches";

interface NavigationProps {
  view: View;
  onNavigate: (view: View) => void;
}

export function AppHeader() {
  return (
    <header className="border-b border-line bg-white">
      <div className="main-width flex h-14 items-center">
        <span className="text-[1.75rem] leading-none font-extrabold tracking-[-0.06em]">
          coy<span aria-hidden="true" className="ml-0.5 inline-block size-2.5 rounded-full bg-petal" />
        </span>
      </div>
    </header>
  );
}

export function Navigation({ view, onNavigate }: NavigationProps) {
  const items = [
    { id: "home", label: "Home", Icon: House },
    { id: "discover", label: "Discover", Icon: Compass },
  ] as const;

  return (
    <nav aria-label="Main navigation" className="sticky bottom-0 z-10 mt-auto border-t border-line bg-white pb-[env(safe-area-inset-bottom)]">
      <div className="main-width grid grid-cols-2 gap-2.5 py-2">
        {items.map(({ id, label, Icon }) => {
          const selected = id === view || (id === "discover" && view === "matches");
          return (
            <button key={id} type="button" aria-current={selected ? "page" : undefined}
              onClick={() => onNavigate(id)}
              className={`flex min-h-11 items-center justify-center gap-2 rounded-xl text-sm font-bold ${selected ? "bg-lilac text-ink" : "text-muted hover:bg-lilac-soft"}`}>
              <Icon size={18} aria-hidden="true" /> {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
