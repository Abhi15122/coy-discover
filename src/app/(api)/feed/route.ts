import { getDiscoverDatabase } from "@/backend/discover";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({ profiles: getDiscoverDatabase().feed() }, {
    headers: { "Cache-Control": "no-store" },
  });
}
