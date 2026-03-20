'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { siDiscord } from 'simple-icons';
import { siteConfig } from '@/content/site.config';
import { useI18n } from '@/lib/i18n';

const DiscordSection: React.FC = () => {
	const { t } = useI18n();

	return (
		<motion.section
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: '-50px' }}
			transition={{ duration: 0.5 }}
			className="mb-16"
		>
			<div className="bg-cursor-surface border border-cursor-border rounded-lg p-8 flex items-start justify-between gap-6">
				<div>
					<h3 className="text-xl font-bold text-cursor-text mb-2">{t('discord.title')}</h3>
					<p className="text-cursor-text-muted text-sm mb-5 max-w-lg">{t('discord.description')}</p>
					<a
						href={siteConfig.discordUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-2 border border-cursor-border-emphasis text-cursor-text rounded-md px-5 py-2.5 text-sm font-medium hover:bg-cursor-surface-raised transition-colors"
					>
						{t('discord.join')}
					</a>
				</div>
				<div className="flex-shrink-0 text-cursor-text-muted">
					<svg role="img" viewBox="0 0 24 24" className="w-10 h-10 fill-current">
						<path d={siDiscord.path} />
					</svg>
				</div>
			</div>
		</motion.section>
	);
};

export default DiscordSection;
