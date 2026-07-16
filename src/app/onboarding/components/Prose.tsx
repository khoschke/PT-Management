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

export function Prose({ body }: { body: string[] }) {
  const blocks: { type: "p" | "ul"; lines: string[] }[] = [];

  for (const line of body) {
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
        block.type === "ul" ? (
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
