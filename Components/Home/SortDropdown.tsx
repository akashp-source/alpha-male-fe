"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Check, ChevronDown } from "lucide-react";

export type SortOption = { value: string; label: string };

/**
 * "Sort by" pill with a styled open list (the browser's own select list
 * can't be styled). Keyboard: Enter / Space / arrows open it, arrows move,
 * Enter picks, Escape or Tab closes; a click outside closes it too.
 */
export default function SortDropdown({
    value,
    options,
    onChange,
}: {
    value: string;
    options: SortOption[];
    onChange: (value: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(0);
    const rootRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const listId = useId();

    const selectedIndex = Math.max(0, options.findIndex((option) => option.value === value));
    const selected = options[selectedIndex];

    // Close on a click/tap outside.
    useEffect(() => {
        if (!open) return;
        const onPointerDown = (event: PointerEvent) => {
            if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
        };
        document.addEventListener("pointerdown", onPointerDown);
        return () => document.removeEventListener("pointerdown", onPointerDown);
    }, [open]);

    const openList = () => {
        setActive(selectedIndex);
        setOpen(true);
    };

    const pick = (index: number) => {
        const option = options[index];
        if (option) onChange(option.value);
        setOpen(false);
        buttonRef.current?.focus();
    };

    const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
        if (!open) {
            if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(event.key)) {
                event.preventDefault();
                openList();
            }
            return;
        }
        if (event.key === "ArrowDown") {
            event.preventDefault();
            setActive((index) => (index + 1) % options.length);
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActive((index) => (index - 1 + options.length) % options.length);
        } else if (event.key === "Home") {
            event.preventDefault();
            setActive(0);
        } else if (event.key === "End") {
            event.preventDefault();
            setActive(options.length - 1);
        } else if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            pick(active);
        } else if (event.key === "Escape") {
            event.preventDefault();
            setOpen(false);
        } else if (event.key === "Tab") {
            setOpen(false);
        }
    };

    return (
        <div ref={rootRef} className="relative">
            <button
                ref={buttonRef}
                type="button"
                role="combobox"
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={listId}
                aria-activedescendant={open ? `${listId}-${active}` : undefined}
                aria-label={`Sort by: ${selected?.label ?? ""}`}
                onClick={() => (open ? setOpen(false) : openList())}
                onKeyDown={onKeyDown}
                className={`flex h-10 items-center gap-2 rounded-full border bg-white pl-4 pr-3 shadow-sm transition hover:border-brand-navy/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy/15 ${open ? "border-brand-navy" : "border-slate-300"}`}
            >
                <span className="whitespace-nowrap font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-navy-muted">
                    Sort by
                </span>
                <span className="whitespace-nowrap font-body text-xs font-semibold text-brand-navy sm:text-sm">
                    {selected?.label}
                </span>
                <ChevronDown
                    size={16}
                    aria-hidden="true"
                    className={`ml-1 shrink-0 text-brand-navy transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                />
            </button>

            <ul
                id={listId}
                role="listbox"
                aria-label="Sort by"
                className={`absolute right-0 z-30 mt-2 min-w-full origin-top-right overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-[0_16px_40px_rgba(33,46,73,0.16)] transition duration-150 ${open ? "visible scale-100 opacity-100" : "invisible scale-95 opacity-0"}`}
            >
                {options.map((option, index) => {
                    const isSelected = index === selectedIndex;
                    const isActive = index === active;
                    return (
                        <li
                            key={option.value}
                            id={`${listId}-${index}`}
                            role="option"
                            aria-selected={isSelected}
                            onPointerEnter={() => setActive(index)}
                            onClick={() => pick(index)}
                            className={`flex cursor-pointer items-center justify-between gap-6 whitespace-nowrap rounded-xl px-3.5 py-2.5 font-body text-sm transition-colors ${isActive ? "bg-pale-gray" : ""} ${isSelected ? "font-semibold text-brand-navy" : "text-brand-navy-muted"}`}
                        >
                            {option.label}
                            <Check
                                size={15}
                                aria-hidden="true"
                                className={`shrink-0 text-brand-navy ${isSelected ? "opacity-100" : "opacity-0"}`}
                            />
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
