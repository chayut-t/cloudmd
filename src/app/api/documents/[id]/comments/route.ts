import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { addComment } from "@/lib/store";

const commentSchema = z.object({
  body: z.string().trim().min(1).max(1000),
  anchorStart: z.number().int().nullable().optional(),
  anchorEnd: z.number().int().nullable().optional()
});

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const params = await context.params;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json();
  const parsed = commentSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const result = await addComment({
    documentId: params.id,
    userId: session.user.id,
    body: parsed.data.body,
    anchorStart: parsed.data.anchorStart ?? null,
    anchorEnd: parsed.data.anchorEnd ?? null
  });

  if (result.status === "not_found") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (result.status === "forbidden") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({
    comment: {
      id: result.comment.id,
      body: result.comment.body,
      anchorStart: result.comment.anchorStart,
      anchorEnd: result.comment.anchorEnd,
      createdAt: result.comment.createdAt,
      authorName: result.author?.name ?? null,
      authorEmail: result.author?.email ?? "unknown"
    }
  });
}
