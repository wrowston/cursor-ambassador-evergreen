'use client';

import { useEffect, useMemo, useState } from 'react';
import { Copy, ExternalLink } from 'lucide-react';
import { FilterChip } from '@/components/credits/FilterChip';
import { cardClass } from '@/components/credits/chrome';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
		return <p className="text-sm text-muted-foreground">Loading codes...</p>;
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
				<h1 className="text-2xl font-semibold tracking-tight">Code Management</h1>
				<Button
					type="button"
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
				</Button>
			</div>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
				<MiniStat label="Available Codes" value={codes.length - usedCount} />
				<MiniStat label="Redeemed Codes" value={usedCount} />
				<MiniStat label="Total Codes" value={codes.length} />
			</div>

			<Card>
				<CardContent className="space-y-4">
					<div className="flex flex-wrap gap-2">
						<FilterChip selected={filter === 'all'} onClick={() => setFilter('all')}>
							All ({codes.length})
						</FilterChip>
						<FilterChip selected={filter === 'unused'} onClick={() => setFilter('unused')}>
							Available ({codes.length - usedCount})
						</FilterChip>
						<FilterChip selected={filter === 'used'} onClick={() => setFilter('used')}>
							Redeemed ({usedCount})
						</FilterChip>
					</div>
					<Input
						className="max-w-sm"
						placeholder="Search codes or redeemed by..."
						value={search}
						onChange={(event) => setSearch(event.target.value)}
					/>
				</CardContent>
			</Card>

			<Card>
				<CardContent>
					<h2 className="font-heading font-semibold tracking-tight">Codes ({filtered.length})</h2>
					<div className="mt-4 space-y-2">
						{filtered.map((code) => (
							<CodeRow key={code.id} code={code} />
						))}
						{filtered.length === 0 ? (
							<p className="py-6 text-center text-sm text-muted-foreground">No codes found.</p>
						) : null}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

function CodeRow({ code }: { code: CodeListItem }) {
	const [copied, setCopied] = useState(false);

	const copy = async () => {
		await navigator.clipboard.writeText(code.url);
		setCopied(true);
		window.setTimeout(() => setCopied(false), 1200);
	};

	return (
		<div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-background p-3">
			<div className="flex min-w-0 items-center gap-2">
				<Button type="button" variant="outline" size="sm" onClick={copy} className="max-w-full">
					<span className="max-w-[42ch] truncate font-mono">{code.url}</span>
					<Copy data-icon="inline-end" />
				</Button>
				<Button variant="ghost" size="icon-sm" asChild>
					<a href={code.url} target="_blank" rel="noopener noreferrer" aria-label="Open referral link">
						<ExternalLink />
					</a>
				</Button>
			</div>
			<div className="flex flex-wrap items-center gap-2">
				<Badge variant={code.isUsed ? 'secondary' : 'success'}>{code.isUsed ? 'Redeemed' : 'Available'}</Badge>
				{code.redeemedBy ? <Badge variant="outline">{code.redeemedBy}</Badge> : null}
				{copied ? <span className="text-xs text-muted-foreground">Copied</span> : null}
			</div>
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
