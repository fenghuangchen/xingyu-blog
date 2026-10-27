import { cn } from "@/lib/utils";

export function CoverArt({
  cover,
  index,
  className,
}: {
  cover: string;
  index?: string;
  className?: string;
}) {
  return (
    <div
      className={cn("cover-art", `cover-${cover}`, className)}
      aria-hidden="true"
    >
      <span className="cover-glow" />
      <span className="cover-shape shape-a" />
      <span className="cover-shape shape-b" />
      <span className="cover-shape shape-c" />
      {index ? <span className="cover-index">{index}</span> : null}
      <span className="cover-sheen" />
    </div>
  );
}
