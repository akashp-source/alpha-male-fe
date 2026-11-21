/**
 * Renders a product description stored as plain text.
 *
 * Formatting rules (how to write it in the DB / admin textarea):
 * - Each line starting with "-", "*" or "•" (plus a space) is a bullet point.
 * - Each line starting with "1." or "1)" is a numbered point.
 * - Any other line is normal text; a blank line starts a new paragraph.
 * Text with no such lines renders exactly as before (plain paragraph).
 */

type Block =
    | { type: "paragraph"; lines: string[] }
    | { type: "bullets"; items: string[] }
    | { type: "numbers"; items: string[] };

const BULLET = /^\s*[-*•●▪]\s+(.+)$/;
const NUMBER = /^\s*\d{1,2}[.)]\s+(.+)$/;

export function parseDescription(text: string): Block[] {
    const blocks: Block[] = [];

    const normalized = String(text ?? "")
        .replace(/\r\n?/g, "\n")
        // A typed "\n" (backslash + n, e.g. entered in Compass's list view)
        // counts as a line break too.
        .replace(/\\n/g, "\n");

    for (const rawLine of normalized.split("\n")) {
        const line = rawLine.trim();
        const last = blocks[blocks.length - 1];

        if (!line) {
            // Blank line ends the current paragraph.
            if (last?.type === "paragraph") blocks.push({ type: "paragraph", lines: [] });
            continue;
        }

        const bullet = line.match(BULLET);
        const number = bullet ? null : line.match(NUMBER);

        if (bullet) {
            if (last?.type === "bullets") last.items.push(bullet[1]);
            else blocks.push({ type: "bullets", items: [bullet[1]] });
        } else if (number) {
            if (last?.type === "numbers") last.items.push(number[1]);
            else blocks.push({ type: "numbers", items: [number[1]] });
        } else if (last?.type === "paragraph") {
            last.lines.push(line);
        } else {
            blocks.push({ type: "paragraph", lines: [line] });
        }
    }

    return blocks.filter((block) => (block.type === "paragraph" ? block.lines.length > 0 : block.items.length > 0));
}

export default function RichDescription({ text, className = "" }: { text?: string | null; className?: string }) {
    const blocks = parseDescription(text ?? "");
    if (!blocks.length) return null;

    return (
        <div className={`space-y-2 break-words ${className}`}>
            {blocks.map((block, index) => {
                if (block.type === "paragraph") {
                    return (
                        <p key={index}>
                            {block.lines.map((line, i) => (
                                <span key={i}>
                                    {i > 0 && <br />}
                                    {line}
                                </span>
                            ))}
                        </p>
                    );
                }

                const Tag = block.type === "bullets" ? "ul" : "ol";
                return (
                    <Tag key={index} className="space-y-1.5">
                        {block.items.map((item, i) => (
                            <li key={i} className="flex gap-2.5">
                                {block.type === "bullets" ? (
                                    <span aria-hidden="true" className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-[#212E49]" />
                                ) : (
                                    <span aria-hidden="true" className="min-w-[1.25rem] shrink-0 font-semibold text-[#212E49]">
                                        {i + 1}.
                                    </span>
                                )}
                                <span>{item}</span>
                            </li>
                        ))}
                    </Tag>
                );
            })}
        </div>
    );
}
