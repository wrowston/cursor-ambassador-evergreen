'use client';

import { useEffect, useRef, useState } from 'react';
import { fieldClass, labelClass } from '@/components/credits/chrome';
import type { AttendeeSuggestion } from '@/lib/credits/model';

type Props = {
	value: string;
	onChange: (value: string) => void;
	onAttendeeSelect: (attendee: AttendeeSuggestion | null) => void;
	error?: string;
	disabled?: boolean;
	projectId: string;
};

export function AttendeeAutocomplete({
	value,
	onChange,
	onAttendeeSelect,
	error,
	disabled = false,
	projectId,
}: Props) {
	const [attendees, setAttendees] = useState<AttendeeSuggestion[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isOpen, setIsOpen] = useState(false);
	const [focusedIndex, setFocusedIndex] = useState(-1);
	const inputRef = useRef<HTMLInputElement>(null);
	const listRef = useRef<HTMLUListElement>(null);

	useEffect(() => {
		let cancelled = false;
		setIsLoading(true);

		fetch(`/api/credits/attendees?projectId=${encodeURIComponent(projectId)}`)
			.then((response) => response.json())
			.then((data) => {
				if (!cancelled) {
					setAttendees(data.attendees ?? []);
				}
			})
			.catch(() => {
				if (!cancelled) {
					setAttendees([]);
				}
			})
			.finally(() => {
				if (!cancelled) {
					setIsLoading(false);
				}
			});

		return () => {
			cancelled = true;
		};
	}, [projectId]);

	const available = attendees.filter((attendee) => !attendee.hasRedeemed);
	const suggestions =
		value.length < 2
			? []
			: available.filter((attendee) => attendee.name.toLowerCase().includes(value.toLowerCase().trim())).slice(0, 5);

	const select = (attendee: AttendeeSuggestion) => {
		onChange(attendee.name);
		onAttendeeSelect(attendee);
		setIsOpen(false);
		setFocusedIndex(-1);
		inputRef.current?.blur();
	};

	useEffect(() => {
		const onPointerDown = (event: MouseEvent) => {
			const target = event.target as Node;
			if (!inputRef.current?.contains(target) && !listRef.current?.contains(target)) {
				setIsOpen(false);
				setFocusedIndex(-1);
			}
		};
		document.addEventListener('mousedown', onPointerDown);
		return () => document.removeEventListener('mousedown', onPointerDown);
	}, []);

	return (
		<div className="relative">
			<label htmlFor="attendee-name" className={labelClass}>
				Attendee Name
			</label>
			<input
				ref={inputRef}
				id="attendee-name"
				type="text"
				autoComplete="off"
				placeholder={isLoading ? 'Loading attendees...' : 'Start typing attendee name...'}
				value={value}
				disabled={disabled || isLoading}
				onChange={(event) => {
					const next = event.target.value;
					onChange(next);
					const match = attendees.find((attendee) => attendee.name.toLowerCase() === next.trim().toLowerCase());
					onAttendeeSelect(match ?? null);
					setIsOpen(next.length >= 2);
					setFocusedIndex(-1);
				}}
				onFocus={() => value.length >= 2 && setIsOpen(true)}
				onKeyDown={(event) => {
					if (!isOpen || suggestions.length === 0) {
						return;
					}
					if (event.key === 'ArrowDown') {
						event.preventDefault();
						setFocusedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
					} else if (event.key === 'ArrowUp') {
						event.preventDefault();
						setFocusedIndex((prev) => Math.max(prev - 1, -1));
					} else if (event.key === 'Enter' && focusedIndex >= 0) {
						event.preventDefault();
						select(suggestions[focusedIndex]);
					} else if (event.key === 'Escape') {
						setIsOpen(false);
						setFocusedIndex(-1);
					}
				}}
				className={`${fieldClass} ${error ? 'border-cursor-accent-red' : ''}`}
			/>
			{error ? <p className="mt-1 text-sm text-cursor-accent-red">{error}</p> : null}

			{isOpen && suggestions.length > 0 ? (
				<ul
					ref={listRef}
					role="listbox"
					className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-cursor-border bg-cursor-surface-raised"
				>
					{suggestions.map((attendee, index) => (
						<li
							key={attendee.id}
							role="option"
							aria-selected={index === focusedIndex}
							className={`cursor-pointer px-4 py-2 text-sm ${
								index === focusedIndex
									? 'bg-cursor-overlay text-cursor-text'
									: 'text-cursor-text-secondary hover:bg-cursor-overlay'
							}`}
							onClick={() => select(attendee)}
						>
							{attendee.name}
						</li>
					))}
				</ul>
			) : null}

			{isOpen && value.length >= 2 && suggestions.length === 0 && !isLoading ? (
				<div className="absolute z-50 mt-1 w-full rounded-md border border-cursor-border bg-cursor-surface-raised px-4 py-3 text-sm text-cursor-text-muted">
					No attendees found matching &quot;{value}&quot;
				</div>
			) : null}
		</div>
	);
}
