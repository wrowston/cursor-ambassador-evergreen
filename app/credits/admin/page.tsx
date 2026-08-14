'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { btnPrimaryClass, cardClass, fieldClass, labelClass } from '@/components/credits/chrome';

export default function CreditsAdminLoginPage() {
	const router = useRouter();
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	const onSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		setLoading(true);
		setError('');

		try {
			const response = await fetch('/api/credits/admin/auth', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ password }),
			});
			const result = await response.json();
			if (!result.success) {
				setError(result.error || 'Invalid password');
				return;
			}
			router.push('/credits/admin/projects');
		} catch {
			setError('Authentication failed. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center px-4">
			<div className={`${cardClass} w-full max-w-md`}>
				<h1 className="text-xl font-medium">Admin Access</h1>
				<p className="mt-1 text-sm text-cursor-text-muted">Enter the admin password to access the dashboard</p>
				<form onSubmit={onSubmit} className="mt-6 space-y-4">
					<div>
						<label htmlFor="password" className={labelClass}>
							Password
						</label>
						<input
							id="password"
							type="password"
							value={password}
							onChange={(event) => setPassword(event.target.value)}
							placeholder="Enter admin password"
							required
							autoFocus
							className={fieldClass}
						/>
					</div>
					{error ? (
						<p className="rounded-md border border-cursor-accent-red/40 bg-cursor-accent-red-bg p-3 text-sm text-cursor-accent-red">
							{error}
						</p>
					) : null}
					<button type="submit" disabled={loading || !password.trim()} className={`${btnPrimaryClass} w-full`}>
						{loading ? 'Authenticating...' : 'Access Dashboard'}
					</button>
				</form>
			</div>
		</div>
	);
}
