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
  | { type: "p" | "ul"; lines: string[] }
  | { type: "figure"; src: string; alt: string; caption?: string };

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

export function Prose({ body }: { body: string[] }) {
  const blocks: Block[] = [];

  for (const line of body) {
    const image = IMAGE_LINE.exec(line);
    if (image) {
      blocks.push({ type: "figure", alt: image[1], src: image[2], caption: image[3] });
      continue;
    }

    const isBullet = line.startsWith("- ");
    const last = blocks[blocks.length - 1];
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
