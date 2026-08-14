'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { btnClass, btnPrimaryClass, cardClass, fieldClass, labelClass } from '@/components/credits/chrome';
import { generateProjectSlug, type ProjectSummary } from '@/lib/credits/model';
import { clearSelectedProject, setSelectedProject } from '@/lib/credits/session';

export default function CreditsAdminProjectsPage() {
	const router = useRouter();
	const [projects, setProjects] = useState<ProjectSummary[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [creating, setCreating] = useState(false);
	const [saving, setSaving] = useState(false);
	const [form, setForm] = useState({ name: '', description: '', eventDate: '', slug: '' });
	const [pendingDelete, setPendingDelete] = useState<ProjectSummary | null>(null);
	const [confirmText, setConfirmText] = useState('');

	useEffect(() => {
		let cancelled = false;
		setLoading(true);
		fetch('/api/credits/admin/projects')
			.then(async (response) => {
				if (response.status === 401) {
					router.replace('/credits/admin');
					return null;
				}
				return response.json();
			})
			.then((result) => {
				if (cancelled || !result) {
					return;
				}
				if (!result.success) {
					setError(result.error || 'Failed to load projects');
					return;
				}
				setProjects(result.data.projects);
				setError('');
			})
			.catch(() => {
				if (!cancelled) {
					setError('Failed to load projects');
				}
			})
			.finally(() => {
				if (!cancelled) {
					setLoading(false);
				}
			});
		return () => {
			cancelled = true;
		};
	}, [router]);

	const select = (project: ProjectSummary) => {
		setSelectedProject({ id: project.id, name: project.name, slug: project.slug });
		router.push('/credits/admin/dashboard');
	};

	const create = async () => {
		setSaving(true);
		setError('');
		try {
			const response = await fetch('/api/credits/admin/projects', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: form.name.trim(),
					description: form.description.trim() || undefined,
					eventDate: form.eventDate || undefined,
					slug: form.slug.trim(),
					status: 'active',
				}),
			});
			const result = await response.json();
			if (!result.success) {
				setError(result.error || 'Failed to create project');
				return;
			}
			setSelectedProject({ id: result.data.id, name: result.data.name, slug: result.data.slug });
			router.push('/credits/admin/dashboard');
		} catch {
			setError('Failed to create project');
		} finally {
			setSaving(false);
		}
	};

	const remove = async () => {
		if (!pendingDelete || confirmText !== 'DELETE') {
			return;
		}
		setSaving(true);
		try {
			const response = await fetch(`/api/credits/admin/projects/${pendingDelete.id}`, { method: 'DELETE' });
			const result = await response.json();
			if (!result.success) {
				setError(result.error || 'Failed to delete project');
				return;
			}
			setProjects((current) => current.filter((project) => project.id !== pendingDelete.id));
			setPendingDelete(null);
			setConfirmText('');
		} catch {
			setError('Failed to delete project');
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return <p className="p-8 text-sm text-cursor-text-muted">Loading projects...</p>;
	}

	return (
		<div className="mx-auto max-w-3xl px-6 py-10">
			<div className="mb-8 flex items-start justify-between gap-4">
				<div>
					<h1 className="text-2xl font-medium">Select Project</h1>
					<p className="mt-1 text-sm text-cursor-text-muted">Choose an event to manage, or create a new one.</p>
				</div>
				<button
					type="button"
					className={btnClass}
					onClick={async () => {
						await fetch('/api/credits/admin/auth', {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({ logout: true }),
						});
						clearSelectedProject();
						router.push('/credits/admin');
					}}
				>
					Logout
				</button>
			</div>

			{error ? (
				<p className="mb-6 rounded-md border border-cursor-accent-red/40 bg-cursor-accent-red-bg p-3 text-sm text-cursor-accent-red">
					{error}
				</p>
			) : null}

			<div className={`${cardClass} mb-6 border-dashed`}>
				{creating ? (
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h2 className="text-lg font-medium">New Project</h2>
							<button
								type="button"
								className={btnClass}
								onClick={() => {
									setCreating(false);
									setForm({ name: '', description: '', eventDate: '', slug: '' });
								}}
							>
								Cancel
							</button>
						</div>
						<div>
							<label className={labelClass} htmlFor="project-name">
								Project Name
							</label>
							<input
								id="project-name"
								className={fieldClass}
								value={form.name}
								onChange={(event) =>
									setForm((current) => ({
										...current,
										name: event.target.value,
										slug: current.slug || generateProjectSlug(event.target.value),
									}))
								}
							/>
						</div>
						<div>
							<label className={labelClass} htmlFor="project-slug">
								URL Slug
							</label>
							<input
								id="project-slug"
								className={fieldClass}
								value={form.slug}
								onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
							/>
						</div>
						<div>
							<label className={labelClass} htmlFor="project-description">
								Description
							</label>
							<input
								id="project-description"
								className={fieldClass}
								value={form.description}
								onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
							/>
						</div>
						<div>
							<label className={labelClass} htmlFor="project-date">
								Event Date
							</label>
							<input
								id="project-date"
								type="date"
								className={fieldClass}
								value={form.eventDate}
								onChange={(event) => setForm((current) => ({ ...current, eventDate: event.target.value }))}
							/>
						</div>
						<button
							type="button"
							className={`${btnPrimaryClass} w-full`}
							disabled={saving || !form.name.trim() || !form.slug.trim()}
							onClick={create}
						>
							{saving ? 'Creating...' : 'Create & Select Project'}
						</button>
					</div>
				) : (
					<div className="text-center">
						<h2 className="text-lg font-medium">Create New Project</h2>
						<p className="mt-1 text-sm text-cursor-text-muted">Start a new hackathon or event project</p>
						<button type="button" className={`${btnPrimaryClass} mt-4`} onClick={() => setCreating(true)}>
							Create Project
						</button>
					</div>
				)}
			</div>

			<div className="space-y-3">
				{projects.map((project) => (
					<div key={project.id} className={cardClass}>
						<div className="flex items-start justify-between gap-4">
							<button type="button" className="flex-1 text-left" onClick={() => select(project)}>
								<h3 className="font-medium">{project.name}</h3>
								{project.description ? <p className="mt-1 text-sm text-cursor-text-muted">{project.description}</p> : null}
								<p className="mt-2 text-sm text-cursor-text-faint">
									{project.totalCodes} codes · {project.totalAttendees} attendees · {project.totalRedemptions} redeemed
								</p>
							</button>
							<div className="flex items-center gap-2">
								<span className="text-xs uppercase tracking-wide text-cursor-text-muted">{project.status}</span>
								<button type="button" className={btnClass} onClick={() => setPendingDelete(project)}>
									Delete
								</button>
							</div>
						</div>
					</div>
				))}
			</div>

			{pendingDelete ? (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
					<div className={`${cardClass} w-full max-w-md`}>
						<h2 className="text-lg font-medium text-cursor-accent-red">Delete Project</h2>
						<p className="mt-2 text-sm text-cursor-text-muted">
							This cannot be undone. {pendingDelete.name} and all related codes, attendees, and redemptions will be
							removed.
						</p>
						<label className={`${labelClass} mt-4`} htmlFor="confirm-delete">
							Type DELETE to confirm
						</label>
						<input
							id="confirm-delete"
							className={fieldClass}
							value={confirmText}
							onChange={(event) => setConfirmText(event.target.value)}
							autoComplete="off"
						/>
						<div className="mt-4 flex gap-2">
							<button
								type="button"
								className={`${btnClass} flex-1`}
								onClick={() => {
									setPendingDelete(null);
									setConfirmText('');
								}}
							>
								Cancel
							</button>
							<button
								type="button"
								className={`${btnPrimaryClass} flex-1`}
								disabled={confirmText !== 'DELETE' || saving}
								onClick={remove}
							>
								{saving ? 'Deleting...' : 'Delete Project'}
							</button>
						</div>
					</div>
				</div>
			) : null}
		</div>
	);
}
