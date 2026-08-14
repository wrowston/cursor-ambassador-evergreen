import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { ATTENDEES, CODES, PROJECTS, REDEMPTIONS, getAdminDb, projectFromDoc } from './admin';
import {
	CreditsError,
	type AttendeeSuggestion,
	type AttendeeValidationResult,
	type CreditsProject,
	type RedeemInput,
	type ValidateInput,
} from './model';

export async function uploadCodes(
	projectId: string,
	rows: Array<{ code: string; cursorUrl: string }>,
): Promise<{ totalProcessed: number; newCodes: number; duplicatesSkipped: number }> {
	const firestore = getAdminDb();
	const existing = await firestore.collection(CODES).where('projectId', '==', projectId).get();
	const seen = new Set(existing.docs.map((doc) => doc.data().code));
	const fresh = rows.filter((row) => !seen.has(row.code));

	if (fresh.length === 0) {
		throw new CreditsError('All codes already exist in the database', 400);
	}

	for (let i = 0; i < fresh.length; i += 400) {
		const batch = firestore.batch();
		for (const row of fresh.slice(i, i + 400)) {
			const ref = firestore.collection(CODES).doc();
			batch.set(ref, {
				projectId,
				code: row.code,
				cursorUrl: row.cursorUrl,
				isRedeemed: false,
				createdAt: FieldValue.serverTimestamp(),
			});
		}
		await batch.commit();
	}

	return {
		totalProcessed: rows.length,
		newCodes: fresh.length,
		duplicatesSkipped: rows.length - fresh.length,
	};
}

export async function uploadAttendees(
	projectId: string,
	rows: Array<{ name: string; email: string }>,
): Promise<{ totalProcessed: number; newAttendees: number; duplicatesSkipped: number }> {
	const firestore = getAdminDb();
	const existing = await firestore.collection(ATTENDEES).where('projectId', '==', projectId).get();
	const seen = new Set(existing.docs.map((doc) => String(doc.data().email).toLowerCase()));
	const fresh = rows.filter((row) => !seen.has(row.email.toLowerCase()));

	if (fresh.length === 0) {
		throw new CreditsError('All attendees already exist in the database', 400);
	}

	for (let i = 0; i < fresh.length; i += 400) {
		const batch = firestore.batch();
		for (const row of fresh.slice(i, i + 400)) {
			const ref = firestore.collection(ATTENDEES).doc();
			batch.set(ref, {
				projectId,
				name: row.name,
				email: row.email.toLowerCase().trim(),
				createdAt: FieldValue.serverTimestamp(),
			});
		}
		await batch.commit();
	}

	return {
		totalProcessed: rows.length,
		newAttendees: fresh.length,
		duplicatesSkipped: rows.length - fresh.length,
	};
}

export async function getPublicProjectBySlug(slug: string): Promise<CreditsProject> {
	const snapshot = await getAdminDb()
		.collection(PROJECTS)
		.where('slug', '==', slug)
		.where('status', '==', 'active')
		.limit(1)
		.get();

	if (snapshot.empty) {
		throw new CreditsError('Project not found or not active', 404);
	}

	return projectFromDoc(snapshot.docs[0].id, snapshot.docs[0].data());
}

export async function listPublicAttendees(projectId: string): Promise<AttendeeSuggestion[]> {
	const snapshot = await getAdminDb().collection(ATTENDEES).where('projectId', '==', projectId).get();

	return snapshot.docs
		.map((doc) => {
			const data = doc.data();
			return {
				id: doc.id,
				name: data.name,
				email: data.email,
				hasRedeemed: Boolean(data.redeemedAt),
			};
		})
		.filter((attendee) => attendee.name && attendee.email);
}

export async function validateAttendee(input: ValidateInput): Promise<AttendeeValidationResult> {
	const firestore = getAdminDb();
	const name = input.name.trim();

	if (input.step === 'name') {
		const snapshot = await firestore
			.collection(ATTENDEES)
			.where('projectId', '==', input.projectId)
			.where('name', '==', name)
			.limit(1)
			.get();

		if (snapshot.empty) {
			return {
				isValid: false,
				hasAlreadyRedeemed: false,
				error: 'Name not found in attendee list. Please check the spelling or contact an organizer.',
			};
		}

		const doc = snapshot.docs[0];
		const data = doc.data();
		const hasAlreadyRedeemed = Boolean(data.redeemedAt);
		return {
			isValid: true,
			attendeeId: doc.id,
			expectedEmail: data.email,
			hasAlreadyRedeemed,
			error: hasAlreadyRedeemed ? 'You have already redeemed a code for this event.' : undefined,
		};
	}

	const email = input.email?.toLowerCase().trim();
	if (!email) {
		return { isValid: false, hasAlreadyRedeemed: false, error: 'Email is required' };
	}

	const snapshot = await firestore
		.collection(ATTENDEES)
		.where('projectId', '==', input.projectId)
		.where('name', '==', name)
		.where('email', '==', email)
		.limit(1)
		.get();

	if (snapshot.empty) {
		return {
			isValid: false,
			hasAlreadyRedeemed: false,
			error: 'Email does not match the expected address for this name.',
		};
	}

	const doc = snapshot.docs[0];
	const hasAlreadyRedeemed = Boolean(doc.data().redeemedAt);
	return {
		isValid: true,
		attendeeId: doc.id,
		hasAlreadyRedeemed,
		error: hasAlreadyRedeemed ? 'You have already redeemed a code for this event.' : undefined,
	};
}

export async function redeemCode(input: RedeemInput): Promise<{
	code: string;
	cursorUrl: string;
	name: string;
	email: string;
	redemptionId: string;
}> {
	const firestore = getAdminDb();
	const name = input.name.trim();
	const email = input.email.toLowerCase().trim();

	return firestore.runTransaction(async (tx) => {
		const attendeeSnap = await tx.get(
			firestore
				.collection(ATTENDEES)
				.where('projectId', '==', input.projectId)
				.where('name', '==', name)
				.where('email', '==', email)
				.limit(1),
		);

		if (attendeeSnap.empty) {
			throw new CreditsError('Attendee not found. Please validate your information first.', 404);
		}

		const attendeeDoc = attendeeSnap.docs[0];
		if (attendeeDoc.data().redeemedAt) {
			throw new CreditsError('You have already redeemed a code. Each attendee can only redeem one code.', 400);
		}

		const codeSnap = await tx.get(
			firestore
				.collection(CODES)
				.where('projectId', '==', input.projectId)
				.where('isRedeemed', '==', false)
				.limit(1),
		);

		if (codeSnap.empty) {
			throw new CreditsError('All codes have been redeemed. Please contact an administrator for more codes.', 503);
		}

		const codeDoc = codeSnap.docs[0];
		const codeData = codeDoc.data();
		const now = Timestamp.now();
		const redemptionRef = firestore.collection(REDEMPTIONS).doc();

		tx.update(codeDoc.ref, { isRedeemed: true, redeemedAt: now });
		tx.update(attendeeDoc.ref, { redeemedAt: now });
		tx.set(redemptionRef, {
			projectId: input.projectId,
			attendeeName: name,
			attendeeEmail: email,
			code: codeData.code,
			cursorUrl: codeData.cursorUrl,
			redeemedAt: now,
		});

		return {
			code: codeData.code,
			cursorUrl: codeData.cursorUrl,
			name,
			email,
			redemptionId: redemptionRef.id,
		};
	});
}
