interface PageTitleProps {
  title: string;
}

export function PageTitle({ title }: PageTitleProps) {
  return <h1 className="page-title">{title}</h1>;
}
