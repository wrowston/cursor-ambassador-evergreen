import { NextRequest, NextResponse } from 'next/server';
import { redeemCode } from '@/lib/credits/claims';
import { RedeemInputSchema } from '@/lib/credits/model';
import { creditsErrorResponse } from '@/lib/credits/http';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
	try {
		const input = RedeemInputSchema.parse(await request.json());
		const data = await redeemCode(input);
		return NextResponse.json({ success: true, data });
	} catch (error) {
		return creditsErrorResponse(error);
	}
}
