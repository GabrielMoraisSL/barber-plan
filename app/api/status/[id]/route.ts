import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { id } = params;
    
    try {
        const status = await prisma.appointmentStatus.findUnique({
            where: { id },
            include: {
                appointments: {
                    include: {
                        customer: { select: { id: true, name: true } },
                        barber: { select: { id: true, name: true } },
                        service: { select: { id: true, name: true } }
                    },
                    orderBy: { date: 'desc' },
                    take: 20
                },
                _count: {
                    select: { appointments: true }
                }
            }
        });

        if (!status) {
            return NextResponse.json(
                { error: "Status não encontrado" },
                { status: 404 }
            );
        }

        return NextResponse.json(status);
    } catch (error) {
        return NextResponse.json(
            { error: `Erro ao buscar status: ${error}` },
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

        const updated = await prisma.appointmentStatus.update({
            where: { id },
            data: { name },
        });

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json(
            { error: `Erro ao atualizar status: ${error}` },
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
        await prisma.appointmentStatus.delete({ where: { id } });
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        return NextResponse.json(
            { error: `Erro ao deletar status: ${error}` },
            { status: 400 }
        );
    }
}
