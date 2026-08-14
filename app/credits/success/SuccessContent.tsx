'use client';

import { useSearchParams } from 'next/navigation';
import { btnPrimaryClass, cardClass } from '@/components/credits/chrome';

export function SuccessContent() {
	const searchParams = useSearchParams();
	const cursorUrl = searchParams.get('cursorUrl');
	const name = searchParams.get('name') || 'Attendee';

	return (
		<div className="text-center">
			<h1 className="text-3xl font-medium text-cursor-text">Success, {name}</h1>
			<p className="mt-3 text-lg text-cursor-text-muted">Your Cursor credits are ready to claim</p>

			<div className={`${cardClass} mt-8`}>
				{cursorUrl ? (
					<>
						<a href={cursorUrl} target="_blank" rel="noopener noreferrer" className={`${btnPrimaryClass} w-full py-4 text-lg`}>
							Claim Your Credits Now
						</a>
						<p className="mt-4 text-sm text-cursor-text-muted">
							Opens Cursor and applies your referral credits
						</p>
					</>
				) : (
					<p className="text-sm text-cursor-text-muted">No referral link was provided.</p>
				)}
			</div>

			<p className="mt-8 text-sm text-cursor-text-faint">Need help? Contact the event organizers</p>
		</div>
	);
}
