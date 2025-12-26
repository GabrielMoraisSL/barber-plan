import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, phone, email } = body;

        const customer = await prisma.customer.create({
            data: {
                name,
                phone,
                email,
            },
        });
        
        return NextResponse.json(customer, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: `Erro ao criar cliente: ${error}` },
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
        const [customers, totalCount] = await prisma.$transaction([
            prisma.customer.findMany({
                where: keyword ? {
                    OR: [
                        { name: { contains: String(keyword), mode: 'insensitive' } },
                        { email: { contains: String(keyword), mode: 'insensitive' } },
                        { phone: { contains: String(keyword), mode: 'insensitive' } }
                    ]
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

            prisma.customer.count({
                where: keyword ? {
                    OR: [
                        { name: { contains: String(keyword), mode: 'insensitive' } },
                        { email: { contains: String(keyword), mode: 'insensitive' } },
                        { phone: { contains: String(keyword), mode: 'insensitive' } }
                    ]
                } : undefined,
            })
        ]);

        return NextResponse.json({
            data: customers,
            meta: {
                totalItems: totalCount,
                totalPages: Math.ceil(totalCount / take),
                currentPage: page ? Number(page) : 1,
                pageSize: take
            }
        });
    } catch (error) {
        return NextResponse.json(
            { error: `Erro ao buscar clientes: ${error}` },
            { status: 500 }
        );
    }
}
