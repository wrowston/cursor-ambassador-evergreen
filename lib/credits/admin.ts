import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { FieldValue, Timestamp, getFirestore, type DocumentData, type Firestore } from 'firebase-admin/firestore';
import {
	CreditsError,
	generateProjectSlug,
	type AttendeeListItem,
	type CodeListItem,
	type CreateProjectInput,
	type CreditsProject,
	type DashboardData,
	type ProjectSummary,
	type UpdateProjectInput,
} from './model';

export const PROJECTS = 'projects';
export const ATTENDEES = 'attendees';
export const CODES = 'codes';
export const REDEMPTIONS = 'redemptions';

let db: Firestore | undefined;

export function getAdminDb(): Firestore {
	if (db) {
		return db;
	}

	const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
	const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
	const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

	if (!projectId || !clientEmail || !privateKey) {
		throw new CreditsError('Firebase Admin is not configured', 500);
	}

	if (!getApps().length) {
		initializeApp({
			credential: cert({ projectId, clientEmail, privateKey }),
		});
	}

	db = getFirestore();
	return db;
}

function iso(value: unknown): string | undefined {
	if (!value) {
		return undefined;
	}
	if (value instanceof Timestamp) {
		return value.toDate().toISOString();
	}
	if (value instanceof Date) {
		return value.toISOString();
	}
	if (typeof value === 'string') {
		return value;
	}
	return undefined;
}

export function projectFromDoc(id: string, data: DocumentData): CreditsProject {
	return {
		id,
		name: data.name,
		slug: data.slug,
		description: data.description || undefined,
		eventDate: iso(data.eventDate),
		status: data.status || 'active',
	};
}

async function projectStats(firestore: Firestore, projectId: string) {
	const [codes, attendees, redemptions] = await Promise.all([
		firestore.collection(CODES).where('projectId', '==', projectId).count().get(),
		firestore.collection(ATTENDEES).where('projectId', '==', projectId).count().get(),
		firestore.collection(REDEMPTIONS).where('projectId', '==', projectId).count().get(),
	]);

	return {
		totalCodes: codes.data().count,
		totalAttendees: attendees.data().count,
		totalRedemptions: redemptions.data().count,
	};
}

export async function listProjects(): Promise<ProjectSummary[]> {
	const firestore = getAdminDb();
	const snapshot = await firestore.collection(PROJECTS).orderBy('createdAt', 'desc').get();

	return Promise.all(
		snapshot.docs.map(async (doc) => ({
			...projectFromDoc(doc.id, doc.data()),
			...(await projectStats(firestore, doc.id)),
		})),
	);
}

export async function createProject(input: CreateProjectInput): Promise<CreditsProject> {
	const firestore = getAdminDb();
	const slug = input.slug || generateProjectSlug(input.name);

	const existing = await firestore.collection(PROJECTS).where('slug', '==', slug).limit(1).get();
	if (!existing.empty) {
		throw new CreditsError('A project with this slug already exists', 400);
	}

	const now = FieldValue.serverTimestamp();
	const ref = await firestore.collection(PROJECTS).add({
		name: input.name,
		slug,
		description: input.description || '',
		status: input.status || 'active',
		eventDate: input.eventDate ? Timestamp.fromDate(new Date(input.eventDate)) : null,
		createdAt: now,
		updatedAt: now,
	});

	return {
		id: ref.id,
		name: input.name,
		slug,
		description: input.description,
		eventDate: input.eventDate,
		status: input.status || 'active',
	};
}

export async function getProject(id: string): Promise<CreditsProject> {
	const doc = await getAdminDb().collection(PROJECTS).doc(id).get();
	if (!doc.exists) {
		throw new CreditsError('Project not found', 404);
	}
	return projectFromDoc(doc.id, doc.data()!);
}

export async function updateProject(id: string, input: UpdateProjectInput): Promise<CreditsProject> {
	const firestore = getAdminDb();
	const ref = firestore.collection(PROJECTS).doc(id);
	const current = await ref.get();
	if (!current.exists) {
		throw new CreditsError('Project not found', 404);
	}

	if (input.slug) {
		const clash = await firestore.collection(PROJECTS).where('slug', '==', input.slug).limit(1).get();
		if (!clash.empty && clash.docs[0].id !== id) {
			throw new CreditsError('A project with this slug already exists', 400);
		}
	}

	const patch: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
	if (input.name !== undefined) patch.name = input.name;
	if (input.slug !== undefined) patch.slug = input.slug;
	if (input.description !== undefined) patch.description = input.description;
	if (input.status !== undefined) patch.status = input.status;
	if (input.eventDate !== undefined) {
		patch.eventDate = input.eventDate ? Timestamp.fromDate(new Date(input.eventDate)) : null;
	}

	await ref.update(patch);
	return getProject(id);
}

export async function deleteProject(id: string): Promise<{
	deletedCodes: number;
	deletedAttendees: number;
	deletedRedemptions: number;
}> {
	const firestore = getAdminDb();
	const project = await firestore.collection(PROJECTS).doc(id).get();
	if (!project.exists) {
		throw new CreditsError('Project not found', 404);
	}

	const [codes, attendees, redemptions] = await Promise.all([
		firestore.collection(CODES).where('projectId', '==', id).get(),
		firestore.collection(ATTENDEES).where('projectId', '==', id).get(),
		firestore.collection(REDEMPTIONS).where('projectId', '==', id).get(),
	]);

	const refs = [
		...codes.docs.map((doc) => doc.ref),
		...attendees.docs.map((doc) => doc.ref),
		...redemptions.docs.map((doc) => doc.ref),
		project.ref,
	];

	for (let i = 0; i < refs.length; i += 400) {
		const batch = firestore.batch();
		for (const ref of refs.slice(i, i + 400)) {
			batch.delete(ref);
		}
		await batch.commit();
	}

	return {
		deletedCodes: codes.size,
		deletedAttendees: attendees.size,
		deletedRedemptions: redemptions.size,
	};
}

export async function getDashboard(projectId: string): Promise<DashboardData> {
	const firestore = getAdminDb();
	const [codesSnap, attendeesSnap, redemptionsSnap] = await Promise.all([
		firestore.collection(CODES).where('projectId', '==', projectId).get(),
		firestore.collection(ATTENDEES).where('projectId', '==', projectId).get(),
		firestore.collection(REDEMPTIONS).where('projectId', '==', projectId).get(),
	]);

	const recentRedemptions = redemptionsSnap.docs
		.map((doc) => {
			const data = doc.data();
			return {
				id: doc.id,
				attendeeName: data.attendeeName || 'Unknown',
				email: data.attendeeEmail || 'Unknown',
				timestamp: iso(data.redeemedAt) || new Date().toISOString(),
				codeUrl: data.cursorUrl || 'N/A',
			};
		})
		.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

	const usedCodes = codesSnap.docs.filter((doc) => doc.data().isRedeemed).length;

	return {
		totalCodes: codesSnap.size,
		usedCodes,
		totalAttendees: attendeesSnap.size,
		totalRedemptions: redemptionsSnap.size,
		recentRedemptions,
	};
}

export async function listCodes(projectId: string): Promise<CodeListItem[]> {
	const firestore = getAdminDb();
	const [codesSnap, redemptionsSnap] = await Promise.all([
		firestore.collection(CODES).where('projectId', '==', projectId).get(),
		firestore.collection(REDEMPTIONS).where('projectId', '==', projectId).get(),
	]);

	const byUrl = new Map<string, { redeemedBy: string; redeemedAt?: string; email: string }>();
	for (const doc of redemptionsSnap.docs) {
		const data = doc.data();
		if (data.cursorUrl) {
			byUrl.set(data.cursorUrl, {
				redeemedBy: data.attendeeName,
				redeemedAt: iso(data.redeemedAt),
				email: data.attendeeEmail,
			});
		}
	}

	return codesSnap.docs
		.map((doc) => {
			const data = doc.data();
			const url = data.cursorUrl || '';
			const redemption = byUrl.get(url);
			return {
				id: doc.id,
				url,
				isUsed: Boolean(data.isRedeemed || redemption),
				redeemedBy: redemption?.redeemedBy,
				redeemedAt: redemption?.redeemedAt,
				email: redemption?.email,
			};
		})
		.filter((code) => code.url)
		.sort((a, b) => Number(a.isUsed) - Number(b.isUsed) || a.url.localeCompare(b.url));
}

export async function listAttendees(projectId: string): Promise<AttendeeListItem[]> {
	const firestore = getAdminDb();
	const [attendeesSnap, redemptionsSnap] = await Promise.all([
		firestore.collection(ATTENDEES).where('projectId', '==', projectId).get(),
		firestore.collection(REDEMPTIONS).where('projectId', '==', projectId).get(),
	]);

	const byKey = new Map<string, { redeemedAt?: string; codeUrl?: string }>();
	for (const doc of redemptionsSnap.docs) {
		const data = doc.data();
		byKey.set(`${data.attendeeName}-${data.attendeeEmail}`.toLowerCase(), {
			redeemedAt: iso(data.redeemedAt),
			codeUrl: data.cursorUrl,
		});
	}

	return attendeesSnap.docs
		.map((doc) => {
			const data = doc.data();
			const redemption = byKey.get(`${data.name}-${data.email}`.toLowerCase());
			const redeemedAt = iso(data.redeemedAt) || redemption?.redeemedAt;
			return {
				id: doc.id,
				name: data.name,
				email: data.email,
				hasRedeemed: Boolean(redeemedAt),
				redeemedAt,
				codeUrl: redemption?.codeUrl,
			};
		})
		.sort((a, b) => Number(a.hasRedeemed) - Number(b.hasRedeemed) || a.name.localeCompare(b.name));
}
