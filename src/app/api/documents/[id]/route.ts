import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { saveDocument } from "@/lib/store";

const patchSchema = z.object({
  title: z.string().trim().min(1).max(120),
  content: z.string().max(200_000)
});

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const params = await context.params;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json();
  const parsed = patchSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const result = await saveDocument({
    documentId: params.id,
    userId: session.user.id,
    title: parsed.data.title,
    content: parsed.data.content
  });

  if (result.status === "not_found") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (result.status === "forbidden") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ ok: true });
}
