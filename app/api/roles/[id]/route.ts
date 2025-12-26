import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { id } = params;
    
    try {
        const role = await prisma.role.findUnique({
            where: { id },
            include: {
                users: {
                    select: { id: true, name: true, email: true }
                },
                _count: {
                    select: { users: true }
                }
            }
        });

        if (!role) {
            return NextResponse.json(
                { error: "Função não encontrada" },
                { status: 404 }
            );
        }

        return NextResponse.json(role);
    } catch (error) {
        return NextResponse.json(
            { error: `Erro ao buscar função: ${error}` },
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
        const { name } = body;

        const updated = await prisma.role.update({
            where: { id },
            data: { name },
        });

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json(
            { error: `Erro ao atualizar função: ${error}` },
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
        await prisma.role.delete({ where: { id } });
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        return NextResponse.json(
            { error: `Erro ao deletar função: ${error}` },
            { status: 400 }
        );
    }
}
