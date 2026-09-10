function renderInline(text: string, key: number) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return (
    <span key={key}>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} style={{ color: "var(--ob-text)" }}>
            {part.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </span>
  );
}

// `![alt](/src.png "caption")` — the caption is optional.
const IMAGE_LINE = /^!\[([^\]]*)\]\((\S+?)(?:\s+"([^"]*)")?\)$/;

type Block =
  | { type: "p" | "ul" | "quote"; lines: string[] }
  | { type: "figure"; src: string; alt: string; caption?: string }
  | { type: "table"; head: string[]; rows: string[][] };

// The workbook's diagrams are greyscale line art on a light ground, so they're
// always mounted on a white card rather than the section surface. Otherwise the
// black strokes disappear against the dark-mode background.
function Figure({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  return (
    <figure className="my-1 flex flex-col items-center gap-2.5">
      {/* 520px keeps the tall client-journey map legible without upscaling the
          smallest source diagram (the blank Ikigai, 509px square) past 1:1. */}
      <div className="w-full max-w-[520px] rounded-2xl bg-white p-4" style={{ border: "1px solid var(--ob-border)" }}>
        {/* Not next/image: these are fixed-size local diagrams, and the plain tag
            keeps them working in the static export the onboarding pages use. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="mx-auto block h-auto w-full" />
      </div>
      {caption && (
        <figcaption className="max-w-[520px] text-center text-[13px] italic leading-relaxed">{caption}</figcaption>
      )}
    </figure>
  );
}

// The words a PT can actually borrow: phone openers, texts, the pricing line.
// Set apart from the prose around them so they can be found at a glance, which
// is the whole reason they are in the workbook rather than being paraphrased.
function Script({ lines }: { lines: string[] }) {
  return (
    <blockquote
      className="rounded-xl px-4 py-3 text-[15px] leading-relaxed"
      style={{ background: "var(--ob-accent-soft)", borderLeft: "3px solid var(--ob-accent)" }}
    >
      {lines.map((line, i) => (
        <p key={i} className={i > 0 ? "mt-2" : undefined}>
          {renderInline(line, i)}
        </p>
      ))}
    </blockquote>
  );
}

// Wide tables scroll inside their own container rather than pushing the page
// sideways. In a labelled table the first column is a row label, so it carries
// the same weight as the header.
function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  // A table of choices rather than of data — the 64-value list in Part 2 — has
  // no column names, so an all-empty header row is written as `| | | | |` and
  // the header is dropped rather than rendered as an empty band.
  const labelled = head.some((cell) => cell.length > 0);
  return (
    <div className="-mx-1 overflow-x-auto px-1">
      <table className="w-full min-w-[420px] border-collapse text-[14px]">
        {labelled && (
          <thead>
            <tr>
              {head.map((cell, i) => (
                <th
                  key={i}
                  className="border-b px-3 py-2 text-left align-bottom font-semibold"
                  style={{ borderColor: "var(--ob-border)", color: "var(--ob-text)" }}
                >
                  {renderInline(cell, i)}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="border-b px-3 py-2 align-top"
                  style={{
                    borderColor: "var(--ob-border)",
                    color: labelled && j === 0 ? "var(--ob-text)" : undefined,
                    fontWeight: labelled && j === 0 ? 600 : undefined,
                  }}
                >
                  {renderInline(cell, j)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const splitRow = (row: string) =>
  row
    .trim()
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((cell) => cell.trim());

// A pipe table, as one multi-line body entry:
//   "| A | B |\n| --- | --- |\n| 1 | 2 |"
// Returns null for anything that is not one, so a stray "|" stays prose.
function parseTable(entry: string): { head: string[]; rows: string[][] } | null {
  if (!entry.startsWith("|") || !entry.includes("\n")) return null;
  const lines = entry.split("\n").filter((l) => l.trim().length > 0);
  if (lines.length < 3) return null;
  if (!/^\|[\s:|-]+\|$/.test(lines[1].trim())) return null;
  return { head: splitRow(lines[0]), rows: lines.slice(2).map(splitRow) };
}

export function Prose({ body }: { body: string[] }) {
  const blocks: Block[] = [];

  for (const line of body) {
    const table = parseTable(line);
    if (table) {
      blocks.push({ type: "table", ...table });
      continue;
    }

    const image = IMAGE_LINE.exec(line);
    if (image) {
      blocks.push({ type: "figure", alt: image[1], src: image[2], caption: image[3] });
      continue;
    }

    const last = blocks[blocks.length - 1];

    // Consecutive "> " lines are one script, so a two-part opener stays one
    // block rather than becoming two quotes with a gap between them.
    if (line.startsWith("> ")) {
      if (last?.type === "quote") last.lines.push(line.slice(2));
      else blocks.push({ type: "quote", lines: [line.slice(2)] });
      continue;
    }

    const isBullet = line.startsWith("- ");
    if (isBullet && last?.type === "ul") {
      last.lines.push(line.slice(2));
    } else if (isBullet) {
      blocks.push({ type: "ul", lines: [line.slice(2)] });
    } else {
      blocks.push({ type: "p", lines: [line] });
    }
  }

  return (
    <div className="flex flex-col gap-3 text-[15px] leading-relaxed" style={{ color: "var(--ob-text-secondary)" }}>
      {blocks.map((block, i) =>
        block.type === "figure" ? (
          <Figure key={i} src={block.src} alt={block.alt} caption={block.caption} />
        ) : block.type === "table" ? (
          <Table key={i} head={block.head} rows={block.rows} />
        ) : block.type === "quote" ? (
          <Script key={i} lines={block.lines} />
        ) : block.type === "ul" ? (
          <ul key={i} className="ml-5 list-disc space-y-1.5">
            {block.lines.map((line, j) => (
              <li key={j}>{renderInline(line, j)}</li>
            ))}
          </ul>
        ) : (
          <p key={i}>{renderInline(block.lines[0], 0)}</p>
        ),
      )}
    </div>
  );
}
