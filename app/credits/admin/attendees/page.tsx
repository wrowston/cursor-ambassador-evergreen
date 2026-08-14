'use client';

import { useEffect, useMemo, useState } from 'react';
import { btnClass, btnPrimaryClass, cardClass, fieldClass } from '@/components/credits/chrome';
import { getSelectedProject } from '@/lib/credits/session';
import type { AttendeeListItem } from '@/lib/credits/model';

export default function CreditsAdminAttendeesPage() {
	const [attendees, setAttendees] = useState<AttendeeListItem[]>([]);
	const [filter, setFilter] = useState<'all' | 'redeemed' | 'pending'>('all');
	const [search, setSearch] = useState('');
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
			const response = await fetch(`/api/credits/admin/attendees?projectId=${project.id}`);
			if (!response.ok) {
				throw new Error('failed');
			}
			const data = await response.json();
			setAttendees(data.attendees);
			setError('');
		} catch {
			setError('Failed to load attendees');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		load();
	}, []);

	const filtered = useMemo(() => {
		return attendees.filter((attendee) => {
			if (filter === 'redeemed' && !attendee.hasRedeemed) return false;
			if (filter === 'pending' && attendee.hasRedeemed) return false;
			if (!search) return true;
			const term = search.toLowerCase();
			return attendee.name.toLowerCase().includes(term) || attendee.email.toLowerCase().includes(term);
		});
	}, [attendees, filter, search]);

	const redeemedCount = attendees.filter((attendee) => attendee.hasRedeemed).length;

	if (loading) {
		return <p className="text-sm text-cursor-text-muted">Loading attendees...</p>;
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
				<h1 className="text-2xl font-medium">Attendee Management</h1>
				<button
					type="button"
					className={btnPrimaryClass}
					onClick={() => {
						const rows = [
							['Name', 'Email', 'Status', 'Redeemed At', 'Code URL'],
							...filtered.map((attendee) => [
								attendee.name,
								attendee.email,
								attendee.hasRedeemed ? 'Redeemed' : 'Pending',
								attendee.redeemedAt ? new Date(attendee.redeemedAt).toLocaleString() : '',
								attendee.codeUrl || '',
							]),
						];
						const csv = rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
						const blob = new Blob([csv], { type: 'text/csv' });
						const url = URL.createObjectURL(blob);
						const link = document.createElement('a');
						link.href = url;
						link.download = `attendees-${filter}.csv`;
						link.click();
						URL.revokeObjectURL(url);
					}}
				>
					Export
				</button>
			</div>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
				<MiniStat label="Redeemed Credits" value={redeemedCount} />
				<MiniStat label="Pending Redemption" value={attendees.length - redeemedCount} />
				<MiniStat label="Total Attendees" value={attendees.length} />
			</div>

			<div className={cardClass}>
				<div className="flex flex-wrap gap-2">
					{(
						[
							['all', `All (${attendees.length})`],
							['pending', `Pending (${attendees.length - redeemedCount})`],
							['redeemed', `Redeemed (${redeemedCount})`],
						] as const
					).map(([key, label]) => (
						<button
							key={key}
							type="button"
							onClick={() => setFilter(key)}
							className={filter === key ? btnPrimaryClass : btnClass}
						>
							{label}
						</button>
					))}
				</div>
				<input
					className={`${fieldClass} mt-4 max-w-sm`}
					placeholder="Search by name or email..."
					value={search}
					onChange={(event) => setSearch(event.target.value)}
				/>
			</div>

			<div className={cardClass}>
				<h2 className="font-medium">Attendees ({filtered.length})</h2>
				<div className="mt-4 space-y-3">
					{filtered.map((attendee) => (
						<div key={attendee.id} className="rounded-md border border-cursor-border bg-cursor-bg p-4">
							<div className="flex items-start justify-between gap-4">
								<div>
									<p className="font-medium">{attendee.name}</p>
									<p className="text-sm text-cursor-text-muted">{attendee.email}</p>
									{attendee.hasRedeemed && attendee.redeemedAt ? (
										<p className="mt-2 text-sm text-cursor-accent-green">
											Redeemed on {new Date(attendee.redeemedAt).toLocaleString()}
										</p>
									) : null}
								</div>
								<span className="text-xs uppercase tracking-wide text-cursor-text-muted">
									{attendee.hasRedeemed ? 'Redeemed' : 'Pending'}
								</span>
							</div>
						</div>
					))}
					{filtered.length === 0 ? (
						<p className="py-6 text-center text-sm text-cursor-text-muted">No attendees found.</p>
					) : null}
				</div>
			</div>
		</div>
	);
}

function MiniStat({ label, value }: { label: string; value: number }) {
	return (
		<div className={cardClass}>
			<p className="text-2xl font-medium">{value}</p>
			<p className="text-sm text-cursor-text-muted">{label}</p>
		</div>
	);
}
