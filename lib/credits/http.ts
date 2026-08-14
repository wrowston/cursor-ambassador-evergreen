import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { CreditsError } from './model';

export function creditsErrorResponse(error: unknown): NextResponse {
	if (error instanceof CreditsError) {
		return NextResponse.json({ success: false, error: error.message }, { status: error.status });
	}

	if (error instanceof ZodError) {
		return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
	}

	const message = error instanceof Error ? error.message : 'Request failed';
	return NextResponse.json({ success: false, error: message }, { status: 500 });
}

export function requireProjectId(url: string): string {
	const projectId = new URL(url).searchParams.get('projectId');
	if (!projectId) {
		throw new CreditsError('Project ID is required', 400);
	}
	return projectId;
}
