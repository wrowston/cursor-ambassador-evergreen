import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/credits/auth';
import { deleteProject, getProject, updateProject } from '@/lib/credits/admin';
import { UpdateProjectInputSchema } from '@/lib/credits/model';
import { creditsErrorResponse } from '@/lib/credits/http';

export const runtime = 'nodejs';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
	const denied = await requireAdmin();
	if (denied) {
		return denied;
	}

	try {
		const { id } = await context.params;
		const project = await getProject(id);
		return NextResponse.json({ success: true, data: project });
	} catch (error) {
		return creditsErrorResponse(error);
	}
}

export async function PATCH(request: NextRequest, context: RouteContext) {
	const denied = await requireAdmin();
	if (denied) {
		return denied;
	}

	try {
		const { id } = await context.params;
		const body = await request.json();
		const input = UpdateProjectInputSchema.parse({
			...body,
			eventDate: body.eventDate || undefined,
			description: body.description || undefined,
		});
		const project = await updateProject(id, input);
		return NextResponse.json({ success: true, data: project });
	} catch (error) {
		return creditsErrorResponse(error);
	}
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
	const denied = await requireAdmin();
	if (denied) {
		return denied;
	}

	try {
		const { id } = await context.params;
		const details = await deleteProject(id);
		return NextResponse.json({ success: true, details });
	} catch (error) {
		return creditsErrorResponse(error);
	}
}
