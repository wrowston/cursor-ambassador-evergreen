import type { ReactNode } from 'react';
import { badgeVariants } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Props = {
	selected: boolean;
	onClick: () => void;
	children: ReactNode;
};

export function FilterChip({ selected, onClick, children }: Props) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(badgeVariants({ variant: selected ? 'default' : 'outline' }), 'cursor-pointer')}
		>
			{children}
		</button>
	);
}
