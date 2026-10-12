import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { SITE } from "@/config/site";

// POST /api/revalidate { paths: ["/", "/courses/slug"] }
// Purges Next.js cached pages right after an admin save, so the public site
// shows fresh data immediately instead of waiting out the ISR window.
// Auth: forwards the browser's cookies to the API session check — no secrets
// in client JS, works on localhost and on hosting alike.
export async function POST(req: NextRequest) {
  const cookie = req.headers.get("cookie") ?? "";
  const meRes = await fetch(`${SITE.apiUrl}/auth/me`, {
    headers: { cookie },
    cache: "no-store",
  }).catch(() => null);
  if (!meRes || !meRes.ok) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const { paths } = (await req.json().catch(() => ({}))) as { paths?: string[] };
  for (const p of paths?.length ? paths : ["/"]) {
    revalidatePath(p, "page");
  }
  revalidatePath("/", "layout"); // header/footer read settings too
  return NextResponse.json({ ok: true });
}
