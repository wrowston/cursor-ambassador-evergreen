type LumaEventEmbedProps = {
	eventId: string;
	className?: string;
};

const EMBED_BASE = 'https://luma.com/embed/event';

/**
 * Luma “simple” event embed (register / details in-page).
 */
export function LumaEventEmbed({ eventId, className }: LumaEventEmbedProps) {
	const src = `${EMBED_BASE}/${eventId}/simple`;

	return (
		<iframe
			src={src}
			width={600}
			height={450}
			frameBorder={0}
			className={className}
			style={{ border: '1px solid #bfcbda88', borderRadius: 4, maxWidth: '100%', width: '100%' }}
			allow="fullscreen; payment"
			title="Luma event"
			tabIndex={0}
		/>
	);
}
