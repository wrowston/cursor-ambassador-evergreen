import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/credits/auth';
import { createProject, listProjects } from '@/lib/credits/admin';
import { CreateProjectInputSchema } from '@/lib/credits/model';
import { creditsErrorResponse } from '@/lib/credits/http';

export const runtime = 'nodejs';

export async function GET() {
	const denied = await requireAdmin();
	if (denied) {
		return denied;
	}

	try {
		const projects = await listProjects();
		return NextResponse.json({ success: true, data: { projects } });
	} catch (error) {
		return creditsErrorResponse(error);
	}
}

export async function POST(request: NextRequest) {
	const denied = await requireAdmin();
	if (denied) {
		return denied;
	}

	try {
		const body = await request.json();
		const input = CreateProjectInputSchema.parse({
			...body,
			eventDate: body.eventDate || undefined,
			description: body.description || undefined,
		});
		const project = await createProject(input);
		return NextResponse.json({ success: true, data: project });
	} catch (error) {
		return creditsErrorResponse(error);
	}
}
