import { redirect } from "next/navigation";

import { auth } from "@/auth";

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
};

export async function requireUser(): Promise<CurrentUser> {
  const session = await auth();

  if (!session?.user?.id || !session.user.email) {
    redirect("/");
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name ?? session.user.email
  };
}
