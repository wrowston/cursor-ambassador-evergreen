import cafeCursorImages from '@/content/recaps/cafe-cursor-slc.images.json';
import { GalleryPhoto } from '@/lib/types';

// Photos from the first Cursor Meetup (Sugar House Station, March 13, 2026).
// Also re-exported as the gallery for content/recaps/cursor-meetup-slc-1.ts.
export const cursorMeetupPhotos: GalleryPhoto[] = [
	{
		src: 'https://g3ik3pexma.ufs.sh/f/Ans4G8qtRkcndCV3bduKQvIw5Ti42o1EaeGzZsh7gybtkdB0',
		alt: 'Cursor community event group photo',
	},
	{
		src: 'https://g3ik3pexma.ufs.sh/f/Ans4G8qtRkcnl1qfLNVektLHUCp59bOQSyZsY3dhJa8v6Ecu',
		alt: 'Cursor meetup participants working together',
	},
	{
		src: 'https://g3ik3pexma.ufs.sh/f/Ans4G8qtRkcnqt1TUzkl07EZyrYnT8NLzDM4iv5U1m6auGWh',
		alt: 'Cursor community photo from event',
	},
	{
		src: 'https://g3ik3pexma.ufs.sh/f/Ans4G8qtRkcn0mKtEBbdu8yKQq1GelIcoMVwDzt6PCv27Ybs',
		alt: 'Cursor workshop moment during session',
	},
	{
		src: 'https://g3ik3pexma.ufs.sh/f/Ans4G8qtRkcncyFGljiIEGsUnApCmhHve6itPgL75ox3wbyQ',
		alt: 'Cursor meetup attendees in discussion',
	},
	{
		src: 'https://g3ik3pexma.ufs.sh/f/Ans4G8qtRkcnQd09XXE9M6FChSGNaxAfR2ks5JtEgQbUY7vj',
		alt: 'Cursor event participants and speakers',
	},
	{
		src: 'https://g3ik3pexma.ufs.sh/f/Ans4G8qtRkcnvmardYgpZlKqoeHgOSizjQx7sJrwuh5RvA62',
		alt: 'Cursor community moment from social share',
	},
	{
		src: 'https://g3ik3pexma.ufs.sh/f/Ans4G8qtRkcnAIsWa2qtRkcnhBTMlYH2mZ96dp7NjQyvSeA8',
		alt: 'Cursor community gathering and networking',
	},
	{
		src: 'https://g3ik3pexma.ufs.sh/f/Ans4G8qtRkcnSlIOLP0FAx1s2MnyjPGeuX7rNzlSEH4mWQUp',
		alt: 'Cursor ambassador event highlight',
	},
];

// All Cafe Cursor SLC photos, sourced from the upload manifest.
const cafeCursorPhotos: GalleryPhoto[] = cafeCursorImages.map((img, i) => ({
	src: img.url,
	alt: `Cafe Cursor SLC — photo ${i + 1}`,
}));

// Weave a "minority" set (the moody B&W Cursor Meetup photos) into a "majority"
// set (the bright color Cafe Cursor photos) such that no two minority items are
// adjacent. The Meetup photos have a lot of negative/black space — clustering
// two together visually reads as a hole in the marquee — so we surround each
// with at least one Cafe photo for contrast and pace.
function weave<T>(majority: T[], minority: T[]): T[] {
	if (minority.length === 0) return [...majority];
	const out: T[] = [];
	const step = Math.max(2, Math.ceil(majority.length / minority.length) + 1);
	let mi = 0;
	for (let i = 0; i < majority.length; i++) {
		out.push(majority[i]);
		if (mi < minority.length && (i + 1) % step === 0) {
			out.push(minority[mi++]);
		}
	}
	while (mi < minority.length) out.push(minority[mi++]);
	return out;
}

// Split each event's photos into halves so each marquee row gets a balanced mix
// of both events. The two events have very different visual languages
// (B&W moody fisheye vs bright color); mixing them in motion turns the contrast
// into texture rather than a static side-by-side clash.
const meetupMid = Math.ceil(cursorMeetupPhotos.length / 2);
const cafeMid = Math.ceil(cafeCursorPhotos.length / 2);

export const marqueeRowOne: GalleryPhoto[] = weave(
	cafeCursorPhotos.slice(0, cafeMid),
	cursorMeetupPhotos.slice(0, meetupMid),
);

export const marqueeRowTwo: GalleryPhoto[] = weave(
	cafeCursorPhotos.slice(cafeMid),
	cursorMeetupPhotos.slice(meetupMid),
);
