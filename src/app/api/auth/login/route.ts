import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "Email ou mot de passe incorrect" }, { status: 401 });
  }

  const valid = await verifyPassword(password, user.password);
  if (!valid) {
    return NextResponse.json({ error: "Email ou mot de passe incorrect" }, { status: 401 });
  }

  const token = createToken({ userId: user.id, email: user.email, role: user.role, name: user.name });

  const response = NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  response.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return response;
}
