import cafeCursorImages from '@/content/recaps/cafe-cursor-slc.images.json';
import { GalleryPhoto, RecapData } from '@/lib/types';

const photos: GalleryPhoto[] = cafeCursorImages.map((img, i) => ({
	src: img.url,
	alt: `Cafe Cursor SLC — photo ${i + 1}`,
}));

export const cafeCursorSlcRecap: RecapData = {
	slug: 'cafe-cursor-slc',
	title: 'Cafe Cursor SLC — Recap',
	date: 'May 16, 2026',
	location: 'Alpha Coffee Cafe, Salt Lake City',
	locationUrl: 'https://www.google.com/maps/search/?api=1&query=Alpha+Coffee+Cafe+111+S+Main+Street+Salt+Lake+City+UT+84111',
	summary: ['Recap of Cafe Cursor SLC.'],
	photos,
};
