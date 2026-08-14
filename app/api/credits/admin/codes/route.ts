import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/credits/auth';
import { listCodes } from '@/lib/credits/admin';
import { creditsErrorResponse, requireProjectId } from '@/lib/credits/http';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
	const denied = await requireAdmin();
	if (denied) {
		return denied;
	}

	try {
		const codes = await listCodes(requireProjectId(request.url));
		return NextResponse.json({ codes });
	} catch (error) {
		return creditsErrorResponse(error);
	}
}
