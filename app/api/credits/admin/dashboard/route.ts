import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/credits/auth';
import { getDashboard } from '@/lib/credits/admin';
import { creditsErrorResponse, requireProjectId } from '@/lib/credits/http';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
	const denied = await requireAdmin();
	if (denied) {
		return denied;
	}

	try {
		const data = await getDashboard(requireProjectId(request.url));
		return NextResponse.json(data);
	} catch (error) {
		return creditsErrorResponse(error);
	}
}
