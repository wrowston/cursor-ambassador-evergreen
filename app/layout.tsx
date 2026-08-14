import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Analytics } from '@vercel/analytics/react';
import { I18nProvider } from '@/lib/i18n';
import { siteConfig } from '@/content/site.config';
import './globals.css';

const cursorGothic = localFont({
	src: [
		{ path: './fonts/CursorGothic-Regular.otf', weight: '400', style: 'normal' },
		{ path: './fonts/CursorGothic-Italic.otf', weight: '400', style: 'italic' },
		{ path: './fonts/CursorGothic-Bold.otf', weight: '700', style: 'normal' },
		{ path: './fonts/CursorGothic-BoldItalic.otf', weight: '700', style: 'italic' },
	],
	variable: '--font-cursor-gothic',
	fallback: [],
	adjustFontFallback: false,
});

export const metadata: Metadata = {
	title: `${siteConfig.communityName} | Cursor Ambassador Site`,
	description: `${siteConfig.communityName} — meetups, hackathons, and community for Cursor users in ${siteConfig.city}.`,
	openGraph: {
		title: siteConfig.communityName,
		description: `${siteConfig.communityName} — meetups, hackathons, and community for Cursor users in ${siteConfig.city}.`,
		type: 'website',
	},
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang={siteConfig.defaultLocale} className={`${cursorGothic.variable} dark`}>
			<body className={`${cursorGothic.className} bg-background font-sans text-foreground antialiased`}>
				<I18nProvider>{children}</I18nProvider>
				<Analytics />
			</body>
		</html>
	);
}
