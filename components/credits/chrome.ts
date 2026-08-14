import { buttonVariants } from '@/components/ui/button';

export const fieldClass =
	'flex h-9 w-full rounded-lg border border-border bg-background px-3 py-1 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50';

export const btnClass = buttonVariants({ variant: 'outline' });

export const btnPrimaryClass = buttonVariants({ variant: 'default' });

export const cardClass = 'rounded-lg border border-border bg-card p-6 text-card-foreground';

export const labelClass = 'mb-1.5 block text-sm text-muted-foreground';
