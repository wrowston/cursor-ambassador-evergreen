import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const ADMIN_COOKIE = 'credits_admin';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const HMAC_PAYLOAD = 'credits-admin-v1';

function adminPassword(): string | undefined {
	return process.env.ADMIN_PASSWORD;
}

export function signAdminCookie(password: string): string {
	return createHmac('sha256', password).update(HMAC_PAYLOAD).digest('hex');
}

export function verifyAdminCookie(value: string | undefined, password: string): boolean {
	if (!value) {
		return false;
	}
	const expected = signAdminCookie(password);
	const actual = Buffer.from(value);
	const wanted = Buffer.from(expected);
	if (actual.length !== wanted.length) {
		return false;
	}
	return timingSafeEqual(actual, wanted);
}

export function applyAdminCookie(response: NextResponse, password: string): void {
	response.cookies.set(ADMIN_COOKIE, signAdminCookie(password), {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		path: '/',
		maxAge: COOKIE_MAX_AGE,
	});
}

export function clearAdminCookie(response: NextResponse): void {
	response.cookies.set(ADMIN_COOKIE, '', {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		path: '/',
		maxAge: 0,
	});
}

export async function requireAdmin(): Promise<NextResponse | null> {
	const password = adminPassword();
	if (!password) {
		return NextResponse.json({ success: false, error: 'Admin authentication not configured' }, { status: 500 });
	}

	const store = await cookies();
	if (!verifyAdminCookie(store.get(ADMIN_COOKIE)?.value, password)) {
		return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
	}

	return null;
}
