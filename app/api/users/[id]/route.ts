import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { id } = params;

    try {
        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                role: true,
                barbershop: true,
                appointments: {
                    include: {
                        customer: true,
                        service: true,
                        status: true
                    },
                    orderBy: { date: 'desc' },
                    take: 10
                },
                _count: {
                    select: { appointments: true }
                }
            }
        });

        if (!user) {
            return NextResponse.json(
                { error: "Usuário não encontrado" },
                { status: 404 }
            );
        }

        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json(
            { error: `Erro ao buscar usuário: ${error}` },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { id } = params;

    try {
        const body = await request.json();
        const { email, name, roleId, barbershopId } = body;

        const updated = await prisma.user.update({
            where: { id },
            data: {
                email,
                name,
                roleId,
                barbershopId,
            },
            include: {
                role: true,
                barbershop: true,
            }
        });

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json(
            { error: `Erro ao atualizar usuário: ${error}` },
            { status: 400 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { id } = params;

    try {
        await prisma.user.delete({ where: { id } });
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        return NextResponse.json(
            { error: `Erro ao deletar usuário: ${error}` },
            { status: 400 }
        );
    }
}
