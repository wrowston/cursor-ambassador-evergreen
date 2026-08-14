import { NextRequest, NextResponse } from 'next/server';
import { validateAttendee } from '@/lib/credits/claims';
import { ValidateInputSchema } from '@/lib/credits/model';
import { creditsErrorResponse } from '@/lib/credits/http';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
	try {
		const input = ValidateInputSchema.parse(await request.json());
		const data = await validateAttendee(input);
		return NextResponse.json({ success: true, data });
	} catch (error) {
		return creditsErrorResponse(error);
	}
}
