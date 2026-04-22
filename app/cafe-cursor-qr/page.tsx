import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import QRCode from 'qrcode';
import type { Metadata } from 'next';
import { CafeCursorQrPrintHelper } from '@/components/CafeCursorQrPrintHelper';
import { events } from '@/content/events';

const EVENT_ID = 'cafe-cursor-slc';

export const metadata: Metadata = {
	title: 'Cafe Cursor · Salt Lake City',
	description: 'Scan to register for Cafe Cursor in Salt Lake City on Luma.',
};

function paramOn(v: string | string[] | undefined) {
	if (v === undefined) {
		return false;
	}
	const s = Array.isArray(v) ? v[0] : v;
	return s === '1' || s === 'true';
}

type PageProps = {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CafeCursorQrPage({ searchParams }: PageProps) {
	const sp = await searchParams;
	const isLight = paramOn(sp.light) || paramOn(sp.print);

	const event = events.find((e) => e.id === EVENT_ID);
	const lumaUrl = event?.lumaUrl;
	if (!lumaUrl) {
		notFound();
	}

	const qrSvg = await QRCode.toString(lumaUrl, {
		type: 'svg',
		width: 280,
		margin: 2,
		color: { dark: '#000000', light: '#ffffff' },
	});

	return (
		<main
			className={[
				'min-h-screen flex flex-col items-center justify-center px-6 py-16 print:py-10',
				isLight ? 'bg-white text-neutral-900' : 'bg-cursor-bg text-cursor-text',
				'print:bg-white print:text-neutral-900',
			].join(' ')}
		>
			<div className="flex flex-col items-center text-center max-w-md w-full print:max-w-none">
				<Image
					src="/cursor-logo.svg"
					alt="Cursor"
					width={180}
					height={48}
					priority
					className={['h-12 w-auto mb-10 object-contain', isLight ? 'invert' : 'print:invert'].join(' ')}
				/>
				<p
					className={[
						'font-cursor text-2xl md:text-3xl font-semibold tracking-tight mb-2',
						isLight ? 'text-neutral-900' : 'text-cursor-text',
						'print:text-neutral-900',
					].join(' ')}
				>
					Salt Lake City
				</p>
				<h1
					className={[
						'font-cursor text-xl md:text-2xl mb-10',
						isLight ? 'text-neutral-700' : 'text-cursor-text-secondary',
						'print:text-neutral-800',
					].join(' ')}
				>
					Cafe Cursor
				</h1>
				<div
					className={[
						'p-4 rounded-2xl',
						isLight
							? 'bg-white border border-neutral-200'
							: 'bg-white shadow-lg print:shadow-none print:border print:border-neutral-300',
					].join(' ')}
				>
					<div
						className="w-[280px] max-w-full [&>svg]:block [&>svg]:h-auto [&>svg]:w-full"
						dangerouslySetInnerHTML={{ __html: qrSvg }}
					/>
				</div>
				<p
					className={[
						'mt-6 text-sm',
						isLight ? 'text-neutral-500' : 'text-cursor-text-muted',
						'print:text-neutral-600',
					].join(' ')}
				>
					Scan to register on Luma
				</p>
				<CafeCursorQrPrintHelper isLight={isLight} />
				<Link
					href="/"
					className={[
						'mt-8 text-sm transition-colors print:hidden',
						isLight
							? 'text-neutral-500 hover:text-neutral-800'
							: 'text-cursor-text-muted hover:text-cursor-text',
					].join(' ')}
				>
					Back to home
				</Link>
			</div>
		</main>
	);
}
