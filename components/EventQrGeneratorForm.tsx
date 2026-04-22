'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { buildEventQrQuery, EVENT_QR_LIMITS, isAllowedLumaUrl } from '@/lib/eventQr';
import Link from 'next/link';

function FieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor: string }) {
	return (
		<label
			htmlFor={htmlFor}
			className="mb-1.5 block text-left text-sm font-medium text-cursor-text-secondary"
		>
			{children}
		</label>
	);
}

export function EventQrGeneratorForm() {
	const router = useRouter();
	const [city, setCity] = useState('');
	const [event, setEvent] = useState('');
	const [luma, setLuma] = useState('');
	const [error, setError] = useState<string | null>(null);

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		const c = city.slice(0, EVENT_QR_LIMITS.city).trim();
		const ev = event.slice(0, EVENT_QR_LIMITS.event).trim();
		const l = luma.trim();
		if (c.length === 0) {
			setError('Please enter a city (or place) name.');
			return;
		}
		if (ev.length === 0) {
			setError('Please enter an event type.');
			return;
		}
		if (l.length === 0) {
			setError('Please enter a Luma registration link.');
			return;
		}
		if (!isAllowedLumaUrl(l)) {
			setError('Luma link must be a valid https:// URL on luma.com or lu.ma.');
			return;
		}
		setError(null);
		const q = buildEventQrQuery({ city: c, event: ev, luma: l });
		router.push(`/event-qr?${q}`);
	}

	return (
		<main className="min-h-screen flex flex-col items-center justify-center px-6 py-16 bg-cursor-bg text-cursor-text">
			<div className="w-full max-w-md">
				<h1 className="font-cursor text-2xl font-semibold tracking-tight text-center mb-2">
					Event QR poster
				</h1>
				<p className="text-sm text-cursor-text-muted text-center mb-8">
					Enter your event details to generate a shareable QR code for Luma registration.
				</p>
				<form onSubmit={handleSubmit} className="flex flex-col gap-4">
					<div>
						<FieldLabel htmlFor="event-qr-city">City</FieldLabel>
						<input
							id="event-qr-city"
							type="text"
							name="city"
							autoComplete="address-level2"
							maxLength={EVENT_QR_LIMITS.city}
							value={city}
							onChange={(e) => setCity(e.target.value)}
							placeholder="e.g. Salt Lake City"
							className="w-full rounded-md border border-cursor-border-emphasis bg-cursor-surface-raised px-3 py-2 text-sm text-cursor-text placeholder:text-cursor-text-faint focus:outline-none focus:ring-2 focus:ring-cursor-text-muted/30"
						/>
					</div>
					<div>
						<FieldLabel htmlFor="event-qr-type">Event type</FieldLabel>
						<input
							id="event-qr-type"
							type="text"
							name="event"
							maxLength={EVENT_QR_LIMITS.event}
							value={event}
							onChange={(e) => setEvent(e.target.value)}
							placeholder="e.g. Cafe Cursor"
							className="w-full rounded-md border border-cursor-border-emphasis bg-cursor-surface-raised px-3 py-2 text-sm text-cursor-text placeholder:text-cursor-text-faint focus:outline-none focus:ring-2 focus:ring-cursor-text-muted/30"
						/>
					</div>
					<div>
						<FieldLabel htmlFor="event-qr-luma">Luma link</FieldLabel>
						<input
							id="event-qr-luma"
							type="url"
							name="luma"
							value={luma}
							onChange={(e) => setLuma(e.target.value)}
							placeholder="https://luma.com/... or https://lu.ma/..."
							className="w-full rounded-md border border-cursor-border-emphasis bg-cursor-surface-raised px-3 py-2 text-sm text-cursor-text placeholder:text-cursor-text-faint focus:outline-none focus:ring-2 focus:ring-cursor-text-muted/30"
						/>
					</div>
					{error ? (
						<p className="text-sm text-red-400/90" role="alert">
							{error}
						</p>
					) : null}
					<button
						type="submit"
						className="mt-2 inline-flex h-10 w-full items-center justify-center rounded-md border border-cursor-border-emphasis bg-cursor-surface-raised px-4 text-sm font-medium text-cursor-text transition-colors hover:bg-cursor-overlay"
					>
						Generate poster
					</button>
				</form>
				<Link
					href="/"
					className="mt-10 block text-center text-sm text-cursor-text-muted transition-colors hover:text-cursor-text"
				>
					Back to home
				</Link>
			</div>
		</main>
	);
}
