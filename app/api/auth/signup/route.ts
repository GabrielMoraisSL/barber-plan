import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { email, password, name, roleId, barbershopId } = await request.json();

        const userExists = await prisma.user.findUnique({
            where: { email },
        });

        if (userExists) {
            return NextResponse.json({ error: "Usuário já cadastrado" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                roleId,
                barbershopId,
            },
        });

        return NextResponse.json({ message: "Usuário criado com sucesso!" }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: `Erro ao criar usuário: ${error}` }, { status: 500 });
    }
}