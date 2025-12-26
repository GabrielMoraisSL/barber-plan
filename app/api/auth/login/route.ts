// app/api/auth/login/route.ts
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_SECRET!;

export async function POST(request: Request) {
  const { email, password } = await request.json();

  console.log("🔐 Tentativa de login para:", email, password);
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
  }

  const accessToken = jwt.sign(
    { userId: user.id, role: user.roleId },
    ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { userId: user.id },
    REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  const response = NextResponse.json({ accessToken });

  response.cookies.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60,
  });

  return response;
}