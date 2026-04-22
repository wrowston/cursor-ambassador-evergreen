import { CursorEvent } from '@/lib/types';

export const events: CursorEvent[] = [
	{
		id: 'cafe-cursor-slc',
		title: 'Cafe Cursor SLC - May 9th, 2026',
		date: '2026-05-09',
		displayDate: 'May 9th, 2026',
		location: 'Salt Lake City, Utah',
		lumaUrl: 'https://luma.com/event/evt-sa7UnwEzjOKsq4m',
		lumaEventId: 'evt-sa7UnwEzjOKsq4m',
		qrPath: '/cafe-cursor-qr',
		status: 'upcoming',
	},
	{
		id: 'cursor-meetup-slc-1',
		title: 'Cursor Meetup Salt Lake City',
		date: '2026-03-13',
		displayDate: 'March 13, 2026',
		location: 'Salt Lake City, Utah',
		lumaUrl: 'https://lu.ma/p521sri9',
		status: 'past',
	},
];

export const upcomingEvents = events.filter((event) => event.status === 'upcoming');
export const pastEvents = events.filter((event) => event.status === 'past');
