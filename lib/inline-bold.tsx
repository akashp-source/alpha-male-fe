import type { ReactNode } from "react";

/**
 * "**bold**" in admin-written text → <strong>. Everything else stays plain
 * text (no HTML). Stray "\n" typed as text (backslash + n) becomes a line break
 * where the container keeps line breaks (whitespace-pre-line), else a space.
 */
export function withBold(text: string, strongClassName = "font-semibold"): ReactNode[] {
    return text
        .replace(/\\n/g, "\n")
        .split(/(\*\*[^*]+?\*\*)/g)
        .map((part, i) =>
            /^\*\*[^*]+?\*\*$/.test(part) ? (
                <strong key={i} className={strongClassName}>
                    {part.slice(2, -2)}
                </strong>
            ) : (
                part
            ),
        );
}
