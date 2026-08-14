export type SelectedProject = {
	id: string;
	name: string;
	slug: string;
};

const KEY = 'credits_admin_project';

export function getSelectedProject(): SelectedProject | null {
	if (typeof window === 'undefined') {
		return null;
	}
	const raw = sessionStorage.getItem(KEY);
	if (!raw) {
		return null;
	}
	try {
		return JSON.parse(raw) as SelectedProject;
	} catch {
		sessionStorage.removeItem(KEY);
		return null;
	}
}

export function setSelectedProject(project: SelectedProject): void {
	sessionStorage.setItem(KEY, JSON.stringify(project));
}

export function clearSelectedProject(): void {
	sessionStorage.removeItem(KEY);
}

export function maskEmail(email: string): string {
	if (!email || email.length < 3) {
		return email;
	}

	const [localPart, domain] = email.split('@');
	if (!localPart || !domain) {
		return email;
	}

	const maskedLocal = `${localPart[0]}${'*'.repeat(Math.max(6, localPart.length - 1))}`;
	const tld = domain.split('.').pop() ?? '';
	return `${maskedLocal}@${'*'.repeat(6)}.${tld}`;
}
