import { notFound, redirect } from 'next/navigation';
import { events } from '@/content/events';
import { buildEventQrQuery, paramOn } from '@/lib/eventQr';

const EVENT_ID = 'cafe-cursor-slc';
const DISPLAY_CITY = 'Salt Lake City';
const DISPLAY_EVENT = 'Cafe Cursor';

type PageProps = {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CafeCursorQrPage({ searchParams }: PageProps) {
	const sp = await searchParams;
	const event = events.find((e) => e.id === EVENT_ID);
	if (!event?.lumaUrl) {
		notFound();
	}
	const next = {
		city: DISPLAY_CITY,
		event: DISPLAY_EVENT,
		luma: event.lumaUrl,
		light: paramOn(sp.light) || paramOn(sp.print) ? true : false,
		print: false,
	};
	redirect(`/event-qr?${buildEventQrQuery(next)}`);
}
