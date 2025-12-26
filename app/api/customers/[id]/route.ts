import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { id } = params;
    
    try {
        const customer = await prisma.customer.findUnique({
            where: { id },
            include: {
                appointments: {
                    include: {
                        barber: { select: { id: true, name: true } },
                        service: { select: { id: true, name: true, price: true } },
                        status: { select: { id: true, name: true } }
                    },
                    orderBy: { date: 'desc' },
                    take: 20
                },
                _count: {
                    select: { appointments: true }
                }
            }
        });

        if (!customer) {
            return NextResponse.json(
                { error: "Cliente não encontrado" },
                { status: 404 }
            );
        }

        return NextResponse.json(customer);
    } catch (error) {
        return NextResponse.json(
            { error: `Erro ao buscar cliente: ${error}` },
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
        const { name, phone, email } = body;

        const updated = await prisma.customer.update({
            where: { id },
            data: {
                name,
                phone,
                email,
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json(
            { error: `Erro ao atualizar cliente: ${error}` },
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
        await prisma.customer.delete({ where: { id } });
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        return NextResponse.json(
            { error: `Erro ao deletar cliente: ${error}` },
            { status: 400 }
        );
    }
}
