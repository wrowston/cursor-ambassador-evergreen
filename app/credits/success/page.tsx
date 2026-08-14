import { Suspense } from 'react';
import { CreditsPublicShell } from '@/components/credits/PublicShell';
import { SuccessContent } from './SuccessContent';

export default function CreditsSuccessPage() {
	return (
		<CreditsPublicShell>
			<Suspense fallback={<p className="text-center text-sm text-cursor-text-muted">Loading...</p>}>
				<SuccessContent />
			</Suspense>
		</CreditsPublicShell>
	);
}
