// proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export async function proxy(request: NextRequest) {
    const path = request.nextUrl.pathname;

    if (path.startsWith('/api/auth') || path === '/login') {
        return NextResponse.next();
    }

    request.headers.forEach((value, key) => {
        if (key.toLowerCase() === 'authorization') {
            console.log(`   ${key}: ${value.substring(0, 50)}...`);
        }
    });

    const authHeader = request.headers.get('authorization');

    const token = authHeader?.replace('Bearer ', '').trim();

    if (!token) {
        return NextResponse.json(
            { error: "Token não fornecido" },
            { status: 401 }
        );
    }

    try {
        if (!process.env.JWT_SECRET) {
            return NextResponse.json(
                { error: "Erro de configuração do servidor" },
                { status: 500 }
            );
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
            userId: string;
            email: string;
            role: string;
            roleId: string;
            barbershopId: string;
        };

        const response = NextResponse.next();
        response.headers.set('x-user-id', decoded.userId || '');
        response.headers.set('x-user-email', decoded.email || '');
        response.headers.set('x-user-role', decoded.role || '');
        response.headers.set('x-user-role-id', decoded.roleId || '');
        response.headers.set('x-user-barbershop-id', decoded.barbershopId || '');

        return response;
    } catch (error) {
        return NextResponse.json(
            { error: "Token inválido ou expirado" },
            { status: 401 }
        );
    }
}

export const config = {
    matcher: [
        '/api/:path*',
        '/dashboard/:path*',
    ],
};