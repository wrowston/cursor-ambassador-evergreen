import { CursorEvent } from '@/lib/types';

export const events: CursorEvent[] = [
	{
		id: 'cafe-cursor-slc',
		title: 'Cafe Cursor SLC - Coming Soon',
		date: '',
		displayDate: 'Coming Soon',
		location: 'Salt Lake City, Utah',
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
