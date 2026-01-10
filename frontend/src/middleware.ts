import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value
    const role = request.cookies.get('user_role')?.value

    const { pathname } = request.nextUrl

    // 1. Root path handling:
    // If user goes to /, redirect based on auth status and role
    if (pathname === '/') {
        if (token) {
            if (role === 'SINH_VIEN') {
                return NextResponse.redirect(new URL('/student/dashboard', request.url))
            }
            return NextResponse.redirect(new URL('/admin/dashboard', request.url))
        } else {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    // 2. Protected paths
    const isProtectedPath = pathname.startsWith('/dashboard') || pathname.startsWith('/admin') || pathname.startsWith('/student')

    if (isProtectedPath && !token) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Role-based protection
    if (token) {
        if (pathname.startsWith('/admin') && role === 'SINH_VIEN') {
            return NextResponse.redirect(new URL('/student/dashboard', request.url))
        }
        if (pathname.startsWith('/student') && role !== 'SINH_VIEN') { // Assuming null/undefined role defaults to admin access or restricted
            // Better to be explicit: if role is ADMIN or MANAGER, they shouldn't be in student dashboard? 
            // Or maybe they can view it? usually admins can view everything but let's stick to separation for now.
            // Actually, admins might need to see student view, but for now let's strict redirect to own dashboard to avoid confusion
            // unless we have specific "View as Student" feature.
            return NextResponse.redirect(new URL('/admin/dashboard', request.url))
        }
    }

    // 3. Auth pages (Login/Register)
    // If user is already logged in, redirect to dashboard
    const isAuthPath = pathname === '/login' || pathname === '/register'
    if (isAuthPath && token) {
        if (role === 'SINH_VIEN') {
            return NextResponse.redirect(new URL('/student/dashboard', request.url))
        }
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/',
        '/dashboard/:path*',
        '/admin/:path*',
        '/student/:path*',
        '/login',
        '/register'
    ],
}
