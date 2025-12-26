import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { id } = params;
    
    try {
        const barbershop = await prisma.barbershop.findUnique({
            where: { id },
            include: {
                users: {
                    select: { id: true, name: true, email: true, role: true }
                },
                services: {
                    select: { id: true, name: true, price: true, duration: true }
                },
                _count: {
                    select: { users: true, services: true }
                }
            }
        });

        if (!barbershop) {
            return NextResponse.json(
                { error: "Barbearia não encontrada" },
                { status: 404 }
            );
        }

        return NextResponse.json(barbershop);
    } catch (error) {
        return NextResponse.json(
            { error: `Erro ao buscar barbearia: ${error}` },
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
        const { name, address } = body;

        const updated = await prisma.barbershop.update({
            where: { id },
            data: {
                name,
                address,
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json(
            { error: `Erro ao atualizar barbearia: ${error}` },
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
        await prisma.barbershop.delete({ where: { id } });
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        return NextResponse.json(
            { error: `Erro ao deletar barbearia: ${error}` },
            { status: 400 }
        );
    }
}
