interface PageHeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="font-display text-3xl font-bold text-text-primary">{title}</h1>
      {description ? <p className="mt-2 text-text-secondary">{description}</p> : null}
    </div>
  );
}
