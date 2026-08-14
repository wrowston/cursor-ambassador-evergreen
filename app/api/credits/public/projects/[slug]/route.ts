import { NextRequest, NextResponse } from 'next/server';
import { getPublicProjectBySlug } from '@/lib/credits/claims';
import { creditsErrorResponse } from '@/lib/credits/http';

export const runtime = 'nodejs';

export async function GET(_request: NextRequest, context: { params: Promise<{ slug: string }> }) {
	try {
		const { slug } = await context.params;
		if (!slug) {
			return NextResponse.json({ success: false, error: 'Project slug is required' }, { status: 400 });
		}

		const project = await getPublicProjectBySlug(slug);
		return NextResponse.json({
			success: true,
			data: {
				id: project.id,
				name: project.name,
				description: project.description ?? null,
				slug: project.slug,
				eventDate: project.eventDate ?? null,
			},
		});
	} catch (error) {
		return creditsErrorResponse(error);
	}
}
