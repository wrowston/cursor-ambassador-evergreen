import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthInputSchema } from '@/lib/credits/model';
import { applyAdminCookie, clearAdminCookie } from '@/lib/credits/auth';
import { creditsErrorResponse } from '@/lib/credits/http';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
	try {
		const body = AdminAuthInputSchema.parse(await request.json());

		if ('logout' in body) {
			const response = NextResponse.json({ success: true });
			clearAdminCookie(response);
			return response;
		}

		const adminPassword = process.env.ADMIN_PASSWORD;
		if (!adminPassword) {
			return NextResponse.json({ success: false, error: 'Admin authentication not configured' }, { status: 500 });
		}

		if (body.password !== adminPassword) {
			await new Promise((resolve) => setTimeout(resolve, 400));
			return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 });
		}

		const response = NextResponse.json({ success: true });
		applyAdminCookie(response, adminPassword);
		return response;
	} catch (error) {
		return creditsErrorResponse(error);
	}
}
