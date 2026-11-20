"use client";

import { Compass, Heart, HeartCrack } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Profile, SwipeAction, SwipeResult } from "@/shared/types";
import { ActionButton } from "../ui/action-button";
import { MatchOverlay } from "./match-overlay";
import { MatchesList } from "./matches-list";
import { AppHeader, Navigation, type View } from "./navigation";
import { ProfileCard } from "./profile-card";
import { REDUCED_MOTION_EXIT_MS, SWIPE_EXIT_MS } from "./swipe-feedback";

type ProfileList = { status: "loading" | "error" } | { status: "ready"; profiles: Profile[] };

async function readJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json() as Promise<T>;
}

export function DiscoverApp() {
  const [view, setView] = useState<View>("discover");
  const [feed, setFeed] = useState<ProfileList>({ status: "loading" });
  const [matches, setMatches] = useState<ProfileList>({ status: "loading" });
  const [feedAttempt, setFeedAttempt] = useState(0);
  const [matchesAttempt, setMatchesAttempt] = useState(0);
  const [exiting, setExiting] = useState<SwipeAction | null>(null);
  const [swipeError, setSwipeError] = useState(false);
  const [match, setMatch] = useState<Profile | null>(null);
  const swipeInProgress = useRef(false);
  const profile = feed.status === "ready" ? feed.profiles[0] : undefined;
  const dismissMatch = useCallback(() => setMatch(null), []);

  useEffect(() => {
    const controller = new AbortController();
    readJson<{ profiles: Profile[] }>("/feed", { signal: controller.signal })
      .then(({ profiles }) => setFeed({ status: "ready", profiles }))
      .catch(() => {
        if (!controller.signal.aborted) setFeed({ status: "error" });
      });
    return () => controller.abort();
  }, [feedAttempt]);

  useEffect(() => {
    if (view !== "matches") return;
    const controller = new AbortController();
    readJson<{ profiles: Profile[] }>("/matches", { signal: controller.signal })
      .then(({ profiles }) => setMatches({ status: "ready", profiles }))
      .catch(() => {
        if (!controller.signal.aborted) setMatches({ status: "error" });
      });
    return () => controller.abort();
  }, [view, matchesAttempt]);

  function navigate(next: View) {
    if (next === "matches" && next !== view) setMatches({ status: "loading" });
    setView(next);
  }

  async function swipe(action: SwipeAction) {
    if (!profile || match || swipeInProgress.current) return;
    swipeInProgress.current = true;
    setSwipeError(false);
    setExiting(action);

    try {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const exitMs = reducedMotion ? REDUCED_MOTION_EXIT_MS[action] : SWIPE_EXIT_MS[action];
      const exitAnimation = new Promise<void>((resolve) => window.setTimeout(resolve, exitMs));
      const response = await fetch("/swipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId: profile.id, action }),
      });
      if (response.status === 409) {
        // A different tab saved a decision before this one.
        setFeed({ status: "loading" });
        setFeedAttempt((attempt) => attempt + 1);
        return;
      }
      if (!response.ok) throw new Error("Could not save swipe");
      const result: SwipeResult = await response.json();

      await exitAnimation;
      setFeed((current) => current.status === "ready"
        ? { status: "ready", profiles: current.profiles.filter(({ id }) => id !== profile.id) }
        : current);
      if (result.match) {
        setMatch(result.match);
        setMatchesAttempt((attempt) => attempt + 1);
      }
    } catch {
      setSwipeError(true);
    } finally {
      swipeInProgress.current = false;
      setExiting(null);
    }
  }

  const list = view === "matches" ? matches : feed;

  return (
    <div className="flex min-h-dvh flex-col overflow-x-clip">
      <AppHeader />
      <main className="main-width flex flex-1 flex-col pt-5 pb-3 sm:pt-7 sm:pb-5" aria-label={view === "home" ? "Home" : undefined}>
        {view !== "home" && (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
              <h1 className="text-[2.25rem] leading-none font-extrabold tracking-[-0.075em]">
                {view === "matches" ? "Matches" : "Discover"}
              </h1>
              {view === "discover" ? (
                <button type="button" onClick={() => navigate("matches")}
                  className="inline-flex min-h-10 items-center gap-2 rounded-full border border-line bg-white px-3.5 text-sm font-bold hover:border-ink/30">
                  <Heart size={16} className="text-petal-dark" aria-hidden="true" /> Matches
                </button>
              ) : (
                <button type="button" onClick={() => navigate("discover")}
                  className="min-h-10 rounded-full border border-line bg-white px-3.5 text-sm font-bold hover:border-ink/30">
                  Back to Discover
                </button>
              )}
            </div>

            {list.status === "loading" && (
              <p role="status" className="rounded-panel border border-line bg-white p-5 text-muted">
                {view === "matches" ? "Loading matches…" : "Loading profiles…"}
              </p>
            )}
            {list.status === "error" && (
              <section className="rounded-panel border border-line bg-white p-5">
                <p role="alert" className="mb-3">Something went wrong loading {view === "matches" ? "matches" : "profiles"}.</p>
                <ActionButton onClick={() => {
                  if (view === "matches") {
                    setMatches({ status: "loading" });
                    setMatchesAttempt((attempt) => attempt + 1);
                  } else {
                    setFeed({ status: "loading" });
                    setFeedAttempt((attempt) => attempt + 1);
                  }
                }}>Try again</ActionButton>
              </section>
            )}

            {view === "matches" && matches.status === "ready" && (
              <MatchesList profiles={matches.profiles} onBack={() => navigate("discover")} />
            )}

            {view === "discover" && profile && (
              <>
                <ProfileCard key={profile.id} profile={profile} exiting={exiting}
                  disabled={exiting !== null || match !== null} onSwipe={swipe} />
                <div className="mt-4 md:sticky md:bottom-[var(--bottom-nav-height)] md:z-10 md:bg-lilac-soft md:pb-1">
                  <div role="group" aria-label="Swipe actions" className="grid grid-cols-2 gap-3">
                    <ActionButton disabled={exiting !== null || match !== null} onClick={() => swipe("pass")}>
                      <HeartCrack size={18} aria-hidden="true" /> Pass
                    </ActionButton>
                    <ActionButton tone="primary" disabled={exiting !== null || match !== null} onClick={() => swipe("like")}>
                      <Heart size={17} aria-hidden="true" /> Like
                    </ActionButton>
                  </div>
                  {swipeError ? (
                    <p role="alert" className="mt-3 text-center text-sm text-petal-dark">Couldn’t save your swipe. Please try again.</p>
                  ) : (
                    <p className="mt-3 text-center text-xs text-muted md:hidden">Swipe left to pass or right to like.</p>
                  )}
                </div>
                <p role="status" className="sr-only">{profile.name}, {profile.age}, {profile.city}</p>
              </>
            )}
            {view === "discover" && feed.status === "ready" && !profile && (
              <section aria-labelledby="empty-feed-title" className="rounded-panel border border-line bg-lilac p-5 shadow-card">
                <div className="grid size-11 place-items-center rounded-xl bg-white"><Compass size={22} aria-hidden="true" /></div>
                <h2 id="empty-feed-title" className="mt-3 text-xl font-extrabold tracking-tight">No profiles left</h2>
                <p className="mt-1 text-muted">You’ve seen everyone in this demo. You can still view your mutual matches.</p>
                <ActionButton className="mt-4" onClick={() => navigate("matches")}>View matches</ActionButton>
              </section>
            )}
          </>
        )}
      </main>
      <Navigation view={view} onNavigate={navigate} />
      <p role="status" className="sr-only">
        {match ? `It’s a match! You and ${match.name} liked each other.` : ""}
      </p>
      {match && <MatchOverlay name={match.name} onComplete={dismissMatch} />}
    </div>
  );
}
