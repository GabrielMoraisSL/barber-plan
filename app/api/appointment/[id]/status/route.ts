import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { id } = params;

    try {
        const body = await request.json();
        const { statusId } = body;

        if (!statusId) {
            return NextResponse.json(
                { error: "O campo statusId é obrigatório." },
                { status: 400 }
            );
        }

        const updated = await prisma.appointment.update({
            where: { id },
            data: {
                statusId: String(statusId)
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json(
            { error: `Erro ao atualizar status: ${error}` },
            { status: 400 }
        );
    }
}
