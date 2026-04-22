import type { Metadata } from 'next';
import { Suspense } from 'react';
import { EventQrGeneratorForm } from '@/components/EventQrGeneratorForm';
import { EventQrPoster } from '@/components/EventQrPoster';
import { EventQrPrintHelper } from '@/components/EventQrPrintHelper';
import { siteConfig } from '@/content/site.config';
import {
	generateEventQrSvg,
	paramOn,
	parseParamString,
	validateEventQrFields,
} from '@/lib/eventQr';

type PageProps = {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const defaultMetadata: Metadata = {
	title: 'Event QR poster',
	description: `Generate a Cursor event QR code for Luma — ${siteConfig.communityName}.`,
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
	const sp = await searchParams;
	const city = parseParamString(sp.city);
	const event = parseParamString(sp.event);
	const luma = parseParamString(sp.luma);
	const v = validateEventQrFields(city, event, luma);
	if (!v.ok) {
		return defaultMetadata;
	}
	return {
		title: `${v.eventType} · ${v.city} | QR`,
		description: `Scan to register for ${v.eventType} in ${v.city} on Luma.`,
	};
}

export default async function EventQrPage({ searchParams }: PageProps) {
	const sp = await searchParams;
	const city = parseParamString(sp.city);
	const event = parseParamString(sp.event);
	const luma = parseParamString(sp.luma);
	const v = validateEventQrFields(city, event, luma);
	const isLight = paramOn(sp.light) || paramOn(sp.print);

	if (!v.ok) {
		return <EventQrGeneratorForm />;
	}

	const qrSvg = await generateEventQrSvg(v.lumaUrl);

	return (
		<EventQrPoster
			city={v.city}
			eventType={v.eventType}
			isLight={isLight}
			qrSvg={qrSvg}
			actions={
				<Suspense fallback={null}>
					<EventQrPrintHelper isLight={isLight} />
				</Suspense>
			}
		/>
	);
}
