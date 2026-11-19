import { getDiscoverDatabase } from "@/server/discover";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({ profiles: getDiscoverDatabase().matches() }, {
    headers: { "Cache-Control": "no-store" },
  });
}
