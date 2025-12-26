import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name } = body;

        const status = await prisma.appointmentStatus.create({
            data: { name },
        });
        
        return NextResponse.json(status, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: `Erro ao criar status: ${error}` },
            { status: 400 }
        );
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    
    const keyword = searchParams.get('keyword');
    const page = searchParams.get('page');
    const pageSize = searchParams.get('pageSize');

    const take = pageSize ? Number(pageSize) : 10;
    const skip = page ? (Number(page) - 1) * take : 0;

    try {
        const [statuses, totalCount] = await prisma.$transaction([
            prisma.appointmentStatus.findMany({
                where: keyword ? {
                    name: { contains: String(keyword), mode: 'insensitive' }
                } : undefined,
                include: {
                    _count: {
                        select: { appointments: true }
                    }
                },
                orderBy: { name: 'asc' },
                take,
                skip,
            }),

            prisma.appointmentStatus.count({
                where: keyword ? {
                    name: { contains: String(keyword), mode: 'insensitive' }
                } : undefined,
            })
        ]);

        return NextResponse.json({
            data: statuses,
            meta: {
                totalItems: totalCount,
                totalPages: Math.ceil(totalCount / take),
                currentPage: page ? Number(page) : 1,
                pageSize: take
            }
        });
    } catch (error) {
        return NextResponse.json(
            { error: `Erro ao buscar status: ${error}` },
            { status: 500 }
        );
    }
}
