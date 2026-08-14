'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { CreditsPublicShell } from '@/components/credits/PublicShell';
import { RedemptionForm } from '@/components/credits/RedemptionForm';

type PublicProject = {
	id: string;
	name: string;
	slug: string;
};

export default function CreditsRedeemPage() {
	const params = useParams();
	const slug = String(params.slug ?? '');
	const [project, setProject] = useState<PublicProject | null>(null);
	const [loading, setLoading] = useState(true);
	const [notFound, setNotFound] = useState(false);

	useEffect(() => {
		if (!slug) {
			setNotFound(true);
			setLoading(false);
			return;
		}

		let cancelled = false;
		fetch(`/api/credits/public/projects/${encodeURIComponent(slug)}`)
			.then(async (response) => {
				if (!response.ok) {
					throw new Error('not found');
				}
				return response.json();
			})
			.then((result) => {
				if (!cancelled) {
					setProject(result.data);
				}
			})
			.catch(() => {
				if (!cancelled) {
					setNotFound(true);
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
	}, [slug]);

	return (
		<CreditsPublicShell>
			{loading ? (
				<p className="text-center text-sm text-cursor-text-muted">Loading event...</p>
			) : notFound || !project ? (
				<div className="text-center">
					<h1 className="text-2xl font-medium text-cursor-text">Event not found</h1>
					<p className="mt-2 text-cursor-text-muted">
						The event you&apos;re looking for is not available for code redemption.
					</p>
					<Link href="/" className="mt-4 inline-block text-sm text-cursor-text underline hover:text-cursor-text-muted">
						Return home
					</Link>
				</div>
			) : (
				<div>
					<div className="mb-8 text-center">
						<h1 className="text-2xl font-medium text-cursor-text">Claim Your Code</h1>
						<p className="mt-2 text-cursor-text-muted">{project.name}</p>
						<p className="mt-1 text-sm text-cursor-text-faint">Enter your details to receive your Cursor credits</p>
					</div>
					<RedemptionForm projectId={project.id} />
				</div>
			)}
		</CreditsPublicShell>
	);
}
