import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { createSnapshot } from "@/lib/store";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const params = await context.params;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await createSnapshot({
    documentId: params.id,
    userId: session.user.id,
    reason: "manual-snapshot"
  });

  if (result.status === "not_found") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (result.status === "forbidden") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ ok: true });
}
