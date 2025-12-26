import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { id } = params;
    
    try {
        const appointment = await prisma.appointment.findUnique({
            where: { id },
            include: { customer: true, barber: true, service: true }
        });

        if (!appointment) {
            return NextResponse.json(
                { error: "Não encontrado" },
                { status: 404 }
            );
        }

        return NextResponse.json(appointment);
    } catch (error) {
        return NextResponse.json(
            { error: `Erro ao buscar agendamento: ${error}` },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { id } = params;
    
    try {
        await prisma.appointment.delete({ where: { id } });
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        return NextResponse.json(
            { error: `Erro ao deletar agendamento: ${error}` },
            { status: 400 }
        );
    }
}
