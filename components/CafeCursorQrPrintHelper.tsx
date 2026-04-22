'use client';

import Link from 'next/link';

type CafeCursorQrPrintHelperProps = {
	isLight: boolean;
};

export function CafeCursorQrPrintHelper({ isLight }: CafeCursorQrPrintHelperProps) {
	const modeToggleClass = isLight
		? 'border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50'
		: 'border-cursor-border-emphasis bg-cursor-surface-raised text-cursor-text hover:bg-cursor-overlay';

	return (
		<div className="mt-6 flex w-full max-w-sm flex-col items-stretch gap-2 sm:flex-row sm:justify-center sm:items-center print:hidden">
			<button
				type="button"
				onClick={() => window.print()}
				className={[
					'inline-flex h-9 flex-1 items-center justify-center rounded-md border px-4 text-sm font-medium transition-colors sm:flex-initial sm:min-w-[7rem]',
					modeToggleClass,
				].join(' ')}
			>
				Print
			</button>
			<Link
				href={isLight ? '/cafe-cursor-qr' : '/cafe-cursor-qr?light=1'}
				className={[
					'inline-flex h-9 flex-1 items-center justify-center rounded-md border px-4 text-sm font-medium transition-colors sm:flex-initial sm:min-w-[7rem] text-center',
					modeToggleClass,
				].join(' ')}
			>
				{isLight ? 'Dark mode' : 'Light mode'}
			</Link>
		</div>
	);
}
