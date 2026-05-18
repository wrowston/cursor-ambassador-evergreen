'use client';

import React from 'react';
import Image from 'next/image';
import { partners } from '@/content/partners';
import { siteConfig } from '@/content/site.config';
import { useI18n } from '@/lib/i18n';

const Partners: React.FC = () => {
	const { t } = useI18n();

	return (
		<div className="mb-8">
			<h3 className="text-xs uppercase tracking-wider text-cursor-text-muted font-medium mb-4">
				{t('footer.hostingPartners')}
			</h3>

			{partners.length > 0 ? (
				<div className="flex flex-wrap justify-center gap-3">
					{partners.map((partner) => (
						<a
							key={partner.name}
							href={partner.url}
							target="_blank"
							rel="noopener noreferrer"
							className="bg-cursor-bg-dark border border-cursor-border rounded-md p-4 flex flex-col items-center justify-center gap-3 w-full max-w-xs sm:w-72 hover:border-cursor-border-emphasis transition-colors group"
						>
							<div
								className="w-full rounded-sm overflow-hidden px-3 py-3"
								style={{ backgroundColor: partner.logoBg ?? '#ffffff' }}
							>
								<div className={`relative ${partner.logoHeight ?? 'h-20'} w-full`}>
									<Image
										src={partner.logo}
										alt={partner.name}
										fill
										className="object-contain opacity-80 group-hover:opacity-100 transition duration-300"
										sizes="(max-width: 640px) 90vw, 288px"
									/>
								</div>
							</div>
							<span className="text-xs text-cursor-text-muted">{partner.name}</span>
						</a>
					))}
				</div>
			) : (
				<p className="text-sm text-cursor-text-muted">
					{t('footer.partnerCta')}{' '}
					<a
						href={siteConfig.discordUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="text-cursor-text underline underline-offset-2 hover:text-cursor-accent-purple transition-colors"
					>
						Reach out on Discord
					</a>
				</p>
			)}
		</div>
	);
};

export default Partners;
