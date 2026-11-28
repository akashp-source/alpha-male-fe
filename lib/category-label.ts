// Plain helper (no "use client"), so server components can use it too.
// lib/categories.ts re-exports it for the existing client imports.

/** Display form of a category name: first letter of each word capitalised ("oral strip" -> "Oral Strip"). */
export function categoryLabel(name: string) {
    return String(name ?? "")
        .trim()
        .replace(/(^|[\s/-])([a-z])/g, (_, sep: string, letter: string) => sep + letter.toUpperCase());
}
