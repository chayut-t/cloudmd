"use server";

import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth";
import { createDocumentForOwner } from "@/lib/store";

export async function createDocumentAction(formData: FormData) {
  const user = await requireUser();
  const rawTitle = String(formData.get("title") ?? "").trim();
  const title = rawTitle.length > 0 ? rawTitle : "Untitled";
  const content = `# ${title}\n\n`;

  const document = await createDocumentForOwner(user.id, title, content);

  redirect(`/docs/${document.id}`);
}
