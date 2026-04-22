'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const EVENT_QR_PATH = '/event-qr';

type EventQrPrintHelperProps = {
	isLight: boolean;
};

function buildToggledHref(searchParams: URLSearchParams, isLight: boolean): string {
	const next = new URLSearchParams(searchParams.toString());
	if (isLight) {
		next.delete('light');
	} else {
		next.set('light', '1');
	}
	const q = next.toString();
	return q ? `${EVENT_QR_PATH}?${q}` : EVENT_QR_PATH;
}

export function EventQrPrintHelper({ isLight }: EventQrPrintHelperProps) {
	const searchParams = useSearchParams();
	const modeToggleClass = isLight
		? 'border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50'
		: 'border-cursor-border-emphasis bg-cursor-surface-raised text-cursor-text hover:bg-cursor-overlay';

	const btnClass = [
		'inline-flex h-9 flex-1 min-w-0 items-center justify-center rounded-md border px-3 text-sm font-medium transition-colors',
		'sm:flex-initial sm:min-w-[6.5rem]',
		modeToggleClass,
	].join(' ');

	return (
		<div className="mt-6 w-full max-w-sm print:hidden">
			<div className="flex w-full max-w-sm flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap sm:justify-center sm:items-center">
				<button type="button" onClick={() => window.print()} className={btnClass}>
					Print
				</button>
				<button type="button" onClick={() => window.print()} className={btnClass}>
					Download PDF
				</button>
				<Link
					href={buildToggledHref(new URLSearchParams(searchParams.toString()), isLight)}
					className={[btnClass, 'text-center'].join(' ')}
				>
					{isLight ? 'Dark mode' : 'Light mode'}
				</Link>
			</div>
			<p
				className={[
					'mt-3 text-center text-xs max-w-sm mx-auto',
					isLight ? 'text-neutral-500' : 'text-cursor-text-faint',
				].join(' ')}
			>
				To save a file, use <span className="whitespace-nowrap">Save as PDF</span> (or Microsoft Print to PDF) in
				the print dialog.
			</p>
		</div>
	);
}
