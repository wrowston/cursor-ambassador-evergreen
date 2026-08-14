'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { btnClass, btnPrimaryClass, cardClass } from '@/components/credits/chrome';
import { getSelectedProject } from '@/lib/credits/session';
import type { DashboardData } from '@/lib/credits/model';

export default function CreditsAdminDashboardPage() {
	const [stats, setStats] = useState<DashboardData | null>(null);
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(true);

	const load = async () => {
		const project = getSelectedProject();
		if (!project) {
			setError('No project selected');
			setLoading(false);
			return;
		}
		try {
			const response = await fetch(`/api/credits/admin/dashboard?projectId=${project.id}`);
			if (!response.ok) {
				throw new Error('Failed to fetch data');
			}
			setStats(await response.json());
			setError('');
		} catch {
			setError('Failed to load dashboard data');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		load();
		const timer = setInterval(load, 30000);
		return () => clearInterval(timer);
	}, []);

	if (loading) {
		return <p className="text-sm text-cursor-text-muted">Loading dashboard...</p>;
	}

	if (error) {
		return (
			<div className={cardClass}>
				<p className="text-cursor-accent-red">{error}</p>
				<button type="button" className={`${btnClass} mt-4`} onClick={load}>
					Try Again
				</button>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-medium">Dashboard</h1>
				<div className="flex gap-2">
					<Link href="/credits/admin/uploads" className={btnClass}>
						Upload Data
					</Link>
					<button type="button" className={btnPrimaryClass} onClick={load}>
						Refresh
					</button>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
				<Stat title="Total Codes" value={stats?.totalCodes ?? 0} detail="Available for redemption" />
				<Stat title="Total Attendees" value={stats?.totalAttendees ?? 0} detail="Registered for event" />
				<Stat
					title="Redemptions"
					value={stats?.totalRedemptions ?? 0}
					detail={`${stats?.totalRedemptions ?? 0} of ${stats?.totalCodes ?? 0} codes redeemed`}
				/>
			</div>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				<div className={cardClass}>
					<h2 className="font-medium">Recent Redemptions</h2>
					<p className="mt-1 text-sm text-cursor-text-muted">Latest code claims</p>
					{stats?.recentRedemptions.length ? (
						<div className="mt-4 space-y-3">
							{stats.recentRedemptions.slice(0, 5).map((item) => (
								<div key={item.id} className="rounded-md border border-cursor-border bg-cursor-bg p-3">
									<p className="text-sm font-medium">{item.attendeeName}</p>
									<p className="text-xs text-cursor-text-muted">{item.email}</p>
									<p className="text-xs text-cursor-text-faint">{new Date(item.timestamp).toLocaleString()}</p>
								</div>
							))}
						</div>
					) : (
						<p className="py-8 text-center text-sm text-cursor-text-muted">No redemptions yet</p>
					)}
				</div>
				<div className={cardClass}>
					<h2 className="font-medium">Quick Actions</h2>
					<div className="mt-4 space-y-2">
						<Link href="/credits/admin/uploads" className={`${btnClass} w-full`}>
							Upload New Codes
						</Link>
						<Link href="/credits/admin/uploads" className={`${btnClass} w-full`}>
							Upload Attendee List
						</Link>
						<Link href="/credits/admin/codes" className={`${btnClass} w-full`}>
							View All Codes
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}

function Stat({ title, value, detail }: { title: string; value: number; detail: string }) {
	return (
		<div className={cardClass}>
			<p className="text-sm text-cursor-text-muted">{title}</p>
			<p className="mt-2 text-2xl font-medium">{value.toLocaleString()}</p>
			<p className="mt-1 text-xs text-cursor-text-faint">{detail}</p>
		</div>
	);
}
