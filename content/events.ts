import { CursorEvent } from '@/lib/types';

export const events: CursorEvent[] = [
	{
		id: 'cafe-cursor-slc',
		title: 'Cafe Cursor SLC - May 16th, 2026',
		date: '2026-05-16',
		displayDate: 'May 16th, 2026',
		location: 'Alpha Coffee Cafe, Salt Lake City',
		locationUrl: 'https://www.google.com/maps/search/?api=1&query=Alpha+Coffee+Cafe+111+S+Main+Street+Salt+Lake+City+UT+84111',
		lumaUrl: 'https://luma.com/event/evt-sa7UnwEzjOKsq4m',
		lumaEventId: 'evt-sa7UnwEzjOKsq4m',
		qrPath: '/cafe-cursor-qr',
		recapPath: '/recaps/cafe-cursor-slc',
		status: 'past',
	},
	{
		id: 'cursor-meetup-slc-1',
		title: 'Cursor Meetup Salt Lake City',
		date: '2026-03-13',
		displayDate: 'March 13, 2026',
		location: 'Sugar House Station, Salt Lake City',
		locationUrl: 'https://www.google.com/maps/search/?api=1&query=Sugar+House+Station+2155+Highland+Drive+Salt+Lake+City+UT+84106',
		lumaUrl: 'https://lu.ma/p521sri9',
		recapPath: '/recaps/cursor-meetup-slc-1',
		status: 'past',
	},
];

export const upcomingEvents = events.filter((event) => event.status === 'upcoming');
export const pastEvents = events.filter((event) => event.status === 'past');
