import { NextRequest, NextResponse } from 'next/server';
import { listPublicAttendees } from '@/lib/credits/claims';
import { creditsErrorResponse, requireProjectId } from '@/lib/credits/http';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
	try {
		const attendees = await listPublicAttendees(requireProjectId(request.url));
		return NextResponse.json({ success: true, attendees });
	} catch (error) {
		return creditsErrorResponse(error);
	}
}
