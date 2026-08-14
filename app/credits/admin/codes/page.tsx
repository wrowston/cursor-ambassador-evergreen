'use client';

import { useEffect, useMemo, useState } from 'react';
import { btnClass, btnPrimaryClass, cardClass, fieldClass } from '@/components/credits/chrome';
import { getSelectedProject } from '@/lib/credits/session';
import type { CodeListItem } from '@/lib/credits/model';

export default function CreditsAdminCodesPage() {
	const [codes, setCodes] = useState<CodeListItem[]>([]);
	const [filter, setFilter] = useState<'all' | 'used' | 'unused'>('all');
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
			const response = await fetch(`/api/credits/admin/codes?projectId=${project.id}`);
			if (!response.ok) {
				throw new Error('failed');
			}
			const data = await response.json();
			setCodes(data.codes);
			setError('');
		} catch {
			setError('Failed to load codes');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		load();
	}, []);

	const filtered = useMemo(() => {
		return codes.filter((code) => {
			if (filter === 'used' && !code.isUsed) return false;
			if (filter === 'unused' && code.isUsed) return false;
			if (!search) return true;
			const term = search.toLowerCase();
			return code.url.toLowerCase().includes(term) || (code.redeemedBy?.toLowerCase().includes(term) ?? false);
		});
	}, [codes, filter, search]);

	const usedCount = codes.filter((code) => code.isUsed).length;

	if (loading) {
		return <p className="text-sm text-cursor-text-muted">Loading codes...</p>;
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
				<h1 className="text-2xl font-medium">Code Management</h1>
				<button
					type="button"
					className={btnPrimaryClass}
					onClick={() => {
						const rows = [
							['Code URL', 'Status', 'Redeemed By', 'Redeemed At'],
							...filtered.map((code) => [
								code.url,
								code.isUsed ? 'Used' : 'Available',
								code.redeemedBy || '',
								code.redeemedAt ? new Date(code.redeemedAt).toLocaleString() : '',
							]),
						];
						downloadCsv(`codes-${filter}.csv`, rows);
					}}
				>
					Export
				</button>
			</div>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
				<MiniStat label="Available Codes" value={codes.length - usedCount} />
				<MiniStat label="Redeemed Codes" value={usedCount} />
				<MiniStat label="Total Codes" value={codes.length} />
			</div>

			<div className={cardClass}>
				<div className="flex flex-wrap gap-2">
					{(
						[
							['all', `All (${codes.length})`],
							['unused', `Available (${codes.length - usedCount})`],
							['used', `Redeemed (${usedCount})`],
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
					placeholder="Search codes or redeemed by..."
					value={search}
					onChange={(event) => setSearch(event.target.value)}
				/>
			</div>

			<div className={cardClass}>
				<h2 className="font-medium">Codes ({filtered.length})</h2>
				<div className="mt-4 space-y-2">
					{filtered.map((code) => (
						<div key={code.id} className="rounded-md border border-cursor-border bg-cursor-bg p-3">
							<a href={code.url} target="_blank" rel="noopener noreferrer" className="font-mono text-sm underline">
								{code.url}
							</a>
							<p className="mt-1 text-xs text-cursor-text-muted">
								{code.isUsed ? `Used${code.redeemedBy ? ` by ${code.redeemedBy}` : ''}` : 'Available'}
							</p>
						</div>
					))}
					{filtered.length === 0 ? <p className="py-6 text-center text-sm text-cursor-text-muted">No codes found.</p> : null}
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

function downloadCsv(filename: string, rows: string[][]) {
	const csv = rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
	const blob = new Blob([csv], { type: 'text/csv' });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	link.click();
	URL.revokeObjectURL(url);
}
