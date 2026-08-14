'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { clearSelectedProject, getSelectedProject, type SelectedProject } from '@/lib/credits/session';

const NAV = [
	{ href: '/credits/admin/dashboard', label: 'Dashboard' },
	{ href: '/credits/admin/codes', label: 'Codes' },
	{ href: '/credits/admin/attendees', label: 'Attendees' },
	{ href: '/credits/admin/uploads', label: 'Upload Data' },
] as const;

export default function CreditsAdminLayout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const router = useRouter();
	const [ready, setReady] = useState(false);
	const [authed, setAuthed] = useState(false);
	const [project, setProject] = useState<SelectedProject | null>(null);

	useEffect(() => {
		const selected = getSelectedProject();
		setProject(selected);

		if (pathname === '/credits/admin') {
			setReady(true);
			return;
		}

		fetch('/api/credits/admin/projects')
			.then((response) => {
				if (response.status === 401) {
					router.replace('/credits/admin');
					return;
				}
				setAuthed(true);
				if (!selected && pathname !== '/credits/admin/projects') {
					router.replace('/credits/admin/projects');
				}
			})
			.catch(() => router.replace('/credits/admin'))
			.finally(() => setReady(true));
	}, [pathname, router]);

	const logout = async () => {
		await fetch('/api/credits/admin/auth', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ logout: true }),
		});
		clearSelectedProject();
		router.push('/credits/admin');
	};

	if (!ready) {
		return <p className="p-8 text-sm text-muted-foreground">Loading...</p>;
	}

	if (pathname === '/credits/admin' || pathname === '/credits/admin/projects') {
		return children;
	}

	if (!authed || !project) {
		return children;
	}

	return (
		<div>
			<header className="border-b">
				<div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
					<div>
						<h1 className="text-lg font-semibold tracking-tight">Cursor Credits Admin</h1>
						<p className="text-sm text-muted-foreground">{project.name}</p>
					</div>
					<div className="flex flex-wrap gap-2">
						<Button variant="outline" size="sm" asChild>
							<Link href="/credits/admin/projects">Switch Project</Link>
						</Button>
						<Button variant="outline" size="sm" asChild>
							<Link href={`/credits/event/${project.slug}/redeem`}>View Public Site</Link>
						</Button>
						<Button type="button" variant="outline" size="sm" onClick={logout}>
							Logout
						</Button>
					</div>
				</div>
			</header>
			<nav className="border-b">
				<div className="mx-auto flex max-w-5xl gap-6 px-6">
					{NAV.map((item) => (
						<Link
							key={item.href}
							href={item.href}
							className={`border-b-2 py-3 text-sm ${
								pathname === item.href
									? 'border-foreground text-foreground'
									: 'border-transparent text-muted-foreground hover:text-foreground'
							}`}
						>
							{item.label}
						</Link>
					))}
				</div>
			</nav>
			<main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
		</div>
	);
}
