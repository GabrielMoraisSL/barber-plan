import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, price, duration, barbershopId } = body;

        const service = await prisma.service.create({
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
        
        return NextResponse.json(service, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: `Erro ao criar serviço: ${error}` },
            { status: 400 }
        );
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    
    const barbershopId = searchParams.get('barbershopId');
    const keyword = searchParams.get('keyword');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const page = searchParams.get('page');
    const pageSize = searchParams.get('pageSize');

    const take = pageSize ? Number(pageSize) : 10;
    const skip = page ? (Number(page) - 1) * take : 0;

    try {
        const [services, totalCount] = await prisma.$transaction([
            prisma.service.findMany({
                where: {
                    barbershopId: barbershopId ? String(barbershopId) : undefined,
                    name: keyword ? { contains: String(keyword), mode: 'insensitive' } : undefined,
                    price: {
                        gte: minPrice ? Number(minPrice) : undefined,
                        lte: maxPrice ? Number(maxPrice) : undefined,
                    }
                },
                include: {
                    barbershop: { select: { id: true, name: true } },
                    _count: {
                        select: { appointments: true }
                    }
                },
                orderBy: { name: 'asc' },
                take,
                skip,
            }),

            prisma.service.count({
                where: {
                    barbershopId: barbershopId ? String(barbershopId) : undefined,
                    name: keyword ? { contains: String(keyword), mode: 'insensitive' } : undefined,
                    price: {
                        gte: minPrice ? Number(minPrice) : undefined,
                        lte: maxPrice ? Number(maxPrice) : undefined,
                    }
                }
            })
        ]);

        return NextResponse.json({
            data: services,
            meta: {
                totalItems: totalCount,
                totalPages: Math.ceil(totalCount / take),
                currentPage: page ? Number(page) : 1,
                pageSize: take
            }
        });
    } catch (error) {
        return NextResponse.json(
            { error: `Erro ao buscar serviços: ${error}` },
            { status: 500 }
        );
    }
}
