import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/credits/auth';
import { uploadAttendees, uploadCodes } from '@/lib/credits/claims';
import { parseAttendeesCSV, parseCodesCSV } from '@/lib/credits/csv';
import { CreditsError } from '@/lib/credits/model';
import { creditsErrorResponse } from '@/lib/credits/http';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
	const denied = await requireAdmin();
	if (denied) {
		return denied;
	}

	try {
		const formData = await request.formData();
		const file = formData.get('file');
		const type = formData.get('type');
		const projectId = formData.get('projectId');

		if (!(file instanceof File)) {
			throw new CreditsError('No file provided', 400);
		}
		if (type !== 'codes' && type !== 'attendees') {
			throw new CreditsError('Invalid upload type', 400);
		}
		if (typeof projectId !== 'string' || !projectId) {
			throw new CreditsError('Project ID is required', 400);
		}

		const content = await file.text();

		if (type === 'codes') {
			const parsed = parseCodesCSV(content);
			if (parsed.length === 0) {
				throw new CreditsError('CSV file is empty or contains no valid codes', 400);
			}
			const details = await uploadCodes(projectId, parsed);
			return NextResponse.json({
				success: true,
				message: `Successfully uploaded ${details.newCodes} codes`,
				details,
			});
		}

		const parsed = parseAttendeesCSV(content);
		if (parsed.length === 0) {
			throw new CreditsError('CSV file is empty or contains no valid attendees', 400);
		}
		const details = await uploadAttendees(projectId, parsed);
		return NextResponse.json({
			success: true,
			message: `Successfully uploaded ${details.newAttendees} attendees`,
			details,
		});
	} catch (error) {
		return creditsErrorResponse(error);
	}
}
