import { z } from 'zod';

export const ProjectStatusSchema = z.enum(['active', 'archived', 'draft']);
export type ProjectStatus = z.infer<typeof ProjectStatusSchema>;

export const CreditsProjectSchema = z.object({
	id: z.string().min(1),
	name: z.string().min(1).max(100),
	slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
	description: z.string().max(500).optional(),
	eventDate: z.string().optional(),
	status: ProjectStatusSchema,
});
export type CreditsProject = z.infer<typeof CreditsProjectSchema>;

export const CreditsAttendeeSchema = z.object({
	id: z.string().min(1),
	projectId: z.string().min(1),
	name: z.string().min(1).max(100),
	email: z.string().email(),
	redeemedAt: z.string().optional(),
});
export type CreditsAttendee = z.infer<typeof CreditsAttendeeSchema>;

export const CreditsCodeSchema = z.object({
	id: z.string().min(1),
	projectId: z.string().min(1),
	code: z.string().min(1),
	cursorUrl: z.string().min(1),
	isRedeemed: z.boolean(),
});
export type CreditsCode = z.infer<typeof CreditsCodeSchema>;

export const CreditsRedemptionSchema = z.object({
	id: z.string().min(1),
	projectId: z.string().min(1),
	attendeeName: z.string().min(1),
	attendeeEmail: z.string().email(),
	code: z.string().min(1),
	cursorUrl: z.string().min(1),
	redeemedAt: z.string(),
});
export type CreditsRedemption = z.infer<typeof CreditsRedemptionSchema>;

export const CreateProjectInputSchema = z.object({
	name: z.string().min(1).max(100),
	slug: z
		.string()
		.regex(/^[a-z0-9-]+$/)
		.optional(),
	description: z.string().max(500).optional(),
	eventDate: z.string().optional(),
	status: ProjectStatusSchema.optional(),
});
export type CreateProjectInput = z.infer<typeof CreateProjectInputSchema>;

export const UpdateProjectInputSchema = CreateProjectInputSchema.partial();
export type UpdateProjectInput = z.infer<typeof UpdateProjectInputSchema>;

export const RedeemInputSchema = z.object({
	name: z.string().min(1).max(100),
	email: z.string().email(),
	projectId: z.string().min(1),
});
export type RedeemInput = z.infer<typeof RedeemInputSchema>;

export const ValidateInputSchema = z.object({
	step: z.enum(['name', 'email']),
	name: z.string().min(1).max(100),
	email: z.string().email().optional(),
	projectId: z.string().min(1),
});
export type ValidateInput = z.infer<typeof ValidateInputSchema>;

export const AdminAuthInputSchema = z.union([
	z.object({ password: z.string().min(1) }),
	z.object({ logout: z.literal(true) }),
]);

export type RedeemStep = 'name' | 'email' | 'ready' | 'claimed';

export type RedeemUiState =
	| { step: 'name'; name: string }
	| { step: 'email'; name: string; expectedEmail: string; email: string }
	| { step: 'ready'; name: string; email: string }
	| { step: 'claimed'; name: string; email: string; cursorUrl: string };

export type AttendeeSuggestion = {
	id: string;
	name: string;
	email: string;
	hasRedeemed: boolean;
};

export type ProjectSummary = CreditsProject & {
	totalCodes: number;
	totalAttendees: number;
	totalRedemptions: number;
};

export type DashboardData = {
	totalCodes: number;
	usedCodes: number;
	totalAttendees: number;
	totalRedemptions: number;
	recentRedemptions: Array<{
		id: string;
		attendeeName: string;
		email: string;
		timestamp: string;
		codeUrl: string;
	}>;
};

export type CodeListItem = {
	id: string;
	url: string;
	isUsed: boolean;
	redeemedBy?: string;
	redeemedAt?: string;
	email?: string;
};

export type AttendeeListItem = {
	id: string;
	name: string;
	email: string;
	hasRedeemed: boolean;
	redeemedAt?: string;
	codeUrl?: string;
};

export type AttendeeValidationResult = {
	isValid: boolean;
	attendeeId?: string;
	expectedEmail?: string;
	hasAlreadyRedeemed: boolean;
	error?: string;
};

export function generateProjectSlug(name: string): string {
	return name
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');
}

export class CreditsError extends Error {
	constructor(
		message: string,
		readonly status: number,
	) {
		super(message);
		this.name = 'CreditsError';
	}
}
