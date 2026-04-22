'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ExternalLink, QrCode } from 'lucide-react';
import { upcomingEvents } from '@/content/events';
import { useI18n } from '@/lib/i18n';
import { LumaEventEmbed } from '@/components/LumaEventEmbed';

const UpcomingEvents: React.FC = () => {
	const { t, locale } = useI18n();

	if (upcomingEvents.length === 0) {
		return null;
	}

	const formatDate = (date: string) =>
		new Date(`${date}T00:00:00`).toLocaleDateString(locale === 'en' ? 'en-US' : locale, {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});

	return (
		<motion.section
			id="upcoming"
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: '-50px' }}
			transition={{ duration: 0.5 }}
			className="mb-16 scroll-mt-20"
		>
			<h2 className="text-xs uppercase tracking-wider text-cursor-text-muted font-medium mb-6">
				{t('home.upcomingEvents')}
			</h2>

			<div className="divide-y divide-cursor-border">
				{upcomingEvents.map((event, index) => {
					const eventCity = event.location.split(',')[0].trim();

					return (
						<motion.div
							key={event.id}
							initial={{ opacity: 0, y: 10 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, margin: '-50px' }}
							transition={{ duration: 0.4, delay: index * 0.08 }}
							className="py-5 first:pt-0 last:pb-0"
						>
							<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
								<span className="text-sm text-cursor-text-muted w-32 flex-shrink-0 pt-0.5">
									{event.date ? formatDate(event.date) : event.displayDate}
								</span>
								<div className="flex-1 min-w-0 w-full">
									<h3 className="text-cursor-text font-medium">{event.title}</h3>
									<div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5">
										<span className="text-sm text-cursor-text-muted">{eventCity}</span>
										{event.lumaUrl && !event.lumaEventId ? (
											<>
												<span className="text-cursor-text-faint" aria-hidden>
													&middot;
												</span>
												<a
													href={event.lumaUrl}
													target="_blank"
													rel="noopener noreferrer"
													className="text-sm text-cursor-text hover:text-cursor-text-muted transition-colors inline-flex items-center gap-1"
												>
													{t('home.register')}
													<ExternalLink className="w-3 h-3 shrink-0" aria-hidden />
												</a>
											</>
										) : null}
										{event.qrPath ? (
											<>
												<span className="text-cursor-text-faint" aria-hidden>
													&middot;
												</span>
												<Link
													href={event.qrPath}
													className="text-sm text-cursor-text hover:text-cursor-text-muted transition-colors inline-flex items-center gap-1.5"
												>
													<QrCode className="w-3.5 h-3.5 shrink-0" aria-hidden />
													<span>{t('home.viewQrCode')}</span>
												</Link>
											</>
										) : null}
									</div>
									{event.lumaEventId ? (
										<div className="mt-4 w-full max-w-[600px]">
											<LumaEventEmbed eventId={event.lumaEventId} className="block" />
										</div>
									) : null}
								</div>
							</div>
						</motion.div>
					);
				})}
			</div>
		</motion.section>
	);
};

export default UpcomingEvents;
