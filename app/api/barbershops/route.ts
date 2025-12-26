import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, address } = body;

        const barbershop = await prisma.barbershop.create({
            data: {
                name,
                address,
            },
        });
        
        return NextResponse.json(barbershop, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: `Erro ao criar barbearia: ${error}` },
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
        const [barbershops, totalCount] = await prisma.$transaction([
            prisma.barbershop.findMany({
                where: keyword ? {
                    OR: [
                        { name: { contains: String(keyword), mode: 'insensitive' } },
                        { address: { contains: String(keyword), mode: 'insensitive' } }
                    ]
                } : undefined,
                include: {
                    _count: {
                        select: { users: true, services: true }
                    }
                },
                orderBy: { name: 'asc' },
                take,
                skip,
            }),

            prisma.barbershop.count({
                where: keyword ? {
                    OR: [
                        { name: { contains: String(keyword), mode: 'insensitive' } },
                        { address: { contains: String(keyword), mode: 'insensitive' } }
                    ]
                } : undefined,
            })
        ]);

        return NextResponse.json({
            data: barbershops,
            meta: {
                totalItems: totalCount,
                totalPages: Math.ceil(totalCount / take),
                currentPage: page ? Number(page) : 1,
                pageSize: take
            }
        });
    } catch (error) {
        return NextResponse.json(
            { error: `Erro ao buscar barbearias: ${error}` },
            { status: 500 }
        );
    }
}
