'use client';

import { useEffect, useMemo, useState } from 'react';
import { FilterChip } from '@/components/credits/FilterChip';
import { cardClass } from '@/components/credits/chrome';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
		return <p className="text-sm text-muted-foreground">Loading attendees...</p>;
	}

	if (error) {
		return (
			<Card>
				<CardContent>
					<p className="text-destructive">{error}</p>
					<Button type="button" variant="outline" className="mt-4" onClick={load}>
						Try Again
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold tracking-tight">Attendee Management</h1>
				<Button
					type="button"
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
				</Button>
			</div>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
				<MiniStat label="Redeemed Credits" value={redeemedCount} />
				<MiniStat label="Pending Redemption" value={attendees.length - redeemedCount} />
				<MiniStat label="Total Attendees" value={attendees.length} />
			</div>

			<Card>
				<CardContent className="space-y-4">
					<div className="flex flex-wrap gap-2">
						<FilterChip selected={filter === 'all'} onClick={() => setFilter('all')}>
							All ({attendees.length})
						</FilterChip>
						<FilterChip selected={filter === 'pending'} onClick={() => setFilter('pending')}>
							Pending ({attendees.length - redeemedCount})
						</FilterChip>
						<FilterChip selected={filter === 'redeemed'} onClick={() => setFilter('redeemed')}>
							Redeemed ({redeemedCount})
						</FilterChip>
					</div>
					<Input
						className="max-w-sm"
						placeholder="Search by name or email..."
						value={search}
						onChange={(event) => setSearch(event.target.value)}
					/>
				</CardContent>
			</Card>

			<Card>
				<CardContent>
					<h2 className="font-heading font-semibold tracking-tight">Attendees ({filtered.length})</h2>
					<div className="mt-4 space-y-3">
						{filtered.map((attendee) => (
							<div key={attendee.id} className="rounded-lg border bg-background p-4">
								<div className="flex items-start justify-between gap-4">
									<div>
										<p className="font-medium">{attendee.name}</p>
										<p className="text-sm text-muted-foreground">{attendee.email}</p>
										{attendee.hasRedeemed && attendee.redeemedAt ? (
											<p className="mt-2 text-sm text-emerald-400">
												Redeemed on {new Date(attendee.redeemedAt).toLocaleString()}
											</p>
										) : null}
									</div>
									<Badge variant={attendee.hasRedeemed ? 'success' : 'warning'}>
										{attendee.hasRedeemed ? 'Redeemed' : 'Pending'}
									</Badge>
								</div>
							</div>
						))}
						{filtered.length === 0 ? (
							<p className="py-6 text-center text-sm text-muted-foreground">No attendees found.</p>
						) : null}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

function MiniStat({ label, value }: { label: string; value: number }) {
	return (
		<div className={cardClass}>
			<p className="text-2xl font-semibold tracking-tight">{value}</p>
			<p className="text-sm text-muted-foreground">{label}</p>
		</div>
	);
}
