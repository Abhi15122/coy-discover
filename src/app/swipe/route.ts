import { getDiscoverDatabase } from "@/server/discover";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const payload: unknown = await request.json().catch(() => null);
  if (!payload || typeof payload !== "object" || !("profileId" in payload) || !("action" in payload)) {
    return Response.json({ error: "Supply a profile ID and a like or pass." }, { status: 400 });
  }

  const { profileId, action } = payload;
  if (typeof profileId !== "number" || !Number.isSafeInteger(profileId) || profileId < 1 ||
      (action !== "like" && action !== "pass")) {
    return Response.json({ error: "Supply a valid profile ID and a like or pass." }, { status: 400 });
  }

  const result = getDiscoverDatabase().swipe(profileId, action);
  if (result === "missing") return Response.json({ error: "Profile not found." }, { status: 404 });
  if (result === "conflict") return Response.json({ error: "This profile has already been swiped on." }, { status: 409 });
  return Response.json(result);
}
