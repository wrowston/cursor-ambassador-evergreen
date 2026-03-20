'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, ArrowRight, ExternalLink } from 'lucide-react';
import { pastEvents } from '@/content/events';
import { useI18n } from '@/lib/i18n';

const containerVariants = {
	hidden: {},
	visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const PastEvents: React.FC = () => {
	const { t, locale } = useI18n();

	if (pastEvents.length === 0) {
		return null;
	}

	return (
		<motion.section
			id="recaps"
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: '-50px' }}
			transition={{ duration: 0.5 }}
			className="mb-16 scroll-mt-20"
		>
			<h2 className="text-xs uppercase tracking-wider text-cursor-text-muted font-medium mb-4">
				{t('home.pastEvents')}
			</h2>

			<motion.div
				variants={containerVariants}
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true, margin: '-50px' }}
				className="space-y-4"
			>
				{pastEvents.map((event) => {
					const displayDate = new Date(`${event.date}T00:00:00`).toLocaleDateString(
						locale === 'en' ? 'en-US' : locale,
						{ year: 'numeric', month: 'long', day: 'numeric' },
					);

					return (
						<motion.div key={event.id} variants={itemVariants}>
							<div className="bg-cursor-surface border border-cursor-border rounded-lg overflow-hidden flex items-center gap-5 p-4 group">
								{event.thumbnail ? (
									<div className="relative w-28 h-20 flex-shrink-0 rounded-md overflow-hidden">
										<Image
											src={event.thumbnail}
											alt={event.title}
											fill
											className="object-cover"
											sizes="112px"
										/>
									</div>
								) : null}
								<div className="flex-1 min-w-0">
									<h3 className="text-cursor-text font-medium mb-1.5">{event.title}</h3>
									<div className="flex flex-wrap items-center gap-3 text-sm text-cursor-text-muted">
										<div className="flex items-center gap-1.5">
											<Calendar className="w-4 h-4" />
											<span>{displayDate}</span>
										</div>
									</div>
									<div className="flex items-center gap-4 mt-2">
										{event.recapPath ? (
											<Link
												href={event.recapPath}
												className="flex items-center gap-1.5 text-sm text-cursor-text hover:text-cursor-text-muted transition-colors"
											>
												<span>{t('home.viewRecap')}</span>
												<ArrowRight className="w-4 h-4" />
											</Link>
										) : null}
										{event.lumaUrl ? (
											<a
												href={event.lumaUrl}
												target="_blank"
												rel="noopener noreferrer"
												className="flex items-center gap-1.5 text-sm text-cursor-text hover:text-cursor-text-muted transition-colors"
											>
												<span>View on Luma</span>
												<ExternalLink className="w-3.5 h-3.5" />
											</a>
										) : null}
									</div>
								</div>
							</div>
						</motion.div>
					);
				})}
			</motion.div>
		</motion.section>
	);
};

export default PastEvents;
