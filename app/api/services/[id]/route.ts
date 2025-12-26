import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { id } = params;
    
    try {
        const service = await prisma.service.findUnique({
            where: { id },
            include: {
                barbershop: true,
                appointments: {
                    include: {
                        customer: true,
                        barber: true,
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

        if (!service) {
            return NextResponse.json(
                { error: "Serviço não encontrado" },
                { status: 404 }
            );
        }

        return NextResponse.json(service);
    } catch (error) {
        return NextResponse.json(
            { error: `Erro ao buscar serviço: ${error}` },
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
        const { name, price, duration, barbershopId } = body;

        const updated = await prisma.service.update({
            where: { id },
            data: {
                name,
                price,
                duration,
                barbershopId,
            },
            include: {
                barbershop: true,
            }
        });

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json(
            { error: `Erro ao atualizar serviço: ${error}` },
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
        await prisma.service.delete({ where: { id } });
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        return NextResponse.json(
            { error: `Erro ao deletar serviço: ${error}` },
            { status: 400 }
        );
    }
}
