function SectionTitle({
  children,
  className,
}: {
  children: React.ReactNode[];
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-sm font-mono text-primary uppercase">
        {children?.[0]}
      </p>
      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
        {children?.[1]}
      </h2>
    </div>
  );
}

export default SectionTitle;
