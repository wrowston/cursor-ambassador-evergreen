'use client';

import React from 'react';
import { GalleryPhoto } from '@/lib/types';

interface PhotoMarqueeProps {
	rowOne: GalleryPhoto[];
	rowTwo: GalleryPhoto[];
	/** Duration in seconds for the top row to complete one loop. */
	durationOne?: number;
	/** Duration in seconds for the bottom row to complete one loop. */
	durationTwo?: number;
}

const PhotoMarquee: React.FC<PhotoMarqueeProps> = ({
	rowOne,
	rowTwo,
	durationOne = 90,
	durationTwo = 110,
}) => {
	return (
		<div
			className="relative h-full overflow-hidden"
			style={{
				maskImage:
					'linear-gradient(to right, transparent, black 6%, black 94%, transparent)',
				WebkitMaskImage:
					'linear-gradient(to right, transparent, black 6%, black 94%, transparent)',
			}}
		>
			<div className="flex flex-col h-full gap-2 py-2">
				<MarqueeRow photos={rowOne} direction="left" duration={durationOne} />
				<MarqueeRow photos={rowTwo} direction="right" duration={durationTwo} />
			</div>
		</div>
	);
};

interface MarqueeRowProps {
	photos: GalleryPhoto[];
	direction: 'left' | 'right';
	duration: number;
}

const MarqueeRow: React.FC<MarqueeRowProps> = ({ photos, direction, duration }) => {
	const doubled = React.useMemo(() => [...photos, ...photos], [photos]);

	return (
		<div className="group relative flex-1 min-h-0 overflow-hidden">
			<div
				className="flex h-full items-stretch gap-2 will-change-transform group-hover:[animation-play-state:paused] motion-reduce:animate-none"
				style={{
					width: 'max-content',
					animation: `${direction === 'left' ? 'marquee-left' : 'marquee-right'} ${duration}s linear infinite`,
				}}
			>
				{doubled.map((photo, index) => (
					<div
						key={`${photo.src}-${index}`}
						className="relative h-full flex-shrink-0 overflow-hidden bg-cursor-bg-dark"
					>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src={photo.src}
							alt={photo.alt}
							className="h-full w-auto select-none object-cover"
							draggable={false}
							loading="eager"
							decoding="async"
						/>
					</div>
				))}
			</div>
		</div>
	);
};

export default PhotoMarquee;
