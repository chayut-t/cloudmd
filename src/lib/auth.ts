import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { upsertUserByEmail } from "@/lib/store";

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
};

const DEV_BYPASS = process.env.BYPASS_AUTH === "true" && process.env.NODE_ENV === "development";

export async function requireUser(): Promise<CurrentUser> {
  if (DEV_BYPASS) {
    const devUser = await upsertUserByEmail({
      email: "dev@localhost",
      name: "Dev User"
    });
    return { id: devUser.id, email: devUser.email, name: devUser.name ?? "Dev User" };
  }

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
