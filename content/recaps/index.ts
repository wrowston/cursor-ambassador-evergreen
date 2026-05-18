import { cafeCursorSlcRecap } from '@/content/recaps/cafe-cursor-slc';
import { cursorMeetupSlc1Recap } from '@/content/recaps/cursor-meetup-slc-1';
import { RecapData } from '@/lib/types';

export const recapsBySlug: Record<string, RecapData> = {
	[cursorMeetupSlc1Recap.slug]: cursorMeetupSlc1Recap,
	[cafeCursorSlcRecap.slug]: cafeCursorSlcRecap,
};
