// app/api/auth/refresh/route.ts
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (!refreshToken) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const payload = jwt.verify(refreshToken, process.env.REFRESH_SECRET!) as { userId: string };
    
    const newAccessToken = jwt.sign(
      { userId: payload.userId },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" }
    );

    return NextResponse.json({ accessToken: newAccessToken });
  } catch (err) {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }
}