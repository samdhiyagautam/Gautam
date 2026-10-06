import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  lede?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  lede,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <Reveal
      className={cn(
        "max-w-3xl mb-14 sm:mb-16",
        align === "center" ? "mx-auto text-center" : "mx-0 text-left",
        className
      )}
    >
      <p className="cinematic-eyebrow mb-4">
        <span aria-hidden="true" className="cinematic-eyebrow-rule" />
        {eyebrow}
      </p>
      <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-[-0.02em] leading-[1.05] text-balance">
        {title}
      </h2>
      {lede ? (
        <p className="mt-4 text-lg text-muted-foreground leading-relaxed text-balance">
          {lede}
        </p>
      ) : null}
    </Reveal>
  );
}
