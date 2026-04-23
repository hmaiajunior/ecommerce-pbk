import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import type { Session } from "next-auth"

type GuardResult =
  | { session: Session; error: null }
  | { session: null; error: NextResponse }

export async function requireAdmin(): Promise<GuardResult> {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      session: null,
      error: NextResponse.json({ error: "Não autenticado." }, { status: 401 }),
    }
  }

  if (session.user.role !== "ADMIN") {
    return {
      session: null,
      error: NextResponse.json({ error: "Acesso negado." }, { status: 403 }),
    }
  }

  return { session, error: null }
}
