import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    const roleId = searchParams.get('roleId');
    const barbershopId = searchParams.get('barbershopId');
    const keyword = searchParams.get('keyword');
    const page = searchParams.get('page');
    const pageSize = searchParams.get('pageSize');

    const take = pageSize ? Number(pageSize) : 10;
    const skip = page ? (Number(page) - 1) * take : 0;

    try {
        const [users, totalCount] = await prisma.$transaction([
            prisma.user.findMany({
                where: {
                    roleId: roleId ? String(roleId) : undefined,
                    barbershopId: barbershopId ? String(barbershopId) : undefined,
                    OR: keyword ? [
                        { name: { contains: String(keyword), mode: 'insensitive' } },
                        { email: { contains: String(keyword), mode: 'insensitive' } }
                    ] : undefined,
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    createdAt: true,
                    role: { select: { id: true, name: true } },
                    barbershop: { select: { id: true, name: true } },
                    _count: {
                        select: { appointments: true }
                    }
                },
                orderBy: { name: 'asc' },
                take,
                skip,
            }),

            prisma.user.count({
                where: {
                    roleId: roleId ? String(roleId) : undefined,
                    barbershopId: barbershopId ? String(barbershopId) : undefined,
                    OR: keyword ? [
                        { name: { contains: String(keyword), mode: 'insensitive' } },
                        { email: { contains: String(keyword), mode: 'insensitive' } }
                    ] : undefined,
                }
            })
        ]);

        return NextResponse.json({
            data: users,
            meta: {
                totalItems: totalCount,
                totalPages: Math.ceil(totalCount / take),
                currentPage: page ? Number(page) : 1,
                pageSize: take
            }
        });
    } catch (error) {
        return NextResponse.json(
            { error: `Erro ao buscar usuários: ${error}` },
            { status: 500 }
        );
    }
}
