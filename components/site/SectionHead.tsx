import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function SectionHead({
  index,
  title,
  description,
  href,
  action = "查看全部",
  className,
}: {
  index: string;
  title: string;
  description?: string;
  href?: string;
  action?: string;
  className?: string;
}) {
  return (
    <div className={cn("section-head", className)}>
      <div>
        <span className="section-kicker">{index}</span>
        <h2 className="section-title">{title}</h2>
        {description ? (
          <p className="section-description">{description}</p>
        ) : null}
      </div>
      {href ? (
        <Link href={href} className="section-link">
          {action}
          <ArrowRight size={15} />
        </Link>
      ) : null}
    </div>
  );
}
