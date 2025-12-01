interface SectionTitleProps {
  title: string;
  className?: string;
}

export function SectionTitle({ title, className }: SectionTitleProps) {
  return <h2 className={`section-title ${className || ""}`}>{title}</h2>;
}
