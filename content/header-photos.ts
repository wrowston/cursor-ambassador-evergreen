import { HeaderPhoto } from '@/lib/types';

// Desktop grid: 4 columns x 4 rows (16 cells).
// Mobile grid: 2 columns x 4 rows (8 cells).
export const headerPhotos: HeaderPhoto[] = [
	{
		src: 'https://g3ik3pexma.ufs.sh/f/Ans4G8qtRkcndCV3bduKQvIw5Ti42o1EaeGzZsh7gybtkdB0',
		alt: 'Cursor community event group photo',
		row: 1,
		col: 1,
		rowSpan: 2,
		colSpan: 2,
		mobile: { row: 1, col: 1, rowSpan: 2, colSpan: 2 },
	},
	{
		src: 'https://g3ik3pexma.ufs.sh/f/Ans4G8qtRkcnl1qfLNVektLHUCp59bOQSyZsY3dhJa8v6Ecu',
		alt: 'Cursor meetup participants working together',
		row: 1,
		col: 3,
		mobile: { row: 3, col: 1 },
	},
	{
		src: 'https://g3ik3pexma.ufs.sh/f/Ans4G8qtRkcnqt1TUzkl07EZyrYnT8NLzDM4iv5U1m6auGWh',
		alt: 'Cursor community photo from event',
		row: 1,
		col: 4,
		rowSpan: 2,
		mobileHidden: true,
	},
	{
		src: 'https://g3ik3pexma.ufs.sh/f/Ans4G8qtRkcn0mKtEBbdu8yKQq1GelIcoMVwDzt6PCv27Ybs',
		alt: 'Cursor workshop moment during session',
		row: 2,
		col: 3,
		mobile: { row: 3, col: 2 },
	},
	{
		src: 'https://g3ik3pexma.ufs.sh/f/Ans4G8qtRkcncyFGljiIEGsUnApCmhHve6itPgL75ox3wbyQ',
		alt: 'Cursor meetup attendees in discussion',
		row: 3,
		col: 1,
		mobileHidden: true,
	},
	{
		src: 'https://g3ik3pexma.ufs.sh/f/Ans4G8qtRkcnQd09XXE9M6FChSGNaxAfR2ks5JtEgQbUY7vj',
		alt: 'Cursor event participants and speakers',
		row: 3,
		col: 2,
		mobileHidden: true,
	},
	{
		src: 'https://g3ik3pexma.ufs.sh/f/Ans4G8qtRkcnvmardYgpZlKqoeHgOSizjQx7sJrwuh5RvA62',
		alt: 'Cursor community moment from social share',
		row: 3,
		col: 3,
		rowSpan: 2,
		colSpan: 2,
		mobileHidden: true,
	},
	{
		src: 'https://g3ik3pexma.ufs.sh/f/Ans4G8qtRkcnAIsWa2qtRkcnhBTMlYH2mZ96dp7NjQyvSeA8',
		alt: 'Cursor community gathering and networking',
		row: 4,
		col: 1,
		mobileHidden: true,
	},
	{
		src: 'https://g3ik3pexma.ufs.sh/f/Ans4G8qtRkcnSlIOLP0FAx1s2MnyjPGeuX7rNzlSEH4mWQUp',
		alt: 'Cursor ambassador event highlight',
		row: 4,
		col: 2,
		mobile: { row: 4, col: 1, colSpan: 2 },
	},
];
