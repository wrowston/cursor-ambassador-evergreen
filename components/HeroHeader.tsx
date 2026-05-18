'use client';

import React from 'react';
import { motion } from 'framer-motion';
import PhotoMarquee from '@/components/PhotoMarquee';
import { marqueeRowOne, marqueeRowTwo } from '@/content/header-photos';

const HeroHeader: React.FC = () => {
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.6, delay: 0.2 }}
			className="h-[calc(100svh-56px)] border-t border-cursor-border overflow-hidden"
			style={{
				maskImage: 'linear-gradient(to bottom, black 85%, transparent)',
				WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent)',
			}}
		>
			<PhotoMarquee rowOne={marqueeRowOne} rowTwo={marqueeRowTwo} />
		</motion.div>
	);
};

export default HeroHeader;
