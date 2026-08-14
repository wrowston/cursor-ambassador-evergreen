'use client';

import { useState } from 'react';
import { btnClass, cardClass } from '@/components/credits/chrome';
import { getSelectedProject } from '@/lib/credits/session';

type UploadResult = {
	type: 'codes' | 'attendees';
	success: boolean;
	message: string;
	details?: unknown;
};

export default function CreditsAdminUploadsPage() {
	const [uploading, setUploading] = useState(false);
	const [result, setResult] = useState<UploadResult | null>(null);

	const upload = async (file: File, type: 'codes' | 'attendees') => {
		setUploading(true);
		setResult(null);
		const project = getSelectedProject();
		if (!project) {
			setResult({ type, success: false, message: 'No project selected. Please select a project first.' });
			setUploading(false);
			return;
		}

		try {
			const formData = new FormData();
			formData.append('file', file);
			formData.append('type', type);
			formData.append('projectId', project.id);
			const response = await fetch('/api/credits/admin/upload', { method: 'POST', body: formData });
			const payload = await response.json();
			setResult({
				type,
				success: Boolean(payload.success),
				message: payload.message || payload.error || 'Upload failed',
				details: payload.details,
			});
		} catch {
			setResult({ type, success: false, message: 'Upload failed. Please try again.' });
		} finally {
			setUploading(false);
		}
	};

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-medium">Upload Data</h1>
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				<UploadCard
					title="Upload Codes"
					description="CSV of cursor.com referral URLs"
					hint="Each line: https://cursor.com/referral?code=ABCD1234,Creator,Date"
					disabled={uploading}
					onFile={(file) => upload(file, 'codes')}
				/>
				<UploadCard
					title="Upload Attendees"
					description="Luma export with name, email, and approval_status"
					hint="Only approved rows with name and email are imported"
					disabled={uploading}
					onFile={(file) => upload(file, 'attendees')}
				/>
			</div>
			{result ? (
				<div className={cardClass}>
					<p className={result.success ? 'text-cursor-accent-green' : 'text-cursor-accent-red'}>{result.message}</p>
					{result.details ? (
						<pre className="mt-3 overflow-auto text-xs text-cursor-text-muted">{JSON.stringify(result.details, null, 2)}</pre>
					) : null}
				</div>
			) : null}
		</div>
	);
}

function UploadCard({
	title,
	description,
	hint,
	disabled,
	onFile,
}: {
	title: string;
	description: string;
	hint: string;
	disabled: boolean;
	onFile: (file: File) => void;
}) {
	return (
		<div className={cardClass}>
			<h2 className="font-medium">{title}</h2>
			<p className="mt-1 text-sm text-cursor-text-muted">{description}</p>
			<label className={`${btnClass} mt-4 w-full cursor-pointer ${disabled ? 'opacity-50' : ''}`}>
				{disabled ? 'Uploading...' : 'Choose CSV'}
				<input
					type="file"
					accept=".csv"
					disabled={disabled}
					className="hidden"
					onChange={(event) => {
						const file = event.target.files?.[0];
						if (file) {
							onFile(file);
						}
						event.target.value = '';
					}}
				/>
			</label>
			<p className="mt-3 text-xs text-cursor-text-faint">{hint}</p>
		</div>
	);
}
