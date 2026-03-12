import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password, name, role, phone, address, farmName, farmDescription } = body;

  if (!email || !password || !name || !role) {
    return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 409 });
  }

  const hashedPassword = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role,
      phone,
      address,
      farmName: role === "FARMER" ? farmName : null,
      farmDescription: role === "FARMER" ? farmDescription : null,
    },
  });

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
