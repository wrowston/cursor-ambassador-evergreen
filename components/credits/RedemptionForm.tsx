'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AttendeeAutocomplete } from '@/components/credits/AttendeeAutocomplete';
import { btnClass, btnPrimaryClass, cardClass, fieldClass, labelClass } from '@/components/credits/chrome';
import { maskEmail } from '@/lib/credits/session';
import type { AttendeeSuggestion, AttendeeValidationResult, RedeemUiState } from '@/lib/credits/model';

type Props = {
	projectId: string;
};

export function RedemptionForm({ projectId }: Props) {
	const router = useRouter();
	const [state, setState] = useState<RedeemUiState>({ step: 'name', name: '' });
	const [selected, setSelected] = useState<AttendeeSuggestion | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const validate = async (body: Record<string, unknown>) => {
		const response = await fetch('/api/credits/attendees/validate', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body),
		});
		const result = await response.json();
		const data = result.data as AttendeeValidationResult | undefined;
		if (!result.success || !data?.isValid) {
			throw new Error(data?.error || result.error || 'Validation failed');
		}
		if (data.hasAlreadyRedeemed) {
			throw new Error('You have already redeemed a code. Each attendee can only redeem one code.');
		}
		return data;
	};

	const onNameContinue = async () => {
		if (!state.name.trim() || !selected) {
			setError(selected ? 'Please enter your name' : 'Please select your name from the suggestions');
			return;
		}
		setLoading(true);
		setError(null);
		try {
			const data = await validate({ step: 'name', name: state.name.trim(), projectId });
			setState({
				step: 'email',
				name: state.name.trim(),
				expectedEmail: data.expectedEmail || selected.email,
				email: '',
			});
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Validation failed');
		} finally {
			setLoading(false);
		}
	};

	const onEmailContinue = async () => {
		if (state.step !== 'email') {
			return;
		}
		if (!state.email.trim()) {
			setError('Please enter your email address');
			return;
		}
		if (state.email.toLowerCase().trim() !== state.expectedEmail.toLowerCase()) {
			setError('Email does not match the expected address. Please check and try again.');
			return;
		}
		setLoading(true);
		setError(null);
		try {
			await validate({
				step: 'email',
				name: state.name,
				email: state.email.toLowerCase().trim(),
				projectId,
			});
			setState({ step: 'ready', name: state.name, email: state.email.toLowerCase().trim() });
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Validation failed');
		} finally {
			setLoading(false);
		}
	};

	const onClaim = async () => {
		if (state.step !== 'ready') {
			return;
		}
		setLoading(true);
		setError(null);
		try {
			const response = await fetch('/api/credits/redeem', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: state.name, email: state.email, projectId }),
			});
			const result = await response.json();
			if (!result.success) {
				throw new Error(result.error || 'Failed to claim code');
			}
			setState({ step: 'claimed', name: state.name, email: state.email, cursorUrl: result.data.cursorUrl });
			const params = new URLSearchParams({
				cursorUrl: result.data.cursorUrl,
				name: result.data.name,
			});
			router.push(`/credits/success?${params.toString()}`);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Redemption failed');
		} finally {
			setLoading(false);
		}
	};

	const stepLabel =
		state.step === 'name'
			? 'Step 1: Enter your name'
			: state.step === 'email'
				? 'Step 2: Confirm your email'
				: state.step === 'ready'
					? 'Ready to claim your code'
					: 'Claimed';

	return (
		<div className={cardClass}>
			<h2 className="text-lg font-medium text-cursor-text">Attendee Information</h2>
			<p className="mt-1 text-sm text-cursor-text-muted">{stepLabel}</p>

			<div className="mt-6 space-y-6">
				<div>
					<AttendeeAutocomplete
						value={state.name}
						onChange={(name) => {
							setState({ step: 'name', name });
							setError(null);
						}}
						onAttendeeSelect={(attendee) => {
							setSelected(attendee);
							setError(null);
							if (attendee) {
								setState({ step: 'email', name: attendee.name, expectedEmail: attendee.email, email: '' });
							} else {
								setState({ step: 'name', name: state.name });
							}
						}}
						error={state.step === 'name' ? (error ?? undefined) : undefined}
						disabled={state.step !== 'name' || loading}
						projectId={projectId}
					/>
					{state.step === 'name' ? (
						<button type="button" onClick={onNameContinue} disabled={!selected || loading} className={`${btnPrimaryClass} mt-3 w-full`}>
							{loading ? 'Validating...' : 'Continue'}
						</button>
					) : null}
				</div>

				{state.step === 'email' || state.step === 'ready' ? (
					<div>
						<label htmlFor="email" className={labelClass}>
							Email Address
						</label>
						{state.step === 'email' ? (
							<p className="mb-2 text-sm text-cursor-text-muted">
								Please enter the email that matches:{' '}
								<span className="font-mono text-cursor-text">{maskEmail(state.expectedEmail)}</span>
							</p>
						) : null}
						<input
							id="email"
							type="email"
							autoComplete="email"
							placeholder="Enter your email address"
							value={state.email}
							disabled={state.step === 'ready' || loading}
							onChange={(event) => {
								if (state.step === 'email') {
									setState({ ...state, email: event.target.value });
									setError(null);
								}
							}}
							className={`${fieldClass} ${state.step === 'email' && error ? 'border-cursor-accent-red' : ''}`}
						/>
						<div className="mt-3 flex gap-2">
							<button
								type="button"
								onClick={() => {
									setState({ step: 'name', name: state.name });
									setSelected(null);
									setError(null);
								}}
								disabled={loading}
								className={`${btnClass} flex-1`}
							>
								Back
							</button>
							{state.step === 'email' ? (
								<button
									type="button"
									onClick={onEmailContinue}
									disabled={!state.email.trim() || loading}
									className={`${btnPrimaryClass} flex-1`}
								>
									{loading ? 'Validating...' : 'Verify Email'}
								</button>
							) : null}
						</div>
					</div>
				) : null}

				{state.step === 'ready' ? (
					<div className="space-y-4">
						<div className="rounded-md border border-cursor-accent-green/40 bg-cursor-accent-green-bg p-3 text-sm text-cursor-accent-green">
							Name and email verified. Ready to claim your Cursor code.
						</div>
						<button type="button" onClick={onClaim} disabled={loading} className={`${btnPrimaryClass} w-full py-3`}>
							{loading ? 'Claiming Code...' : 'Claim My Cursor Code'}
						</button>
					</div>
				) : null}

				{error && state.step !== 'name' ? (
					<div className="rounded-md border border-cursor-accent-red/40 bg-cursor-accent-red-bg p-3 text-sm text-cursor-accent-red">
						{error}
					</div>
				) : null}
			</div>
		</div>
	);
}
