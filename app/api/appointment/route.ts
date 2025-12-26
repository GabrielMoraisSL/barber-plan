import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { date, customerId, barberId, serviceId } = body;

        const appointment = await prisma.appointment.create({
            data: {
                date: new Date(date),
                customerId,
                barberId,
                serviceId,
                statusId: "2",
            },
            include: {
                customer: true,
                barber: true,
                service: true,
                status: true,
            }
        });
        
        return NextResponse.json(appointment, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: `Erro ao criar agendamento: ${error}` },
            { status: 400 }
        );
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    
    const barberId = searchParams.get('barberId');
    const statusId = searchParams.get('statusId');
    const keyword = searchParams.get('keyword');
    const page = searchParams.get('page');
    const pageSize = searchParams.get('pageSize');

    const take = pageSize ? Number(pageSize) : 10;
    const skip = page ? (Number(page) - 1) * take : 0;

    try {
        const [appointments, totalCount] = await prisma.$transaction([
            prisma.appointment.findMany({
                where: {
                    barberId: barberId ? String(barberId) : undefined,
                    statusId: statusId ? String(statusId) : undefined,
                    OR: keyword ? [
                        { customer: { name: { contains: String(keyword), mode: 'insensitive' } } },
                        { service: { name: { contains: String(keyword), mode: 'insensitive' } } }
                    ] : undefined,
                },
                include: {
                    customer: { select: { id: true, name: true, phone: true } },
                    barber: { select: { id: true, name: true } },
                    service: { select: { id: true, name: true, price: true } },
                    status: { select: { id: true, name: true } }
                },
                orderBy: { date: 'asc' },
                take,
                skip,
            }),

            prisma.appointment.count({
                where: {
                    barberId: barberId ? String(barberId) : undefined,
                    statusId: statusId ? String(statusId) : undefined,
                    OR: keyword ? [
                        { customer: { name: { contains: String(keyword), mode: 'insensitive' } } },
                        { service: { name: { contains: String(keyword), mode: 'insensitive' } } }
                    ] : undefined,
                }
            })
        ]);

        return NextResponse.json({
            data: appointments,
            meta: {
                totalItems: totalCount,
                totalPages: Math.ceil(totalCount / take),
                currentPage: page ? Number(page) : 1,
                pageSize: take
            }
        });
    } catch (error) {
        return NextResponse.json(
            { error: `Erro ao buscar agendamentos: ${error}` },
            { status: 500 }
        );
    }
}
