import Navbar from '@/components/Navbar';

export function CreditsPublicShell({ children }: { children: React.ReactNode }) {
	return (
		<>
			<Navbar />
			<main className="mx-auto w-full max-w-lg px-6 py-16">{children}</main>
		</>
	);
}
