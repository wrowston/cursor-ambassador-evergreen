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
				<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
					{partners.map((partner) => (
						<a
							key={partner.name}
							href={partner.url}
							target="_blank"
							rel="noopener noreferrer"
							className="bg-cursor-bg-dark border border-cursor-border rounded-md p-3 flex flex-col items-center justify-center gap-2 min-h-[96px] hover:border-cursor-border-emphasis transition-colors group"
						>
							<div
								className="w-full rounded-sm overflow-hidden px-2 py-2"
								style={{ backgroundColor: partner.logoBg ?? '#ffffff' }}
							>
								<div className={`relative ${partner.logoHeight ?? 'h-10'} w-full`}>
									<Image
										src={partner.logo}
										alt={partner.name}
										fill
										className="object-contain opacity-60 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition duration-300"
										sizes="(max-width: 768px) 45vw, 20vw"
									/>
								</div>
							</div>
							<span className="text-[11px] text-cursor-text-muted">{partner.name}</span>
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
