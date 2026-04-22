import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import QRCode from 'qrcode';
import type { Metadata } from 'next';
import { events } from '@/content/events';
import { LumaEventEmbed } from '@/components/LumaEventEmbed';

const EVENT_ID = 'cafe-cursor-slc';

export const metadata: Metadata = {
	title: 'Cafe Cursor · Salt Lake City',
	description: 'Scan to register for Cafe Cursor in Salt Lake City on Luma.',
};

export default async function CafeCursorQrPage() {
	const event = events.find((e) => e.id === EVENT_ID);
	const lumaUrl = event?.lumaUrl;
	const lumaEventId = event?.lumaEventId;
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
		<main className="min-h-screen bg-cursor-bg text-cursor-text flex flex-col items-center justify-center px-6 py-16">
			<div className="flex flex-col items-center text-center max-w-[600px] w-full">
				<Image
					src="/cursor-logo.svg"
					alt="Cursor"
					width={180}
					height={48}
					priority
					className="h-12 w-auto mb-10"
				/>
				<p className="font-cursor text-2xl md:text-3xl font-semibold tracking-tight text-cursor-text mb-2">
					Salt Lake City
				</p>
				<h1 className="font-cursor text-xl md:text-2xl text-cursor-text-secondary mb-6">
					Cafe Cursor
				</h1>
				{lumaEventId ? (
					<div className="mb-8 w-full">
						<LumaEventEmbed eventId={lumaEventId} className="block" />
					</div>
				) : null}
				<div className="bg-white p-4 rounded-2xl shadow-lg">
					<div
						className="w-[280px] max-w-full [&>svg]:block [&>svg]:h-auto [&>svg]:w-full"
						dangerouslySetInnerHTML={{ __html: qrSvg }}
					/>
				</div>
				<p className="mt-6 text-sm text-cursor-text-muted">Scan to register on Luma</p>
				<Link
					href="/"
					className="mt-12 text-sm text-cursor-text-muted hover:text-cursor-text transition-colors"
				>
					Back to home
				</Link>
			</div>
		</main>
	);
}
